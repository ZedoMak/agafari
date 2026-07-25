import { HeroSection } from './components/HeroSection';
import { CategorySection } from './components/CategorySection';
import { MainContent } from './components/MainContent';
import { MapPreview } from './components/MapPreview';
import { RecentChanges } from './components/RecentChanges';

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      <HeroSection />
      <CategorySection />
      <MainContent />
      <MapPreview />
      <RecentChanges />
    </div>
  );
}
