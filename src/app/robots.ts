import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/signup"],
        disallow: ["/", "/leads", "/pipeline", "/conversations", "/analytics", "/settings", "/soporte", "/demo-ia"],
      },
    ],
    sitemap: "https://cliente.impulsapr.com/sitemap.xml",
    host: "https://cliente.impulsapr.com",
  };
}
