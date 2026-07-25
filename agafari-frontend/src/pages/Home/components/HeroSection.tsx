import { Button } from '../../../components/ui/button';

export function HeroSection() {
  return (
    <div className="bg-primary pt-12 pb-16 md:pt-24 md:pb-32 px-4 md:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs md:text-sm font-semibold text-accent mb-6 border border-accent/30">
          OFFICIAL GOVERNMENT DIRECTORY
        </div>

        {/* Headings */}
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Find Any Government Service
          </h1>
          <h2 className="text-xl md:text-3xl font-semibold text-white/90 font-amharic">
            ማንኛውም የመንግስት አገልግሎት ያግኙ
          </h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed pt-2 max-w-xl">
            Access official procedures, requirements, and fees for all Ethiopian federal and regional administrative services in one place.
          </p>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex flex-wrap items-center gap-4 mt-10">
          <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-8 h-12 rounded-md">
            Browse Services
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 rounded-md">
            Search by name
          </Button>
        </div>
      </div>
    </div>
  );
}
