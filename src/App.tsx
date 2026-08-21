import React from 'react';
import { ModernNavbar } from './components/ModernNavbar';
import { ModernSidebar } from './components/ModernSidebar';
import { ClassroomWorkspace } from './components/learning/ClassroomWorkspace';
import { AssignmentLedger } from './components/AssignmentLedger';

function App() {
  return (
    <div className="w-full min-h-screen bg-[var(--color-canvas-light)] flex flex-col antialiased">
      <ModernNavbar />

      <div className="w-full flex flex-1 items-stretch">
        <ModernSidebar />
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="border-b border-[var(--color-canvas-border)]">
            <ClassroomWorkspace />
          </div>

          <div className="bg-white py-12">
            <AssignmentLedger />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
