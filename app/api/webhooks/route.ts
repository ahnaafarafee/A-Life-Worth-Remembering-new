import prisma from "@/prisma/client";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      try {
        const newUser = await prisma.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name || "",
            lastName: last_name || "",
            imageUrl: image_url,
          },
        });
        console.log("Created new user:", newUser); // Debug log
        return new Response(JSON.stringify(newUser), { status: 201 });
      } catch (err: any) {
        console.error("Error creating user:", err);
        return new Response(
          JSON.stringify({
            error: "Failed to create user",
            details: err?.message || "Unknown error",
          }),
          { status: 500 }
        );
      }
    }

    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      try {
        const updatedUser = await prisma.user.update({
          where: { clerkId: id },
          data: {
            email: email_addresses[0].email_address,
            firstName: first_name || "",
            lastName: last_name || "",
            imageUrl: image_url,
          },
        });
        console.log("Updated user:", updatedUser); // Debug log
        return new Response(JSON.stringify(updatedUser), { status: 200 });
      } catch (err: any) {
        console.error("Error updating user:", err);
        return new Response(
          JSON.stringify({
            error: "Failed to update user",
            details: err?.message || "Unknown error",
          }),
          { status: 500 }
        );
      }
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;
      try {
        await prisma.user.delete({
          where: { clerkId: id },
        });
        console.log("Deleted user:", id); // Debug log
        return new Response("User deleted", { status: 200 });
      } catch (err: any) {
        console.error("Error deleting user:", err);
        return new Response(
          JSON.stringify({
            error: "Failed to delete user",
            details: err?.message || "Unknown error",
          }),
          { status: 500 }
        );
      }
    }
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    return new Response("Webhook received", { status: 200 });
  } catch (err: any) {
    console.error("Error verifying webhook:", err);
    return new Response(
      JSON.stringify({
        error: "Error verifying webhook",
        details: err?.message || "Unknown error",
      }),
      { status: 400 }
    );
  }
}
