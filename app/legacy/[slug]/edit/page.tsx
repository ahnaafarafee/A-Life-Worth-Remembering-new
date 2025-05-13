import { Suspense } from "react";
import EditLegacyPageClient from "./client";

export default function EditLegacyPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-primary"></div>
        </div>
      }
    >
      <EditLegacyPageClient slug={params.slug} />
    </Suspense>
  );
}
