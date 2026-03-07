import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fitplanai.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/features", "/science", "/sign-in", "/sign-up"],
        disallow: [
          "/dashboard",
          "/meal-plans",
          "/onboarding",
          "/settings",
          "/progress",
          "/insights",
          "/api/",
          "/shared/",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
