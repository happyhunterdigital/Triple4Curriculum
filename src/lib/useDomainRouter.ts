import { useState, useEffect } from 'react';

interface DomainRoute {
  path: string;
  title: string;
  description: string;
}

const ROUTE_MAP: Record<string, DomainRoute> = {
  '/': {
    path: '/',
    title: 'The Institute // Deep Autonomous Learning',
    description: 'A rigorous educational environment built entirely for intellectual autonomy.'
  },
  '/dashboard': {
    path: '/dashboard',
    title: 'Dashboard // The Institute',
    description: 'Your academic command center.'
  },
  '/classroom': {
    path: '/classroom',
    title: 'Classroom // The Institute',
    description: 'Cinematic learning workspace.'
  },
  '/assignments': {
    path: '/assignments',
    title: 'Assignments // The Institute',
    description: 'Submission registry and task ledger.'
  },
  '/campus': {
    path: '/campus',
    title: 'Virtual Campus // The Institute',
    description: 'Interactive campus environment.'
  }
};

export function useDomainRouter() {
  const [currentRoute, setCurrentRoute] = useState<DomainRoute>(() => {
    const path = window.location.pathname;
    return ROUTE_MAP[path] || ROUTE_MAP['/'];
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const route = ROUTE_MAP[path] || ROUTE_MAP['/'];
      setCurrentRoute(route);
      document.title = route.title;
    };

    window.addEventListener('popstate', handlePopState);
    document.title = currentRoute.title;

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const route = ROUTE_MAP[path] || ROUTE_MAP['/'];
    window.history.pushState({}, '', path);
    setCurrentRoute(route);
    document.title = route.title;
  };

  return { currentRoute, navigate, routes: Object.values(ROUTE_MAP) };
}
