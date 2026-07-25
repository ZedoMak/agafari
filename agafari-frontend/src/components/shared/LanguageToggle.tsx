import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'en' ? 'EN | አማ' : 'አማ | EN'}</span>
    </Button>
  );
}
