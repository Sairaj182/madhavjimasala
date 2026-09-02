import { Metadata } from 'next';
import LegacyHero from '@/components/legacy/LegacyHero';
import JourneyTimeline from '@/components/legacy/JourneyTimeline';
import ThenAndNow from '@/components/legacy/ThenAndNow';
import CurrentLeadership from '@/components/legacy/CurrentLeadership';
import LegacyCounters from '@/components/legacy/LegacyCounters';
import ClosingStatement from '@/components/legacy/ClosingStatement';
import SectionDivider from '@/components/shared/SectionDivider';

export const metadata: Metadata = {
  title: 'Our Legacy | Madhavji Masala',
  description: 'Four generations of trust, flavor & legacy. Explore the history and values of Madhavji Masala.',
};

export default function LegacyPage() {
  return (
    <main className="bg-white min-h-screen">
      <LegacyHero />
      <SectionDivider variant="diamond" />
      <JourneyTimeline />
      <SectionDivider variant="line" />
      <CurrentLeadership />
      <ThenAndNow />
      <SectionDivider variant="diamond" />
      <LegacyCounters />
      <ClosingStatement />
    </main>
  );
}
