"use client";

import { Check } from "lucide-react";
import { GoldButton } from "@/components/gold-button";
import SectionHeader from "@/components/section-header";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PricingSection() {
  const [showComparison, setShowComparison] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show comparison table by default on the pricing page
    if (pathname === "/pricing") {
      setShowComparison(true);
    }
  }, [pathname]);

  const features = [
    { name: "Personalised URL", classic: true, premium: true },
    { name: "Privacy Options", classic: true, premium: true },
    { name: "Personalised background image", classic: true, premium: true },
    { name: "Personalised font colour", classic: true, premium: true },
    { name: "A life in pictures video", classic: true, premium: true },
    { name: "Profile image", classic: true, premium: true },
    { name: "Sliding banner", classic: true, premium: true },
    { name: "Introduction", classic: true, premium: true },
    { name: "Relationships", classic: true, premium: true },
    { name: "General knowledge", classic: true, premium: true },
    { name: "Insights", classic: true, premium: true },
    { name: "Gallery", classic: "30", premium: "1000+" },
    { name: "Guest book", classic: true, premium: true },
    { name: "Stories", classic: false, premium: true },
    { name: "Sound clips", classic: false, premium: true },
    { name: "Events", classic: false, premium: true },
    { name: "RSVPs", classic: false, premium: true },
    { name: "Funeral wishes", classic: true, premium: true },
    { name: "3 images", classic: true, premium: true },
    { name: "Obituary", classic: true, premium: true },
    { name: "Eulogy", classic: true, premium: true },
    { name: "Order of Service", classic: true, premium: true },
    { name: "Message from the family", classic: true, premium: true },
    { name: "Video", classic: false, premium: true },
    { name: "Tributes", classic: true, premium: true },
    { name: "Written message from the honouree", classic: true, premium: true },
    { name: "Video message from the honouree", classic: true, premium: true },
    { name: "Make a donation", classic: true, premium: true },
    { name: "Relatives & Friends", classic: true, premium: true },
    { name: "Share your page", classic: true, premium: true },
  ];

  const handlePlanSelect = (packageType: string) => {
    setShowComparison(true);
  };

  const PricingButton = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    return (
      <Link
        href={href}
        className="relative inline-flex items-center justify-center px-16 py-4 font-semibold text-black text-lg transition-transform hover:scale-105 w-80 mx-auto"
        onClick={() => handlePlanSelect(href.split("=")[1])}
      >
        <div className="absolute inset-0">
          <Image
            src="/images/button.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <span className="relative z-10">{children}</span>
      </Link>
    );
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="PRICING PACKAGES"
          subtitle="Choose the perfect package to honor your loved ones and preserve precious memories for generations to come."
        />

        <div className="custom-pricing-section">
          <div className="custom-pricing-container">
            {/* Classic Single Plan */}
            <div className="custom-pricing-card">
              <div className="custom-card-header custom-purple-header">
                <h2 className="custom-plan-name">Classic Single</h2>
                <div className="custom-price">
                  £99<span>/year</span>
                </div>
              </div>
              <div className="custom-card-body">
                <ul className="custom-feature-list">
                  <li>
                    <span className="custom-checkmark"></span>Personalized
                    memorial page
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Up to 30 photos in
                    gallery
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Guest book for
                    visitors
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Tributes and
                    messages
                  </li>
                </ul>
                <PricingButton href="/pricing">Select Plan</PricingButton>
              </div>
            </div>

            {/* Premium Single Plan */}
            <div className="custom-pricing-card">
              <div className="custom-card-header custom-gold-header">
                <div className="custom-popular-badge">RECOMMENDED</div>
                <h2 className="custom-plan-name">Premium Single</h2>
                <div className="custom-price">
                  £149<span>/year</span>
                </div>
              </div>
              <div className="custom-card-body">
                <ul className="custom-feature-list">
                  <li>
                    <span className="custom-checkmark"></span>Everything in
                    Classic, plus:
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>1000+ photos in
                    gallery
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Stories, sound
                    clips & videos
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Events management
                    with RSVPs
                  </li>
                </ul>
                <PricingButton href="/pricing">Select Plan</PricingButton>
              </div>
            </div>

            {/* Premium Bundle Plan */}
            <div className="custom-pricing-card">
              <div className="custom-card-header custom-purple-header">
                <h2 className="custom-plan-name">Premium Bundle</h2>
                <div className="custom-price">
                  £299<span>/year</span>
                </div>
              </div>
              <div className="custom-card-body">
                <ul className="custom-feature-list">
                  <li>
                    <span className="custom-checkmark"></span>5 Premium Memorial
                    Pages
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Unlimited Media
                    Storage
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Complete
                    Customization
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Advanced Family
                    Tree
                  </li>
                  <li>
                    <span className="custom-checkmark"></span>Priority Support
                  </li>
                </ul>
                <PricingButton href="/pricing">Select Plan</PricingButton>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          {showComparison && (
            <div className="mt-12 max-w-5xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gold-primary/30">
              <div className="bg-gold-primary/10 p-4 border-b border-gold-primary/20">
                <h3 className="text-xl font-bold text-gold-primary text-center">
                  Full Feature Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 w-1/2">
                        Features
                      </th>
                      <th className="py-3 px-4 text-center font-semibold text-purple-primary w-1/4">
                        Classic
                      </th>
                      <th className="py-3 px-4 text-center font-semibold text-purple-primary w-1/4">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="py-2 px-4 border-t border-gray-200">
                          {feature.name}
                        </td>
                        <td className="py-2 px-4 text-center border-t border-gray-200">
                          {typeof feature.classic === "boolean" ? (
                            feature.classic ? (
                              <Check className="h-5 w-5 text-gold-primary mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="text-sm text-gray-700">
                              {feature.classic}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center border-t border-gray-200">
                          {typeof feature.premium === "boolean" ? (
                            feature.premium ? (
                              <Check className="h-5 w-5 text-gold-primary mx-auto" />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )
                          ) : (
                            <span className="text-sm text-purple-primary font-semibold">
                              {feature.premium}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Not sure which package is right for you? Contact our support team
              for personalized assistance in choosing the perfect memorial
              solution.
            </p>
            <GoldButton href="/contact">Contact Us</GoldButton>
          </div>
        </div>

        <style jsx>{`
          .custom-pricing-section * {
            box-sizing: border-box !important;
          }

          .custom-pricing-section {
            padding: 20px !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            font-family: inherit !important;
          }

          .custom-pricing-container {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 20px !important;
            max-width: 1200px !important;
            width: 100% !important;
            margin: 0 auto !important;
          }

          .custom-pricing-card {
            background-color: white !important;
            border-radius: 10px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
            width: 100% !important;
            max-width: 350px !important;
            display: flex !important;
            flex-direction: column !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            margin: 0 !important;
            border: none !important;
          }

          .custom-pricing-card:hover {
            transform: translateY(-10px) !important;
            box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15) !important;
          }

          .custom-card-header {
            padding: 25px 20px !important;
            text-align: center !important;
            color: white !important;
            margin: 0 !important;
            border: none !important;
            background-image: none !important;
          }

          .custom-purple-header {
            background-color: #4a0a6e !important;
            color: white !important;
          }

          .custom-gold-header {
            background-color: #e5d079 !important;
            position: relative !important;
            color: #333 !important;
          }

          .custom-popular-badge {
            position: absolute !important;
            top: 10px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: white !important;
            color: #4a0a6e !important;
            padding: 5px 15px !important;
            border-radius: 20px !important;
            font-weight: bold !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
            margin: 0 !important;
            z-index: 1 !important;
          }

          .custom-plan-name {
            font-size: 28px !important;
            margin-bottom: 10px !important;
            margin-top: 20px !important;
            color: inherit !important;
            font-weight: bold !important;
            line-height: 1.2 !important;
            text-align: center !important;
            padding: 0 !important;
          }

          .custom-price {
            font-size: 36px !important;
            font-weight: bold !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 0 !important;
            color: inherit !important;
          }

          .custom-price span {
            font-size: 18px !important;
            font-weight: normal !important;
            color: inherit !important;
          }

          .custom-card-body {
            padding: 30px 20px !important;
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            background: transparent !important;
            border: none !important;
            margin: 0 !important;
          }

          .custom-feature-list {
            list-style: none !important;
            margin-bottom: 30px !important;
            flex-grow: 1 !important;
            padding: 0 !important;
          }

          .custom-feature-list li {
            margin-bottom: 15px !important;
            display: flex !important;
            align-items: flex-start !important;
            color: #333 !important;
            padding: 0 !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            text-align: left !important;
          }

          .custom-checkmark {
            display: inline-block !important;
            color: #e5d079 !important;
            margin-right: 10px !important;
            font-weight: bold !important;
          }

          .custom-checkmark::before {
            content: "✓" !important;
            color: #e5d079 !important;
          }

          .custom-cta-button {
            background: linear-gradient(135deg, #e5d079, #d4b84e) !important;
            color: #333 !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 25px !important;
            font-weight: bold !important;
            cursor: pointer !important;
            text-transform: uppercase !important;
            font-size: 16px !important;
            text-align: center !important;
            display: block !important;
            width: 80% !important;
            margin: 0 auto !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
            transition: transform 0.2s, box-shadow 0.2s !important;
            line-height: 1.5 !important;
            text-decoration: none !important;
          }

          .custom-cta-button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2) !important;
          }

          @media (max-width: 768px) {
            .custom-pricing-container {
              flex-direction: column !important;
              align-items: center !important;
            }

            .custom-pricing-card {
              max-width: 100% !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
