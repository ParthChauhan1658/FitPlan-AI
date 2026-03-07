"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "The Science", href: "/science" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-brand-navy/90 backdrop-blur-md border-b border-brand-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo/fitplan-logo-full.png"
              alt="FitPlan AI"
              width={160}
              height={40}
              className="h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative text-gray-400 hover:text-brand-teal text-sm font-medium transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-teal transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-amber to-brand-amber-light text-brand-navy text-sm font-bold hover:scale-105 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 min-h-[44px]"
              aria-label="Get started free with FitPlan AI"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-brand-navy/95 backdrop-blur-md border-t border-brand-border animate-fade-in"
        >
          <nav className="flex flex-col px-4 py-4 gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-400 hover:text-brand-teal py-3 px-2 text-sm font-medium border-b border-brand-border/50 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="text-center text-gray-400 hover:text-white py-2.5 text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="text-center px-5 py-3 rounded-full bg-gradient-to-r from-brand-amber to-brand-amber-light text-brand-navy text-sm font-bold hover:scale-105 transition-all duration-300"
                aria-label="Get started free with FitPlan AI"
              >
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
