"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
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
            <span className="text-gold-primary font-light text-xl">
              A Life Worth Remembering
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/about"
              className="text-gray-700 hover:text-gold-primary transition-colors text-sm font-medium"
            >
              ABOUT US
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-gold-primary transition-colors text-sm font-medium"
            >
              PRICING PLANS
            </Link>
            <Link
              href="/create-a-page"
              className="text-gray-700 hover:text-gold-primary transition-colors text-sm font-medium"
            >
              CREATE A PAGE
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gold-primary transition-colors text-sm font-medium"
            >
              CONTACT US
            </Link>
            <SignedIn>
              {!isLoading && legacyPage && (
                <Link
                  href={`/legacy/${legacyPage.slug}`}
                  className="text-gray-700 hover:text-gold-primary transition-colors text-sm font-medium"
                >
                  MY PAGE
                </Link>
              )}
            </SignedIn>
            <div className="relative">
              <input
                type="text"
                placeholder="Search memorials..."
                className="w-40 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
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
