import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
  BarChart3,
  User,
  Users,
  Building2,
  UserCheck,
  MessageSquare,
  Settings,
  LogOut,
  Compass,
  Bot,
  CalendarCheck,
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApplications } from '../../context/ApplicationContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { applications } = useApplications();
  const navigate = useNavigate();
  const location = useLocation();

  const activeAppsCount = applications.length;

  const navGroups = [
    {
      group: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', path: '/jobs', icon: Briefcase },
        { name: 'Applications', path: '/applications', icon: Layers, badge: activeAppsCount },
      ]
    },
    {
      group: 'PREPARE',
      items: [
        { name: 'Resume Intelligence', path: '/resume', icon: FileText },
        { name: 'Interview Preparation', path: '/interview/app-1', icon: CalendarCheck },
        { name: 'Mock Interview', path: '/mock-interview/app-1', icon: Bot },
      ]
    },
    {
      group: 'COMMUNITY',
      items: [
        { name: 'Explore People', path: '/explore', icon: Users },
        { name: 'Companies', path: '/companies', icon: Building2 },
        { name: 'Career Guidance', path: '/guidance', icon: UserCheck },
        { name: 'Interview Experiences', path: '/interviews', icon: MessageSquare },
      ]
    },
    {
      group: 'INSIGHTS',
      items: [
        { name: 'Career Analytics', path: '/analytics', icon: BarChart3 },
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isItemActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    if (path === '/notifications') return location.pathname === '/notifications';
    if (path.startsWith('/interview/')) return location.pathname.startsWith('/interview');
    if (path.startsWith('/mock-interview/')) return location.pathname.startsWith('/mock-interview');
    if (path.startsWith('/applications')) return location.pathname.startsWith('/applications');
    if (path.startsWith('/explore')) return location.pathname.startsWith('/explore') || location.pathname.startsWith('/people');
    if (path.startsWith('/companies')) return location.pathname.startsWith('/companies');
    if (path.startsWith('/interviews')) return location.pathname.startsWith('/interviews');
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-15 px-5 border-b border-slate-100 dark:border-slate-800/80">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">CareerPilot</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">AI</span>
            </div>
          </NavLink>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact AI Readiness Indicator */}
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-none truncate">Readiness Score</p>
                <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-1 overflow-hidden">
                  <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full w-[76%]" />
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">76%</span>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-md ${
                        active
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div
              onClick={() => {
                onClose();
                navigate('/profile');
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-7.5 h-7.5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.degree?.split(' ')[0] || 'CS'} Senior</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
