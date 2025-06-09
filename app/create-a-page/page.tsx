"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageType } from "@prisma/client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SectionHeader from "@/components/section-header";
import { useUser } from "@clerk/nextjs";
import { useLegacyPage } from "@/hooks/useLegacyPage";
import Link from "next/link";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_BUCKET = "legacy-media";

const formSchema = z.object({
  pageType: z.enum(["MEMORIAL", "BIOGRAPHY", "AUTOBIOGRAPHY"]),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, {
      message: "URL can only contain lowercase letters, numbers, and hyphens",
    }),
  honoureeName: z.string().min(2),
  creatorName: z.string().min(2),
  dateOfBirth: z.string(),
  hasTransitioned: z.boolean().default(false),
  dateOfPassing: z.string().optional(),
  relationship: z.string().min(2),
  storyName: z.string().min(2).default("Story"),
  story: z.string().min(10),
  coverPhoto: z.string().optional(),
  honoureePhoto: z.string().optional(),
  backgroundImage: z.string().optional(),
  videoUrl: z.string().url().optional(),
  isNextOfKin: z.boolean().optional(),
  // Font selections
  headingFont: z.string().default("Playfair Display"),
  bodyFont: z.string().default("Lora"),
  accentFont: z.string().default("Cormorant Garamond"),

  // General Knowledge
  personality: z.string().optional(),
  values: z.string().optional(),
  beliefs: z.string().optional(),

  // Media Items
  photos: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        preview: z.string().optional(),
        dateTaken: z.string(),
        location: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .default([]),

  soundClips: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        dateTaken: z.string(),
        location: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .default([]),

  // Events
  events: z
    .array(
      z.object({
        name: z.string(),
        date: z.string(),
        time: z.string(),
        rsvpBy: z.string().optional(),
        location: z.string(),
        googleMapsCode: z.string().optional(),
        externalUrl: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .default([]),

  // Relationships
  relationships: z
    .array(
      z.object({
        type: z.string(),
        isCustomType: z.boolean(),
        name: z.string(),
      })
    )
    .default([]),

  // Insights
  insights: z
    .array(
      z.object({
        message: z.string(),
      })
    )
    .default([]),

  // Memorial Details (only for MEMORIAL type)
  funeralWishes: z.string().optional(),
  obituary: z.string().optional(),
  funeralHome: z.string().optional(),
  viewingDetails: z.string().optional(),
  processionDetails: z.string().optional(),
  serviceDetails: z.string().optional(),
  wakeDetails: z.string().optional(),
  finalRestingPlace: z.string().optional(),
  eulogy: z.string().optional(),
  orderOfService: z.string().optional(),
  familyMessage: z.string().optional(),
  memorialVideo: z.string().optional(),
  tributes: z.string().optional(),
  messageFromHonouree: z.string().optional(),

  quotes: z
    .array(
      z.object({
        text: z.string().min(1, "Quote text is required"),
        author: z.string().optional(),
      })
    )
    .default([]),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateLegacyPage() {
  const { user } = useUser();
  const { legacyPage } = useLegacyPage();
  const [pageType, setPageType] = useState<PageType>(PageType.MEMORIAL);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [honoureePhotoPreview, setHonoureePhotoPreview] = useState<
    string | null
  >(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(
    null
  );
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<
    string | null
  >(null);
  const [photos, setPhotos] = useState<FormData["photos"]>([]);
  const [soundClips, setSoundClips] = useState<FormData["soundClips"]>([]);
  const [events, setEvents] = useState<FormData["events"]>([]);
  const [relationships, setRelationships] = useState<FormData["relationships"]>(
    []
  );
  const [insights, setInsights] = useState<FormData["insights"]>([]);
  const [isNextOfKin, setIsNextOfKin] = useState(false);
  const [isAuthorizedBiography, setIsAuthorizedBiography] = useState(false);
  const [isAuthorizedAutobiography, setIsAuthorizedAutobiography] =
    useState(false);
  const [isCustomRelationship, setIsCustomRelationship] = useState(false);
  const [hasExistingPage, setHasExistingPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<FormData["quotes"]>([]);

  // Font options
  const fontOptions = [
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Lora", label: "Lora" },
    { value: "Cormorant Garamond", label: "Cormorant Garamond" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Libre Baskerville", label: "Libre Baskerville" },
    { value: "Crimson Text", label: "Crimson Text" },
    { value: "Source Serif Pro", label: "Source Serif Pro" },
    { value: "PT Serif", label: "PT Serif" },
    { value: "Noto Serif", label: "Noto Serif" },
    { value: "EB Garamond", label: "EB Garamond" },
  ];

  const relationshipTypes = [
    "Child of",
    "Daughter of",
    "Son of",
    "Grandchild of",
    "Nibling of",
    "Sibling of",
    "Spouse of",
    "Parent of",
    "Friend of",
    "Other",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasTransitioned: false,
      storyName: "Story",
      pageType: PageType.MEMORIAL,
    },
  });

  // Update pageType in form when it changes
  useEffect(() => {
    setValue("pageType", pageType);
  }, [pageType, setValue]);

  useEffect(() => {
    const checkExistingPage = async () => {
      try {
        const response = await fetch("/api/legacy/check");
        const data = await response.json();
        setHasExistingPage(data.hasPage);
      } catch (error) {
        console.error("Error checking existing page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingPage();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  if (hasExistingPage) {
    return (
      <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12">
        <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
          <Navbar />
          <div className="py-16 md:py-24 text-center">
            <Image
              src="/images/gold-logo.png"
              alt="A Life Worth Remembering"
              width={200}
              height={200}
              className="mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-gold-primary mb-6">
              You Already Have a Legacy Page
            </h1>
            <p className="text-xl text-gold-secondary mb-8 max-w-2xl mx-auto">
              Each user can only create one legacy page. You can view and edit
              your existing page.
            </p>
            <div className="space-y-4">
              <Link
                href={`/legacy/${legacyPage?.slug}`}
                className="inline-block bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-8 py-3 transition-colors"
              >
                View My Legacy Page
              </Link>
              <p className="text-sm text-gold-secondary">
                Need to make changes? Contact support for assistance.
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      // Create FormData object for file uploads
      const formData = new FormData();

      // Add user information
      if (user) {
        formData.append("email", user.emailAddresses[0].emailAddress);
        formData.append("firstName", user.firstName || "");
        formData.append("lastName", user.lastName || "");
      }

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else if (typeof value === "string") {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            // Handle arrays separately
            return;
          }
        }
      });

      // Ensure pageType is included
      formData.append("pageType", pageType);

      // Add media files
      if (honoureePhotoPreview) {
        const response = await fetch(honoureePhotoPreview);
        const blob = await response.blob();
        formData.append("honoureePhoto", blob);
      }

      if (coverPhotoPreview) {
        const response = await fetch(coverPhotoPreview);
        const blob = await response.blob();
        formData.append("coverPhoto", blob);
      }

      if (backgroundImagePreview) {
        const response = await fetch(backgroundImagePreview);
        const blob = await response.blob();
        formData.append("backgroundImage", blob);
      }

      // Add photos
      photos.forEach((photo, index) => {
        if (photo.file) {
          formData.append(`photos[${index}][file]`, photo.file);
        }
        formData.append(`photos[${index}][dateTaken]`, photo.dateTaken);
        if (photo.location) {
          formData.append(`photos[${index}][location]`, photo.location);
        }
        if (photo.description) {
          formData.append(`photos[${index}][description]`, photo.description);
        }
        if (photo.category) {
          formData.append(`photos[${index}][category]`, photo.category);
        }
      });

      // Add sound clips
      soundClips.forEach((clip, index) => {
        if (clip.file) {
          formData.append(`soundClips[${index}][file]`, clip.file);
        }
        formData.append(`soundClips[${index}][dateTaken]`, clip.dateTaken);
        if (clip.location) {
          formData.append(`soundClips[${index}][location]`, clip.location);
        }
        if (clip.description) {
          formData.append(
            `soundClips[${index}][description]`,
            clip.description
          );
        }
      });

      // Add events
      events.forEach((event, index) => {
        Object.entries(event).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(`events[${index}][${key}]`, value.toString());
          }
        });
      });

      // Add relationships
      relationships.forEach((rel, index) => {
        Object.entries(rel).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(
              `relationships[${index}][${key}]`,
              value.toString()
            );
          }
        });
      });

      // Add insights
      insights.forEach((insight, index) => {
        formData.append(`insights[${index}][message]`, insight.message);
      });

      // Add quotes
      quotes.forEach((quote, index) => {
        formData.append(`quotes[${index}][text]`, quote.text);
        if (quote.author) {
          formData.append(`quotes[${index}][author]`, quote.author);
        }
      });

      // Send to API
      const response = await fetch("/api/legacy", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create page");
      }

      setSubmitMessage({
        type: "success",
        message: "Page created successfully!",
      });

      // Redirect to the created page
      window.location.href = `/legacy/${data.slug}`;
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create page. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = () => {
    const newPhoto = {
      file: undefined,
      preview: undefined,
      dateTaken: new Date().toISOString().split("T")[0],
      location: "",
      description: "",
      category: "",
    };
    setPhotos([...photos, newPhoto]);
  };

  const handlePhotoChange = (index: number, file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhotos = [...photos];
        updatedPhotos[index] = {
          ...updatedPhotos[index],
          file,
          preview: reader.result as string,
        };
        setPhotos(updatedPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoundClipUpload = () => {
    const newSoundClip = {
      file: undefined,
      dateTaken: new Date().toISOString().split("T")[0],
      location: "",
      description: "",
    };
    setSoundClips([...soundClips, newSoundClip]);
  };

  const handleAddEvent = () => {
    const newEvent = {
      name: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      rsvpBy: "",
      location: "",
      googleMapsCode: "",
      externalUrl: "",
      message: "",
    };
    setEvents([...events, newEvent]);
  };

  const handleAddRelationship = () => {
    const newRelationship = {
      type: "",
      isCustomType: false,
      name: "",
    };
    setRelationships([...relationships, newRelationship]);
  };

  const handleAddInsight = () => {
    const newInsight = {
      message: "",
    };
    setInsights([...insights, newInsight]);
  };

  const handleAddQuote = () => {
    const newQuote = {
      text: "",
      author: "",
    };
    setQuotes([...quotes, newQuote]);
  };

  type ItemType =
    | "photos"
    | "soundClips"
    | "events"
    | "relationships"
    | "insights"
    | "quotes";

  const handleItemChange = (
    index: number,
    field: string,
    value: any,
    type: ItemType
  ) => {
    const setter = {
      photos: setPhotos,
      soundClips: setSoundClips,
      events: setEvents,
      relationships: setRelationships,
      insights: setInsights,
      quotes: setQuotes,
    }[type];

    const items = {
      photos,
      soundClips,
      events,
      relationships,
      insights,
      quotes,
    }[type];

    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    (setter as React.Dispatch<React.SetStateAction<any[]>>)(updatedItems);
  };

  const removeItem = (index: number, type: ItemType) => {
    switch (type) {
      case "photos":
        setPhotos(photos.filter((_, i) => i !== index));
        break;
      case "soundClips":
        setSoundClips(soundClips.filter((_, i) => i !== index));
        break;
      case "events":
        setEvents(events.filter((_, i) => i !== index));
        break;
      case "relationships":
        setRelationships(relationships.filter((_, i) => i !== index));
        break;
      case "insights":
        setInsights(insights.filter((_, i) => i !== index));
        break;
      case "quotes":
        setQuotes(quotes.filter((_, i) => i !== index));
        break;
    }
  };

  return (
    <div className="min-h-screen">
      <div
        className="w-full py-8 px-4 md:px-8 lg:px-12"
        style={{
          backgroundImage: "url('/images/background-new.jpeg')",
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

          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center space-y-6 mb-12">
                <Image
                  src="/images/gold-logo.png"
                  alt="A Life Worth Remembering"
                  width={200}
                  height={200}
                  className="mb-4"
                />
                <h1 className="text-4xl md:text-5xl font-bold text-gold-primary text-center">
                  CREATE A LEGACY PAGE
                </h1>
                <p className="text-xl text-gold-secondary text-center max-w-2xl">
                  Take your time to create a meaningful page for yourself or a
                  loved one
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-4xl mx-auto space-y-8 bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-gold"
              >
                {/* Page Type Selection */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gold-primary mb-4">
                    Page Information
                  </h3>

                  <h3 className="text-xl font-bold text-gold-primary mb-4">
                    Page Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(PageType).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPageType(type)}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          pageType === type
                            ? "border-gold-primary bg-gold-primary/10"
                            : "border-gold-primary/30 hover:border-gold-primary/50"
                        }`}
                      >
                        <h4 className="font-bold text-gold-primary mb-2">
                          {type.charAt(0) + type.slice(1).toLowerCase()}
                        </h4>
                        <p className="text-sm text-gold-secondary">
                          {type === PageType.MEMORIAL
                            ? "Honor and remember a loved one who has passed"
                            : type === PageType.BIOGRAPHY
                            ? "Share someone's life story and achievements"
                            : "Tell your own life story and experiences"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next of Kin Checkbox for Memorial */}
                {pageType === "MEMORIAL" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNextOfKin"
                      checked={isNextOfKin}
                      onChange={(e) => setIsNextOfKin(e.target.checked)}
                      className="h-4 w-4 text-gold-primary focus:ring-gold-primary border-gold-primary/50 rounded"
                    />
                    <label
                      htmlFor="isNextOfKin"
                      className="text-gold-secondary"
                    >
                      I confirm that I am the next of kin and have legal
                      authority to create this page on behalf of the honouree
                    </label>
                  </div>
                )}

                {/* Confirm authority for Biography */}
                {pageType === "BIOGRAPHY" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAuthorizedBiography"
                      checked={isAuthorizedBiography}
                      onChange={(e) =>
                        setIsAuthorizedBiography(e.target.checked)
                      }
                      className="h-4 w-4 text-gold-primary focus:ring-gold-primary border-gold-primary/50 rounded"
                    />
                    <label
                      htmlFor="isAuthorizedBiography"
                      className="text-gold-secondary"
                    >
                      I confirm that I have the authority to create this page on
                      behalf of the honouree.
                    </label>
                  </div>
                )}

                {/* Confirm authority for Autobiography */}
                {pageType === "AUTOBIOGRAPHY" && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAuthorizedAutobiography"
                      checked={isAuthorizedAutobiography}
                      onChange={(e) =>
                        setIsAuthorizedAutobiography(e.target.checked)
                      }
                      className="h-4 w-4 text-gold-primary focus:ring-gold-primary border-gold-primary/50 rounded"
                    />
                    <label
                      htmlFor="isAuthorizedAutobiography"
                      className="text-gold-secondary"
                    >
                      I confirm that I am the honouree and have legal authority
                      to create this page on behalf of myself.
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-gold-primary font-bold">
                    Unique Page URL
                  </label>
                  <input
                    {...register("slug")}
                    className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                    placeholder="your-unique-page-url"
                  />
                </div>

                <div>
                  <label className="block text-gold-primary font-bold">
                    Background Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setBackgroundImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                  />
                  {backgroundImagePreview && (
                    <div className="mt-2">
                      <img
                        src={backgroundImagePreview}
                        alt="Background image preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gold-secondary mt-1">
                    Upload a background image for the page (optional)
                  </p>
                </div>

                {/* Typography Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gold-primary mb-4">
                    Typography
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gold-primary font-bold mb-2">
                        Heading Font
                      </label>
                      <select
                        {...register("headingFont")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 rounded-md p-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
                        style={{ fontFamily: "var(--heading-font)" }}
                      >
                        {fontOptions.map((font) => (
                          <option
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold mb-2">
                        Body Font
                      </label>
                      <select
                        {...register("bodyFont")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 rounded-md p-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
                        style={{ fontFamily: "var(--body-font)" }}
                      >
                        {fontOptions.map((font) => (
                          <option
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold mb-2">
                        Accent Font
                      </label>
                      <select
                        {...register("accentFont")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 rounded-md p-3 focus:border-gold-primary focus:ring-1 focus:ring-gold-primary"
                        style={{ fontFamily: "var(--accent-font)" }}
                      >
                        {fontOptions.map((font) => (
                          <option
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gold-secondary">
                    These fonts will be used throughout your legacy page. Choose
                    fonts that reflect the personality and style you want to
                    convey.
                  </p>
                </div>

                {/* Account Holder's Details Section */}
                <div>
                  <h3 className="text-xl font-bold text-gold-primary mb-4">
                    Account Holder's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Your Name
                      </label>
                      <input
                        {...register("creatorName")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Relationship
                      </label>
                      <input
                        {...register("relationship")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Your relationship to the honouree"
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gold-primary mb-4">
                    Honouree's Details
                  </h3>
                  {/* Other Basic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Honouree Name
                      </label>
                      <input
                        {...register("honoureeName")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Enter honouree's full name"
                      />
                    </div>

                    <div>
                      <label className="block text-gold-primary font-bold">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        {...register("dateOfBirth")}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Select date of birth"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasTransitioned"
                        {...register("hasTransitioned")}
                        onChange={(e) => setHasTransitioned(e.target.checked)}
                        className="h-4 w-4 text-gold-primary focus:ring-gold-primary border-gold-primary/50 rounded"
                      />
                      <label
                        htmlFor="hasTransitioned"
                        className="text-gold-secondary"
                      >
                        Honouree has transitioned
                      </label>
                    </div>
                    {hasTransitioned && (
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Date of Passing
                        </label>
                        <input
                          type="date"
                          {...register("dateOfPassing")}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Select date of passing"
                        />
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Honouree's Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setHonoureePhotoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                      />
                      {honoureePhotoPreview && (
                        <div className="mt-2">
                          <img
                            src={honoureePhotoPreview}
                            alt="Honouree photo preview"
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gold-secondary mt-1">
                        Upload a clear photo of the honouree
                      </p>
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Cover Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCoverPhotoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                      />
                      {coverPhotoPreview && (
                        <div className="mt-2">
                          <img
                            src={coverPhotoPreview}
                            alt="Cover photo preview"
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gold-secondary mt-1">
                        Upload a cover photo for the legacy page
                      </p>
                    </div>
                  </div>

                  {/* Video URL Section */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Introduction Video
                      </label>
                      <input
                        {...register("videoUrl")}
                        type="url"
                        placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                      />
                      <p className="text-sm text-gold-secondary mt-1">
                        Add a video URL to be displayed on the legacy page
                        (optional)
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gold-primary font-bold">
                      Introduction Title
                    </label>
                    <input
                      {...register("storyName")}
                      placeholder="A Life Worth Remembering"
                      className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3 mb-4"
                    />
                    <label className="block text-gold-primary font-bold">
                      Introduction
                    </label>
                    <textarea
                      {...register("story")}
                      rows={6}
                      className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                      placeholder="Share the honouree's story..."
                    />
                  </div>
                </div>

                {/* General Knowledge Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gold-primary">
                    General Knowledge
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Personality
                      </label>
                      <textarea
                        {...register("personality")}
                        rows={3}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Describe the honouree's personality..."
                      />
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Values
                      </label>
                      <textarea
                        {...register("values")}
                        rows={3}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Share the honouree's values..."
                      />
                    </div>
                    <div>
                      <label className="block text-gold-primary font-bold">
                        Beliefs
                      </label>
                      <textarea
                        {...register("beliefs")}
                        rows={3}
                        className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                        placeholder="Share the honouree's beliefs..."
                      />
                    </div>
                  </div>
                </div>

                {/* Memorial Details Section */}
                {pageType === "MEMORIAL" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gold-primary">
                      Memorial Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Funeral Wishes
                        </label>
                        <textarea
                          {...register("funeralWishes")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter funeral wishes..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Obituary
                        </label>
                        <textarea
                          {...register("obituary")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter obituary text..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Funeral Home
                        </label>
                        <input
                          {...register("funeralHome")}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter funeral home name"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Viewing Details
                        </label>
                        <textarea
                          {...register("viewingDetails")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter viewing details..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Procession Details
                        </label>
                        <textarea
                          {...register("processionDetails")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter procession details..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Service Details
                        </label>
                        <textarea
                          {...register("serviceDetails")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter service details..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Wake Details
                        </label>
                        <textarea
                          {...register("wakeDetails")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter wake details..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Final Resting Place
                        </label>
                        <input
                          {...register("finalRestingPlace")}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter final resting place"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Eulogy
                        </label>
                        <textarea
                          {...register("eulogy")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter eulogy text..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Order of Service
                        </label>
                        <input
                          {...register("orderOfService")}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter order of service"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Family Message
                        </label>
                        <textarea
                          {...register("familyMessage")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter family message..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Memorial Video
                        </label>
                        <input
                          {...register("memorialVideo")}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter memorial video URL"
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Tributes
                        </label>
                        <textarea
                          {...register("tributes")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter tributes..."
                        />
                      </div>
                      <div>
                        <label className="block text-gold-primary font-bold">
                          Message from Honouree
                        </label>
                        <textarea
                          {...register("messageFromHonouree")}
                          rows={3}
                          className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-3"
                          placeholder="Enter message from honouree..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gold-primary">
                      Gallery
                    </h3>
                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      className="bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                    >
                      Add Photo
                    </button>
                  </div>

                  {photos.length > 0 && (
                    <div className="space-y-4">
                      {photos.map((photo, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Photo {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "photos")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Photo Upload
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handlePhotoChange(index, e.target.files?.[0])
                                }
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                              {photo.preview && (
                                <div className="mt-2">
                                  <img
                                    src={photo.preview}
                                    alt={`Photo ${index + 1} preview`}
                                    className="w-32 h-32 object-cover rounded-md"
                                  />
                                </div>
                              )}
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Date Taken
                              </label>
                              <input
                                type="date"
                                value={photo.dateTaken}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "dateTaken",
                                    e.target.value,
                                    "photos"
                                  )
                                }
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                placeholder="Select date taken"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={photo.location}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "location",
                                    e.target.value,
                                    "photos"
                                  )
                                }
                                placeholder="Where was this taken?"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Description
                              </label>
                              <textarea
                                value={photo.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value,
                                    "photos"
                                  )
                                }
                                placeholder="Tell us about this photo..."
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                rows={3}
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Category (Optional)
                              </label>
                              <input
                                type="text"
                                value={photo.category}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "category",
                                    e.target.value,
                                    "photos"
                                  )
                                }
                                placeholder="e.g., Family, Travel, Celebration"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sound Clips Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gold-primary">
                      Sound Clips
                    </h3>
                    <button
                      type="button"
                      onClick={handleSoundClipUpload}
                      className="bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                    >
                      Add Sound Clip
                    </button>
                  </div>

                  {soundClips.length > 0 && (
                    <div className="space-y-4">
                      {soundClips.map((clip, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Sound Clip {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "soundClips")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Audio Upload
                              </label>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "file",
                                    e.target.files?.[0],
                                    "soundClips"
                                  )
                                }
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                placeholder="Choose an audio file to upload"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Date Recorded
                              </label>
                              <input
                                type="date"
                                value={clip.dateTaken}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "dateTaken",
                                    e.target.value,
                                    "soundClips"
                                  )
                                }
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                placeholder="Select date recorded"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={clip.location}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "location",
                                    e.target.value,
                                    "soundClips"
                                  )
                                }
                                placeholder="Where was this recorded?"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Description
                              </label>
                              <textarea
                                value={clip.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value,
                                    "soundClips"
                                  )
                                }
                                placeholder="Tell us about this recording..."
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Events Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gold-primary">
                      Events
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddEvent}
                      className="bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                    >
                      Add Event
                    </button>
                  </div>

                  {events.length > 0 && (
                    <div className="space-y-4">
                      {events.map((event, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Event {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "events")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Event Name
                              </label>
                              <input
                                type="text"
                                value={event.name}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "name",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                placeholder="Enter event name"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-gold-secondary mb-1">
                                  Date
                                </label>
                                <input
                                  type="date"
                                  value={event.date}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "date",
                                      e.target.value,
                                      "events"
                                    )
                                  }
                                  className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                  placeholder="Select event date"
                                />
                              </div>
                              <div>
                                <label className="block text-gold-secondary mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  value={event.time}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "time",
                                      e.target.value,
                                      "events"
                                    )
                                  }
                                  className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                  placeholder="Select event time"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                RSVP By
                              </label>
                              <input
                                type="datetime-local"
                                value={event.rsvpBy}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "rsvpBy",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                placeholder="Select RSVP deadline"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                value={event.location}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "location",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                placeholder="Enter event location"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Google Maps GEO Code
                              </label>
                              <input
                                type="text"
                                value={event.googleMapsCode}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "googleMapsCode",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                placeholder="Enter Google Maps GEO Code"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                External Event URL
                              </label>
                              <input
                                type="url"
                                value={event.externalUrl}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "externalUrl",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                placeholder="Enter external event URL"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-gold-secondary mb-1">
                                Message
                              </label>
                              <textarea
                                value={event.message}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "message",
                                    e.target.value,
                                    "events"
                                  )
                                }
                                placeholder="Enter event message or description"
                                className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relationships Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gold-primary">
                    Relationships
                  </h3>

                  {relationships.length > 0 && (
                    <div className="space-y-4">
                      {relationships.map((relationship, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Relationship {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "relationships")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <label className="block text-gold-secondary mb-1">
                              Relationship Type
                            </label>
                            <select
                              value={relationship.type}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "type",
                                  e.target.value,
                                  "relationships"
                                )
                              }
                              className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            >
                              <option value="">Select relationship type</option>
                              {relationshipTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mt-4">
                            <label className="block text-gold-secondary mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={relationship.name}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "name",
                                  e.target.value,
                                  "relationships"
                                )
                              }
                              placeholder="Name of the person"
                              className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddRelationship}
                    className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                  >
                    Add Relationship
                  </button>
                </div>

                {/* Insights Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gold-primary">
                    Insights
                  </h3>

                  {insights.length > 0 && (
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Insight {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "insights")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <label className="block text-gold-secondary mb-1">
                              Message
                            </label>
                            <textarea
                              value={insight.message}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "message",
                                  e.target.value,
                                  "insights"
                                )
                              }
                              placeholder="Share an insight or memory..."
                              className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddInsight}
                    className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                  >
                    Add Insight
                  </button>
                </div>

                {/* Quotes Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gold-primary">
                    Quotes Or Personal Message
                  </h3>

                  {quotes.length > 0 && (
                    <div className="space-y-4">
                      {quotes.map((quote, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-lg border border-gold-primary/50"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-gold-primary font-bold">
                              Quote {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index, "quotes")}
                              className="text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div>
                            <label className="block text-gold-secondary mb-1">
                              Quote Text
                            </label>
                            <textarea
                              value={quote.text}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "text",
                                  e.target.value,
                                  "quotes"
                                )
                              }
                              placeholder="Enter the quote..."
                              className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                              rows={3}
                            />
                          </div>

                          <div className="mt-4">
                            <label className="block text-gold-secondary mb-1">
                              Author (Optional)
                            </label>
                            <input
                              type="text"
                              value={quote.author}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "author",
                                  e.target.value,
                                  "quotes"
                                )
                              }
                              placeholder="Who said this quote?"
                              className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddQuote}
                    className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
                  >
                    Add Quote
                  </button>
                </div>

                {/* Submit Button */}
                <div className="mt-12">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (pageType === "MEMORIAL" && !isNextOfKin) ||
                      (pageType === "BIOGRAPHY" && !isAuthorizedBiography) ||
                      (pageType === "AUTOBIOGRAPHY" &&
                        !isAuthorizedAutobiography)
                    }
                    className="relative w-full py-4 px-16 text-base font-medium text-purple-primary transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src="/images/button.png"
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>Creating...</span>
                        </>
                      ) : (
                        "Create Page"
                      )}
                    </span>
                  </button>
                </div>

                {/* Error/Success Message */}
                {submitMessage && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      submitMessage.type === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submitMessage.message}
                  </div>
                )}
              </form>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}
