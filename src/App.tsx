import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, RemoteTeamMember, TimeEntry, PrioritizationWeights, ProjectStatus, AuthUser } from './types/project';
import { INITIAL_PROJECTS, INITIAL_MEMBERS, INITIAL_TIME_ENTRIES } from './data/initialProjects';
import { DEFAULT_WEIGHTS, autoPrioritizeProjects } from './utils/prioritization';
import { TopBar, TabKey } from './components/TopBar';
import { ProjectTable } from './components/ProjectTable';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsView } from './components/LeadsView';
import { HostingVault } from './components/HostingVault';
import { LoginPanel } from './components/LoginPanel';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { TimeLogModal } from './components/TimeLogModal';
import { ActiveLeadsTrackingBar } from './components/ActiveLeadsTrackingBar';
import { DigitalCoyotesLogo } from './components/DigitalCoyotesLogo';
import { RotateCcw } from 'lucide-react';

const DEFAULT_VISIBLE_TABS: TabKey[] = ['projects', 'kanban', 'leads', 'hosting'];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabKey>('projects');

  // Real-time Global Search State & Lead Filter Sync
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [ledgerLeadFilter, setLedgerLeadFilter] = useState<string>('All');

  // User Authentication Session with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('dc_current_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('dc_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('dc_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Core Data with LocalStorage Persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('dc_projects') || localStorage.getItem('nexus_projects');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.map((p) => {
          let updatedLead = p.projectLead;
          let updatedSub = p.subLead;
          if (p.id === 'proj-3' && p.projectLead && p.projectLead.toLowerCase() === 'kunal') {
            updatedLead = 'Suraj';
          }
          if (p.id === 'proj-12') {
            updatedLead = 'Kunal';
            updatedSub = 'Saniya';
          }
          if (p.id === 'proj-27') {
            updatedLead = 'Saniya';
            updatedSub = 'Kunal';
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
        if (Array.isArray(parsed)) {
          // Initialize canonical map from INITIAL_MEMBERS ensuring unique IDs (e.g. mem-sakshi, mem-saniya, mem-kunal)
          const canonicalMap = new Map<string, RemoteTeamMember>();
          INITIAL_MEMBERS.forEach((m) => {
            canonicalMap.set(m.name.toLowerCase(), {
              ...m,
              id: `mem-${m.name.toLowerCase()}`,
            });
          });

          // Merge any saved operational status/timer seconds from existing localStorage
          parsed.forEach((m) => {
            if (!m || !m.name) return;
            const nameKey = m.name.toLowerCase().trim();
            if (nameKey === 'rasika') return; // Rasika removed per request

            if (canonicalMap.has(nameKey)) {
              const canon = canonicalMap.get(nameKey)!;
              canonicalMap.set(nameKey, {
                ...canon,
                status: m.status || canon.status,
                trackedTodaySeconds:
                  typeof m.trackedTodaySeconds === 'number'
                    ? m.trackedTodaySeconds
                    : canon.trackedTodaySeconds,
              });
            }
          });

          const sanitized = Array.from(canonicalMap.values());
          // Immediately overwrite any corrupt localStorage entry containing duplicate mem-6 keys
          try {
            localStorage.setItem('dc_members', JSON.stringify(sanitized));
            localStorage.setItem('nexus_members', JSON.stringify(sanitized));
          } catch {
            // ignore
          }
          return sanitized;
        }
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

  // Live Timer Interval: runs continuously to tick activeTimer and all 'tracking' team leads
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Tick primary active timer if running
      setActiveTimer((prev) => {
        if (!prev.isRunning) return prev;
        return {
          ...prev,
          seconds: prev.seconds + 1,
        };
      });

      // 2. Tick trackedTodaySeconds for all members currently marked as 'tracking'
      setMembers((prev) => {
        const hasTracking = prev.some((m) => m.status === 'tracking');
        if (!hasTracking) return prev;
        return prev.map((m) => {
          if (m.status === 'tracking') {
            return {
              ...m,
              trackedTodaySeconds: (m.trackedTodaySeconds || 0) + 1,
            };
          }
          return m;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer Control Handlers
  const handleToggleTimer = () => {
    setActiveTimer((prev) => {
      const willRun = !prev.isRunning;
      setMembers((mList) =>
        mList.map((m) =>
          m.name.toLowerCase() === prev.member.toLowerCase()
            ? { ...m, status: willRun ? 'tracking' : 'active' }
            : m
        )
      );
      return {
        ...prev,
        isRunning: willRun,
      };
    });
  };

  const handleStartTimerForProject = (project: Project) => {
    const lead = project.projectLead || 'Sakshi';
    setActiveTimer({
      isRunning: true,
      projectId: project.id,
      projectName: project.name,
      member: lead,
      seconds: 0,
      description: `Task sprint on ${project.name}`,
    });
    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === lead.toLowerCase()
          ? { ...m, status: 'tracking', currentProject: project.name }
          : m
      )
    );
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
    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === member.toLowerCase()
          ? { ...m, status: 'tracking', currentProject: proj?.name || m.currentProject }
          : m
      )
    );
  };

  // Start tracking directly for a specific team lead
  const handleStartTrackingLead = (leadName: string, projectId?: string) => {
    let targetProject: Project | undefined;
    if (projectId) {
      targetProject = projects.find((p) => p.id === projectId);
    }
    if (!targetProject) {
      targetProject =
        projects.find(
          (p) =>
            p.projectLead.toLowerCase() === leadName.toLowerCase() &&
            (p.status === 'In process' || p.status === 'Changes from Client')
        ) ||
        projects.find((p) => p.projectLead.toLowerCase() === leadName.toLowerCase()) ||
        projects[0];
    }

    const projName = targetProject?.name || 'Active Sprint';
    const projId = targetProject?.id || '';

    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === leadName.toLowerCase()
          ? { ...m, status: 'tracking', currentProject: projName }
          : m
      )
    );

    setActiveTimer({
      isRunning: true,
      projectId: projId,
      projectName: projName,
      member: leadName,
      seconds: 0,
      description: `Live sprint session for ${leadName} on ${projName}`,
    });
  };

  // Stop tracking for a specific team lead and log their hours
  const handleStopTrackingLead = (leadName: string) => {
    const member = members.find((m) => m.name.toLowerCase() === leadName.toLowerCase());
    const isPrimary = activeTimer.member.toLowerCase() === leadName.toLowerCase();
    const duration = isPrimary && activeTimer.seconds >= 10 ? activeTimer.seconds : 1800;
    const targetProject =
      (isPrimary && projects.find((p) => p.id === activeTimer.projectId)) ||
      projects.find((p) => p.name === member?.currentProject) ||
      projects.find((p) => p.projectLead.toLowerCase() === leadName.toLowerCase()) ||
      projects[0];

    if (targetProject) {
      const newEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        projectId: targetProject.id,
        projectName: targetProject.name,
        member: leadName,
        date: new Date().toISOString().split('T')[0],
        durationSeconds: duration,
        description: `Live sprint tracking session for ${leadName}`,
        billable: true,
        category: 'development',
        timestamp: Date.now(),
      };
      setTimeEntries((prev) => [newEntry, ...prev]);

      const hoursInc = Number((duration / 3600).toFixed(2));
      setProjects((prev) =>
        prev.map((p) =>
          p.id === targetProject.id
            ? { ...p, loggedHours: Number(((p.loggedHours || 0) + hoursInc).toFixed(1)) }
            : p
        )
      );
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === leadName.toLowerCase()
          ? { ...m, status: 'active' }
          : m
      )
    );

    if (isPrimary) {
      setActiveTimer({
        isRunning: false,
        projectId: '',
        projectName: '',
        member: leadName,
        seconds: 0,
        description: '',
      });
    }
  };

  // Track ALL active leads simultaneously
  const handleTrackAllActiveLeads = () => {
    setMembers((prev) =>
      prev.map((m) => {
        const leadProjects = projects.filter(
          (p) => p.projectLead.toLowerCase() === m.name.toLowerCase()
        );
        const topProject =
          leadProjects.find((p) => p.status === 'In process' || p.status === 'Changes from Client') ||
          leadProjects[0];
        return {
          ...m,
          status: 'tracking',
          currentProject: m.currentProject || topProject?.name || 'Active Sprint',
        };
      })
    );
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: true,
    }));
  };

  // Pause all active leads
  const handlePauseAllActiveLeads = () => {
    setMembers((prev) =>
      prev.map((m) => (m.status === 'tracking' ? { ...m, status: 'active' } : m))
    );
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
    }));
  };

  // Switch primary timer lead
  const handleSwitchPrimaryTimerLead = (leadName: string) => {
    const member = members.find((m) => m.name.toLowerCase() === leadName.toLowerCase());
    const leadProjects = projects.filter(
      (p) => p.projectLead.toLowerCase() === leadName.toLowerCase()
    );
    const targetProject =
      projects.find((p) => p.name === member?.currentProject) ||
      leadProjects.find((p) => p.status === 'In process' || p.status === 'Changes from Client') ||
      leadProjects[0] ||
      projects[0];

    setActiveTimer((prev) => ({
      isRunning: member?.status === 'tracking' ? true : prev.isRunning,
      projectId: targetProject?.id || '',
      projectName: targetProject?.name || 'Active Sprint',
      member: leadName,
      seconds: 0,
      description: `Task sprint on ${targetProject?.name || 'Active Project'}`,
    }));
  };

  // Update lead's current project
  const handleUpdateLeadCurrentProject = (leadName: string, projectName: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.name.toLowerCase() === leadName.toLowerCase()
          ? { ...m, currentProject: projectName }
          : m
      )
    );
    if (activeTimer.member.toLowerCase() === leadName.toLowerCase()) {
      const proj = projects.find((p) => p.name === projectName);
      setActiveTimer((prev) => ({
        ...prev,
        projectName,
        projectId: proj?.id || prev.projectId,
      }));
    }
  };

  const handleStopAndLogTimer = () => {
    if (activeTimer.projectId) {
      const duration = activeTimer.seconds >= 10 ? activeTimer.seconds : 1800;
      const loggedHoursInc = Number((duration / 3600).toFixed(2));

      // 1. Create time entry
      const newEntry: TimeEntry = {
        id: `time-${Date.now()}`,
        projectId: activeTimer.projectId,
        projectName: activeTimer.projectName,
        member: activeTimer.member,
        date: new Date().toISOString().split('T')[0],
        durationSeconds: duration,
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
                trackedTodaySeconds: m.trackedTodaySeconds + duration,
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

  // Reassign project lead
  const handleUpdateProjectLead = (projectId: string, newLead: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, projectLead: newLead } : p));
      return autoPrioritizeProjects(updated, weights);
    });
  };

  // Direct Quick Assign new project to a lead (1-Click)
  const handleQuickAssignNewProject = (leadName: string, templateData?: Partial<Project>) => {
    const newSrNo = projects.length > 0 ? Math.max(...projects.map((p) => p.srNo)) + 1 : 1;
    const isSocial = leadName.toLowerCase() === 'saniya' || leadName.toLowerCase() === 'kunal';
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      srNo: newSrNo,
      name: templateData?.name || `${leadName} Campaign ${newSrNo}`,
      projectLead: leadName,
      subLead:
        templateData?.subLead !== undefined
          ? templateData.subLead
          : leadName.toLowerCase() === 'saniya'
          ? 'Kunal'
          : leadName.toLowerCase() === 'kunal'
          ? 'Saniya'
          : '',
      liveUrl: templateData?.liveUrl || '',
      startDate: templateData?.startDate || new Date().toISOString().split('T')[0],
      initiationDate: templateData?.initiationDate || new Date().toISOString().split('T')[0],
      technology: templateData?.technology || (isSocial ? 'Meta Business / Canva Pro' : 'React / Next.js'),
      framework: templateData?.framework || (isSocial ? 'Instagram Reels & Content Strategy' : 'Tailwind CSS'),
      design: templateData?.design || 'Approved',
      content: templateData?.content || 'In Progress',
      lastChange: 'Directly assigned via Quick Assign Hub',
      status: (templateData?.status as ProjectStatus) || 'In process',
      hosting: templateData?.hosting || 'Digital Coyotes Social Suite',
      deadline: templateData?.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      backup: templateData?.backup || '',
      remark: templateData?.remark || `Directly assigned to ${leadName} (Social Media Handler) by Admin`,
      estimatedHours: templateData?.estimatedHours || 40,
      loggedHours: 0,
      priorityLevel: 'P2',
      priorityScore: 78,
      clientUrgencyFlag: false,
    };
    setProjects((prev) => autoPrioritizeProjects([newProject, ...prev], weights));
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

  // Render Login Panel if user is not authenticated
  if (!currentUser) {
    return (
      <LoginPanel
        onLogin={handleLogin}
        teamMembers={members}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Active Team Leads Live Tracking Bar (Persistent Across Workspace) */}
      <ActiveLeadsTrackingBar
        members={members}
        projects={projects}
        activeTimer={activeTimer}
        onTogglePrimaryTimer={handleToggleTimer}
        onStopAndLogPrimaryTimer={handleStopAndLogTimer}
        onStartTrackingLead={handleStartTrackingLead}
        onStopTrackingLead={handleStopTrackingLead}
        onTrackAllActiveLeads={handleTrackAllActiveLeads}
        onPauseAllActiveLeads={handlePauseAllActiveLeads}
        onOpenManualTimeLog={() => setIsLogTimeOpen(true)}
        onSwitchPrimaryTimerLead={handleSwitchPrimaryTimerLead}
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
            onUpdateLead={handleUpdateProjectLead}
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
            currentUser={currentUser}
            activeTimer={activeTimer}
            onSelectProject={(p) => setDetailProject(p)}
            onFilterByLeadInLedger={(leadName) => {
              setLedgerLeadFilter(leadName);
              setActiveTab('projects');
            }}
            onQuickAssignNewProject={handleQuickAssignNewProject}
            onReassignProjectLead={handleUpdateProjectLead}
            onStartTrackingLead={handleStartTrackingLead}
            onStopTrackingLead={handleStopTrackingLead}
            onTrackAllActiveLeads={handleTrackAllActiveLeads}
            onPauseAllActiveLeads={handlePauseAllActiveLeads}
            onUpdateLeadCurrentProject={handleUpdateLeadCurrentProject}
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
