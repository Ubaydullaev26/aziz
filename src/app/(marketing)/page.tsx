import { HeroSection } from "@/features/marketing/hero-section";
import { LiveNowSection } from "@/features/marketing/live-now-section";
import { CategorySection } from "@/features/marketing/category-section";
import { HowItWorksSection } from "@/features/marketing/how-it-works-section";
import { FeaturedPlacesSection } from "@/features/marketing/featured-places-section";
import { GuidesSection } from "@/features/marketing/guides-section";
import { CtaSection } from "@/features/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LiveNowSection />
      <CategorySection />
      <HowItWorksSection />
      <FeaturedPlacesSection />
      <GuidesSection />
      <CtaSection />
    </>
  );
}
