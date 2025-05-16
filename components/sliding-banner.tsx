"use client";

import React from "react";

export default function SlidingBanner() {
  return (
    <div
      className="w-full overflow-hidden py-2"
      style={{
        background: "linear-gradient(90deg, #D4AF37 0%, #f5e7a3 100%)",
        borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(212,175,55,0.15)",
      }}
    >
      <div className="relative w-full h-8 flex items-center">
        <div className="animate-slide whitespace-nowrap text-center w-full text-black font-medium text-lg tracking-wide">
          Honoring Lives. Celebrating Memories. Connecting Generations.
        </div>
      </div>
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-slide {
          display: inline-block;
          animation: slide 18s linear infinite;
        }
      `}</style>
    </div>
  );
}
