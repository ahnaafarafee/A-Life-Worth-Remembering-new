"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./section-header";
import { GoldButton } from "./gold-button";

const memorials = [
  {
    name: "Sarah Johnson",
    years: "1975 - 2022",
    createdBy: "James",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    href: "/memorials/sarah-johnson",
  },
  {
    name: "Robert Thompson",
    years: "1942 - 2023",
    createdBy: "Emily",
    imageSrc:
      "https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    href: "/memorials/robert-thompson",
  },
  {
    name: "Michael Anderson",
    years: "1968 - 2021",
    createdBy: "Lisa",
    imageSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    href: "/memorials/michael-anderson",
  },
];

export default function FeaturedMemorials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="FEATURED MEMORIAL PAGES"
          subtitle="Explore these beautiful tributes created by our community to honor and remember their loved ones."
        />
        <div className="memorial-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 justify-center mx-auto max-w-5xl">
          {memorials.map((memorial, idx) => (
            <div
              key={memorial.name}
              className="memorial-card relative h-[400px] p-2 bg-gradient-to-br from-[#D4AF37] to-[#f5e7a3] rounded-[15px] shadow-[0_10px_25px_rgba(212,175,55,0.5),_inset_0_-8px_15px_rgba(212,175,55,0.3),_0_0_0_2px_rgba(212,175,55,0.7)] transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.6),_inset_0_-10px_20px_rgba(212,175,55,0.4),_0_0_0_3px_rgba(212,175,55,0.8)]"
            >
              <div className="memorial-card-inner relative w-full h-full rounded-[10px] overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                <Image
                  src={memorial.imageSrc}
                  alt={`Memorial of ${memorial.name}`}
                  fill
                  className="memorial-image object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={idx === 0}
                />
                <div className="memorial-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="memorial-person-name text-[1.5rem] font-bold mb-2 leading-tight">
                    {memorial.name}
                  </div>
                  <div className="memorial-years text-[1.1rem] mb-4 text-gray-300">
                    {memorial.years}
                  </div>
                  <div className="memorial-card-footer flex justify-between items-center border-t border-white/20 pt-4">
                    <span className="memorial-created-by text-[0.95rem] opacity-80">
                      Created by {memorial.createdBy}
                    </span>
                    <Link
                      href={memorial.href}
                      className="memorial-view-btn text-[#ffd700] text-[0.95rem] font-medium hover:underline"
                    >
                      View Page
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <GoldButton href="/memorials">View All Memorials</GoldButton>
        </div>
        <style jsx>{`
          .memorial-card {
            box-sizing: border-box;
          }
          .memorial-card-inner {
            box-sizing: border-box;
          }
          .memorial-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .memorial-overlay {
            box-sizing: border-box;
          }
          @media (max-width: 768px) {
            .memorial-card {
              height: 350px !important;
            }
          }
          @media (max-width: 480px) {
            .memorial-card {
              height: 300px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
