import Image from "next/image";
import Link from "next/link";
import { GoldButton } from "@/components/gold-button";

export default function HeroSection() {
  return (
    <section className="lwm-hero-section relative w-full h-[400px] sm:h-[450px] md:h-[500px] overflow-hidden text-white flex items-center justify-center">
      <div className="lwm-hero-background absolute top-0 left-0 w-full h-full z-1">
        <Image
          src="/images/hero-background.png"
          alt="Memorial background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="lwm-hero-overlay absolute top-0 left-0 w-full h-full bg-purple-primary/80 z-2"></div>

      {/* Floating hearts */}
      <div className="lwm-floating-heart absolute w-[20px] h-[20px] sm:w-[25px] sm:h-[25px] md:w-[30px] md:h-[30px] top-[20%] left-[10%] opacity-60 z-2 animate-float-rotate-1">
        <Image
          src="/images/heart.png"
          alt=""
          fill
          className="drop-shadow-glow"
        />
      </div>
      <div className="lwm-floating-heart absolute w-[15px] h-[15px] sm:w-[20px] sm:h-[20px] md:w-[25px] md:h-[25px] top-[30%] right-[15%] opacity-60 z-2 animate-float-rotate-2">
        <Image
          src="/images/heart.png"
          alt=""
          fill
          className="drop-shadow-glow"
        />
      </div>
      <div className="lwm-floating-heart absolute w-[15px] h-[15px] sm:w-[18px] sm:h-[18px] md:w-[20px] md:h-[20px] bottom-[25%] left-[20%] opacity-60 z-2 animate-float-rotate-3">
        <Image
          src="/images/heart.png"
          alt=""
          fill
          className="drop-shadow-glow"
        />
      </div>

      <div className="lwm-hero-content relative z-3 max-w-[800px] mx-auto text-center flex flex-col items-center justify-center h-full px-4">
        <div className="relative w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[50px] md:h-[50px] mb-3 sm:mb-4 md:mb-5">
          <Image
            src="/images/heart.png"
            alt="Golden Heart"
            fill
            className="object-contain drop-shadow-glow"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4 md:mb-5 text-shadow text-white">
          Create Your Legacy Today
        </h1>
        <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 md:mb-10 max-w-[600px] text-shadow">
          Honor your loved ones with a beautiful memorial page that preserves
          their memory for generations to come.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center w-full sm:w-auto">
          <GoldButton href="/create-a-page">Share Your Life Story</GoldButton>
          <GoldButton href="/contact">Contact Us</GoldButton>
        </div>
      </div>
    </section>
  );
}
