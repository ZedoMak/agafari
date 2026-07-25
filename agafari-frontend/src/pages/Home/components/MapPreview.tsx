import { Button } from '../../../components/ui/button';
import { Map } from 'lucide-react';

export function MapPreview() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full py-8">
      <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-sm flex flex-col md:flex-row">
        {/* Left Side: Dark Blue with CTA */}
        <div className="md:w-1/2 bg-[#1A365D] text-white p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">Locate Services Near You</h2>
          <p className="text-white/80 leading-relaxed mb-8 max-w-md">
            Use our interactive directory map to find the nearest Woreda offices, post offices, and administrative centers in Addis Ababa and across the regions.
          </p>
          <Button className="w-max bg-accent text-white hover:bg-accent/90 gap-2 font-semibold border-none">
            <Map className="h-4 w-4" />
            Explore Directory
          </Button>
        </div>
        
        {/* Right Side: Map Image */}
        <div className="md:w-1/2 min-h-[300px] bg-slate-100 relative">
          <img 
            src="/map_preview.png" 
            alt="Map of Addis Ababa government offices" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
