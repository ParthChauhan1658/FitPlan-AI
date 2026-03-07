"use client";

import { useEffect, useRef, useState } from "react";
import { Users, UtensilsCrossed, Globe, Star } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

const STATS = [
  { value: 50000, suffix: "+", label: "Active Users", icon: Users, color: "teal" },
  { value: 1000000, suffix: "+", label: "Meal Plans Generated", icon: UtensilsCrossed, color: "amber" },
  { value: 150, suffix: "+", label: "Countries Served", icon: Globe, color: "teal" },
  { value: 4.9, suffix: "/5", label: "Satisfaction Rating", icon: Star, color: "amber" },
];

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function StatsSection() {
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });
  const [displayValues, setDisplayValues] = useState(STATS.map(() => 0));
  const rafIds = useRef<number[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (!isVisible || started.current) return;
    started.current = true;

    const ids: number[] = [];

    STATS.forEach((stat, i) => {
      const duration = 2000;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOut(progress);
        const current =
          stat.value === 4.9
            ? parseFloat((eased * stat.value).toFixed(1))
            : Math.round(eased * stat.value);

        setDisplayValues((prev) => {
          const next = [...prev];
          next[i] = current;
          return next;
        });

        if (progress < 1) {
          ids[i] = requestAnimationFrame(tick);
        }
      };

      ids[i] = requestAnimationFrame(tick);
    });

    rafIds.current = ids;

    return () => {
      ids.forEach((id) => cancelAnimationFrame(id));
    };
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-brand-navy to-brand-dark py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            const isTeal = stat.color === "teal";
            return (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-8 text-center hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,96,68,0.15)] transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    isTeal
                      ? "bg-brand-teal/10 text-brand-teal"
                      : "bg-brand-amber/10 text-brand-amber"
                  }`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div
                  className={`text-4xl font-extrabold mb-1 ${
                    isTeal ? "text-brand-teal" : "text-brand-amber"
                  }`}
                >
                  {displayValues[i]}
                  <span className="text-2xl">{stat.suffix}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
