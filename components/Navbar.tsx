
import React, { useState, useEffect } from 'react';
import { COMPANY_NAME } from '../constants';
import { Menu, X, Calendar } from 'lucide-react';

interface NavbarProps {
  onBookAppointment: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookAppointment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const elementId = id.replace('#', '');
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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled || isOpen ? 'py-4 glass border-b' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => scrollTo('#')} className="flex items-center space-x-3 text-left group">
          <div className="w-10 h-10 rounded-xl bg-white border border-white/20 flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.png" alt="Future Bound Tech Logo" className="w-full h-full object-contain scale-105" />
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden sm:block">
            {COMPANY_NAME}
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={onBookAppointment}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Calendar size={16} /> Book Appointment
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-[73px] left-0 w-full h-screen glass border-b transition-all duration-300 transform ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex flex-col p-8 space-y-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollTo(link.href)}
              className="text-2xl font-bold text-gray-200 text-left"
            >
              {link.name}
            </button>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              onBookAppointment();
            }}
            className="w-full text-center py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3"
          >
            <Calendar size={20} /> Book Appointment
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
