"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { PageType } from "@prisma/client";
import { getSupabaseUrl } from "@/utils/supabase";
import { useRouter } from "next/navigation";

interface LegacyPage {
  pageType: PageType;
  honoureeName: string;
  creatorName: string;
  dateOfBirth: string;
  dateOfPassing: string | null;
  relationship: string;
  storyName: string;
  story: string;
  honoureePhoto: string | null;
  coverPhoto: string | null;
  personality: string | null;
  values: string | null;
  beliefs: string | null;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  mediaItems: {
    type: "IMAGE" | "VIDEO" | "AUDIO";
    url: string;
    dateTaken: string;
    location: string | null;
    description: string | null;
    category: string | null;
  }[];
  events: {
    name: string;
    date: string;
    time: string;
    rsvpBy: string | null;
    location: string;
    googleMapsCode: string | null;
    externalUrl: string | null;
    message: string | null;
  }[];
  relationships: {
    type: string;
    isCustomType: boolean;
    name: string;
  }[];
  insights: {
    message: string;
  }[];
  memorialDetails: {
    funeralWishes: string | null;
    obituary: string | null;
    funeralHome: string | null;
    viewingDetails: string | null;
    processionDetails: string | null;
    serviceDetails: string | null;
    wakeDetails: string | null;
    finalRestingPlace: string | null;
    eulogy: string | null;
    orderOfService: string | null;
    familyMessage: string | null;
    memorialVideo: string | null;
    tributes: string | null;
    messageFromHonouree: string | null;
  } | null;
  user: {
    clerkId: string;
  };
  quotes: {
    text: string;
    author: string | null;
  }[];
}

