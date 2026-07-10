import { Hero } from "@/components/home/Hero";
import { FeatureBar } from "@/components/home/FeatureBar";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CtaSection } from "@/components/site/CtaSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <FeatureBar />
      <CategoriesSection />
      <CtaSection />
    </>
  );
}
