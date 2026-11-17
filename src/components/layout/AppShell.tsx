import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  UserCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEMO_USERS } from '../../data/mockData';
import { ScreenId } from '../../types';

interface NavItem {
  id: ScreenId;
  matchScreens: ScreenId[];
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    matchScreens: ['dashboard'],
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
  },
  {
    id: 'ar-library',
    matchScreens: ['ar-library', 'ar-viewer'],
    label: 'AR Learning',
    shortLabel: 'AR 3D',
    icon: Box,
  },
  {
    id: 'virtual-classrooms',
    matchScreens: ['virtual-classrooms', 'virtual-classroom-view'],
    label: 'Virtual Classroom',
    shortLabel: 'VR Lab',
    icon: Compass,
  },
  {
    id: 'activities',
    matchScreens: ['activities', 'quiz-player', 'quiz-results'],
    label: 'Activities',
    shortLabel: 'Quizzes',
    icon: ClipboardCheck,
  },
  {
    id: 'progress',
    matchScreens: ['progress'],
    label: 'Progress',
    shortLabel: 'Progress',
    icon: BarChart3,
  },
  {
    id: 'lms',
    matchScreens: ['lms'],
    label: 'Learning Management',
    shortLabel: 'LMS',
    icon: BookOpen,
  },
];

const SCREEN_TITLES: Record<ScreenId, { section: string; page: string }> = {
  login: { section: 'Authentication', page: 'Role Selection' },
  dashboard: { section: 'Overview', page: 'Dashboard' },
  'ar-library': { section: 'AR 3D Materials', page: 'Learning Library' },
  'ar-viewer': { section: 'AR 3D Materials', page: '3D Model & AR Simulation' },
  'virtual-classrooms': { section: 'Virtual Classroom', page: 'Select Environment' },
  'virtual-classroom-view': { section: 'Virtual Classroom', page: 'Interactive Lab' },
  activities: { section: 'Interactive Activities', page: 'Quizzes & Matching' },
  'quiz-player': { section: 'Interactive Activities', page: 'Active Assessment' },
  'quiz-results': { section: 'Interactive Activities', page: 'Results & Review' },
  progress: { section: 'Analytics', page: 'Learning Progress' },
  lms: { section: 'Platform', page: 'Learning Management System' },
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentUser,
    screen,
    screenLoading,
    navigateTo,
    logout,
    loginAsUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    settings,
    updateSettings,
    resetDemoData,
    toasts,
    dismissToast,
    confirmDialog,
    openConfirm,
    closeConfirm,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const breadcrumb = SCREEN_TITLES[screen];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Sidebar (248px, Deep Navy #172554) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#172554] text-white border-r border-blue-950 z-30">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-blue-900/70">
          <div className="w-9 h-9 rounded-lg bg-[#3B82F6] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight whitespace-nowrap">
            XR Smart Learning
          </span>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.matchScreens.includes(screen);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  active
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-blue-100/80 hover:bg-blue-900/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Role & Demo Switcher */}
        {currentUser && (
          <div className="p-4 border-t border-blue-900/70 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-blue-200/80 truncate capitalize">
                  {currentUser.role} Account
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-900/60 hover:bg-blue-900 text-blue-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Role / Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 h-14 lg:h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Brand or Desktop Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="lg:hidden flex items-center gap-2 text-[#172554] font-display font-bold text-sm whitespace-nowrap shrink-0"
            >
              <span className="w-7 h-7 rounded-md bg-[#172554] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span>XR Smart</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 whitespace-nowrap">{breadcrumb.section}</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 truncate">{breadcrumb.page}</span>
            </div>
          </div>

          {/* Right: Notifications, Settings, Profile */}
          <div className="flex items-center gap-2 shrink-0 relative">
            {/* Role label text (no pill badge) */}
            {currentUser && (
              <span className="hidden sm:inline-block text-xs text-slate-500 mr-2 whitespace-nowrap">
                {currentUser.role === 'teacher' ? 'Educator Workspace' : 'Student Workspace'}
              </span>
            )}

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3B82F6] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          setNotifOpen(false);
                          if (n.targetScreen) navigateTo(n.targetScreen);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.detail}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              type="button"
              aria-label="Application settings"
              onClick={() => {
                setSettingsOpen(true);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              className="w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Profile Switcher Button */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((v) => !v);
                    setNotifOpen(false);
                  }}
                  className="h-10 pl-2 pr-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center gap-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="w-7 h-7 rounded-md bg-[#172554] text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.initials}
                  </span>
                  <span className="hidden md:inline text-xs font-semibold text-slate-800 whitespace-nowrap">
                    {currentUser.name}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg z-40 p-3 space-y-2">
                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.institution}</p>
                    </div>
                    <p className="px-2 pt-1 text-[11px] font-semibold text-slate-400">
                      Quick Switch Demo Account
                    </p>
                    <div className="space-y-1">
                      {DEMO_USERS.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            loginAsUser(u.id);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                            u.id === currentUser.id
                              ? 'bg-blue-50 text-blue-800 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          <span className="text-[11px] text-slate-500 capitalize shrink-0 ml-2">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Return to Login Screen</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          {screenLoading ? (
            <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading view">
              <div className="h-8 w-64 bg-slate-200 rounded-lg" />
              <div className="h-[420px] w-full bg-slate-200 rounded-xl" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-white border-t border-slate-200 grid grid-cols-6 px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.matchScreens.includes(screen);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[44px] text-[10px] font-medium transition-colors ${
                active ? 'text-[#3B82F6] font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full px-0.5">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#172554]" />
                <h2 className="font-display font-bold text-base text-slate-900">
                  Prototype Settings
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">Show 3D Labels by Default</p>
                  <p className="text-xs text-slate-500">
                    Display interactive anatomical and structural pins when opening 3D models.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show3DLabelsByDefault}
                  onChange={(e) => updateSettings({ show3DLabelsByDefault: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-[#3B82F6]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">Reduced 3D Motion</p>
                  <p className="text-xs text-slate-500">
                    Pause orbital animations and auto-rotation for comfortable reading.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-[#3B82F6]"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  openConfirm(
                    'Reset Demo Progress?',
                    'This restores all quiz attempts, custom materials, and assignment submissions back to the default alpha dataset.',
                    'Reset Data',
                    resetDemoData,
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#172554] text-white hover:bg-blue-900 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  closeConfirm();
                  fn();
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#172554] text-white hover:bg-blue-900"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-3 flex items-start gap-3"
          >
            {t.tone === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {t.tone === 'info' && <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
            {t.tone === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900">{t.title}</p>
              {t.description && <p className="text-xs text-slate-600 mt-0.5">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
