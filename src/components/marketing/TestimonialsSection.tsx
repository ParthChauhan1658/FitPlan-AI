"use client";

import { Star } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface Testimonial {
  name: string;
  stars: number;
  quote: string;
  descriptor: string;
  avatarInitials: string;
  avatarGradient: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Arjun Mehta",
    stars: 5,
    quote:
      "I've tried every meal planning app out there. FitPlan AI is the first that understands Indian cuisine and gives realistic budgets. Lost 8kg in 3 months.",
    descriptor: "Fat Loss · Mumbai",
    avatarInitials: "AM",
    avatarGradient: "from-brand-teal to-brand-purple",
  },
  {
    name: "Sarah Chen",
    stars: 5,
    quote:
      "As a vegan athlete, finding enough protein sources was always a struggle. The AI nailed my macro targets with creative plant-based meals I actually enjoy.",
    descriptor: "Athletic Performance · Singapore",
    avatarInitials: "SC",
    avatarGradient: "from-brand-purple to-brand-amber",
  },
  {
    name: "Marcus Williams",
    stars: 5,
    quote:
      "The weekly plan feature is a game changer. I spend 10 minutes reviewing my AI plan instead of hours researching recipes. Bulked 5kg lean mass.",
    descriptor: "Muscle Gain · London",
    avatarInitials: "MW",
    avatarGradient: "from-brand-amber to-brand-teal",
  },
  {
    name: "Priya Sharma",
    stars: 5,
    quote:
      "I'm a hostel student on a tight budget. The minimal cooking option gives me healthy meals I can make with just a microwave. Completely changed how I eat.",
    descriptor: "Maintenance · Bangalore",
    avatarInitials: "PS",
    avatarGradient: "from-brand-teal to-brand-amber",
  },
  {
    name: "Tomás García",
    stars: 5,
    quote:
      "The PDF download feature is perfect for sharing with my coach. The grocery lists with cost estimates keep me on budget every single week.",
    descriptor: "Athletic Performance · Madrid",
    avatarInitials: "TG",
    avatarGradient: "from-brand-purple-light to-brand-teal",
  },
  {
    name: "Aisha Okonkwo",
    stars: 5,
    quote:
      "Finally an app that takes allergy restrictions seriously. It never suggests anything with nuts and verifies every meal. I feel safe using this every day.",
    descriptor: "Fat Loss · Lagos",
    avatarInitials: "AO",
    avatarGradient: "from-brand-amber to-brand-purple",
  },
];

const DELAY_CLASSES = [
  "animation-delay-100",
  "animation-delay-200",
  "animation-delay-300",
  "animation-delay-400",
  "animation-delay-500",
  "animation-delay-600",
];

export function TestimonialsSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.05 });

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="bg-brand-navy py-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-3">
            Real Results
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Loved by Fitness{" "}
            <span className="gradient-text">Enthusiasts Worldwide</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join 50,000+ users who have transformed their nutrition with
            AI-powered meal planning.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand-teal/20 hover:shadow-[0_20px_40px_rgba(255,96,68,0.10)] ${
                isVisible
                  ? `animate-fade-in-up ${DELAY_CLASSES[i]}`
                  : "opacity-0 translate-y-4"
              }`}
            >
              {/* Stars */}
              <div
                className="flex gap-1 mb-4"
                aria-label={`${t.stars} out of 5 stars`}
              >
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-current text-brand-amber"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 italic text-sm leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center flex-shrink-0`}
                  aria-hidden="true"
                >
                  <span className="text-white text-xs font-bold">
                    {t.avatarInitials}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-brand-teal text-xs">{t.descriptor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
