import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupStorage() {
  try {
    // Create the legacy-media bucket if it doesn't exist
    const { data: bucket, error: bucketError } =
      await supabase.storage.createBucket("legacy-media", {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "audio/mpeg",
          "audio/wav",
          "audio/ogg",
          "video/mp4",
          "video/webm",
        ],
      });

    if (bucketError && bucketError.message !== "Bucket already exists") {
      throw bucketError;
    }

    // Set up storage policies
    const policies = [
      {
        name: "Allow authenticated users to upload files",
        definition: {
          role: "authenticated",
          operation: "INSERT",
          bucket: "legacy-media",
          policy: "user_id = auth.uid()",
        },
      },
      {
        name: "Allow users to read their own files",
        definition: {
          role: "authenticated",
          operation: "SELECT",
          bucket: "legacy-media",
          policy: "user_id = auth.uid()",
        },
      },
      {
        name: "Allow users to update their own files",
        definition: {
          role: "authenticated",
          operation: "UPDATE",
          bucket: "legacy-media",
          policy: "user_id = auth.uid()",
        },
      },
      {
        name: "Allow users to delete their own files",
        definition: {
          role: "authenticated",
          operation: "DELETE",
          bucket: "legacy-media",
          policy: "user_id = auth.uid()",
        },
      },
    ];

    // Apply each policy
    for (const policy of policies) {
      const { error: policyError } = await supabase.storage
        .from("legacy-media")
        .createPolicy(policy.name, policy.definition);

      if (policyError && policyError.message !== "Policy already exists") {
        throw policyError;
      }
    }

    console.log("Successfully set up Supabase storage bucket and policies");
  } catch (error) {
    console.error("Error setting up Supabase storage:", error);
    process.exit(1);
  }
}

setupStorage();
