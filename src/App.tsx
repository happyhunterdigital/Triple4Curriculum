import React from 'react';
import { AuthProvider } from './lib/authContext';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernSidebar } from './components/ModernSidebar';
import { ClassroomWorkspace } from './components/learning/ClassroomWorkspace';
import { AssignmentLedger } from './components/AssignmentLedger';
import { AIFloatingChatbot } from './components/ai/AIFloatingChatbot';

function App() {
  const [currentRoute, setCurrentRoute] = React.useState<string>('/dashboard');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <div className="w-full min-h-screen bg-[var(--color-canvas-soft)] flex flex-col antialiased">
        <ModernNavbar />

        <div className="w-full flex flex-1 items-stretch">
          <ModernSidebar onNavigate={handleNavigate} />
          
          <div className="flex-1 flex flex-col overflow-y-auto relative z-0">
            <div className="border-b border-[var(--color-canvas-line)]">
              <ClassroomWorkspace />
            </div>

            <div className="bg-white py-12">
              <AssignmentLedger />
            </div>
          </div>
        </div>

        <AIFloatingChatbot />
      </div>
    </AuthProvider>
  );
}

export default App;
