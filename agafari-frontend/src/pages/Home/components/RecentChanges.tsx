import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const MOCK_CHANGELOGS = [
  {
    id: '1',
    service_name_en: 'Passport Renewal',
    service_name_am: 'ፓስፖርት እድሳት',
    ai_change_summary: 'The required fee has been updated from 600 ETB to 2,000 ETB. Wait times have been extended to 5-10 days.',
    status: 'APPROVED',
    date: 'Today',
    agency: 'ICS'
  },
  {
    id: '2',
    service_name_en: 'Business Registration',
    service_name_am: 'የንግድ ምዝገባ',
    ai_change_summary: 'A new requirement added: Digital ID (Fayda) is now mandatory for new registrations.',
    status: 'APPROVED',
    date: 'Yesterday',
    agency: 'Ministry of Trade'
  }
];

export function RecentChanges() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 w-full py-12 md:py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-accent/10 p-2 rounded-lg">
          <AlertCircle className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-main">Recent Service Updates</h2>
          <p className="text-sm text-text-subtle font-amharic">የቅርብ ጊዜ የአገልግሎት ለውጦች</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CHANGELOGS.map((log) => (
          <div key={log.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-accent/50 transition-colors flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-text-subtle uppercase tracking-wider">{log.agency}</span>
                <h3 className="text-lg font-bold text-primary mt-1">
                  {t(log.service_name_en, log.service_name_am)}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-text-subtle">{log.date}</span>
                {log.status === 'APPROVED' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-sm">
                    <CheckCircle2 className="h-3 w-3" /> VERIFIED
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative mt-2">
              <span className="absolute -top-2.5 left-4 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                AI SUMMARY
              </span>
              <p className="text-sm text-text-main leading-relaxed mt-1">
                {log.ai_change_summary}
              </p>
            </div>
            
            <a href="#" className="text-sm font-bold text-accent flex items-center gap-1 hover:underline mt-auto pt-2 w-max">
              View Updated Requirements <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
