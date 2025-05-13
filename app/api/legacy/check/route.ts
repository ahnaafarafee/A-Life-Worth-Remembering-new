import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        legacyPages: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ hasPage: false, page: null });
    }

    // Get the first legacy page (users can only have one)
    const legacyPage = user.legacyPages[0] || null;

    return NextResponse.json({
      hasPage: !!legacyPage,
      page: legacyPage,
    });
  } catch (error) {
    console.error("Error checking existing page:", error);
    return NextResponse.json(
      { error: "Failed to check existing page" },
      { status: 500 }
    );
  }
}
