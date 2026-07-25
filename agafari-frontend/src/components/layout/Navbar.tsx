import { Link, useLocation } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { LanguageToggle } from '../shared/LanguageToggle';
import { SearchBar } from '../shared/SearchBar';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold text-primary">አጋፋሪ</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors hover:text-primary ${isActive('/') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-subtle'}`}
          >
            Home
          </Link>
          <Link
            to="/browse"
            className={`transition-colors hover:text-primary ${isActive('/browse') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-subtle'}`}
          >
            Browse
          </Link>
          <Link
            to="/about"
            className={`transition-colors hover:text-primary ${isActive('/about') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-subtle'}`}
          >
            About
          </Link>
        </nav>

        {/* Desktop Right side */}
        <div className="hidden md:flex items-center gap-4 w-1/3 justify-end">
          <SearchBar />
          <div className="h-6 w-px bg-border mx-2"></div>
          <LanguageToggle />
        </div>

        {/* Mobile Right side */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <button className="p-2 text-text-subtle hover:text-primary">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
