import { Sparkles, FileText } from 'lucide-react';

export function AISummary() {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-1">Summary</h2>
        <p className="text-sm font-amharic text-text-subtle">ማጠቃለያ</p>
      </div>
      
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-bold text-text-main">Official Requirement Changes</h3>
        </div>
        
        <p className="text-sm text-text-main leading-relaxed relative z-10 mb-4">
          Based on the latest directive (Oct 2023), the standard 32-page passport renewal fee is now <strong>2,000 ETB</strong>. If you are applying for the 64-page version, the fee is 4,000 ETB. Online appointments are strictly mandatory for all applicants inside Addis Ababa.
        </p>

        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-white/60 border border-border px-3 py-2 rounded-lg w-max relative z-10">
          <FileText className="w-4 h-4" /> Source: ICS Directive No. 45/2023
        </div>
      </div>
    </div>
  );
}
