import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

interface LegacyPage {
  slug: string;
}

export function useLegacyPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [legacyPage, setLegacyPage] = useState<LegacyPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLegacyPage = async () => {
      if (!isUserLoaded) {
        return;
      }

      if (!user) {
        setLegacyPage(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/legacy/check");
        if (!response.ok) {
          throw new Error("Failed to fetch legacy page");
        }
        const data = await response.json();

        if (data.hasPage && data.page) {
          setLegacyPage(data.page);
        } else {
          setLegacyPage(null);
        }
      } catch (error) {
        console.error("Error fetching legacy page:", error);
        setLegacyPage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLegacyPage();
  }, [user, isUserLoaded]);

  return { legacyPage, isLoading };
}
