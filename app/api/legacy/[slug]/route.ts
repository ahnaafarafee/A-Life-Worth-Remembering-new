import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/prisma/client";

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
