"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLegacyPage } from "@/hooks/useLegacyPage";

export default function AuthRedirect() {
  const { isSignedIn, isLoaded } = useUser();
  const { legacyPage, isLoading } = useLegacyPage();
  const router = useRouter();

  useEffect(() => {
    // if (isLoaded && isSignedIn && !isLoading && !legacyPage) {
    //   router.push("/create-a-page");
    // }
  }, [isLoaded, isSignedIn, isLoading, legacyPage, router]);

  return null;
}
