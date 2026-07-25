import { Link, useLocation } from 'react-router-dom';
import { Home, Search, LayoutGrid, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function MobileNav() {
  const location = useLocation();
  const { toggleLanguage, language } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface px-6 py-3 pb-safe">
      <div className="flex justify-between items-center">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-text-subtle'}`}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link to="/search" className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-primary' : 'text-text-subtle'}`}>
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Search</span>
        </Link>
        
        <Link to="/browse" className={`flex flex-col items-center gap-1 ${isActive('/browse') ? 'text-primary' : 'text-text-subtle'}`}>
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Browse</span>
        </Link>
        
        <button 
          onClick={toggleLanguage}
          className="flex flex-col items-center gap-1 text-text-subtle hover:text-primary"
        >
          <Globe className="h-5 w-5" />
          <span className="text-[10px] font-medium">
            {language === 'en' ? 'አማ' : 'EN'}
          </span>
        </button>
      </div>
    </nav>
  );
}
