import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, RemoteTeamMember, TimeEntry, PrioritizationWeights, ProjectStatus } from './types/project';
import { INITIAL_PROJECTS, INITIAL_MEMBERS, INITIAL_TIME_ENTRIES } from './data/initialProjects';
import { DEFAULT_WEIGHTS, autoPrioritizeProjects } from './utils/prioritization';
import { TopBar, TabKey } from './components/TopBar';
import { ProjectTable } from './components/ProjectTable';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsView } from './components/LeadsView';
import { HostingVault } from './components/HostingVault';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { TimeLogModal } from './components/TimeLogModal';
import { DigitalCoyotesLogo } from './components/DigitalCoyotesLogo';
import { RotateCcw } from 'lucide-react';

const DEFAULT_VISIBLE_TABS: TabKey[] = ['projects', 'kanban', 'leads', 'hosting'];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('projects');

  // Real-time Global Search State & Lead Filter Sync
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [ledgerLeadFilter, setLedgerLeadFilter] = useState<string>('All');

  // Core Data with LocalStorage Persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('dc_projects') || localStorage.getItem('nexus_projects');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.map((p) => {
          let updatedLead = p.projectLead;
          let updatedSub = p.subLead;
          if (p.projectLead && p.projectLead.toLowerCase() === 'kunal') {
            updatedLead = 'Suraj';
          }
          if (p.subLead && p.subLead.toLowerCase() === 'rasika') {
            updatedSub = 'Hasina';
          }
          if (p.id === 'proj-59' || p.id === 'proj-71') {
            updatedLead = 'Hasina';
          }
          const startDate = p.startDate || p.initiationDate || '2026-02-15';
          return {
            ...p,
            projectLead: updatedLead,
            subLead: updatedSub,
            startDate,
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    return autoPrioritizeProjects(INITIAL_PROJECTS, DEFAULT_WEIGHTS);
  });

  const [members, setMembers] = useState<RemoteTeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('dc_members') || localStorage.getItem('nexus_members');
      if (saved) {
        const parsed: RemoteTeamMember[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (m) =>
            m.name.toLowerCase() !== 'kunal' &&
            m.name.toLowerCase() !== 'rasika'
        );
        if (!filtered.some((m) => m.name.toLowerCase() === 'hasina')) {
          const hasina = INITIAL_MEMBERS.find((m) => m.name === 'Hasina');
          if (hasina) return [...filtered, hasina];
        }
        return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MEMBERS;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_time_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TIME_ENTRIES;
  });

  const [weights, setWeights] = useState<PrioritizationWeights>(() => {
    try {
      const saved = localStorage.getItem('nexus_weights');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WEIGHTS;
  });

  // Active Live Timer State
  const [activeTimer, setActiveTimer] = useState<{
    isRunning: boolean;
    projectId: string;
    projectName: string;
    member: string;
    seconds: number;
    description: string;
  }>({
    isRunning: false,
    projectId: '',
    projectName: '',
    member: 'Sakshi',
    seconds: 0,
    description: '',
  });

  // Modal States
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  // Theme state: Day mode (false) or Night mode (true)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dc_theme');
      if (saved) return saved === 'dark';
      return true; // Night mode by default
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dc_theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Visible Tabs State (Default: Projects Ledger, Sprint Board, Hosting & Backups; Prioritization Engine & Remote Time Logs removed per request)
  const [visibleTabs, setVisibleTabs] = useState<TabKey[]>(() => {
    try {
      const saved = localStorage.getItem('dc_visible_tabs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(
            (t: string) => t === 'projects' || t === 'kanban' || t === 'leads' || t === 'hosting'
          ) as TabKey[];
          if (!valid.includes('leads')) {
            valid.push('leads');
          }
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_VISIBLE_TABS;
  });

  // Calculate real-time global matching projects count
  const matchingProjectsCount = useMemo(() => {
    if (!globalSearch.trim()) return projects.length;
    const q = globalSearch.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.projectLead.toLowerCase().includes(q) ||
        (p.subLead && p.subLead.toLowerCase().includes(q)) ||
        (p.technology && p.technology.toLowerCase().includes(q)) ||
        (p.framework && p.framework.toLowerCase().includes(q))
    ).length;
  }, [projects, globalSearch]);

  useEffect(() => {
    try {
      localStorage.setItem('dc_visible_tabs', JSON.stringify(visibleTabs));
    } catch (e) {
      console.error(e);
    }
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0] || 'projects');
    }
  }, [visibleTabs, activeTab]);

  const handleToggleTabVisibility = (tab: TabKey) => {
    setVisibleTabs((prev) => {
      if (prev.includes(tab)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== tab);
      } else {
        return [...prev, tab];
      }
    });
  };

  const handleResetTabs = () => {
    setVisibleTabs(DEFAULT_VISIBLE_TABS);
    setActiveTab('projects');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_projects', JSON.stringify(projects));
    localStorage.setItem('dc_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nexus_members', JSON.stringify(members));
    localStorage.setItem('dc_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('nexus_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('nexus_weights', JSON.stringify(weights));
  }, [weights]);

  // Live Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          seconds: prev.seconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning]);

  // Timer Control Handlers
  const handleToggleTimer = () => {
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const handleStartTimerForProject = (project: Project) => {
    setActiveTimer({
      isRunning: true,
      projectId: project.id,
      projectName: project.name,
      member: project.projectLead || 'Sakshi',
      seconds: 0,
      description: `Task sprint on ${project.name}`,
    });
  };

  const handleStartCustomTimer = (projectId: string, member: string, description: string) => {
    const proj = projects.find((p) => p.id === projectId);
    setActiveTimer({
      isRunning: true,
      projectId,
      projectName: proj?.name || 'Active Project',
      member,
      seconds: 0,
      description: description || `Development on ${proj?.name}`,
    });
  };

  const handleStopAndLogTimer = () => {
    if (activeTimer.seconds >= 10 && activeTimer.projectId) {
      const loggedHoursInc = Number((activeTimer.seconds / 3600).toFixed(2));

      // 1. Create time entry
      const newEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        projectId: activeTimer.projectId,
        projectName: activeTimer.projectName,
        member: activeTimer.member,
        date: new Date().toISOString().split('T')[0],
        durationSeconds: activeTimer.seconds,
        description: activeTimer.description || 'Live sprint tracking session',
        billable: true,
        category: 'development',
        timestamp: Date.now(),
      };
      setTimeEntries((prev) => [newEntry, ...prev]);

      // 2. Increment project logged hours
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeTimer.projectId
            ? { ...p, loggedHours: Number(((p.loggedHours || 0) + loggedHoursInc).toFixed(1)) }
            : p
        )
      );

      // 3. Update member's logged seconds
      setMembers((prev) =>
        prev.map((m) =>
          m.name.toLowerCase() === activeTimer.member.toLowerCase()
            ? {
                ...m,
                trackedTodaySeconds: m.trackedTodaySeconds + activeTimer.seconds,
                status: 'active',
              }
            : m
        )
      );
    }

    setActiveTimer({
      isRunning: false,
      projectId: '',
      projectName: '',
      member: 'Sakshi',
      seconds: 0,
      description: '',
    });
  };

  const handleAddManualTimeEntry = (entryData: Omit<TimeEntry, 'id' | 'timestamp'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: `time-${Date.now()}`,
      timestamp: Date.now(),
    };
    setTimeEntries((prev) => [newEntry, ...prev]);

    const hrsToAdd = Number((entryData.durationSeconds / 3600).toFixed(2));
    setProjects((prev) =>
      prev.map((p) =>
        p.id === entryData.projectId
          ? { ...p, loggedHours: Number(((p.loggedHours || 0) + hrsToAdd).toFixed(1)) }
          : p
      )
    );

    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === entryData.member.toLowerCase()
          ? { ...m, trackedTodaySeconds: m.trackedTodaySeconds + entryData.durationSeconds }
          : m
      )
    );
  };

  const handleDeleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Prioritization Algorithm Runner
  const handleRunAutoPrioritize = () => {
    setProjects((prev) => autoPrioritizeProjects(prev, weights));
  };

  // Status updates from Kanban
  const handleUpdateStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p));
      return autoPrioritizeProjects(updated, weights);
    });
  };

  // Save new / edited project
  const handleSaveProject = (formData: Partial<Project>) => {
    if (editProject) {
      // Edit
      setProjects((prev) => {
        const updated = prev.map((p) => (p.id === editProject.id ? { ...p, ...formData } : p));
        return autoPrioritizeProjects(updated, weights);
      });
      setEditProject(null);
    } else {
      // Create
      const newSrNo = projects.length > 0 ? Math.max(...projects.map((p) => p.srNo)) + 1 : 1;
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        srNo: newSrNo,
        name: formData.name || 'Untitled Project',
        projectLead: formData.projectLead || 'Sakshi',
        subLead: formData.subLead || '',
        liveUrl: formData.liveUrl || '',
        startDate: formData.startDate || formData.initiationDate || new Date().toISOString().split('T')[0],
        initiationDate: formData.initiationDate || formData.startDate || new Date().toISOString().split('T')[0],
        technology: formData.technology || 'WordPress / PHP',
        framework: formData.framework || 'Custom',
        design: formData.design || 'In Review',
        content: formData.content || 'Drafting',
        lastChange: 'Created new project record',
        status: formData.status || 'In process',
        hosting: formData.hosting || '',
        deadline: formData.deadline || '',
        backup: formData.backup || '',
        remark: formData.remark || '',
        estimatedHours: formData.estimatedHours || 40,
        loggedHours: formData.loggedHours || 0,
        priorityLevel: 'P2',
        priorityScore: 70,
        clientUrgencyFlag: formData.clientUrgencyFlag || false,
      };

      setProjects((prev) => autoPrioritizeProjects([newProject, ...prev], weights));
    }
  };

  // Reset to initial dataset
  const handleResetData = () => {
    if (window.confirm('Reset all projects, team metrics, and time entries to initial state?')) {
      const fresh = autoPrioritizeProjects(INITIAL_PROJECTS, DEFAULT_WEIGHTS);
      setProjects(fresh);
      setMembers(INITIAL_MEMBERS);
      setTimeEntries(INITIAL_TIME_ENTRIES);
      setWeights(DEFAULT_WEIGHTS);
      localStorage.removeItem('nexus_projects');
      localStorage.removeItem('nexus_members');
      localStorage.removeItem('nexus_time_entries');
      localStorage.removeItem('nexus_weights');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Sr No',
      'Projects',
      'Project Lead',
      'Sub lead',
      'Current Live Link',
      'Starting Date',
      'Initiation Date',
      'Technology',
      'Frame Work',
      'Design',
      'Content',
      'Last Change',
      'Status',
      'Hosting',
      'Deadline',
      'Backup',
      'Remark',
      'Estimated Hours',
      'Logged Hours',
      'Priority Level',
      'Priority Score',
    ];

    const rows = projects.map((p) => [
      p.srNo,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.projectLead.replace(/"/g, '""')}"`,
      `"${(p.subLead || '').replace(/"/g, '""')}"`,
      `"${(p.liveUrl || '').replace(/"/g, '""')}"`,
      `"${p.startDate || p.initiationDate || ''}"`,
      `"${p.initiationDate || ''}"`,
      `"${(p.technology || '').replace(/"/g, '""')}"`,
      `"${(p.framework || '').replace(/"/g, '""')}"`,
      `"${(p.design || '').replace(/"/g, '""')}"`,
      `"${(p.content || '').replace(/"/g, '""')}"`,
      `"${(p.lastChange || '').replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${(p.hosting || '').replace(/"/g, '""')}"`,
      `"${p.deadline || ''}"`,
      `"${(p.backup || '').replace(/"/g, '""')}"`,
      `"${(p.remark || '').replace(/"/g, '""')}"`,
      p.estimatedHours,
      p.loggedHours,
      p.priorityLevel,
      p.priorityScore,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `digital_coyotes_projects_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'dark bg-neutral-950 text-neutral-100' : 'bg-neutral-100/60 text-neutral-900'} flex flex-col font-sans selection:bg-[#F05A28]/25 selection:text-[#F05A28]`}>
      {/* Universal TopBar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        visibleTabs={visibleTabs}
        onToggleTabVisibility={handleToggleTabVisibility}
        onResetTabs={handleResetTabs}
        onOpenNewProject={() => {
          setEditProject(null);
          setIsNewProjectOpen(true);
        }}
        searchQuery={globalSearch}
        onSearchChange={setGlobalSearch}
        matchingProjectsCount={matchingProjectsCount}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {visibleTabs.includes('projects') && activeTab === 'projects' && (
          <ProjectTable
            projects={projects}
            teamMembers={members}
            globalSearch={globalSearch}
            onSearchChange={setGlobalSearch}
            initialLeadFilter={ledgerLeadFilter}
            onSelectProject={(p) => setDetailProject(p)}
            onEditProject={(p) => {
              setEditProject(p);
              setIsNewProjectOpen(true);
            }}
            onStartTimer={handleStartTimerForProject}
            onExportCSV={handleExportCSV}
          />
        )}

        {visibleTabs.includes('kanban') && activeTab === 'kanban' && (
          <KanbanBoard
            projects={projects}
            teamMembers={members}
            globalSearch={globalSearch}
            onClearSearch={() => setGlobalSearch('')}
            onSelectProject={(p) => setDetailProject(p)}
            onUpdateStatus={handleUpdateStatus}
            onStartTimer={handleStartTimerForProject}
          />
        )}

        {visibleTabs.includes('leads') && activeTab === 'leads' && (
          <LeadsView
            members={members}
            projects={projects}
            onSelectProject={(p) => setDetailProject(p)}
            onFilterByLeadInLedger={(leadName) => {
              setLedgerLeadFilter(leadName);
              setActiveTab('projects');
            }}
          />
        )}

        {visibleTabs.includes('hosting') && activeTab === 'hosting' && (
          <HostingVault projects={projects} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 py-5 text-xs text-neutral-600 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <DigitalCoyotesLogo className="w-5 h-5 text-[#F05A28] shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Digital Coyotes Project Manager</span>
            <span>·</span>
            <span>71 Projects Live Synced</span>
            <span>·</span>
            <span>Remote Team Coordination System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset data back to initial seed"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Initial Seed
            </button>
            <span>·</span>
            <span className="font-mono text-[11px] tabular-nums">
              Session Active
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectDetailModal
        project={detailProject}
        onClose={() => setDetailProject(null)}
        onEdit={(p) => {
          setDetailProject(null);
          setEditProject(p);
          setIsNewProjectOpen(true);
        }}
        onStartTimer={handleStartTimerForProject}
      />

      <ProjectFormModal
        isOpen={isNewProjectOpen}
        project={editProject}
        teamMembers={members}
        onClose={() => {
          setIsNewProjectOpen(false);
          setEditProject(null);
        }}
        onSave={handleSaveProject}
      />

      <TimeLogModal
        isOpen={isLogTimeOpen}
        onClose={() => setIsLogTimeOpen(false)}
        projects={projects}
        teamMembers={members}
        onAddEntry={handleAddManualTimeEntry}
      />
    </div>
  );
}
