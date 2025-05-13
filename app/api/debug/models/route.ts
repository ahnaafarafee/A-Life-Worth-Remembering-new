import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";

export async function GET() {
  try {
    // Fetch all users
    const users = await prisma.user.findMany({
      include: {
        legacyPages: {
          include: {
            generalKnowledge: true,
            memorialDetails: true,
            mediaItems: true,
            events: true,
            relationships: true,
            insights: true,
          },
        },
      },
    });

    // Log the data
    console.log("=== Users ===");
    console.log(JSON.stringify(users, null, 2));

    // Fetch all legacy pages
    const legacyPages = await prisma.legacyPage.findMany({
      include: {
        user: true,
        generalKnowledge: true,
        memorialDetails: true,
        mediaItems: true,
        events: true,
        relationships: true,
        insights: true,
      },
    });

    console.log("\n=== Legacy Pages ===");
    console.log(JSON.stringify(legacyPages, null, 2));

    // Fetch all media items
    const mediaItems = await prisma.mediaItem.findMany({
      include: {
        legacyPage: true,
      },
    });

    console.log("\n=== Media Items ===");
    console.log(JSON.stringify(mediaItems, null, 2));

    // Fetch all events
    const events = await prisma.event.findMany({
      include: {
        legacyPage: true,
      },
    });

    console.log("\n=== Events ===");
    console.log(JSON.stringify(events, null, 2));

    // Fetch all relationships
    const relationships = await prisma.relationship.findMany({
      include: {
        legacyPage: true,
      },
    });

    console.log("\n=== Relationships ===");
    console.log(JSON.stringify(relationships, null, 2));

    // Fetch all insights
    const insights = await prisma.insight.findMany({
      include: {
        legacyPage: true,
      },
    });

    console.log("\n=== Insights ===");
    console.log(JSON.stringify(insights, null, 2));

    return NextResponse.json({
      message: "Models logged successfully",
      counts: {
        users: users.length,
        legacyPages: legacyPages.length,
        mediaItems: mediaItems.length,
        events: events.length,
        relationships: relationships.length,
        insights: insights.length,
      },
    });
  } catch (error) {
    console.error("Error logging models:", error);
    return NextResponse.json(
      { error: "Failed to log models" },
      { status: 500 }
    );
  }
}
