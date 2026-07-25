import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Service } from '../../types/service';
import { Card, CardContent } from '../ui/card';
import { VerifiedBadge } from './VerifiedBadge';
import { ChevronRight, Clock, Wallet } from 'lucide-react';

interface ServiceCardProps {
  key?: string | number;
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { t } = useLanguage();

  return (
    <Link to={`/service/${service.id}`} className="block">
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-text-subtle font-medium uppercase tracking-wider mb-1">
                {service.office_info.split(' ')[0]} {/* Abbreviation placeholder */}
              </p>
              <h3 className="font-semibold text-lg">
                {t(service.name_en, service.name_am)}
              </h3>
            </div>
            <VerifiedBadge />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm text-text-subtle">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                <span>{service.fee}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{service.processing_time}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
