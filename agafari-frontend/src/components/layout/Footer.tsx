import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-24 md:pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-accent" />
              <span className="text-xl font-bold">Meri</span>
            </Link>
            <p className="text-sm text-white/80 leading-relaxed">
              YeEthiopia Meri is the central directory for all Ethiopian Government services. Our mission is to provide transparent, accessible, and efficient information to every citizen.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><Link to="/browse" className="hover:text-accent transition-colors">Service Directory</Link></li>
              <li><Link to="/forms" className="hover:text-accent transition-colors">Forms & Directives</Link></li>
              <li><Link to="/portals" className="hover:text-accent transition-colors">Regional Portals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><Link to="/help" className="hover:text-accent transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
              <li><Link to="/report" className="hover:text-accent transition-colors">Report Issues</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Social</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li><a href="#" className="hover:text-accent transition-colors">Twitter (X)</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <p>© 2024 YeEthiopia Meri - Official Government Information Platform</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
