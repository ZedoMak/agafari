import { CheckCircle2 } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-sm text-xs font-semibold">
      <CheckCircle2 className="h-3 w-3" />
      <span>VERIFIED</span>
    </div>
  );
}
