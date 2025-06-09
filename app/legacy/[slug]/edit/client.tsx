"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageType } from "@prisma/client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
  isNextOfKin: z.boolean().optional(),

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
      })
    )
    .default([]),

  soundClips: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        preview: z.string().optional(),
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

export default function EditLegacyPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { user } = useUser();
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
  const [photos, setPhotos] = useState<FormData["photos"]>([]);
  const [soundClips, setSoundClips] = useState<FormData["soundClips"]>([]);
  const [events, setEvents] = useState<FormData["events"]>([]);
  const [relationships, setRelationships] = useState<FormData["relationships"]>(
    []
  );
  const [insights, setInsights] = useState<FormData["insights"]>([]);
  const [isNextOfKin, setIsNextOfKin] = useState(false);
  const [isCustomRelationship, setIsCustomRelationship] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<FormData["quotes"]>([]);

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
    },
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/legacy/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch legacy page");
        }
        const data = await response.json();

        // Set form values
        setValue("pageType", data.pageType);
        setValue("slug", data.slug);
        setValue("honoureeName", data.honoureeName);
        setValue("creatorName", data.creatorName);
        setValue(
          "dateOfBirth",
          new Date(data.dateOfBirth).toISOString().split("T")[0]
        );
        setValue("hasTransitioned", data.hasTransitioned);
        if (data.dateOfPassing) {
          setValue(
            "dateOfPassing",
            new Date(data.dateOfPassing).toISOString().split("T")[0]
          );
        }
        setValue("relationship", data.relationship);
        setValue("storyName", data.storyName);
        setValue("story", data.story);
        setValue("personality", data.generalKnowledge?.personality || "");
        setValue("values", data.generalKnowledge?.values || "");
        setValue("beliefs", data.generalKnowledge?.beliefs || "");

        // Set state values
        setPageType(data.pageType);
        setHasTransitioned(data.hasTransitioned);
        setHonoureePhotoPreview(data.honoureePhoto);
        setCoverPhotoPreview(data.coverPhoto);
        setIsNextOfKin(data.isNextOfKin);

        // Set media items
        if (data.mediaItems && Array.isArray(data.mediaItems)) {
          const photos = data.mediaItems
            .filter((item: any) => item.type === "IMAGE")
            .map((item: any) => ({
              preview: item.url,
              dateTaken: new Date(item.dateTaken).toISOString().split("T")[0],
              location: item.location || "",
              description: item.description || "",
            }));
          setPhotos(photos);

          const soundClips = data.mediaItems
            .filter((item: any) => item.type === "AUDIO")
            .map((item: any) => ({
              preview: item.url,
              dateTaken: new Date(item.dateTaken).toISOString().split("T")[0],
              location: item.location || "",
              description: item.description || "",
            }));
          setSoundClips(soundClips);
        }

        // Set events
        if (data.events && Array.isArray(data.events)) {
          const events = data.events.map((event: any) => ({
            ...event,
            date: new Date(event.date).toISOString().split("T")[0],
            rsvpBy: event.rsvpBy
              ? new Date(event.rsvpBy).toISOString().split("T")[0]
              : "",
          }));
          setEvents(events);
        }

        // Set relationships
        if (data.relationships && Array.isArray(data.relationships)) {
          setRelationships(data.relationships);
        }

        // Set insights
        if (data.insights && Array.isArray(data.insights)) {
          setInsights(data.insights);
        }

        // Set quotes
        if (data.quotes && Array.isArray(data.quotes)) {
          setQuotes(data.quotes);
        }

        // Set memorial details if applicable
        if (data.pageType === "MEMORIAL" && data.memorialDetails) {
          setValue("funeralWishes", data.memorialDetails.funeralWishes || "");
          setValue("obituary", data.memorialDetails.obituary || "");
          setValue("funeralHome", data.memorialDetails.funeralHome || "");
          setValue("viewingDetails", data.memorialDetails.viewingDetails || "");
          setValue(
            "processionDetails",
            data.memorialDetails.processionDetails || ""
          );
          setValue("serviceDetails", data.memorialDetails.serviceDetails || "");
          setValue("wakeDetails", data.memorialDetails.wakeDetails || "");
          setValue(
            "finalRestingPlace",
            data.memorialDetails.finalRestingPlace || ""
          );
          setValue("eulogy", data.memorialDetails.eulogy || "");
          setValue("orderOfService", data.memorialDetails.orderOfService || "");
          setValue("familyMessage", data.memorialDetails.familyMessage || "");
          setValue("memorialVideo", data.memorialDetails.memorialVideo || "");
          setValue("tributes", data.memorialDetails.tributes || "");
          setValue(
            "messageFromHonouree",
            data.memorialDetails.messageFromHonouree || ""
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching page:", error);
        setSubmitMessage({
          type: "error",
          message: "Failed to load page data. Please try again.",
        });
        setIsLoading(false);
      }
    };

    fetchPage();
  }, [slug, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitMessage(null);

      const formData = new FormData();

      // Add user information
      if (user) {
        formData.append("email", user.emailAddresses[0].emailAddress);
        formData.append("firstName", user.firstName || "");
        formData.append("lastName", user.lastName || "");
      }

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else if (typeof value === "string") {
            formData.append(key, value);
          }
        }
      });

      // Add media files only if they've been changed
      if (honoureePhotoPreview && honoureePhotoPreview.startsWith("data:")) {
        const response = await fetch(honoureePhotoPreview);
        const blob = await response.blob();
        formData.append("honoureePhoto", blob);
      } else if (honoureePhotoPreview) {
        formData.append("honoureePhoto", honoureePhotoPreview);
      }

      if (coverPhotoPreview && coverPhotoPreview.startsWith("data:")) {
        const response = await fetch(coverPhotoPreview);
        const blob = await response.blob();
        formData.append("coverPhoto", blob);
      } else if (coverPhotoPreview) {
        formData.append("coverPhoto", coverPhotoPreview);
      }

      // Add photos - only send new files or modified data
      photos.forEach((photo, index) => {
        if (photo.file) {
          // New photo file
          formData.append(`photos[${index}][file]`, photo.file);
        } else if (photo.preview) {
          // Existing photo
          formData.append(`photos[${index}][preview]`, photo.preview);
        }
        formData.append(`photos[${index}][dateTaken]`, photo.dateTaken);
        if (photo.location) {
          formData.append(`photos[${index}][location]`, photo.location);
        }
        if (photo.description) {
          formData.append(`photos[${index}][description]`, photo.description);
        }
      });

      // Add sound clips
      soundClips.forEach((clip, index) => {
        if (clip.file) {
          formData.append(`soundClips[${index}][file]`, clip.file);
        } else if (clip.preview) {
          formData.append(`soundClips[${index}][preview]`, clip.preview);
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
          if (value !== undefined && value !== null) {
            formData.append(`events[${index}][${key}]`, value.toString());
          }
        });
      });

      // Add relationships
      relationships.forEach((rel, index) => {
        Object.entries(rel).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
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

      const response = await fetch(`/api/legacy/${slug}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update page");
      }

      setSubmitMessage({
        type: "success",
        message: "Page updated successfully!",
      });

      // Redirect to the updated page
      router.push(`/legacy/${slug}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update page. Please try again.",
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

  const handleItemChange = (
    index: number,
    field: string,
    value: any,
    type:
      | "photos"
      | "soundClips"
      | "events"
      | "relationships"
      | "insights"
      | "quotes"
  ) => {
    switch (type) {
      case "photos":
        setPhotos((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
      case "soundClips":
        setSoundClips((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
      case "events":
        setEvents((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
      case "relationships":
        setRelationships((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
      case "insights":
        setInsights((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
      case "quotes":
        setQuotes((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], [field]: value };
          return updated;
        });
        break;
    }
  };

  const removeItem = (
    index: number,
    type:
      | "photos"
      | "soundClips"
      | "events"
      | "relationships"
      | "insights"
      | "quotes"
  ) => {
    switch (type) {
      case "photos":
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        break;
      case "soundClips":
        setSoundClips((prev) => prev.filter((_, i) => i !== index));
        break;
      case "events":
        setEvents((prev) => prev.filter((_, i) => i !== index));
        break;
      case "relationships":
        setRelationships((prev) => prev.filter((_, i) => i !== index));
        break;
      case "insights":
        setInsights((prev) => prev.filter((_, i) => i !== index));
        break;
      case "quotes":
        setQuotes((prev) => prev.filter((_, i) => i !== index));
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full py-8 px-4 md:px-8 lg:px-12"
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
        <div className="py-16 md:py-24">
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
                EDIT LEGACY PAGE
              </h1>
              <p className="text-xl text-gold-secondary text-center max-w-2xl">
                Update your legacy page information
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl mx-auto space-y-8 bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-gold"
        >
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gold-primary">
              Basic Information
            </h3>

            {/* Page Type */}
            <div className="mb-6">
              <label className="block text-gold-primary font-bold mb-2">
                Page Type
              </label>
              <div className="relative">
                <select
                  {...register("pageType")}
                  disabled
                  className="w-full bg-gray-100 border-2 border-gold-primary/50 text-gray-700 rounded-md p-3 cursor-not-allowed appearance-none"
                  value={pageType}
                >
                  <option value="LEGACY">Legacy Page</option>
                  <option value="MEMORIAL">Memorial Page</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gold-secondary mt-2">
                Page type cannot be changed after creation
              </p>
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
                <label htmlFor="isNextOfKin" className="text-gold-secondary">
                  I confirm that I am the next of kin and have legal authority
                  to create this page on behalf of the honouree
                </label>
              </div>
            )}

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

            {/* Photo Upload Fields */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gold-primary">Photos</h3>

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
                            Photo
                          </label>
                          <div className="flex items-center space-x-4">
                            {photo.preview && (
                              <div className="relative w-24 h-24">
                                <Image
                                  src={photo.preview}
                                  alt={`Preview ${index + 1}`}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handlePhotoChange(index, e.target.files?.[0])
                              }
                              className="flex-1"
                            />
                          </div>
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
                            placeholder="Where was this photo taken?"
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
                            placeholder="Describe this photo..."
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handlePhotoUpload}
                className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
              >
                Add Photo
              </button>
            </div>

            {/* Sound Clips Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gold-primary">
                Sound Clips
              </h3>

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
                            Sound Clip
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
                            className="w-full"
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
                            placeholder="Describe this sound clip..."
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSoundClipUpload}
                className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
              >
                Add Sound Clip
              </button>
            </div>

            {/* Events Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gold-primary">Events</h3>

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
                            placeholder="Name of the event"
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                          />
                        </div>

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
                          />
                        </div>

                        <div>
                          <label className="block text-gold-secondary mb-1">
                            RSVP By
                          </label>
                          <input
                            type="date"
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
                            placeholder="Where is the event?"
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                          />
                        </div>

                        <div>
                          <label className="block text-gold-secondary mb-1">
                            Google Maps Code
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
                            placeholder="Google Maps location code"
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                          />
                        </div>

                        <div>
                          <label className="block text-gold-secondary mb-1">
                            External URL
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
                            placeholder="Event website or registration link"
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
                            placeholder="Additional event details..."
                            className="w-full bg-white border border-gold-primary/50 text-gray-900 placeholder:text-gray-500 rounded-md p-2"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleAddEvent}
                className="w-full bg-gold-primary/20 hover:bg-gold-primary/30 text-gold-primary border border-gold-primary rounded-md px-4 py-2 transition-colors"
              >
                Add Event
              </button>
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
              <h3 className="text-xl font-bold text-gold-primary">Insights</h3>

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
              <h3 className="text-xl font-bold text-gold-primary">Quotes</h3>

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

            {/* Submit Button */}
            <div className="space-y-4">
              {submitMessage && (
                <div
                  className={`p-4 rounded-md ${
                    submitMessage.type === "success"
                      ? "bg-green-100 border border-green-400 text-green-700"
                      : "bg-red-100 border border-red-400 text-red-700"
                  }`}
                >
                  {submitMessage.message}
                </div>
              )}
              <div className="relative w-full">
                <button
                  type="submit"
                  disabled={
                    (pageType === "MEMORIAL" && !isNextOfKin) || isSubmitting
                  }
                  className={`relative w-full py-4 px-16 text-base font-medium text-purple-primary transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
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
                        <span>Updating...</span>
                      </>
                    ) : (
                      "Update Page"
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <Footer />
      </div>
    </div>
  );
}
