import React from 'react';
import { 
  LayoutDashboard, BookOpen, Calendar, FileText, 
  CheckSquare, MessageSquare, Bell, Building2, 
  FileSpreadsheet, Users, Terminal, UserPlus, 
  Award, ShieldAlert, Edit3, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../lib/authContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onCloseMobile }) => {
  const { currentRole, currentUser } = useAuth();

  const handleNav = (route: string) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const studentNavItems = [
    { code: '01', label: 'Learner Dashboard', route: '/student/dashboard', icon: LayoutDashboard, badge: 'Streak' },
    { code: '02', label: 'Interactive Lectures', route: '/student/lectures', icon: BookOpen, badge: 'ABS' },
    { code: '03', label: 'Class Timetable', route: '/student/timetable', icon: Calendar },
    { code: '04', label: 'Assignments & Rubrics', route: '/student/assignments', icon: FileText, badge: '2 Due' },
    { code: '05', label: 'Attendance Records', route: '/student/attendance', icon: CheckSquare },
    { code: '06', label: 'Academic Discussions', route: '/student/messages', icon: MessageSquare },
    { code: '07', label: 'Dispatches & Notices', route: '/student/notifications', icon: Bell },
  ];

  const lecturerNavItems = [
    { code: '01', label: 'Faculty Command', route: '/lecturer/dashboard', icon: LayoutDashboard },
    { code: '02', label: 'Learner Progress', route: '/lecturer/progress', icon: Users, badge: 'Live' },
    { code: '03', label: 'Lecture Timetable', route: '/lecturer/timetable', icon: Calendar },
    { code: '04', label: 'Course & Quiz Studio', route: '/lecturer/authoring', icon: Edit3, badge: 'Author' },
    { code: '05', label: 'SpeedGrader™ Suite', route: '/lecturer/grading', icon: ClipboardCheck, badge: 'Queue' },
    { code: '06', label: 'Attendance Register', route: '/lecturer/attendance', icon: CheckSquare },
    { code: '07', label: 'Student Inquiries', route: '/lecturer/messages', icon: MessageSquare },
  ];

  const adminNavItems = [
    { code: '01', label: 'Executive Console', route: '/admin/dashboard', icon: LayoutDashboard },
    { code: '02', label: 'Academic Faculties', route: '/admin/departments', icon: Building2, badge: '5 Depts' },
    { code: '03', label: 'Master Timetable', route: '/admin/timetable', icon: Calendar, badge: 'Matrix' },
    { code: '04', label: 'POPIA Audit Logs', route: '/admin/audit-logs', icon: ShieldAlert, badge: 'Statutory' },
    { code: '05', label: 'SA-SAMS Compliance', route: '/admin/reports', icon: FileSpreadsheet, badge: 'DHET' },
    { code: '06', label: 'Official Dispatches', route: '/admin/announcements', icon: Bell },
    { code: '07', label: 'RBAC Access Matrix', route: '/admin/users', icon: Users },
  ];

  const currentNavItems = 
    currentRole === 'admin' ? adminNavItems :
    currentRole === 'lecturer' ? lecturerNavItems : studentNavItems;

  return (
    <aside className="w-full md:w-64 bg-white md:min-h-[calc(100vh-6rem)] border border-neutral-300 flex flex-col justify-between p-0 rounded-none shadow-none">
      <div className="space-y-0">
        
        {/* Role Header Indicator */}
        <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-500">
              [ DIRECTORY // {currentRole} ]
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-academic-green text-white rounded-none">
              ONLINE
            </span>
          </div>
          <p className="text-sm font-serif font-bold text-deep-onyx mt-1 truncate">
            {currentUser?.departmentName || 'Department of Applied AI'}
          </p>
          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
            NODE // ZA-GAUTENG-01
          </p>
        </div>

        {/* Navigation Section */}
        <div>
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
              MODULE DIRECTORY
            </span>
            <span className="text-[9px] font-mono text-neutral-400">
              {currentNavItems.length} ENTRIES
            </span>
          </div>
          <nav className="divide-y divide-neutral-200">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  id={`nav-${item.route.replace(/[\/\-_]/g, '')}`}
                  onClick={() => handleNav(item.route)}
                  className={`w-full flex items-center justify-between pl-4 pr-3 py-2.5 text-xs text-left transition rounded-none ${
                    isActive
                      ? 'bg-deep-onyx text-achievement-gold font-bold border-l-4 border-l-achievement-gold'
                      : 'bg-white text-neutral-700 hover:bg-[#FAF9F5] hover:text-deep-onyx'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`font-mono text-[9px] ${isActive ? 'text-achievement-gold' : 'text-neutral-400'}`}>
                      {item.code}
                    </span>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-achievement-gold' : 'text-academic-green'}`} />
                    <span className="truncate font-serif font-bold text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono tracking-widest px-1.5 py-0.2 rounded-none uppercase ${
                      isActive 
                        ? 'bg-achievement-gold text-deep-onyx font-bold' 
                        : 'bg-neutral-100 text-neutral-600 border border-neutral-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Utilities */}
        <div className="border-t border-neutral-300">
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50">
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
              INTERFACE UTILITIES
            </span>
          </div>
          <nav className="divide-y divide-neutral-200">
            <button
              id="nav-api-explorer"
              onClick={() => handleNav('/api/docs')}
              className={`w-full flex items-center justify-between pl-4 pr-3 py-2 text-xs transition rounded-none ${
                currentRoute === '/api/docs'
                  ? 'bg-deep-onyx text-achievement-gold font-bold'
                  : 'bg-white text-neutral-700 hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-academic-green" />
                <span className="font-mono text-[11px]">Mobile REST API</span>
              </div>
              <span className="text-[9px] px-1 bg-neutral-100 text-neutral-600 font-mono border border-neutral-300 rounded-none">
                JSON
              </span>
            </button>

            <button
              id="nav-register-account"
              onClick={() => handleNav('/register')}
              className={`w-full flex items-center justify-between pl-4 pr-3 py-2 text-xs transition rounded-none ${
                currentRoute === '/register'
                  ? 'bg-academic-green text-white font-bold'
                  : 'bg-white text-neutral-700 hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-academic-green" />
                <span className="font-mono text-[11px]">Enrol New Scholar</span>
              </div>
              <span className="text-[9px] font-mono text-neutral-400">
                +ADD
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Institution Trust Blueprint Footnote */}
      <div className="p-3 border-t border-neutral-300 bg-[#FAF9F5] text-left">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-academic-green font-bold">
          <Award className="w-3 h-3 text-achievement-gold" />
          <span>TRIPLE 4 PARADIGM // 2026</span>
        </div>
        <p className="text-[9px] font-mono text-neutral-500 mt-1">
          DHET • SA-SAMS • POPIA ACT 4
        </p>
      </div>
    </aside>
  );
};
