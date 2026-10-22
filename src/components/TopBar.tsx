import React, { useState, useEffect, useRef } from 'react';
import { Plus, Sun, Moon, LayoutGrid, Layers, Search, X, LogOut } from 'lucide-react';
import { DigitalCoyotesLogo } from './DigitalCoyotesLogo';
import { AuthUser } from '../types/project';

export type TabKey = 'projects' | 'kanban' | 'leads' | 'hosting';

interface TabMeta {
  id: TabKey;
  label: string;
  mobileLabel: string;
  desc: string;
}

export const ALL_WORKSPACE_TABS: TabMeta[] = [
  {
    id: 'projects',
    label: 'Projects Ledger',
    mobileLabel: 'Ledger',
    desc: 'Master table of all 71 active deployments, project leads, tech, and live status',
  },
  {
    id: 'kanban',
    label: 'Sprint Board',
    mobileLabel: 'Sprint Board',
    desc: 'Interactive 6-column workflow board across all client delivery stages',
  },
  {
    id: 'leads',
    label: 'Project Leads',
    mobileLabel: 'Leads',
    desc: 'Remote team leads directory, workload allocation, active assignments, and contact channels',
  },
  {
    id: 'hosting',
    label: 'Hosting & Backups',
    mobileLabel: 'Hosting',
    desc: 'Centralized registry of client cPanel logins, Hostinger accounts, and Mega.nz links',
  },
];

