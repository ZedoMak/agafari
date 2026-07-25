import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';

import Home from './pages/Home';
import Search from './pages/Search';
import Browse from './pages/Browse';
import Category from './pages/Category';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      {/* pb-16 prevents content from hiding behind the mobile bottom nav */}
      <div className="min-h-screen bg-background text-text-main flex flex-col font-sans pb-16 md:pb-0 relative">
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/:category" element={<Category />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
