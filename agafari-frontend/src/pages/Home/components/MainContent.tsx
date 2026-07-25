import { ArrowRight } from 'lucide-react';
import { POPULAR_SERVICES } from '../../../constants/popularServices';
import { ServiceCard } from '../../../components/shared/ServiceCard';

const MOCK_UPDATES = [
  {
    id: 1,
    date: 'October 24, 2024',
    title: 'New Digital ID Requirements',
    description: 'Fayda ID is now mandatory for all banking and government transactions starting next month.',
    linkText: 'Read Directive'
  },
  {
    id: 2,
    date: 'October 18, 2024',
    title: 'Customs Tariff Revision',
    description: 'Revised import tariffs for renewable energy equipment have been uploaded to the portal.',
    linkText: 'Download List'
  }
];

export function MainContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full pt-12 md:pt-24 pb-8">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Popular Services */}
        <div className="lg:w-2/3 w-full">
          {/* Header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-main">Popular Services</h2>
              <p className="text-sm text-text-subtle font-amharic md:hidden">የመንግስት አገልግሎቶች</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
              See all <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {POPULAR_SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Right Column: Latest Updates */}
        <div className="lg:w-1/3 w-full">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-text-main">Latest Updates</h2>
            <p className="text-sm text-text-subtle font-amharic md:hidden">የቅርብ ጊዜ ዝመናዎች</p>
          </div>

          {/* Updates List - Vertical on desktop, horizontal scroll on mobile */}
          <div className="flex overflow-x-auto lg:flex-col gap-4 pb-4 lg:pb-0 no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {MOCK_UPDATES.map((update) => (
              <div 
                key={update.id} 
                className="min-w-[280px] lg:min-w-0 bg-surface border border-border p-6 rounded-lg border-l-4 border-l-accent shadow-sm flex flex-col gap-3"
              >
                <span className="text-xs font-medium text-text-subtle">{update.date}</span>
                <h3 className="font-semibold text-text-main">{update.title}</h3>
                <p className="text-sm text-text-subtle leading-relaxed flex-1">
                  {update.description}
                </p>
                <a href="#" className="text-sm font-bold text-accent flex items-center gap-1 hover:underline mt-2">
                  {update.linkText} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
