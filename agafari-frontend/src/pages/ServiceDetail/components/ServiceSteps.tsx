import { useLanguage } from '../../../context/LanguageContext';
import type { ServiceStep } from '../../../types/service';

interface ServiceStepsProps {
  steps: ServiceStep[];
}

export function ServiceSteps({ steps }: ServiceStepsProps) {
  const { t } = useLanguage();

  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-1">Application Steps</h2>
          <p className="text-sm font-amharic text-text-subtle">የማመልከቻ ሂደት ተከታታይ</p>
        </div>
        <div className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
          {steps.length} Steps Total
        </div>
      </div>

      <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-8 pb-4">
        {steps.map((step) => (
          <div key={step.id} className="relative pl-8 md:pl-10">
            {/* Number Indicator */}
            <div className="absolute -left-[17px] top-0 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-background">
              {step.order_num}
            </div>
            
            {/* Card */}
            <div className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors shadow-sm">
              <div className="w-8 h-1 bg-accent/60 rounded-full mb-3"></div>
              <h3 className="text-base md:text-lg font-bold text-text-main mb-1">
                {t(step.title_en, step.title_am)}
              </h3>
              <p className="text-sm text-text-subtle leading-relaxed">
                {t(step.desc_en, step.desc_am)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
