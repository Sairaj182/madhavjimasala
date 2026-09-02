import HeroSection from "@/components/home/HeroSection";
import SignatureBlends from "@/components/home/SignatureBlends";
import TrustFactors from "@/components/home/TrustFactors";
import JourneySection from "@/components/home/JourneySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaBanner from "@/components/home/CtaBanner";
import LegacyHero from "@/components/legacy/LegacyHero";
import SectionDivider from "@/components/shared/SectionDivider";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SignatureBlends />
      <SectionDivider variant="diamond" />
      <LegacyHero showCta={true} />
      <SectionDivider variant="leaf" />
      <TrustFactors />
      <SectionDivider variant="line" />
      <JourneySection />
      <SectionDivider variant="diamond" />
      <TestimonialsSection />
      <CtaBanner />
    </>
  );
}
