import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PagePath } from './types';
import { RouterContext, P as PageContainer } from './components/Reveal';
import Home from './pages/Home';

// Lazy load secondary pages to optimize initial bundle size and speed up first paint
const Story = lazy(() => import('./pages/Story'));
const Process = lazy(() => import('./pages/Process'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const StartProjectPage = lazy(() => import('./pages/StartProjectPage'));
const StrategySessionPage = lazy(() => import('./pages/StrategySessionPage'));
const MissionControl = lazy(() => import('./pages/MissionControl'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full" id="page-loader">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<PagePath>('/');

  useEffect(() => {
    const validPaths: PagePath[] = ['/', '/story', '/process', '/portfolio', '/pricing', '/faq', '/contact', '/start-project', '/strategy-session', '/mission-control', '/dashboard', '/login'];
    
    // Parse path and state on start
    const path = window.location.pathname as PagePath;
    if (validPaths.includes(path)) {
      setCurrentPath(path);
    } else {
      setCurrentPath('/');
    }

    // Scroll to section on home page if section hash is specified
    const handleUrlHashAndScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) {
            const headerHeight = 64; // header is h-16 which maps to 64px
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.pageYOffset || document.documentElement.scrollTop) - headerHeight - 24; // with comfortable top padding

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    };

    handleUrlHashAndScroll();

    // Listen to browser PopState navigations
    const handlePopState = () => {
      const activePath = window.location.pathname as PagePath;
      if (validPaths.includes(activePath)) {
        setCurrentPath(activePath);
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleUrlHashAndScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleUrlHashAndScroll);
    };
  }, []);

  const navigate = (to: PagePath) => {
    window.history.pushState(null, '', to);
    setCurrentPath(to);
  };

  const renderPage = () => {
    const cleanPath = currentPath.split('?')[0] as PagePath;
    switch (cleanPath) {
      case '/story':
        return <Story />;
      case '/process':
        return <Process />;
      case '/pricing':
        return <PricingPage />;
      case '/faq':
        return <FAQPage />;
      case '/contact':
        return <ContactPage />;
      case '/portfolio':
        return <Portfolio />;
      case '/start-project':
        return <StartProjectPage />;
      case '/strategy-session':
        return <StrategySessionPage />;
      case '/mission-control':
        return <MissionControl />;
      case '/dashboard':
        return <CustomerDashboard />;
      case '/login':
        return <LoginPage />;
      case '/':
      default:
        return <Home />;
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      <PageContainer>
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </PageContainer>
    </RouterContext.Provider>
  );
}
