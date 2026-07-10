import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Locally generated SVG placeholders (see /api/placeholder) keep the
    // demo self-contained with no external image CDN dependency.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    localPatterns: [{ pathname: "/api/placeholder/**" }],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Cover images pulled in by the real-event import pipeline
      // (src/lib/import) — each source hosts posters on its own domain.
      { protocol: "https", hostname: "afisha.uz" },
      { protocol: "https", hostname: "*.afisha.uz" },
      { protocol: "https", hostname: "iticket.uz" },
      { protocol: "https", hostname: "*.iticket.uz" },
      { protocol: "https", hostname: "img.evbuc.com" },
      { protocol: "https", hostname: "cdn-telegram.org" },
      { protocol: "https", hostname: "*.cdn-telegram.org" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
