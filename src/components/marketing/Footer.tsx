import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Youtube, Github } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Testimonials", href: "/#testimonials" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, label: "FitPlan AI on Twitter", href: "#" },
  { icon: Instagram, label: "FitPlan AI on Instagram", href: "#" },
  { icon: Youtube, label: "FitPlan AI on YouTube", href: "#" },
  { icon: Github, label: "FitPlan AI on GitHub", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-brand-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo/fitplan-wordmark.png"
                alt="FitPlan AI"
                width={120}
                height={24}
                className="h-6 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              AI-powered nutrition for your fitness journey. Personalized meal
              plans that actually work.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-brand-teal transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-border py-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} FitPlan AI. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Made with{" "}
            <span className="text-brand-teal">♥</span>{" "}
            for fitness enthusiasts worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
