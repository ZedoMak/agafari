import { useParams, Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Clock, Wallet, BookOpen } from 'lucide-react';
import { POPULAR_SERVICES } from '../../constants/popularServices';
import { useLanguage } from '../../context/LanguageContext';
import { Badge } from '../../components/ui/badge';
import { ServiceSteps } from './components/ServiceSteps';
import { RequiredDocuments } from './components/RequiredDocuments';
import { ServiceLocations } from './components/ServiceLocations';
import { AISummary } from './components/AISummary';
import { ServiceAssistant } from './components/ServiceAssistant';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();

  // For this mock frontend, we just find it from POPULAR_SERVICES
  const service = POPULAR_SERVICES.find(s => s.id === id);

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-2xl font-bold text-text-main mb-2">Service Not Found</h1>
        <p className="text-text-subtle mb-6">The service you are looking for does not exist or has been moved.</p>
        <Link to="/" className="text-primary font-semibold hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset for Navbar + Sticky Tabs
      const yOffset = -140;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* 1. Breadcrumbs Header Strip */}
      <div className="bg-surface border-b border-border py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center text-xs md:text-sm text-text-subtle overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 mx-2 shrink-0" />
          <Link to="/browse" className="hover:text-primary transition-colors">Government & Public Services</Link>
          <ChevronRight className="h-3 w-3 mx-2 shrink-0" />
          <span className="hover:text-primary transition-colors cursor-pointer">{service.office_info}</span>
          <ChevronRight className="h-3 w-3 mx-2 shrink-0" />
          <span className="font-semibold text-text-main">{t(service.name_en, service.name_am)}</span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-20 flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-stretch">

        {/* Left Column: Steps, Docs, Locations */}
        <div className="flex-1 lg:pr-8 w-full">

          {/* 2. Service Header & Metadata */}
          <div className="bg-surface rounded-xl p-6 md:p-8 border border-border shadow-sm mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 h-min">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight mb-1">
                    {service.name_en}
                  </h1>
                  <h2 className="text-lg text-text-subtle font-amharic mb-2">
                    {service.name_am}
                  </h2>
                  <p className="text-sm text-text-subtle font-medium uppercase tracking-wider">
                    {service.office_info}
                  </p>
                </div>
              </div>

              {/* Desktop official badge */}
              <div className="hidden md:flex flex-col items-end">
                <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20 mb-2 py-1 px-3">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Official
                </Badge>
                <span className="text-[10px] text-text-subtle font-medium">Last updated:<br />{service.last_verified}</span>
              </div>
            </div>

            {/* Mobile official badge */}
            <div className="md:hidden flex justify-between items-center mb-6 border-b border-border pb-4">
              <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Official
              </Badge>
              <span className="text-[10px] text-text-subtle font-medium">Updated: {service.last_verified}</span>
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-text-main shadow-sm">
                <Clock className="w-4 h-4 text-text-subtle" />
                Timeline: {service.processing_time}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-text-main shadow-sm">
                <Wallet className="w-4 h-4 text-text-subtle" />
                Fee: {service.fee}
              </div>
            </div>
          </div>

          {/* In-page Navigation Tabs */}
          <div className="border-b border-border mb-8 sticky top-[64px] bg-background z-30 pt-4">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => scrollToSection('steps')}
                className="text-primary font-bold border-b-2 border-primary pb-3 whitespace-nowrap text-sm md:text-base">
                Steps
              </button>
              <button
                onClick={() => scrollToSection('documents')}
                className="text-text-subtle hover:text-primary font-medium pb-3 whitespace-nowrap text-sm md:text-base transition-colors">
                Documents
              </button>
              <button
                onClick={() => scrollToSection('location')}
                className="text-text-subtle hover:text-primary font-medium pb-3 whitespace-nowrap text-sm md:text-base transition-colors">
                Location
              </button>
              <button
                onClick={() => scrollToSection('summary')}
                className="text-text-subtle hover:text-primary font-medium pb-3 whitespace-nowrap text-sm md:text-base transition-colors">
                Summary
              </button>
            </div>
          </div>

          {/* Main Content (Step 3 & 4) */}
          <div className="mt-8">
            {service.steps && service.steps.length > 0 && (
              <div id="steps">
                <ServiceSteps steps={service.steps} />
              </div>
            )}

            {service.documents && service.documents.length > 0 && (
              <div id="documents">
                <RequiredDocuments documents={service.documents} />
              </div>
            )}

            <div id="location">
              <ServiceLocations />
            </div>

            <div id="summary">
              <AISummary />
            </div>
          </div>

        </div>

        {/* Right Sidebar (Step 5) */}
        <div className="hidden lg:block w-[350px]">
          <div className="sticky top-[100px] h-[calc(100vh-140px)]">
            <ServiceAssistant serviceName={service.name_en} variant="desktop" />
          </div>
        </div>

      </div>

      {/* Mobile Assistant FAB */}
      <ServiceAssistant serviceName={service.name_en} variant="mobile" />
    </div>
  );
}
