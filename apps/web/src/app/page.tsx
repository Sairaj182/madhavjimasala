import HeroSection from "@/components/home/HeroSection";
import SignatureBlends from "@/components/home/SignatureBlends";
import TrustFactors from "@/components/home/TrustFactors";
import JourneySection from "@/components/home/JourneySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SignatureBlends />
      <TrustFactors />
      <JourneySection />
      <TestimonialsSection />
      <CtaBanner />
    </>
  );
}
