import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Shield, GraduationCap, 
  Briefcase, CheckCircle2, User, Menu, X, LogOut, ChevronDown, 
  Sparkles, Search, FileText, ClipboardCheck, Settings, 
  BookOpen, ShieldAlert, ArrowRight, Compass
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { UserRole, SearchResultItem } from '../types';
import { searchGlobalPlatform } from '../lib/searchIndex';
import { DocumentViewerModal } from './modals/DocumentViewerModal';
import { UserProfileModal } from './modals/UserProfileModal';
import { AccountSettingsModal } from './modals/AccountSettingsModal';
import { AITutorDrawer } from './ai/AITutorDrawer';
import { VirtualCampusModal } from './campus/VirtualCampusModal';

interface HeaderProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  currentRoute = '', 
  onToggleMobileMenu, 
  mobileMenuOpen = false 
}) => {
  const { currentUser, currentRole, switchUserByRole, logout, unreadCount } = useAuth();
  
  // Menus and Modals State
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [activeSearchCategory, setActiveSearchCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);

  // Modal Openers
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [virtualCampusOpen, setVirtualCampusOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      } else if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchModalOpen]);

  // Perform search queries
  useEffect(() => {
    let cancelled = false;
    async function performSearch() {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await searchGlobalPlatform(searchQuery, activeSearchCategory);
        if (!cancelled) {
          setSearchResults(res);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }
    const timer = setTimeout(performSearch, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeSearchCategory]);

  const handleSearchResultClick = (item: SearchResultItem) => {
    setSearchModalOpen(false);
    setSearchQuery('');
    if (item.type === 'document' && item.documentId) {
      setSelectedDocId(item.documentId);
    } else {
      onNavigate(item.route);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-deep-onyx text-achievement-gold border border-deep-onyx rounded-none">
            <Shield className="w-3 h-3 text-achievement-gold" />
            ADMIN
          </span>
        );
      case 'lecturer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-academic-green text-white border border-academic-green rounded-none">
            <Briefcase className="w-3 h-3 text-achievement-gold" />
            FACULTY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-academic-green/10 text-academic-green border border-academic-green/30 rounded-none">
            <GraduationCap className="w-3 h-3 text-academic-green" />
            STUDENT
          </span>
        );
    }
  };

  const navLinks = [
    {
      code: '01',
      label: 'Curriculum & Modules',
      route: currentRole === 'admin' ? '/admin/dashboard' : currentRole === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard',
      isActive: currentRoute.includes('dashboard') || currentRoute === '/' || currentRoute === '/student'
    },
    {
      code: '02',
      label: 'Interactive Lectures',
      route: currentRole === 'admin' ? '/admin/timetable' : currentRole === 'lecturer' ? '/lecturer/classes' : '/student/lectures',
      isActive: currentRoute.includes('lectures') || currentRoute.includes('classes')
    },
    {
      code: '03',
      label: 'Timetable Schedule',
      route: currentRole === 'admin' ? '/admin/timetable' : currentRole === 'lecturer' ? '/lecturer/timetable' : '/student/timetable',
      isActive: currentRoute.includes('timetable')
    },
    {
      code: '04',
      label: currentRole === 'admin' ? 'Statutory (SA-SAMS)' : currentRole === 'lecturer' ? 'SpeedGrader™' : 'Assignments & Work',
      route: currentRole === 'admin' ? '/admin/reports' : currentRole === 'lecturer' ? '/lecturer/grading' : '/student/assignments',
      isActive: currentRoute.includes('assignments') || currentRoute.includes('grading') || currentRoute.includes('reports')
    },
    {
      code: '05',
      label: 'Inquiries & Comms',
      route: currentRole === 'admin' ? '/admin/announcements' : currentRole === 'lecturer' ? '/lecturer/messages' : '/student/messages',
      isActive: currentRoute.includes('messages') || currentRoute.includes('announcements')
    }
  ];

  const searchCategories = ['All', 'Courses', 'Assignments', 'Documents', 'Faculty', 'Quick Actions'];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FAF9F5] border-b border-neutral-300">
        
        {/* Top Blueprint Meta Ribbon */}
        <div className="hidden lg:flex items-center justify-between border-b border-neutral-200/80 px-8 py-1 bg-white text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
          <div className="flex items-center gap-6">
            <span>[ SYSTEM // TRIPLE-4-CURRICULUM-V5 ]</span>
            <span>DHET NATIONAL REGISTER #444-ACAD</span>
            <span>SA-SAMS REAL-TIME PROTOCOL: ACTIVE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>POPIA ACT 4 // 2013 SECURE</span>
            <span className="text-academic-green font-bold">STATUS: SENATE CERTIFIED</span>
          </div>
        </div>

        <div className="w-full mx-auto pl-4 pr-3 sm:pl-8 sm:pr-6 lg:pl-10 lg:pr-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Left: Mobile Toggle & Brand Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                id="btn-mobile-menu-toggle"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-deep-onyx border border-neutral-300 hover:bg-neutral-100 rounded-none transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-deep-onyx" />
                ) : (
                  <Menu className="w-5 h-5 text-deep-onyx" />
                )}
              </button>

              <button
                id="btn-nav-brand-home"
                onClick={() => onNavigate(currentRole === 'admin' ? '/admin/dashboard' : currentRole === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard')}
                className="flex items-center py-1 group cursor-pointer focus:outline-none"
                aria-label="Go to homepage"
              >
                <img 
                  src="https://res.cloudinary.com/dka0498ns/image/upload/v1787254845/Triple_4_Curriculum_latest_logo_variant4_hjviza.png" 
                  alt="Triple 4 Curriculum Logo" 
                  className="h-12 sm:h-16 w-auto object-contain rounded-none"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>

            {/* Center-Left: Desktop Architectural Navigation Links */}
            <nav className="hidden xl:flex items-center border-l border-neutral-300 pl-6 h-full">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.route)}
                  className={`h-full flex flex-col justify-center px-4 border-r border-neutral-300/80 text-left transition ${
                    link.isActive
                      ? 'bg-white text-academic-green font-bold border-b-2 border-b-academic-green'
                      : 'text-neutral-700 hover:text-deep-onyx hover:bg-neutral-100/60'
                  }`}
                >
                  <span className="font-mono text-[9px] text-neutral-400 tracking-widest">{link.code} //</span>
                  <span className="text-xs font-serif font-bold tracking-tight">{link.label}</span>
                </button>
              ))}
            </nav>

            {/* Global Search Bar (Center / Desktop) */}
            <div className="flex-1 max-w-xs md:max-w-sm hidden md:block">
              <button
                id="btn-global-search-trigger"
                onClick={() => setSearchModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-neutral-300 hover:border-deep-onyx text-neutral-600 text-xs transition cursor-pointer rounded-none"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono text-[11px] tracking-wider text-neutral-600 uppercase">
                    Query index or code...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-none">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right: Role-Specific Action Button, Mobile Search, Profile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Mobile Search Icon */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="md:hidden p-2 border border-neutral-300 text-deep-onyx hover:bg-neutral-100 transition rounded-none"
                title="Search platform"
              >
                <Search className="w-4 h-4 text-deep-onyx" />
              </button>

              {/* Role-Specific Action Buttons */}
              {currentRole === 'lecturer' ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="btn-lecturer-quick-grade"
                    onClick={() => onNavigate('/lecturer/grading')}
                    className="px-3.5 py-2 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer rounded-none border border-deep-onyx"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-achievement-gold" />
                    <span>SpeedGrader™</span>
                    <span className="font-mono">→</span>
                  </button>
                  <button
                    id="btn-lecturer-author-lecture"
                    onClick={() => onNavigate('/lecturer/authoring')}
                    className="hidden lg:flex px-3 py-2 bg-white border border-neutral-300 hover:border-deep-onyx font-mono text-xs uppercase tracking-wider text-deep-onyx items-center gap-1.5 transition cursor-pointer rounded-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-deep-onyx" />
                    <span>Author</span>
                    <span className="font-mono">→</span>
                  </button>
                </div>
              ) : currentRole === 'student' ? (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    id="btn-student-submit-assignment"
                    onClick={() => onNavigate('/student/assignments')}
                    className="px-3.5 py-2 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer rounded-none border border-deep-onyx"
                  >
                    <FileText className="w-3.5 h-3.5 text-achievement-gold" />
                    <span>Submit Work</span>
                    <span className="font-mono">→</span>
                  </button>
                  <button
                    id="btn-student-ai-tutor"
                    onClick={() => setAiTutorOpen(true)}
                    className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-deep-onyx font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition border border-neutral-300 hover:border-deep-onyx cursor-pointer rounded-none"
                  >
                    <img 
                      src="https://res.cloudinary.com/dka0498ns/image/upload/v1787326034/Triple_4_Curriculum_chabot_Icon_n2qrgg.png"
                      alt="AI"
                      className="w-4 h-4 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span>AI Copilot</span>
                    <span className="font-mono">→</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-admin-statutory-audit"
                  onClick={() => onNavigate('/admin/reports')}
                  className="hidden sm:flex px-3.5 py-2 bg-deep-onyx hover:bg-black text-white font-mono text-xs uppercase tracking-wider items-center gap-2 transition border border-deep-onyx cursor-pointer rounded-none"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-achievement-gold" />
                  <span>Statutory Audit</span>
                  <span className="font-mono">→</span>
                </button>
              )}

              {/* Notification Bell */}
              <button
                id="btn-header-notifications"
                onClick={() => onNavigate(currentRole === 'student' ? '/student/notifications' : '/admin/announcements')}
                className="relative p-2 border border-neutral-300 bg-white hover:border-deep-onyx transition cursor-pointer rounded-none"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-deep-onyx" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-600" />
                )}
              </button>

              {/* User Dropdown & Profile Area */}
              <div className="relative">
                <button
                  id="btn-user-role-menu"
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-3 py-1.5 border border-neutral-300 bg-white hover:border-deep-onyx transition text-left cursor-pointer rounded-none"
                  aria-expanded={roleMenuOpen}
                >
                  <div className="w-7 h-7 bg-deep-onyx text-achievement-gold font-mono font-bold text-xs flex items-center justify-center rounded-none">
                    {currentUser?.name.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-serif font-bold text-deep-onyx leading-tight truncate max-w-[100px]">
                      {currentUser?.name.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                      {currentRole}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </button>

                {roleMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setRoleMenuOpen(false)}
                    />

                    <div 
                      id="dropdown-user-role-menu"
                      className="absolute right-0 mt-1 w-72 bg-white border border-neutral-300 py-0 z-50 rounded-none text-neutral-800"
                    >
                      {/* User Header */}
                      <div className="p-4 border-b border-neutral-300 bg-[#FAF9F5]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">AUTHENTICATED PERSONA</span>
                          {currentUser && getRoleBadge(currentUser.role)}
                        </div>
                        <h4 className="text-base font-serif font-bold text-deep-onyx truncate">{currentUser?.name}</h4>
                        <p className="text-[11px] text-academic-green font-mono truncate">{currentUser?.email}</p>
                        <p className="text-[10px] font-mono tracking-widest text-neutral-500 mt-1">
                          {currentUser?.studentId || currentUser?.employeeId || 'ID: 444-STU-8821'}
                        </p>
                      </div>

                      {/* Profile & Security Management Action Items */}
                      <div className="p-2 space-y-0.5 border-b border-neutral-300">
                        <button
                          onClick={() => {
                            setProfileModalOpen(true);
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono tracking-wide text-neutral-800 hover:bg-[#FAF9F5] transition cursor-pointer rounded-none text-left"
                        >
                          <User className="w-3.5 h-3.5 text-academic-green" />
                          <span>Academic Profile & Dossier</span>
                        </button>

                        <button
                          onClick={() => {
                            setAccountSettingsOpen(true);
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono tracking-wide text-neutral-800 hover:bg-[#FAF9F5] transition cursor-pointer rounded-none text-left"
                        >
                          <Settings className="w-3.5 h-3.5 text-academic-green" />
                          <span>Security & POPIA Directives</span>
                        </button>

                        <button
                          onClick={() => {
                            setVirtualCampusOpen(true);
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono tracking-wide text-neutral-800 hover:bg-[#FAF9F5] transition cursor-pointer rounded-none text-left"
                        >
                          <Compass className="w-3.5 h-3.5 text-achievement-gold" />
                          <span>Virtual Campus Blueprint</span>
                        </button>
                      </div>

                      {/* Switch Persona (RBAC) */}
                      <div className="p-3 border-b border-neutral-300 bg-[#FAF9F5]">
                        <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase mb-2">
                          Switch Role (RBAC Protocol)
                        </p>
                        
                        <div className="space-y-1">
                          <button
                            id="btn-switch-to-student"
                            onClick={() => {
                              switchUserByRole('student');
                              onNavigate('/student/dashboard');
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition cursor-pointer rounded-none border ${
                              currentRole === 'student' 
                                ? 'bg-academic-green text-white border-academic-green font-bold' 
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span className="font-mono text-[11px]">Sarah Khumalo (Student)</span>
                            </div>
                            {currentRole === 'student' && <CheckCircle2 className="w-3 h-3 text-achievement-gold" />}
                          </button>

                          <button
                            id="btn-switch-to-lecturer"
                            onClick={() => {
                              switchUserByRole('lecturer');
                              onNavigate('/lecturer/dashboard');
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition cursor-pointer rounded-none border ${
                              currentRole === 'lecturer' 
                                ? 'bg-academic-green text-white border-academic-green font-bold' 
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span className="font-mono text-[11px]">Dr. Arthur Vance (Faculty)</span>
                            </div>
                            {currentRole === 'lecturer' && <CheckCircle2 className="w-3 h-3 text-achievement-gold" />}
                          </button>

                          <button
                            id="btn-switch-to-admin"
                            onClick={() => {
                              switchUserByRole('admin');
                              onNavigate('/admin/dashboard');
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition cursor-pointer rounded-none border ${
                              currentRole === 'admin' 
                                ? 'bg-deep-onyx text-achievement-gold border-deep-onyx font-bold' 
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5" />
                              <span className="font-mono text-[11px]">Dean Edwards (Admin)</span>
                            </div>
                            {currentRole === 'admin' && <CheckCircle2 className="w-3 h-3 text-achievement-gold" />}
                          </button>
                        </div>
                      </div>

                      {/* Logout */}
                      <div className="p-2">
                        <button
                          id="btn-user-logout"
                          onClick={() => {
                            logout();
                            onNavigate('/login');
                            setRoleMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono tracking-widest uppercase text-rose-700 hover:bg-rose-50 transition cursor-pointer rounded-none text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Terminate Session</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-300 bg-[#FAF9F5] p-4 space-y-4 rounded-none">
            
            {/* User Status Bar */}
            <div className="flex items-center justify-between p-3 bg-white border border-neutral-300 rounded-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-deep-onyx text-achievement-gold font-mono font-bold text-xs flex items-center justify-center rounded-none">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-serif font-bold text-deep-onyx">{currentUser?.name}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">{currentUser?.email}</p>
                </div>
              </div>
              {currentUser && getRoleBadge(currentUser.role)}
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase px-1 mb-1">
                [ NAVIGATION INDEX ]
              </p>
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    onNavigate(link.route);
                    if (onToggleMobileMenu) onToggleMobileMenu();
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-serif font-bold border transition rounded-none ${
                    link.isActive
                      ? 'bg-academic-green text-white border-academic-green'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-deep-onyx'
                  }`}
                >
                  <span className="font-mono text-[9px] opacity-70 mr-2">{link.code} //</span>
                  {link.label}
                </button>
              ))}
            </div>

            {/* Role Switcher Mobile */}
            <div className="space-y-1 pt-2 border-t border-neutral-300">
              <p className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase px-1 mb-1">
                [ ACTIVE ROLE ]
              </p>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => {
                    switchUserByRole('student');
                    onNavigate('/student/dashboard');
                    if (onToggleMobileMenu) onToggleMobileMenu();
                  }}
                  className={`p-2 text-center text-xs font-mono uppercase tracking-wider border rounded-none ${
                    currentRole === 'student'
                      ? 'bg-academic-green text-white border-academic-green'
                      : 'bg-white text-neutral-700 border-neutral-300'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => {
                    switchUserByRole('lecturer');
                    onNavigate('/lecturer/dashboard');
                    if (onToggleMobileMenu) onToggleMobileMenu();
                  }}
                  className={`p-2 text-center text-xs font-mono uppercase tracking-wider border rounded-none ${
                    currentRole === 'lecturer'
                      ? 'bg-academic-green text-white border-academic-green'
                      : 'bg-white text-neutral-700 border-neutral-300'
                  }`}
                >
                  Faculty
                </button>
                <button
                  onClick={() => {
                    switchUserByRole('admin');
                    onNavigate('/admin/dashboard');
                    if (onToggleMobileMenu) onToggleMobileMenu();
                  }}
                  className={`p-2 text-center text-xs font-mono uppercase tracking-wider border rounded-none ${
                    currentRole === 'admin'
                      ? 'bg-deep-onyx text-achievement-gold border-deep-onyx'
                      : 'bg-white text-neutral-700 border-neutral-300'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

          </div>
        )}
      </header>

      {/* Global Universal Search Modal (Command Center) */}
      {searchModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/50 backdrop-blur-none"
          onClick={() => setSearchModalOpen(false)}
        >
          <div 
            className="w-full max-w-3xl bg-white border-2 border-deep-onyx flex flex-col overflow-hidden rounded-none shadow-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Blueprint Header Strip */}
            <div className="px-4 py-2 bg-deep-onyx text-white text-[10px] font-mono tracking-widest uppercase flex items-center justify-between">
              <span>[ SEARCH // REPOSITORY QUERY MATRIX ]</span>
              <span>ESC TO ABORT</span>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 border-b border-neutral-300 flex items-center gap-3 bg-[#FAF9F5]">
              <Search className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by course code, lecture topic, assignment, policy, or faculty..."
                className="flex-1 bg-transparent text-sm sm:text-base text-deep-onyx placeholder:text-neutral-400 focus:outline-none font-serif font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="px-4 py-2 bg-white border-b border-neutral-300 flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {searchCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveSearchCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-mono tracking-wider uppercase transition whitespace-nowrap cursor-pointer rounded-none border ${
                    activeSearchCategory === cat
                      ? 'bg-deep-onyx text-achievement-gold border-deep-onyx font-bold'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-deep-onyx'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Results Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-2 bg-[#FAF9F5]">
              {isSearching ? (
                <div className="py-12 text-center text-xs font-mono tracking-wider text-neutral-500 uppercase">
                  <span>Executing index lookup across Triple 4C syllabus registry...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {searchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSearchResultClick(item)}
                      className="p-3.5 bg-white border border-neutral-300 hover:border-deep-onyx transition cursor-pointer flex items-center justify-between group rounded-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#FAF9F5] border border-neutral-300 text-deep-onyx flex items-center justify-center flex-shrink-0 rounded-none font-mono text-xs">
                          {item.type === 'course' ? 'CRS' :
                           item.type === 'assignment' ? 'WRK' :
                           item.type === 'document' ? 'DOC' :
                           item.type === 'faculty' ? 'FAC' : 'ACT'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-serif font-bold text-deep-onyx group-hover:text-academic-green transition">
                              {item.title}
                            </h4>
                            {item.badge && (
                              <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-300 rounded-none uppercase">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 mt-0.5 font-sans">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-academic-green opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                          <span>{item.type === 'document' ? 'Open Dossier' : 'Inspect'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-base font-serif font-bold text-deep-onyx">
                    No matching records found in syllabus matrix
                  </p>
                  <p className="text-xs font-mono text-neutral-500 max-w-sm mx-auto">
                    Try queries: "CSC-441", "SA-SAMS", "POPIA", "Dr. Arthur Vance", or "SpeedGrader"
                  </p>
                </div>
              ) : (
                /* Default Institutional Policies & Quick Jumps */
                <div className="space-y-3">
                  <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">
                    [ STATUTORY CHARTERS & ACCREDITED GUIDES ]
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSearchModalOpen(false);
                        setSelectedDocId('doc_sasams_2026');
                      }}
                      className="text-left p-3 bg-white border border-neutral-300 hover:border-deep-onyx transition flex items-center gap-3 cursor-pointer rounded-none"
                    >
                      <Shield className="w-4 h-4 text-academic-green flex-shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-deep-onyx">SA-SAMS Statutory Manual 2026</p>
                        <p className="text-[10px] font-mono text-neutral-500">DHET & CAPS Real-time Sync</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSearchModalOpen(false);
                        setSelectedDocId('doc_popia_charter');
                      }}
                      className="text-left p-3 bg-white border border-neutral-300 hover:border-deep-onyx transition flex items-center gap-3 cursor-pointer rounded-none"
                    >
                      <ShieldAlert className="w-4 h-4 text-academic-green flex-shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-deep-onyx">POPIA Data Protection Charter</p>
                        <p className="text-[10px] font-mono text-neutral-500">Act 4 of 2013 Compliance Standard</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSearchModalOpen(false);
                        setSelectedDocId('doc_444_paradigm');
                      }}
                      className="text-left p-3 bg-white border border-neutral-300 hover:border-deep-onyx transition flex items-center gap-3 cursor-pointer rounded-none"
                    >
                      <BookOpen className="w-4 h-4 text-achievement-gold flex-shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-deep-onyx">The 4-4-4 Modular Paradigm</p>
                        <p className="text-[10px] font-mono text-neutral-500">Academic Framework Blueprint</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSearchModalOpen(false);
                        setSelectedDocId('doc_speedgrader_guide');
                      }}
                      className="text-left p-3 bg-white border border-neutral-300 hover:border-deep-onyx transition flex items-center gap-3 cursor-pointer rounded-none"
                    >
                      <ClipboardCheck className="w-4 h-4 text-academic-green flex-shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-deep-onyx">SpeedGrader™ Rubrics Guide</p>
                        <p className="text-[10px] font-mono text-neutral-500">Standard Faculty Marking Rubric</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-white border-t border-neutral-300 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5 uppercase">
                <span>[ INDEX VERIFIED // 100% COVERAGE ]</span>
              </span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="font-bold text-deep-onyx hover:underline cursor-pointer uppercase"
              >
                Close (ESC)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <DocumentViewerModal 
        documentId={selectedDocId} 
        onClose={() => setSelectedDocId(null)} 
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <AccountSettingsModal
        isOpen={accountSettingsOpen}
        onClose={() => setAccountSettingsOpen(false)}
      />

      <AITutorDrawer
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
      />

      <VirtualCampusModal
        isOpen={virtualCampusOpen}
        onClose={() => setVirtualCampusOpen(false)}
      />
    </>
  );
};
