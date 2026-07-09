import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { FeatureBar } from "@/components/home/FeatureBar";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CtaSection } from "@/components/site/CtaSection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <FeatureBar />
      <CategoriesSection />
      <CtaSection />
    </>
  );
}
