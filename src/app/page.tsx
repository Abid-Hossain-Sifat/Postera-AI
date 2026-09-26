import Hero from "@/Components/Hero";
import HowItWorks from "@/Components/HowItWorks";
import FeaturedTemplates from "@/Components/FeaturedTemplates";
import StatsSection from "@/Components/StatsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsSection />
      <HowItWorks />
      <FeaturedTemplates />
    </>
  );
}
