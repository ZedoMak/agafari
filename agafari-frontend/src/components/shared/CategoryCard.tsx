import { useLanguage } from '../../context/LanguageContext';
import type { Category } from '../../types/category';
import { Card, CardContent } from '../ui/card';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  key?: string | number;
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { t } = useLanguage();
  // @ts-ignore - Dynamic icon rendering for MVP
  const IconComponent = Icons[category.iconName] || Icons.HelpCircle;

  return (
    <Card className="hover:border-accent/50 transition-colors cursor-pointer group h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
        <div className="bg-accent/10 p-3 rounded-lg text-accent group-hover:scale-110 transition-transform">
          <IconComponent className="h-6 w-6" />
        </div>
        <span className="font-medium text-sm">
          {t(category.name_en, category.name_am)}
        </span>
      </CardContent>
    </Card>
  );
}
