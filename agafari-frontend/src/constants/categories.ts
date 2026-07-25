import { Category } from '../types/category';

export const CATEGORIES: Category[] = [
  { id: 'identity', name_en: 'Identity & Immigration', name_am: 'ማንነት እና ኢሚግሬሽን', iconName: 'Shield' },
  { id: 'business', name_en: 'Business & Investment', name_am: 'ንግድ እና ኢንቨስትመንት', iconName: 'Briefcase' },
  { id: 'transport', name_en: 'Transport & Vehicles', name_am: 'ትራንስፖርት እና ተሽከርካሪዎች', iconName: 'Car' },
  { id: 'education', name_en: 'Education', name_am: 'ትምህርት', iconName: 'BookOpen' },
  { id: 'finance', name_en: 'Tax & Revenue', name_am: 'ግብር እና ገቢ', iconName: 'Receipt' },
  { id: 'land', name_en: 'Land & Property', name_am: 'መሬት እና ንብረት', iconName: 'MapPin' },
  { id: 'legal', name_en: 'Legal & Justice', name_am: 'ሕግ እና ፍትሕ', iconName: 'Scale' },
  { id: 'other', name_en: 'Other Services', name_am: 'ሌሎች አገልግሎቶች', iconName: 'LayoutGrid' },
];