interface TopBarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  visibleTabs: TabKey[];
  onToggleTabVisibility: (tab: TabKey) => void;
  onResetTabs: () => void;
  onOpenNewProject: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchingProjectsCount?: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  visibleTabs,
  onToggleTabVisibility,
  onResetTabs,
  onOpenNewProject,
  searchQuery,
  onSearchChange,
  matchingProjectsCount,
  currentUser,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  // Live IST Time for remote operations
  const [istTime, setIstTime] = useState<string>('');
  const [showViewsMenu, setShowViewsMenu] = useState<boolean>(false);
  const viewsMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K / '/' to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
        setIstTime(timeStr);
      } catch {
        setIstTime('');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close views menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewsMenuRef.current && !viewsMenuRef.current.contains(event.target as Node)) {
        setShowViewsMenu(false);
      }
    };
    if (showViewsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewsMenu]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          
          {/* Zone 1: Brand Wordmark with Digital Coyotes Geometric Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center p-1 rounded-lg bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20">
              <DigitalCoyotesLogo className="w-8 h-8 shrink-0 text-[#F05A28]" />
              <div className="absolute inset-0 bg-[#F05A28]/10 rounded-lg blur-xs pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white whitespace-nowrap">
                  Digital Coyotes
                </span>
                <span className="text-xs text-[#F05A28] font-mono hidden sm:inline font-semibold">
                  / Project Manager
                </span>
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono hidden md:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Remote Operations Studio</span>
                {istTime && <span>· IST {istTime}</span>}
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium shrink-0">
            {ALL_WORKSPACE_TABS.filter((tab) => visibleTabs.includes(tab.id)).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-neutral-900 dark:text-white border-b-2 border-[#F05A28] font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 2.5: Global Real-Time Search Bar */}
          <div className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block mx-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search project, lead, stack..."
              className="w-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 focus:border-[#F05A28] dark:focus:border-[#F05A28] rounded-lg pl-8 pr-16 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery ? (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {matchingProjectsCount !== undefined && (
                  <span className="text-[10px] text-[#F05A28] font-mono font-semibold px-1 rounded bg-orange-500/10 hidden md:inline">
                    {matchingProjectsCount}
                  </span>
                )}
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-200/50 dark:bg-neutral-700/50 rounded border border-neutral-300/50 dark:border-neutral-600/50 pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Zone 3: Navigation controls, views manager, theme toggle, action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Customize Visible Views Popover */}
            <div className="relative" ref={viewsMenuRef}>
              <button
                onClick={() => setShowViewsMenu(!showViewsMenu)}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                  showViewsMenu
                    ? 'bg-neutral-200 dark:bg-neutral-700 border-neutral-400 dark:border-neutral-600 text-neutral-900 dark:text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
                title="Manage visible navigation pages and views"
                aria-label="Customize visible page views"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#F05A28]" />
                <span className="hidden md:inline font-mono">Views ({visibleTabs.length})</span>
              </button>

              {showViewsMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 p-3.5 z-50 text-xs text-neutral-800 dark:text-neutral-200">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                    <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#F05A28]" />
                      Customize Pages
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {visibleTabs.length} of {ALL_WORKSPACE_TABS.length} active
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2.5">
                    Select which pages appear in your navigation menu:
                  </p>

                  <div className="space-y-1.5">
                    {ALL_WORKSPACE_TABS.map((tab) => {
                      const isVisible = visibleTabs.includes(tab.id);
                      return (
                        <label
                          key={tab.id}
                          className={`flex items-start gap-2.5 p-1.5 rounded-md cursor-pointer transition-colors ${
                            isVisible
                              ? 'bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              : 'opacity-60 hover:opacity-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => onToggleTabVisibility(tab.id)}
                            disabled={tab.id === 'projects' && visibleTabs.length === 1}
                            className="mt-0.5 rounded border-neutral-300 dark:border-neutral-600 text-[#F05A28] focus:ring-[#F05A28] cursor-pointer"
                          />
                          <div className="flex flex-col flex-1">
                            <span className={`font-medium ${isVisible ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
                              {tab.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-1">
                              {tab.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-[11px]">
                    <button
                      onClick={onResetTabs}
                      className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                      Default Preset
                    </button>
                    <button
                      onClick={() => setShowViewsMenu(false)}
                      className="px-2.5 py-1 bg-[#F05A28] hover:bg-[#d94e20] text-white rounded font-medium cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Day / Night Effect Interactive Switch */}
            <div className="flex items-center">
              <button
                onClick={onToggleTheme}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium cursor-pointer transition-all duration-300 ${
                  isDark
                    ? 'bg-neutral-800/90 hover:bg-neutral-750 border-neutral-700 text-neutral-200 shadow-inner'
                    : 'bg-amber-50 hover:bg-amber-100/80 border-amber-300/80 text-amber-900 shadow-xs'
                }`}
                title={isDark ? 'Switch to Day Shift Mode (Light)' : 'Switch to Night Shift Mode (Dark)'}
                aria-label="Toggle Day or Night effect"
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
                    isDark ? 'bg-indigo-950/80 text-indigo-300 shadow-xs' : 'bg-amber-400 text-amber-950 shadow-xs'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 fill-indigo-300/20" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 animate-[spin_12s_linear_infinite]" />
                  )}
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wide">
                  {isDark ? 'Night' : 'Day'}
                </span>
              </button>
            </div>

            {/* New Project Primary CTA */}
            <button
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#F05A28] hover:bg-[#d94e20] rounded-md shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* Logged-in User Profile & Sign Out */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-200 dark:border-neutral-800">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono border shadow-2xs ${currentUser.avatarBg}`}
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 leading-tight truncate max-w-[85px]">
                    {currentUser.role.split('&')[0]}
                  </span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out / Switch User"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-2.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search project, lead, stack..."
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg pl-8 pr-16 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#F05A28]"
            />
            {searchQuery && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {matchingProjectsCount !== undefined && (
                  <span className="text-[10px] text-[#F05A28] font-mono font-semibold">
                    {matchingProjectsCount}
                  </span>
                )}
                <button
                  onClick={() => onSearchChange('')}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar for visible tabs only */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 gap-4 no-scrollbar">
          {ALL_WORKSPACE_TABS.filter((tab) => visibleTabs.includes(tab.id)).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap cursor-pointer py-0.5 ${
                activeTab === tab.id
                  ? 'text-neutral-900 dark:text-white font-semibold border-b border-[#F05A28]'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {tab.mobileLabel}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