export default function LegacyPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [page, setPage] = useState<LegacyPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    description: string | null;
    location: string | null;
    dateTaken: string;
    category: string | null;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");

  // Get unique categories from media items
  const categories =
    page?.mediaItems
      .filter((item) => item.type === "IMAGE" && item.category)
      .map((item) => item.category)
      .filter((category, index, self) => self.indexOf(category) === index) ||
    [];

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter media items based on selected category
  const filteredMediaItems =
    page?.mediaItems.filter(
      (item) =>
        item.type === "IMAGE" &&
        (!selectedCategory || item.category === selectedCategory)
    ) || [];

  console.log("page", page);

  useEffect(() => {
    let isMounted = true;

    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/legacy/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch legacy page");
        }
        const data = await response.json();
        if (isMounted) {
          setPage(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (page?.quotes && page.quotes.length > 1) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex(
          (prev) => (prev + 1) % (page?.quotes?.length || 1)
        );
      }, 5000); // Change quote every 5 seconds
      return () => clearInterval(interval);
    }
  }, [page?.quotes]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this page? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/legacy/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      // Redirect to home page after successful deletion
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete page");
      setIsDeleting(false);
    }
  };

  const nextInsight = () => {
    if (page && page.insights.length > 0) {
      setCurrentInsightIndex((prev) => (prev + 1) % page.insights.length);
    }
  };

  const prevInsight = () => {
    if (page && page.insights.length > 0) {
      setCurrentInsightIndex(
        (prev) => (prev - 1 + page.insights.length) % page.insights.length
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
          <Navbar />
          <div className="py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gold-primary mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-gold-secondary mb-8">
              {error || "The legacy page you're looking for doesn't exist."}
            </p>
            <a
              href="/"
              className="inline-block bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-8 py-3 transition-colors"
            >
              Return Home
            </a>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const isCreator = isUserLoaded && user?.id === page.user.clerkId;

  return (
    <div
      className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12"
      style={
        {
          backgroundImage: "url('/images/background-default-legacy.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
          width: "100vw",
          maxWidth: "100%",
          "--heading-font": page.headingFont,
          "--body-font": page.bodyFont,
          "--accent-font": page.accentFont,
        } as React.CSSProperties
      }
    >
      <style jsx global>{`
        .legacy-heading {
          font-family: var(--heading-font), serif;
        }
        .legacy-body {
          font-family: var(--body-font), serif;
        }
        .legacy-accent {
          font-family: var(--accent-font), serif;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>

      <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
        <Navbar />

        {/* Main Content */}
        <div className="relative">
          {/* Cover Photo */}
          {page.coverPhoto && (
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src={getSupabaseUrl(page.coverPhoto)}
                alt="Cover photo"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Creator Actions - Only show if user is creator */}
          {isCreator && (
            <div className="absolute top-4 right-4 z-10 flex gap-4">
              <a
                href={`/legacy/${slug}/edit`}
                className="bg-white/90 hover:bg-white text-gold-primary border border-gold-primary rounded-md px-6 py-2 transition-colors shadow-lg"
              >
                Edit Page
              </a>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500/90 hover:bg-red-500 text-white border border-red-500 rounded-md px-6 py-2 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete Page"
                )}
              </button>
            </div>
          )}

          {/* Honouree Info */}
          <div className="relative -mt-24 px-8 pb-8 text-center">
            {page.honoureePhoto && (
              <div className="relative w-48 h-48 mx-auto mb-6">
                <Image
                  src={getSupabaseUrl(page.honoureePhoto)}
                  alt={page.honoureeName}
                  fill
                  className="object-cover rounded-full border-4 border-white shadow-xl"
                />
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mb-4 legacy-heading">
              Celebrating the life of
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold text-gold-primary mb-4 legacy-heading">
              {page.honoureeName}
            </h1>
            <p className="text-xl text-gold-secondary mb-2 legacy-body">
              {new Date(page.dateOfBirth).toDateString()} -{" "}
              {page.dateOfPassing
                ? new Date(page.dateOfPassing).toDateString()
                : "Present"}
            </p>
            <p className="text-lg text-gold-secondary mb-2 legacy-body">
              {page.pageType.charAt(0) + page.pageType.slice(1).toLowerCase()}{" "}
              Page
            </p>
            <p className="text-lg text-gold-secondary mb-4 legacy-body">
              Created by {page.creatorName}
            </p>

            {/* Share Widgets */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {/* Copy Link Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
                className="flex items-center gap-2 bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary px-4 py-2 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Link
              </button>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white p-3 rounded-md transition-colors"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
              </a>

              {/* Twitter Share */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  window.location.href
                )}&text=${encodeURIComponent(
                  `Check out ${
                    page.honoureeName
                  }'s ${page.pageType.toLowerCase()} page`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white p-3 rounded-md transition-colors"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>

              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white p-3 rounded-md transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quotes Slider */}
          {page.quotes && page.quotes.length > 0 && (
            <div
              className="w-full overflow-hidden"
              style={{
                background: "linear-gradient(90deg, #D4AF37 0%, #f5e7a3 100%)",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(212,175,55,0.15)",
              }}
            >
              <div className="relative w-full">
                <div className="marquee whitespace-nowrap flex items-center animate-marquee">
                  {[...page.quotes, ...page.quotes].map((quote, index) => (
                    <div
                      key={index}
                      className="mx-8 inline-flex flex-col items-center text-black"
                    >
                      <blockquote className="text-xl md:text-xl font-serif italic mb-2">
                        "{quote.text}"
                      </blockquote>
                      {quote.author && (
                        <p className="text-lg text-black/80">
                          — {quote.author}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Story Section */}
          <div className="px-8 pb-8 mt-4">
            {/* Story */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gold-primary mb-4 legacy-heading">
                {page.storyName}
              </h2>
              <div className="prose max-w-none text-gray-700 bg-white/50 p-6 rounded-lg legacy-body">
                {page.story}
              </div>
            </div>

            {/* General Knowledge */}
            {(page.personality || page.values || page.beliefs) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6 legacy-heading">
                  General Knowledge
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {page.personality && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2 legacy-heading">
                        Personality
                      </h3>
                      <p className="text-gray-700 legacy-body">
                        {page.personality}
                      </p>
                    </div>
                  )}
                  {page.values && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2 legacy-heading">
                        Values
                      </h3>
                      <p className="text-gray-700 legacy-body">{page.values}</p>
                    </div>
                  )}
                  {page.beliefs && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2 legacy-heading">
                        Beliefs
                      </h3>
                      <p className="text-gray-700 legacy-body">
                        {page.beliefs}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gallery */}
            {page.mediaItems.length > 0 && (
              <>
                {/* Images Section */}
                {page.mediaItems.filter((item) => item.type === "IMAGE")
                  .length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gold-primary mb-6">
                      Gallery
                    </h2>

                    {/* Category Search and Filter */}
                    {categories.length > 0 && (
                      <div className="mb-6 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full md:w-96 px-4 py-2 pl-10 rounded-lg border border-gold-primary/30 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary outline-none transition-colors bg-white/50"
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gold-primary/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>

                        {/* Category Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedCategory === null
                                ? "bg-gold-primary text-white"
                                : "bg-gold-primary/20 text-gold-primary hover:bg-gold-primary/30"
                            }`}
                          >
                            All Photos
                          </button>
                          {filteredCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === category
                                  ? "bg-gold-primary text-white"
                                  : "bg-gold-primary/20 text-gold-primary hover:bg-gold-primary/30"
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {filteredMediaItems.map((item, index) => (
                        <div
                          key={index}
                          className="relative aspect-square group"
                        >
                          <Image
                            src={getSupabaseUrl(item.url)}
                            alt={item.description || `Media item ${index + 1}`}
                            fill
                            className="object-cover rounded-lg transition-transform group-hover:scale-105"
                          />
                          {(item.location ||
                            item.description ||
                            item.category) && (
                            <div
                              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg cursor-pointer"
                              onClick={() =>
                                setSelectedImage({
                                  url: getSupabaseUrl(item.url),
                                  description: item.description,
                                  location: item.location,
                                  dateTaken: item.dateTaken,
                                  category: item.category,
                                })
                              }
                            >
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                {item.category && (
                                  <span className="inline-block bg-gold-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                                    {item.category}
                                  </span>
                                )}
                                {item.location && (
                                  <p className="text-sm mb-1 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    {item.location}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-sm line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sound Clips Section */}
                {page.mediaItems.filter((item) => item.type === "AUDIO")
                  .length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gold-primary mb-6">
                      Sound Clips
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {page.mediaItems
                        .filter((item) => item.type === "AUDIO")
                        .map((item, index) => (
                          <div
                            key={index}
                            className="bg-white/50 p-6 rounded-lg border border-gold-primary/20 hover:border-gold-primary/40 transition-colors"
                          >
                            <div className="mb-4">
                              <audio
                                controls
                                className="w-full"
                                src={getSupabaseUrl(item.url)}
                              >
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                            {(item.location ||
                              item.description ||
                              item.dateTaken) && (
                              <div className="space-y-2">
                                {item.dateTaken && (
                                  <p className="text-gold-secondary text-sm">
                                    Date:{" "}
                                    {new Date(
                                      item.dateTaken
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                                {item.location && (
                                  <p className="text-gold-secondary text-sm">
                                    Location: {item.location}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-gray-700">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Events */}
            {page.events.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6">
                  Events
                </h2>
                <div className="space-y-6">
                  {page.events.map((event) => (
                    <div
                      key={event.name}
                      className="bg-white/50 p-6 rounded-lg border border-gold-primary/20 hover:border-gold-primary/40 transition-colors"
                    >
                      <h3 className="text-2xl font-bold text-gold-primary mb-4">
                        {event.name}
                      </h3>
                      {event.message && (
                        <p className="text-gray-700 mb-4">{event.message}</p>
                      )}
                      <div className="space-y-2 mb-4">
                        <p className="text-gold-secondary">
                          Date: {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-gold-secondary">
                          Location: {event.location}
                        </p>
                        {event.googleMapsCode && (
                          <a
                            href={`https://maps.google.com/?q=${event.googleMapsCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-primary hover:text-gold-secondary text-sm"
                          >
                            View on Google Maps
                          </a>
                        )}
                        {event.rsvpBy && (
                          <p className="text-gold-secondary">
                            RSVP by:{" "}
                            {new Date(event.rsvpBy).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {event.externalUrl && (
                        <a
                          href={event.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-gold-primary hover:bg-gold-primary/90 text-white px-6 py-2 rounded-md transition-colors"
                        >
                          RSVP
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationships */}
            {page.relationships.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6">
                  Relationships
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {page.relationships.map((rel) => (
                    <div
                      key={rel.name}
                      className="bg-white/50 p-6 rounded-lg border border-gold-primary/20 hover:border-gold-primary/40 transition-colors"
                    >
                      <p className="text-gold-secondary mb-2">{rel.type}</p>
                      <p className="text-xl font-bold text-gold-primary">
                        {rel.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {page.insights.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6">
                  Insights
                </h2>
                <div className="relative w-full">
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${currentInsightIndex * 100}%)`,
                      }}
                    >
                      {page.insights.map((insight, index) => (
                        <div
                          key={insight.message}
                          className="w-full flex-shrink-0 bg-white/50 p-8 rounded-lg border border-gold-primary/20 hover:border-gold-primary/40 transition-colors min-h-[300px] flex items-center justify-center"
                        >
                          <p className="text-gray-700 text-lg text-center max-w-3xl">
                            {insight.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevInsight}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary p-3 rounded-full transition-colors"
                    aria-label="Previous insight"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextInsight}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary p-3 rounded-full transition-colors"
                    aria-label="Next insight"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {page.insights.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentInsightIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentInsightIndex
                            ? "bg-gold-primary"
                            : "bg-gold-primary/30"
                        }`}
                        aria-label={`Go to insight ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Memorial Details */}
            {page.pageType === "MEMORIAL" && page.memorialDetails && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6">
                  Memorial Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {Object.entries(page.memorialDetails).map(([key, value]) => {
                    if (!value) return null;
                    const title = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    return (
                      <div
                        key={key}
                        className="bg-white/50 p-6 rounded-lg border border-gold-primary/20 hover:border-gold-primary/40 transition-colors"
                      >
                        <h3 className="text-xl font-bold text-gold-secondary mb-2">
                          {title}
                        </h3>
                        {key === "memorialVideo" ? (
                          <div className="aspect-video">
                            <iframe
                              src={value}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <p className="text-gray-700">{value}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {/* Full Page Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gold-primary transition-colors z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Image */}
            <div className="flex-1 relative">
              <Image
                src={selectedImage.url}
                alt={selectedImage.description || "Full size image"}
                fill
                className="object-contain"
              />
            </div>

            {/* Image Details */}
            <div className="bg-gradient-to-t from-black/90 to-black/70 text-white p-6">
              <div className="max-w-4xl mx-auto">
                {selectedImage.category && (
                  <span className="inline-block bg-gold-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-3">
                    {selectedImage.category}
                  </span>
                )}
                {selectedImage.description && (
                  <p className="text-lg mb-4">{selectedImage.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  {selectedImage.location && (
                    <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {selectedImage.location}
                    </div>
                  )}
                  <div className="flex items-center bg-black/30 px-3 py-1.5 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(selectedImage.dateTaken).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
