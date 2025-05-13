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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const legacyPage = await prisma.legacyPage.findUnique({
      where: { slug: params.slug },
      include: {
        user: true,
        generalKnowledge: true,
        memorialDetails: true,
        mediaItems: true,
        events: true,
        relationships: true,
        insights: true,
        quotes: true,
      },
    });

    if (!legacyPage) {
      return NextResponse.json(
        { error: "Legacy page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(legacyPage);
  } catch (error) {
    console.error("Error fetching legacy page:", error);
    return NextResponse.json(
      { error: "Failed to fetch legacy page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the legacy page
    const legacyPage = await prisma.legacyPage.findUnique({
      where: { slug: params.slug },
    });

    if (!legacyPage) {
      return NextResponse.json(
        { error: "Legacy page not found" },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the page
    if (legacyPage.userId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to delete this page" },
        { status: 403 }
      );
    }

    // Delete the legacy page and all related data
    await prisma.legacyPage.delete({
      where: { id: legacyPage.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting legacy page:", error);
    return NextResponse.json(
      { error: "Failed to delete legacy page" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the legacy page
    const legacyPage = await prisma.legacyPage.findUnique({
      where: { slug: params.slug },
      include: {
        user: true,
        generalKnowledge: true,
        memorialDetails: true,
        mediaItems: true,
        events: true,
        relationships: true,
        insights: true,
        quotes: true,
      },
    });

    if (!legacyPage) {
      return NextResponse.json(
        { error: "Legacy page not found" },
        { status: 404 }
      );
    }

    // Check if the user is the creator of the page
    if (legacyPage.userId !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to edit this page" },
        { status: 403 }
      );
    }

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

    // Upload new photos if provided
    let honoureePhotoPath = legacyPage.honoureePhoto;
    const honoureePhoto = formData.get("honoureePhoto") as File;
    if (honoureePhoto && honoureePhoto.size > 0) {
      honoureePhotoPath = await uploadToSupabase(
        honoureePhoto,
        `honouree-photo-${Date.now()}`
      );
    }

    let coverPhotoPath = legacyPage.coverPhoto;
    const coverPhoto = formData.get("coverPhoto") as File;
    if (coverPhoto && coverPhoto.size > 0) {
      coverPhotoPath = await uploadToSupabase(
        coverPhoto,
        `cover-photo-${Date.now()}`
      );
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

      if (file && file.size > 0) {
        const path = await uploadToSupabase(
          file,
          `photo-${Date.now()}-${photoIndex}`
        );
        photos.push({
          type: "IMAGE" as MediaType,
          url: path,
          dateTaken: new Date(dateTaken),
          location: location || null,
          description: description || null,
        });
      }
      photoIndex++;
    }

    // Process sound clips
    const soundClips = [];
    let soundClipIndex = 0;
    while (formData.has(`soundClips[${soundClipIndex}][file]`)) {
      const file = formData.get(`soundClips[${soundClipIndex}][file]`) as File;
      const dateTaken = formData.get(
        `soundClips[${soundClipIndex}][dateTaken]`
      ) as string;
      const location = formData.get(
        `soundClips[${soundClipIndex}][location]`
      ) as string;
      const description = formData.get(
        `soundClips[${soundClipIndex}][description]`
      ) as string;

      if (file && file.size > 0) {
        const path = await uploadToSupabase(
          file,
          `sound-${Date.now()}-${soundClipIndex}`
        );
        soundClips.push({
          type: "AUDIO" as MediaType,
          url: path,
          dateTaken: new Date(dateTaken),
          location: location || null,
          description: description || null,
        });
      }
      soundClipIndex++;
    }

    // Process events
    const events = [];
    let eventIndex = 0;
    while (formData.has(`events[${eventIndex}][name]`)) {
      events.push({
        name: formData.get(`events[${eventIndex}][name]`) as string,
        date: new Date(formData.get(`events[${eventIndex}][date]`) as string),
        time: formData.get(`events[${eventIndex}][time]`) as string,
        rsvpBy: formData.get(`events[${eventIndex}][rsvpBy]`)
          ? new Date(formData.get(`events[${eventIndex}][rsvpBy]`) as string)
          : null,
        location: formData.get(`events[${eventIndex}][location]`) as string,
        googleMapsCode: formData.get(
          `events[${eventIndex}][googleMapsCode]`
        ) as string,
        externalUrl: formData.get(
          `events[${eventIndex}][externalUrl]`
        ) as string,
        message: formData.get(`events[${eventIndex}][message]`) as string,
      });
      eventIndex++;
    }

    // Process relationships
    const relationships = [];
    let relationshipIndex = 0;
    while (formData.has(`relationships[${relationshipIndex}][type]`)) {
      relationships.push({
        type: formData.get(
          `relationships[${relationshipIndex}][type]`
        ) as string,
        isCustomType:
          formData.get(`relationships[${relationshipIndex}][isCustomType]`) ===
          "true",
        name: formData.get(
          `relationships[${relationshipIndex}][name]`
        ) as string,
      });
      relationshipIndex++;
    }

    // Process insights
    const insights = [];
    let insightIndex = 0;
    while (formData.has(`insights[${insightIndex}][message]`)) {
      insights.push({
        message: formData.get(`insights[${insightIndex}][message]`) as string,
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

    // Update legacy page in database
    const updatedPage = await prisma.legacyPage.update({
      where: { id: legacyPage.id },
      data: {
        pageType: formData.get("pageType") as PageType,
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
        generalKnowledge: {
          update: {
            personality: formData.get("personality") as string,
            values: formData.get("values") as string,
            beliefs: formData.get("beliefs") as string,
          },
        },
        memorialDetails: {
          update: {
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
          deleteMany: {},
          create: [...photos, ...soundClips],
        },
        events: {
          deleteMany: {},
          create: events,
        },
        relationships: {
          deleteMany: {},
          create: relationships,
        },
        insights: {
          deleteMany: {},
          create: insights,
        },
        quotes: {
          deleteMany: {},
          createMany: {
            data: quotes,
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

    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("Error updating legacy page:", error);
    return NextResponse.json(
      { error: "Failed to update legacy page" },
      { status: 500 }
    );
  }
}
