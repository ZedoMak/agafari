import { Phone, Navigation } from 'lucide-react';

export function ServiceLocations() {

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-1">Service Branches</h2>
        <p className="text-sm font-amharic text-text-subtle">የአገልግሎት መስጫ ማዕከላት</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {/* Interactive Map Embed */}
        <div className="h-48 md:h-64 w-full bg-slate-200 relative">
          <iframe 
            title="Office Location Map"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight={0} 
            marginWidth={0} 
            src="https://www.openstreetmap.org/export/embed.html?bbox=38.7441110610962%2C9.023253746685085%2C38.75629854202271%2C9.030438128362678&amp;layer=mapnik&amp;marker=9.026845946399066%2C38.75020480155945" 
            style={{ border: 0, filter: 'contrast(1.1) saturate(1.2)' }}
          ></iframe>
        </div>

        {/* Branch Info */}
        <div className="p-5 md:p-6">
          <h3 className="font-bold text-lg text-text-main mb-2">Main Headquarters (Posta Bet)</h3>
          <p className="text-sm text-text-subtle mb-6">
            Churchill Road, next to the Main Post Office, Addis Ababa.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-primary text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Navigation className="w-4 h-4" /> Get Directions
            </button>
            <button className="flex-1 bg-surface border border-border text-text-main font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              <Phone className="w-4 h-4" /> Contact Office
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
