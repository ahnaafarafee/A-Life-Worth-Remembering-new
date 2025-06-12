import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { GoldButton } from "@/components/gold-button";
import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import WhyChooseSection from "@/components/why-choose-section";
import TestimonialSection from "@/components/testimonial-section";
import FeaturedMemorials from "@/components/featured-memorials";
import PricingSection from "@/components/pricing-section";
import AuthRedirect from "@/components/auth-redirect";
import FamilyTreeSection from "@/components/family-tree-section";
import SlidingBanner from "@/components/sliding-banner";
import MediaMentions from "@/components/media-mentions";

export default function Home() {
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
      <AuthRedirect />
      <div className="container mx-auto max-w-7xl bg-white rounded-lg border-4 border-gold-primary shadow-2xl overflow-hidden">
        <Navbar />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-6 md:py-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gold-primary leading-tight">
                CREATE YOUR ONLINE LEGACY{" "}
                <span className="block mt-1 md:mt-0 md:inline font-bold">
                  WITH PASSION AND PURPOSE
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-700 max-w-xl mx-auto md:mx-0">
                A personalised platform where you can preserve the story of a
                loved-one who has passed or journal your own life story and
                future memorial wishes.
              </p>
              <div className="flex justify-center md:justify-start">
                <GoldButton href="/create-a-page">Get Started</GoldButton>
              </div>
            </div>
            <div className="flex justify-center mt-6 md:mt-0">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
                <Image
                  src="/images/logo.png"
                  alt="A Life Worth Remembering"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        {/* Sliding Banner */}
        <div className="mb-4">
          <SlidingBanner />
        </div>
        {/* Hero Banner (replacing Sliding Banner) */}
        <div>
          <HeroSection />
        </div>

        {/* Why Choose Section */}
        <div>
          <WhyChooseSection />
        </div>

        {/* Featured Memorials - New Modern Design */}
        <div>
          <FeaturedMemorials />
        </div>

        {/* Family Tree Section */}
        <div>
          <FamilyTreeSection />
        </div>

        {/* How It Works - New Design */}
        <div>
          <HowItWorks />
        </div>

        {/* Pricing Section */}
        <div>
          <PricingSection />
        </div>

        {/* Testimonials - New Design */}
        <div>
          <TestimonialSection />
        </div>
        {/* Media Mentions Section */}
        <MediaMentions />

        <Footer />
      </div>
    </div>
  );
}
