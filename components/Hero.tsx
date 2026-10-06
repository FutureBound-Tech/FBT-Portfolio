
import React from 'react';
import { ArrowRight, ChevronDown, Calendar, MapPin } from 'lucide-react';

interface HeroProps {
  onBookAppointment: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBookAppointment }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToCareers = () => {
    window.history.pushState({}, '', '/careers');
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center pt-28 sm:pt-32 pb-12 px-4 sm:px-6 overflow-hidden w-full max-w-full">
      <div className="max-w-4xl mx-auto text-center z-10 w-full">

        {/* Location badge — local SEO signal */}
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <MapPin size={11} />
            Nellore, Andhra Pradesh
          </div>
        </div>

        <div className="inline-block px-4 py-1.5 mb-4 sm:mb-6 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          #1 Software Company in Nellore
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 leading-tight tracking-tight flex flex-col items-center justify-center">
          <span>Evolving The <span className="gradient-text">Future</span></span>
          <span className="inline-flex items-center my-1.5 sm:my-2.5">
            <span className="px-3.5 py-0.5 rounded-full text-xs sm:text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 shadow-sm shadow-blue-500/10 tracking-widest lowercase">
              of
            </span>
          </span>
          <span className="text-white">IT &amp; Finance</span>
        </h1>

        {/* SEO-rich subheading — h2 level content for crawlers */}
        <p className="text-[11px] sm:text-sm font-semibold text-blue-400/80 tracking-wider mb-3 sm:mb-4 uppercase px-2">
          IT Solutions · Web Development · Mobile Apps · Software Coaching · Nellore
        </p>

        <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Future Bound Tech is Nellore's powerhouse of digital transformation. As the leading software company in Nellore, we deliver expert web development, mobile application development, custom IT solutions, and software coaching — built to scale your vision across Andhra Pradesh and beyond.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
          <button
            onClick={onBookAppointment}
            className="w-full sm:w-auto group px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all hover:translate-y-[-2px] shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Calendar size={18} />
            Book Consultation
          </button>
          <button
            onClick={navigateToCareers}
            className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold transition-all text-white flex items-center justify-center active:scale-95"
          >
            Explore Careers
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500 cursor-pointer"
        onClick={() => scrollTo('services')}
      >
        <ChevronDown size={32} />
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default Hero;
