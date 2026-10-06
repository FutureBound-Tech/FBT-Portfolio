
import React, { useState, useEffect, useRef } from 'react';
import { COMPANY_NAME } from '../constants';
import { Menu, X, Calendar } from 'lucide-react';

interface NavbarProps {
  onBookAppointment: () => void;
  currentView?: 'home' | 'careers' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ onBookAppointment, currentView = 'home' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNavClick = (href: string) => {
    setIsOpen(false);

    // If clicking Career, navigate to /careers page
    if (href === '#careers' || href === '/careers') {
      window.history.pushState({}, '', '/careers');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If currently on Careers page (or another subpage), navigate to Home first
    if (currentView !== 'home') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
      setTimeout(() => {
        const elementId = href.replace('#', '');
        if (elementId) {
          const el = document.getElementById(elementId);
          if (el) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // On home page:
    const elementId = href.replace('#', '');
    if (!elementId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(elementId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services' },
    { name: 'Finance', href: '#finance' },
    { name: 'Career', href: '#careers' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
      scrolled || isOpen ? 'py-3 sm:py-4 bg-[#080c16] border-b border-white/10 shadow-lg shadow-black/60' : 'py-3.5 sm:py-6 bg-[#050505]/80 backdrop-blur-md sm:bg-transparent'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-3">
        <button onClick={() => handleNavClick('#')} className="flex items-center gap-2.5 sm:gap-3 text-left group min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-white/20 flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img src="/logo.png" alt="Future Bound Tech Logo" className="w-full h-full object-contain scale-105" />
          </div>
          <span className="font-extrabold text-xs sm:text-base md:text-xl tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {COMPANY_NAME}
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = (currentView === 'careers' && link.name === 'Career') || (currentView === 'home' && link.name === 'Home' && !scrolled);
            return (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm font-medium transition-colors uppercase tracking-widest ${
                  isActive ? 'text-blue-400 font-bold' : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                {link.name}
              </button>
            );
          })}
          <button
            onClick={onBookAppointment}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Calendar size={16} /> Book Appointment
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          className="md:hidden p-2 rounded-xl text-gray-200 hover:text-white bg-white/10 border border-white/10 active:scale-95 transition-all shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown Panel (Content-Fit) */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 w-full px-4 pt-2 pb-3 transition-all duration-200 transform origin-top ${
          isOpen ? 'opacity-100 scale-y-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-y-95 pointer-events-none -translate-y-2'
        }`}
      >
        <div 
          className="mobile-nav-panel rounded-2xl p-3.5 flex flex-col space-y-2 shadow-2xl"
          style={{ backgroundColor: '#090d18' }}
        >
          {/* Well-ordered Navigation Links */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = (currentView === 'careers' && link.name === 'Career');
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-left group ${
                    isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-200 hover:text-white hover:bg-white/10 active:bg-blue-600/30'
                  }`}
                >
                  <span>{link.name}</span>
                  <span className={`text-xs font-mono transition-opacity ${isActive ? 'text-blue-400 opacity-100' : 'text-blue-400 opacity-0 group-hover:opacity-100'}`}>→</span>
                </button>
              );
            })}
          </div>

          {/* Divider & Action Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setIsOpen(false);
                onBookAppointment();
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Calendar size={16} /> Book Appointment
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
