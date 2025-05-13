"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { GoldButton } from "./gold-button";
import { useLegacyPage } from "@/hooks/useLegacyPage";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { legacyPage, isLoading } = useLegacyPage();
  console.log(legacyPage);

  return (
    <header className="relative z-10 border-b border-gold-primary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <span className="text-gold-primary font-light text-2xl">
              A Life Worth Remembering
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-gray-700 hover:text-gold-primary transition-colors"
            >
              ABOUT US
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gold-primary transition-colors"
            >
              PRICING PLANS
            </Link>
            <Link
              href="/create-a-page"
              className="text-gray-700 hover:text-gold-primary transition-colors"
            >
              CREATE A PAGE
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gold-primary transition-colors"
            >
              CONTACT US
            </Link>
            <SignedIn>
              {!isLoading && legacyPage && (
                <Link
                  href={`/legacy/${legacyPage.slug}`}
                  className="text-gray-700 hover:text-gold-primary transition-colors"
                >
                  MY PAGE
                </Link>
              )}
            </SignedIn>
            <SignedOut>
              <GoldButton>
                <SignInButton />
              </GoldButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-purple-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white shadow-lg md:hidden z-20">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/about"
              className="text-gray-700 hover:text-gold-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              ABOUT US
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gold-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              PRICING PLANS
            </Link>
            <SignedIn>
              <Link
                href="/create-a-page"
                className="text-gray-700 hover:text-gold-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                CREATE A PAGE
              </Link>
            </SignedIn>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gold-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT US
            </Link>
            <SignedIn>
              {!isLoading && legacyPage && (
                <Link
                  href={`/legacy/${legacyPage.slug}`}
                  className="text-gray-700 hover:text-gold-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  MY PAGE
                </Link>
              )}
            </SignedIn>
            <SignedOut>
              <GoldButton>
                <SignInButton />
              </GoldButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      )}
    </header>
  );
}
