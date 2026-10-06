import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
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
import ReviewModal from './components/ReviewModal';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Caught by Boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070e] text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-8 rounded-3xl bg-[#0b0f1a] border border-white/10 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-xs text-gray-400">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'careers' | 'admin'>('home');

  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/admin-mb' || hash === '#/admin-mb' || hash === '#admin-mb') {
        setCurrentView('admin');
      } else if (
        path === '/careers' || 
        path === '/career' || 
        hash === '#/careers' || 
        hash === '#/career' || 
        hash === '#careers' || 
        hash === '#career'
      ) {
        setCurrentView('careers');
      } else if (
        path === '/support' || 
        path === '/review' || 
        hash === '#/support' || 
        hash === '#support' || 
        hash === '#/review' || 
        hash === '#review'
      ) {
        setCurrentView('home');
        setIsReviewModalOpen(true);
      } else {
        setCurrentView('home');
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
    setCurrentView('home');
    setIsReviewModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    if (window.location.pathname === '/support' || window.location.pathname === '/review' || window.location.hash.includes('support')) {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentView === 'admin') {
    return <AdminDashboard onBack={navigateToMain} />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full max-w-full">
      {/* Background Layer */}
      <AnimatedBackground />
      
      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-full overflow-x-hidden">
        <Navbar 
          onBookAppointment={() => setIsAppointmentModalOpen(true)} 
          currentView={currentView}
        />
        <main className="w-full max-w-full overflow-x-hidden">
          {currentView === 'careers' ? (
            <Careers onBackToHome={navigateToMain} />
          ) : (
            <>
              <Hero onBookAppointment={() => setIsAppointmentModalOpen(true)} />
              <Pillars />
              <Services />
              <SEOBlog />
              <Contact />
            </>
          )}
        </main>
        <Footer onOpenReviewModal={() => setIsReviewModalOpen(true)} />
      </div>

      <AppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
      />

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={handleCloseReviewModal} 
      />

      {/* Static Visual Decoration Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
};

export default App;
