import React, { useState, useEffect } from 'react';
import { PagePath } from './types';
import { RouterContext, P as PageContainer } from './components/Reveal';
import Home from './pages/Home';
import Story from './pages/Story';
import Process from './pages/Process';
import PricingPage from './pages/PricingPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import Portfolio from './pages/Portfolio';
import StartProjectPage from './pages/StartProjectPage';
import StrategySessionPage from './pages/StrategySessionPage';
import MissionControl from './pages/MissionControl';

export default function App() {
  const [currentPath, setCurrentPath] = useState<PagePath>('/');

  useEffect(() => {
    const validPaths: PagePath[] = ['/', '/story', '/process', '/portfolio', '/pricing', '/faq', '/contact', '/start-project', '/strategy-session', '/mission-control'];
    
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
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      case '/':
      default:
        return <Home />;
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      <PageContainer>
        {renderPage()}
      </PageContainer>
    </RouterContext.Provider>
  );
}
