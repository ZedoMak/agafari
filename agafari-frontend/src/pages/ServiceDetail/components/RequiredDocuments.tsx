import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import type { ServiceDocument } from '../../../types/service';
import { Check } from 'lucide-react';

interface RequiredDocumentsProps {
  documents: ServiceDocument[];
}

export function RequiredDocuments({ documents }: RequiredDocumentsProps) {
  const { t } = useLanguage();
  // Mocking the user_checklists table behavior locally
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  if (!documents || documents.length === 0) return null;

  const toggleCheck = (id: string) => {
    const newSet = new Set(checkedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCheckedIds(newSet);
  };

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-1">Required Documents</h2>
        <p className="text-sm font-amharic text-text-subtle">አስፈላጊ ሰነዶች</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isChecked = checkedIds.has(doc.id);
          return (
            <div 
              key={doc.id}
              onClick={() => toggleCheck(doc.id)}
              className={`bg-surface border rounded-xl p-5 cursor-pointer transition-all flex items-start gap-4 ${
                isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/40'
              }`}
            >
              {/* Checkbox UI */}
              <div className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                isChecked ? 'bg-primary border-primary text-white' : 'border-border bg-white'
              }`}>
                {isChecked && <Check className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold text-sm md:text-base ${isChecked ? 'text-primary' : 'text-text-main'}`}>
                    {t(doc.title_en, doc.title_am)}
                  </h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                    doc.is_mandatory 
                      ? 'bg-accent/10 text-accent' 
                      : 'bg-slate-100 text-text-subtle'
                  }`}>
                    {doc.is_mandatory ? 'Required' : 'Optional'}
                  </span>
                </div>
                
                {(doc.desc_en || doc.desc_am) && (
                  <p className="text-xs text-text-subtle leading-relaxed mt-1 pr-4">
                    {t(doc.desc_en || '', doc.desc_am || '')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
