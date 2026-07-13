import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/features/marketing/hero-section";
import { LiveNowSection } from "@/features/marketing/live-now-section";
import { CategorySection } from "@/features/marketing/category-section";
import { HowItWorksSection } from "@/features/marketing/how-it-works-section";
import { FeaturedPlacesSection } from "@/features/marketing/featured-places-section";
import { GuidesSection } from "@/features/marketing/guides-section";
import { CtaSection } from "@/features/marketing/cta-section";

export default async function HomePage() {
  // Prefer events with a real (imported) photo over the generated
  // placeholder gradients, so the hero shows actual upcoming events
  // instead of decorative stand-ins once real data exists.
  const heroEvents = await prisma.event.findMany({
    where: {
      isPublished: true,
      endAt: { gte: new Date() },
      NOT: { coverImage: { startsWith: "/api/placeholder" } },
    },
    orderBy: { startAt: "asc" },
    take: 5,
    select: { id: true, slug: true, titleRu: true, coverImage: true, address: true, startAt: true, endAt: true },
  });

  return (
    <>
      <HeroSection events={heroEvents} />
      <LiveNowSection />
      <CategorySection />
      <HowItWorksSection />
      <FeaturedPlacesSection />
      <GuidesSection />
      <CtaSection />
    </>
  );
}
