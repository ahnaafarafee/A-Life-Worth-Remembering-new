import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/prisma/client";
import { PageType } from "@prisma/client";
import { MediaType } from "@prisma/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    // Check if user already has a page
    const existingPage = await prisma.legacyPage.findFirst({
      where: { userId },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "You can only create one legacy page" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
      },
    });

    // Helper function to upload file to Supabase
    const uploadToSupabase = async (file: File, path: string) => {
      const buffer = await file.arrayBuffer();
      const { data, error } = await supabase.storage
        .from("legacy-media")
        .upload(`${user.id}/${path}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;
      return data.path;
    };

    // Upload honouree photo
    let honoureePhotoPath;
    const honoureePhoto = formData.get("honoureePhoto") as File;
    if (honoureePhoto && honoureePhoto.size > 0) {
      honoureePhotoPath = await uploadToSupabase(
        honoureePhoto,
        "honouree-photo"
      );
    }

    // Upload cover photo
    let coverPhotoPath;
    const coverPhoto = formData.get("coverPhoto") as File;
    if (coverPhoto && coverPhoto.size > 0) {
      coverPhotoPath = await uploadToSupabase(coverPhoto, "cover-photo");
    }

    // Process photos
    const photos = [];
    let photoIndex = 0;
    while (formData.has(`photos[${photoIndex}][file]`)) {
      const file = formData.get(`photos[${photoIndex}][file]`) as File;
      const dateTaken = formData.get(
        `photos[${photoIndex}][dateTaken]`
      ) as string;
      const location = formData.get(
        `photos[${photoIndex}][location]`
      ) as string;
      const description = formData.get(
        `photos[${photoIndex}][description]`
      ) as string;
      const category = formData.get(
        `photos[${photoIndex}][category]`
      ) as string;

      let filePath;
      if (file && file.size > 0) {
        filePath = await uploadToSupabase(file, `photos/${photoIndex}`);
      }

      photos.push({
        type: "IMAGE" as MediaType,
        url: filePath || "",
        dateTaken: new Date(dateTaken),
        location: location || null,
        description: description || null,
        category: category || null,
      });

      photoIndex++;
    }

    // Process sound clips
    const soundClips = [];
    let clipIndex = 0;
    while (formData.has(`soundClips[${clipIndex}][file]`)) {
      const file = formData.get(`soundClips[${clipIndex}][file]`) as File;
      const dateTaken = formData.get(
        `soundClips[${clipIndex}][dateTaken]`
      ) as string;
      const location = formData.get(
        `soundClips[${clipIndex}][location]`
      ) as string;
      const description = formData.get(
        `soundClips[${clipIndex}][description]`
      ) as string;

      let filePath;
      if (file && file.size > 0) {
        filePath = await uploadToSupabase(file, `sound-clips/${clipIndex}`);
      }

      soundClips.push({
        dateTaken,
        location,
        description,
        file: filePath,
      });

      clipIndex++;
    }

    // Process events
    const events = [];
    let eventIndex = 0;
    while (formData.has(`events[${eventIndex}][name]`)) {
      events.push({
        name: formData.get(`events[${eventIndex}][name]`),
        date: formData.get(`events[${eventIndex}][date]`),
        time: formData.get(`events[${eventIndex}][time]`),
        rsvpBy: formData.get(`events[${eventIndex}][rsvpBy]`),
        location: formData.get(`events[${eventIndex}][location]`),
        googleMapsCode: formData.get(`events[${eventIndex}][googleMapsCode]`),
        externalUrl: formData.get(`events[${eventIndex}][externalUrl]`),
        message: formData.get(`events[${eventIndex}][message]`),
      });
      eventIndex++;
    }

    // Process relationships
    const relationships = [];
    let relIndex = 0;
    while (formData.has(`relationships[${relIndex}][type]`)) {
      relationships.push({
        type: formData.get(`relationships[${relIndex}][type]`),
        isCustomType:
          formData.get(`relationships[${relIndex}][isCustomType]`) === "true",
        name: formData.get(`relationships[${relIndex}][name]`),
      });
      relIndex++;
    }

    // Process insights
    const insights = [];
    let insightIndex = 0;
    while (formData.has(`insights[${insightIndex}][message]`)) {
      insights.push({
        message: formData.get(`insights[${insightIndex}][message]`),
      });
      insightIndex++;
    }

    // Process quotes
    const quotes = [];
    let quoteIndex = 0;
    while (formData.has(`quotes[${quoteIndex}][text]`)) {
      const text = formData.get(`quotes[${quoteIndex}][text]`);
      const author = formData.get(`quotes[${quoteIndex}][author]`);
      if (text) {
        quotes.push({
          text: text.toString(),
          author: author ? author.toString() : null,
        });
      }
      quoteIndex++;
    }

    // Create legacy page in database
    const legacyPage = await prisma.legacyPage.create({
      data: {
        userId: user.id,
        pageType: formData.get("pageType") as PageType,
        slug: formData.get("slug") as string,
        honoureeName: formData.get("honoureeName") as string,
        creatorName: formData.get("creatorName") as string,
        dateOfBirth: new Date(formData.get("dateOfBirth") as string),
        hasTransitioned: formData.get("hasTransitioned") === "true",
        dateOfPassing: formData.get("dateOfPassing")
          ? new Date(formData.get("dateOfPassing") as string)
          : null,
        relationship: formData.get("relationship") as string,
        storyName: formData.get("storyName") as string,
        story: formData.get("story") as string,
        honoureePhoto: honoureePhotoPath,
        coverPhoto: coverPhotoPath,
        ...(formData.get("headingFont") && {
          headingFont: formData.get("headingFont") as string,
        }),
        ...(formData.get("bodyFont") && {
          bodyFont: formData.get("bodyFont") as string,
        }),
        ...(formData.get("accentFont") && {
          accentFont: formData.get("accentFont") as string,
        }),
        generalKnowledge: {
          create: {
            personality: formData.get("personality") as string,
            values: formData.get("values") as string,
            beliefs: formData.get("beliefs") as string,
          },
        },
        memorialDetails: {
          create: {
            funeralWishes: formData.get("funeralWishes") as string,
            obituary: formData.get("obituary") as string,
            funeralHome: formData.get("funeralHome") as string,
            viewingDetails: formData.get("viewingDetails") as string,
            processionDetails: formData.get("processionDetails") as string,
            serviceDetails: formData.get("serviceDetails") as string,
            wakeDetails: formData.get("wakeDetails") as string,
            finalRestingPlace: formData.get("finalRestingPlace") as string,
            eulogy: formData.get("eulogy") as string,
            orderOfService: formData.get("orderOfService") as string,
            familyMessage: formData.get("familyMessage") as string,
            memorialVideo: formData.get("memorialVideo") as string,
            tributes: formData.get("tributes") as string,
            messageFromHonouree: formData.get("messageFromHonouree") as string,
          },
        },
        mediaItems: {
          create: [
            ...photos.map((photo) => ({
              type: "IMAGE" as MediaType,
              url: photo.url,
              dateTaken: photo.dateTaken,
              location: photo.location,
              description: photo.description,
              category: photo.category,
            })),
            ...soundClips.map((clip) => ({
              type: "AUDIO" as MediaType,
              url: clip.file || "",
              dateTaken: new Date(clip.dateTaken),
              location: clip.location,
              description: clip.description,
            })),
          ],
        },
        events: {
          create: events.map((event) => ({
            name: event.name as string,
            date: new Date(event.date as string),
            time: event.time as string,
            rsvpBy: event.rsvpBy ? new Date(event.rsvpBy as string) : null,
            location: event.location as string,
            googleMapsCode: event.googleMapsCode as string,
            externalUrl: event.externalUrl as string,
            message: event.message as string,
          })),
        },
        relationships: {
          create: relationships.map((rel) => ({
            type: rel.type as string,
            isCustomType: rel.isCustomType,
            name: rel.name as string,
          })),
        },
        insights: {
          create: insights.map((insight) => ({
            message: insight.message as string,
          })),
        },
        quotes: {
          createMany: {
            data: quotes.map((quote) => ({
              text: quote.text,
              author: quote.author,
            })),
          },
        },
      },
      include: {
        user: true,
        mediaItems: true,
        events: true,
        relationships: true,
        insights: true,
        quotes: true,
      },
    });

    return NextResponse.json({ success: true, data: legacyPage });
  } catch (error) {
    console.error("Error creating legacy page:", error);
    return NextResponse.json(
      { error: "Failed to create legacy page" },
      { status: 500 }
    );
  }
}
