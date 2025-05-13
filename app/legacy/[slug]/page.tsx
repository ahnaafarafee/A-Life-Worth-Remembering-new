import { Suspense } from "react";
import LegacyPageClient from "./client";

export default function LegacyPageView({
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
      <LegacyPageClient slug={params.slug} />
    </Suspense>
  );
}
