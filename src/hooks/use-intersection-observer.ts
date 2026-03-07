"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fallback: if IntersectionObserver is unavailable, mark visible immediately
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // fires once only
          }
        });
      },
      {
        threshold: 0.15,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, isVisible];
}
