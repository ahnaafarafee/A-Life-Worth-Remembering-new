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
  mediaItems: {
    type: "IMAGE" | "VIDEO" | "AUDIO";
    url: string;
    dateTaken: string;
    location: string | null;
    description: string | null;
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
  } | null>(null);

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
      style={{
        backgroundImage: "url('/images/background-default-legacy.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        maxWidth: "100%",
      }}
    >
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
            <h1 className="text-4xl md:text-5xl font-bold text-gold-primary mb-4">
              {page.honoureeName}
            </h1>
            <p className="text-xl text-gold-secondary mb-2">
              {new Date(page.dateOfBirth).toLocaleDateString()} -{" "}
              {page.dateOfPassing
                ? new Date(page.dateOfPassing).toLocaleDateString()
                : "Present"}
            </p>
            <p className="text-lg text-gold-secondary mb-2">
              {page.pageType.charAt(0) + page.pageType.slice(1).toLowerCase()}{" "}
              Page
            </p>
            <p className="text-lg text-gold-secondary mb-4">
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
                className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                Share on Facebook
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
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                Share on Twitter
              </a>

              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white px-4 py-2 rounded-md transition-colors"
              >
                Share on LinkedIn
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

              <style jsx>{`
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
            </div>
          )}

          {/* Story Section */}
          <div className="px-8 pb-8 mt-4">
            {/* Story */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gold-primary mb-4">
                {page.storyName}
              </h2>
              <div className="prose max-w-none text-gray-700 bg-white/50 p-6 rounded-lg">
                {page.story}
              </div>
            </div>

            {/* General Knowledge */}
            {(page.personality || page.values || page.beliefs) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gold-primary mb-6">
                  General Knowledge
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {page.personality && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2">
                        Personality
                      </h3>
                      <p className="text-gray-700">{page.personality}</p>
                    </div>
                  )}
                  {page.values && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2">
                        Values
                      </h3>
                      <p className="text-gray-700">{page.values}</p>
                    </div>
                  )}
                  {page.beliefs && (
                    <div className="bg-white/50 p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-gold-secondary mb-2">
                        Beliefs
                      </h3>
                      <p className="text-gray-700">{page.beliefs}</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {page.mediaItems
                        .filter((item) => item.type === "IMAGE")
                        .map((item, index) => (
                          <div
                            key={index}
                            className="relative aspect-square group"
                          >
                            <div
                              className="w-full h-full cursor-pointer"
                              onClick={() =>
                                setSelectedImage({
                                  url: getSupabaseUrl(item.url),
                                  description: item.description,
                                  location: item.location,
                                  dateTaken: item.dateTaken,
                                })
                              }
                            >
                              <Image
                                src={getSupabaseUrl(item.url)}
                                alt={
                                  item.description || `Media item ${index + 1}`
                                }
                                fill
                                className="object-cover rounded-lg transition-transform group-hover:scale-105"
                              />
                            </div>
                            {(item.location || item.description) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.location && (
                                  <p className="text-sm mb-1">
                                    {item.location}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-sm">{item.description}</p>
                                )}
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
            <div className="bg-black/80 text-white p-6">
              <div className="max-w-4xl mx-auto">
                {selectedImage.description && (
                  <p className="text-lg mb-4">{selectedImage.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  {selectedImage.location && (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
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
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
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
