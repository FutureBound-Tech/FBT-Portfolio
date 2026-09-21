
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Pillars from './components/Pillars';
import Services from './components/Services';
import Careers from './components/Careers';
import Contact from './components/Contact';
import SEOBlog from './components/SEOBlog';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import AppointmentModal from './components/AppointmentModal';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin-mb' || hash === '#/admin-mb' || hash === '#admin-mb') {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, []);

  const navigateToMain = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isAdminView) {
    return <AdminDashboard onBack={navigateToMain} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <AnimatedBackground />
      
      {/* Foreground Content */}
      <div className="relative z-10">
        <Navbar onBookAppointment={() => setIsAppointmentModalOpen(true)} />
        <main>
          <Hero onBookAppointment={() => setIsAppointmentModalOpen(true)} />
          <Pillars />
          <Services />
          <Careers />
          <SEOBlog />
          <Contact />
        </main>
        <Footer />
      </div>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
      />

      {/* Static Visual Decoration Overlay */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default App;
