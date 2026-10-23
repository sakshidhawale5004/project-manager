import React, { useState, useMemo } from 'react';
import { Project, RemoteTeamMember, AuthUser } from '../types/project';
import {
  Users,
  Briefcase,
  ExternalLink,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Code2,
  Calendar,
  Sparkles,
  Zap,
  Plus,
  X,
  UserCheck,
  Check,
  Play,
  Pause,
  Square,
  Activity,
  Timer
} from 'lucide-react';

interface LeadsViewProps {
  members: RemoteTeamMember[];
  projects: Project[];
  currentUser?: AuthUser | null;
  activeTimer?: {
    isRunning: boolean;
    projectId: string;
    projectName: string;
    member: string;
    seconds: number;
    description: string;
  };
  onSelectProject: (project: Project) => void;
  onFilterByLeadInLedger: (leadName: string) => void;
  onQuickAssignNewProject?: (leadName: string, templateData?: Partial<Project>) => void;
  onReassignProjectLead?: (projectId: string, newLead: string) => void;
  onStartTrackingLead?: (leadName: string, projectId?: string) => void;
  onStopTrackingLead?: (leadName: string) => void;
  onTrackAllActiveLeads?: () => void;
  onPauseAllActiveLeads?: () => void;
  onUpdateLeadCurrentProject?: (leadName: string, projectName: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  members,
  projects,
  currentUser,
  activeTimer,
  onSelectProject,
  onFilterByLeadInLedger,
  onQuickAssignNewProject,
  onReassignProjectLead,
  onStartTrackingLead,
  onStopTrackingLead,
  onTrackAllActiveLeads,
  onPauseAllActiveLeads,
  onUpdateLeadCurrentProject,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trackingHubFilter, setTrackingHubFilter] = useState<'all' | 'tracking' | 'active'>('all');

  // Quick Assign Modal state
  const [quickAssignTargetLead, setQuickAssignTargetLead] = useState<RemoteTeamMember | null>(null);
  const [customProjectTitle, setCustomProjectTitle] = useState<string>('');
  const [reassignSearchQuery, setReassignSearchQuery] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenQuickAssignModalByName = (leadName: string) => {
    const found = members.find((m) => m.name.toLowerCase() === leadName.toLowerCase());
    if (found) {
      setQuickAssignTargetLead(found);
      setCustomProjectTitle('');
      setReassignSearchQuery('');
    }
  };

  const handleInstantCreate = (
    leadName: string,
    title: string,
    tech = 'Meta Business / Canva Pro',
    framework = 'Social Campaign & Content Strategy'
  ) => {
    if (onQuickAssignNewProject) {
      onQuickAssignNewProject(leadName, {
        name: title,
        technology: tech,
        framework,
        status: 'In process',
        startDate: new Date().toISOString().split('T')[0],
      });
      setSuccessToast(`Assigned "${title}" directly to ${leadName}!`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // Compute live statistics for each lead from the projects dataset with strict deduplication
  const leadStats = useMemo(() => {
    const seenNames = new Set<string>();
    const uniqueMembers: RemoteTeamMember[] = [];
    members.forEach((m) => {
      if (!m || !m.name) return;
      const norm = m.name.toLowerCase().trim();
      if (!seenNames.has(norm)) {
        seenNames.add(norm);
        uniqueMembers.push({
          ...m,
          id: m.id || `mem-${norm}`,
        });
      }
    });

    return uniqueMembers.map((member) => {
      const assignedProjects = projects.filter(
        (p) =>
          p.projectLead.toLowerCase() === member.name.toLowerCase() ||
          (p.subLead && p.subLead.toLowerCase() === member.name.toLowerCase())
      );

      const primaryProjects = projects.filter(
        (p) => p.projectLead.toLowerCase() === member.name.toLowerCase()
      );

      const inProcess = primaryProjects.filter((p) => p.status === 'In process').length;
      const clientChanges = primaryProjects.filter(
        (p) => p.status === 'Changes from Client'
      ).length;
      const live = primaryProjects.filter((p) => p.status === 'Live').length;
      const pendingOrMeeting = primaryProjects.filter(
        (p) => p.status === 'Pending from client' || p.status === 'Schedule Meeting' || p.status === 'Planning'
      ).length;

      const socialMediaTags: Record<string, string[]> = {
        saniya: ['Meta Business Suite', 'Instagram Reels', 'Canva Pro', 'Brand Campaigns', 'Content Strategy'],
        kunal: ['Social Ad Creatives', 'LinkedIn Growth', 'Hootsuite', 'Shorts & Video', 'Social Syndication'],
      };

      const primaryTags = Array.from(
        new Set(
          primaryProjects
            .map((p) => p.technology)
            .filter(Boolean)
            .flatMap((t) => t.split('/').map((s) => s.trim()))
        )
      );

      const techStacks =
        socialMediaTags[member.name.toLowerCase()] ||
        (primaryTags.length > 0 ? primaryTags.slice(0, 5) : ['Web Technology', 'Client Delivery']);

      const totalHours = Number(
        primaryProjects.reduce((acc, p) => acc + (p.loggedHours || 0), 0).toFixed(1)
      );

      return {
        member,
        assignedProjects,
        primaryProjects,
        totalCount: primaryProjects.length,
        inProcess,
        clientChanges,
        live,
        pendingOrMeeting,
        techStacks,
        totalHours,
      };
    });
  }, [members, projects]);

  // Filtered leads based on search and status
  const filteredLeadStats = useMemo(() => {
    return leadStats.filter(({ member }) => {
      const matchesSearch =
        leadSearch === '' ||
        member.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        member.role.toLowerCase().includes(leadSearch.toLowerCase()) ||
        member.email.toLowerCase().includes(leadSearch.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leadStats, leadSearch, statusFilter]);

  // Overall workspace lead totals
  const totalLeads = members.length;
  const activeSprintsTotal = projects.filter((p) => p.status === 'In process').length;
  const urgentChangesTotal = projects.filter((p) => p.status === 'Changes from Client').length;

  const trackingCount = members.filter((m) => m.status === 'tracking').length;
  const activeCount = members.filter((m) => m.status === 'active' || m.status === 'tracking').length;
  const totalTrackedSeconds = members.reduce((acc, m) => acc + (m.trackedTodaySeconds || 0), 0);

  const formatTimeHMS = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const formatHoursMins = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F05A28]/10 text-[#F05A28] border border-[#F05A28]/20">
                <Users className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
                Project Leads & Remote Team Roster
              </h2>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
              Dedicated delivery leads supervising all 71 active digital coyotes deployments. Monitor individual workload distributions, tech stacks, and active sprint assignments.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg px-3.5 py-2 text-center">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                Active Leads
              </div>
              <div className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                {totalLeads}
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg px-3.5 py-2 text-center">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                Active Sprints
              </div>
              <div className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {activeSprintsTotal}
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg px-3.5 py-2 text-center">
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                Client Changes
              </div>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                {urgentChangesTotal}
              </div>
            </div>

            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/70 rounded-lg px-3.5 py-2 text-center">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono flex items-center justify-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking
              </div>
              <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">
                {trackingCount} / {members.length}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Strip */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              placeholder="Search leads, roles, skills..."
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#F05A28] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
              {(['all', 'tracking', 'active', 'idle'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ACTIVE TEAM LEADS LIVE TRACKING CENTER */}
      <div className="bg-white dark:bg-neutral-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-xl p-5 shadow-sm transition-colors space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                  Active Team Leads Live Tracking Center
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {trackingCount} of {members.length} Leads on Clock
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Every team lead on active duty is actively tracked in real time. Track individual sprints or run concurrent continuous tracking across all active leads.
              </p>
            </div>
          </div>

          {/* Quick Actions & Filters for Tracking Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs mr-1">
              <button
                type="button"
                onClick={() => setTrackingHubFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  trackingHubFilter === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                All Leads ({members.length})
              </button>
              <button
                type="button"
                onClick={() => setTrackingHubFilter('tracking')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  trackingHubFilter === 'tracking'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Tracking Now ({trackingCount})
              </button>
              <button
                type="button"
                onClick={() => setTrackingHubFilter('active')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  trackingHubFilter === 'active'
                    ? 'bg-white dark:bg-neutral-900 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                Active On-Call ({activeCount - trackingCount})
              </button>
            </div>

            {trackingCount < members.length ? (
              <button
                type="button"
                onClick={() => onTrackAllActiveLeads?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F05A28] hover:bg-[#d94e20] active:scale-98 text-white font-semibold text-xs font-mono shadow-xs cursor-pointer transition-all"
                title="Start live time tracking for all active team leads simultaneously"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Track All Active Leads</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onPauseAllActiveLeads?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-semibold text-xs font-mono shadow-xs cursor-pointer transition-all"
                title="Pause live time tracking for all leads"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause All Active Leads</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Active Lead Tracking Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {members
            .filter((m) => {
              if (trackingHubFilter === 'tracking') return m.status === 'tracking';
              if (trackingHubFilter === 'active') return m.status === 'active';
              return true;
            })
            .map((member) => {
              const isTracking = member.status === 'tracking';
              const leadProjects = projects.filter(
                (p) => p.projectLead.toLowerCase() === member.name.toLowerCase()
              );
              const isSocial =
                member.name.toLowerCase() === 'saniya' || member.name.toLowerCase() === 'kunal';
              const currentProject =
                member.currentProject || leadProjects[0]?.name || 'Active Project Sprint';
              const dailyTargetSeconds = 8 * 3600; // 8 hours daily target
              const progressPct = Math.min(
                100,
                Math.round(((member.trackedTodaySeconds || 0) / dailyTargetSeconds) * 100)
              );

              return (
                <div
                  key={`track-hub-lead-${member.id}`}
                  className={`border rounded-xl p-3.5 flex flex-col justify-between gap-3 transition-all ${
                    isTracking
                      ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-neutral-900 border-emerald-500/60 dark:border-emerald-600/50 shadow-xs'
                      : member.status === 'active'
                      ? 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300'
                      : 'bg-neutral-50/30 dark:bg-neutral-900/30 border-neutral-200/60 dark:border-neutral-800'
                  }`}
                >
                  {/* Lead Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-xs border shrink-0 ${member.avatarBg}`}
                        >
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                              {member.name}
                            </span>
                            {isSocial && (
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  member.name.toLowerCase() === 'saniya'
                                    ? 'bg-fuchsia-100 dark:bg-fuchsia-950/80 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-800'
                                    : 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800'
                                }`}
                              >
                                Social
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          isTracking
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : member.status === 'active'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTracking
                              ? 'bg-emerald-500 animate-pulse'
                              : member.status === 'active'
                              ? 'bg-indigo-500'
                              : 'bg-neutral-400'
                          }`}
                        />
                        {member.status}
                      </span>
                    </div>

                    {/* Live Ticker Clock Display */}
                    <div className="mt-3 bg-neutral-900 text-white rounded-lg p-2.5 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-1.5">
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            isTracking ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'
                          }`}
                        />
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {isTracking ? 'TRACKING LIVE:' : 'TODAY TOTAL:'}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs font-bold tabular-nums ${
                          isTracking ? 'text-emerald-400' : 'text-neutral-200'
                        }`}
                      >
                        {formatTimeHMS(member.trackedTodaySeconds || 0)}
                      </span>
                    </div>

                    {/* Active Project Dropdown Switcher */}
                    <div className="mt-2.5 space-y-1">
                      <label className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                        <span>Sprint Assignment:</span>
                        <span className="text-[9px] text-[#F05A28]">
                          {leadProjects.length} projects
                        </span>
                      </label>
                      <select
                        value={currentProject}
                        onChange={(e) =>
                          onUpdateLeadCurrentProject?.(member.name, e.target.value)
                        }
                        className="w-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-md px-2 py-1 text-[11px] font-medium focus:outline-none focus:border-[#F05A28] truncate cursor-pointer"
                        title="Change project this lead is tracking time on"
                      >
                        {leadProjects.length > 0 ? (
                          leadProjects.map((p) => (
                            <option key={`p-sel-${member.id}-${p.id}`} value={p.name}>
                              {p.name} ({p.status})
                            </option>
                          ))
                        ) : (
                          <option value={currentProject}>{currentProject}</option>
                        )}
                      </select>
                    </div>

                    {/* Progress Bar towards 8h Daily Target */}
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-400 mb-1">
                        <span>Daily Target</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {formatHoursMins(member.trackedTodaySeconds || 0)} / 8.0h ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isTracking
                              ? 'bg-emerald-500'
                              : progressPct >= 80
                              ? 'bg-emerald-600'
                              : 'bg-[#F05A28]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Track / Pause / Stop Actions */}
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center gap-1.5">
                    {isTracking ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onPauseAllActiveLeads?.()}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-[11px] font-semibold font-mono cursor-pointer transition-colors"
                          title="Pause this lead's tracking session"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onStopTrackingLead?.(member.name)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-[11px] font-semibold font-mono shadow-xs cursor-pointer transition-all"
                          title="Stop session and log hours to project"
                        >
                          <Square className="w-3 h-3" />
                          <span>Stop & Log</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartTrackingLead?.(member.name)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-[11px] font-semibold font-mono shadow-xs cursor-pointer transition-all"
                        title={`Start live tracking timer for ${member.name}`}
                      >
                        <Play className="w-3 h-3" />
                        <span>Start Tracking Lead</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Admin Direct Project Allocation Hub for Social Media Handlers (Saniya & Kunal) */}
      <div className="bg-gradient-to-r from-orange-500/10 via-fuchsia-500/10 to-cyan-500/10 dark:from-orange-950/40 dark:via-fuchsia-950/40 dark:to-cyan-950/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#F05A28] text-white shadow-xs">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-display text-neutral-900 dark:text-white">
                  Admin Direct Project Allocation · Social Media Handlers
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold">
                  1-Click Direct Assign
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Allocate marketing deliverables, campaign launches, reels, and syndication projects directly to Saniya or Kunal with 1 button click.
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Action Cards for Saniya & Kunal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Saniya 1-Click Assign Card */}
          <div className="bg-white/95 dark:bg-neutral-900/95 border border-fuchsia-300 dark:border-fuchsia-900/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-fuchsia-500 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold font-mono text-sm border bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-700/60 shadow-xs shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">Saniya</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-fuchsia-100 dark:bg-fuchsia-950/70 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-800 font-semibold">
                    Social Media Handler
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                  Meta Business Suite · Instagram Reels · Content Strategy
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenQuickAssignModalByName('Saniya')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-98 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all shrink-0"
              title="Click to assign a new project directly to Saniya as lead"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign to Saniya</span>
            </button>
          </div>

          {/* Kunal 1-Click Assign Card */}
          <div className="bg-white/95 dark:bg-neutral-900/95 border border-cyan-300 dark:border-cyan-900/80 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-cyan-500 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold font-mono text-sm border bg-cyan-950/70 text-cyan-300 border-cyan-700/60 shadow-xs shrink-0">
                KU
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">Kunal</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-semibold">
                    Social Media Handler
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                  Paid Ad Creatives · LinkedIn · Video Shorts & Syndication
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenQuickAssignModalByName('Kunal')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all shrink-0"
              title="Click to assign a new project directly to Kunal as lead"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign to Kunal</span>
            </button>
          </div>
        </div>

        {/* 1-Click Instant Quick Create Buttons */}
        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F05A28]" /> 1-Click Direct Templates:
          </span>
          <button
            type="button"
            onClick={() => handleInstantCreate('Saniya', 'Herbiage Social Reels & Launch Campaign', 'Meta Business / Canva Pro', 'Instagram Reels & Content Strategy')}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-fuchsia-50 dark:bg-fuchsia-950/50 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>⚡ Herbiage Reels</span>
            <span className="opacity-70 text-[10px]">→ Saniya</span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantCreate('Kunal', 'Atharv Enterprises Paid Ad Creatives', 'Meta Ads / Figma', 'Conversion Ad Creatives')}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>⚡ Atharv Paid Ads</span>
            <span className="opacity-70 text-[10px]">→ Kunal</span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantCreate('Saniya', 'Digital Coyotes Social Syndication', 'Hootsuite / Canva', 'Cross-Platform Growth')}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-fuchsia-50 dark:bg-fuchsia-950/50 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>⚡ Coyotes Syndication</span>
            <span className="opacity-70 text-[10px]">→ Saniya</span>
          </button>

          <button
            type="button"
            onClick={() => handleInstantCreate('Kunal', 'LinkedIn B2B Leadership & Video Reels', 'LinkedIn / Premiere', 'Shorts & B2B Video')}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>⚡ B2B Video Reels</span>
            <span className="opacity-70 text-[10px]">→ Kunal</span>
          </button>
        </div>
      </div>

      {/* Leads Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeadStats.map(
          ({
            member,
            primaryProjects,
            totalCount,
            inProcess,
            clientChanges,
            live,
            pendingOrMeeting,
            techStacks,
            totalHours,
          }) => {
            const isSelected = selectedLeadId === member.id;

            return (
              <div
                key={`lead-card-${member.id}`}
                className={`bg-white dark:bg-neutral-900/90 border rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-xs ${
                  isSelected
                    ? 'border-[#F05A28] ring-1 ring-[#F05A28]/30 shadow-md'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Lead Card Header */}
                <div className="p-5 pb-4 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-base border shadow-xs ${member.avatarBg}`}
                      >
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                            {member.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono capitalize ${
                              member.status === 'tracking'
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : member.status === 'active'
                                ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'tracking'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : member.status === 'active'
                                  ? 'bg-indigo-500'
                                  : 'bg-neutral-400'
                              }`}
                            />
                            {member.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Timezone */}
                  <div className="flex flex-col gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200/70 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-[#F05A28] truncate transition-colors"
                        title={member.email}
                      >
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {member.timezone}
                      </span>
                      <span>{totalHours}h Logged</span>
                    </div>
                  </div>

                  {/* Live Active Lead Tracking Ribbon */}
                  <div
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      member.status === 'tracking'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            member.status === 'tracking'
                              ? 'bg-emerald-500 animate-pulse'
                              : member.status === 'active'
                              ? 'bg-indigo-500'
                              : 'bg-neutral-400'
                          }`}
                        />
                        <div className="min-w-0">
                          {member.status === 'tracking' ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                              <Activity className="w-3 h-3 animate-spin" />
                              TRACKING: {formatTimeHMS(member.trackedTodaySeconds || 0)}
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                              Today: {formatHoursMins(member.trackedTodaySeconds || 0)}
                            </span>
                          )}
                        </div>
                      </div>

                      {member.status === 'tracking' ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onPauseAllActiveLeads?.()}
                            className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 cursor-pointer"
                            title="Pause tracking"
                          >
                            <Pause className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onStopTrackingLead?.(member.name)}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-mono text-[10px] font-semibold cursor-pointer shadow-xs"
                            title="Stop session and log hours"
                          >
                            <Square className="w-2.5 h-2.5" />
                            <span>Stop</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStartTrackingLead?.(member.name)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-semibold cursor-pointer shadow-xs transition-all"
                          title={`Start live tracking for ${member.name}`}
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Track Lead</span>
                        </button>
                      )}
                    </div>

                    {member.currentProject && (
                      <div className="mt-1 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                        <Briefcase className="w-2.5 h-2.5 shrink-0 text-[#F05A28]" />
                        <span className="truncate">Active sprint: {member.currentProject}</span>
                      </div>
                    )}
                  </div>

                  {/* Workload Metric Badges */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-md border border-neutral-200/80 dark:border-neutral-800">
                      <div className="text-[10px] text-neutral-500 font-mono">Projects</div>
                      <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                        {totalCount}
                      </div>
                    </div>

                    <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-2 rounded-md border border-indigo-200/60 dark:border-indigo-900/40">
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">Sprint</div>
                      <div className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-300">
                        {inProcess}
                      </div>
                    </div>

                    <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">Changes</div>
                      <div className="text-sm font-bold font-mono text-amber-700 dark:text-amber-300">
                        {clientChanges}
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-md border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Live</div>
                      <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                        {live}
                      </div>
                    </div>
                  </div>

                  {/* Technology Tags */}
                  {techStacks.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {techStacks.map((tech, techIdx) => (
                        <span
                          key={`tag-${member.id}-${tech}-${techIdx}`}
                          className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lead Project Drawer / Expand */}
                <div className="mt-auto border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Assigned Deployments</span>
                    <button
                      onClick={() => onFilterByLeadInLedger(member.name)}
                      className="text-[#F05A28] hover:text-[#d94e20] font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View in Ledger</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 3 Most Important Recent / In-process Projects */}
                  <div className="space-y-1.5">
                    {primaryProjects.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => onSelectProject(p)}
                        className="bg-white dark:bg-neutral-800/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 rounded-md p-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
                            <span>Start: {p.startDate || p.initiationDate || '—'}</span>
                            {p.deadline && <span>· Due: {p.deadline}</span>}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-medium shrink-0 px-1.5 py-0.5 rounded ${
                            p.status === 'Live'
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                              : p.status === 'Changes from Client'
                              ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60'
                              : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}

                    {primaryProjects.length > 3 && (
                      <div className="text-[11px] text-neutral-400 text-center pt-1 font-mono">
                        + {primaryProjects.length - 3} more assigned projects
                      </div>
                    )}
                  </div>

                  {/* Quick Assign Lead Button */}
                  <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAssignTargetLead(member);
                        setCustomProjectTitle('');
                        setReassignSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        member.name.toLowerCase() === 'saniya'
                          ? 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-xs'
                          : member.name.toLowerCase() === 'kunal'
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700'
                      }`}
                      title={`Assign a new project directly to ${member.name} as lead`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign Project to {member.name}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Workload Allocation Capacity Breakdown */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs transition-colors space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#F05A28]" />
            <h3 className="text-sm font-bold font-display text-neutral-900 dark:text-white">
              Project Lead Allocation Breakdown
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            71 Total Projects Distributed
          </span>
        </div>

        <div className="space-y-3">
          {leadStats.map(({ member, totalCount, inProcess, clientChanges, live }) => {
            const pct = Math.round((totalCount / 71) * 100);

            return (
              <div key={member.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {member.name}
                    </span>
                    <span className="text-neutral-500 text-[11px]">({member.role})</span>
                  </div>
                  <div className="font-mono text-xs text-neutral-600 dark:text-neutral-300">
                    <strong className="text-neutral-900 dark:text-white">{totalCount}</strong>{' '}
                    projects ({pct}%)
                  </div>
                </div>

                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500"
                    style={{ width: `${(inProcess / 71) * 100}%` }}
                    title={`In Process: ${inProcess}`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(clientChanges / 71) * 100}%` }}
                    title={`Client Changes: ${clientChanges}`}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(live / 71) * 100}%` }}
                    title={`Live: ${live}`}
                  />
                  <div
                    className="h-full bg-neutral-300 dark:bg-neutral-700"
                    style={{
                      width: `${
                        ((totalCount - inProcess - clientChanges - live) / 71) * 100
                      }%`,
                    }}
                    title="Other / Planning"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
            <span>Active Sprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Client Changes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Live in Production</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span>Planning / Meetings</span>
          </div>
        </div>
      </div>

      {/* Quick Assign Project Modal for Target Lead */}
      {quickAssignTargetLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm border shadow-xs ${quickAssignTargetLead.avatarBg}`}
                >
                  {quickAssignTargetLead.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Assign Project to {quickAssignTargetLead.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold">
                      1-Click Assign
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {quickAssignTargetLead.role} · Dedicated Project Lead
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuickAssignTargetLead(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {/* Section 1: 1-Click Instant Templates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" /> Instant 1-Click Project Templates
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">Click to create & assign immediately</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(quickAssignTargetLead.name.toLowerCase() === 'saniya'
                    ? [
                        {
                          title: 'Herbiage Reels & Launch Campaign',
                          tech: 'Meta Business / Canva Pro',
                          framework: 'Instagram Reels & Content Strategy',
                          desc: 'Full reels syndication, daily brand stories, and creator collaborations.',
                        },
                        {
                          title: 'Digital Coyotes Social Syndication',
                          tech: 'Meta Suite / Hootsuite',
                          framework: 'Multi-Channel Brand Awareness',
                          desc: 'Weekly carousel releases, client feature spotlights, and hashtag research.',
                        },
                        {
                          title: 'E-Commerce Lifestyle Photo & Video Sprint',
                          tech: 'Canva / Adobe Lightroom',
                          framework: 'Visual Campaign Creatives',
                          desc: 'Product hero graphics, seasonal discounts, and promotional banners.',
                        },
                        {
                          title: 'Brand Engagement & Viral Content Sprint',
                          tech: 'CapCut / Meta Creator',
                          framework: 'Short-Form Video Strategy',
                          desc: 'Trending audio curation, short videos, and audience Q&A syndication.',
                        },
                      ]
                    : quickAssignTargetLead.name.toLowerCase() === 'kunal'
                    ? [
                        {
                          title: 'Atharv Enterprises Paid Ad Creatives',
                          tech: 'Meta Ads / Figma Pro',
                          framework: 'High-ROAS Conversion Ads',
                          desc: 'Ad creative variants, hook copywriting, and A/B test campaign structuring.',
                        },
                        {
                          title: 'LinkedIn B2B Leadership & Video Reels',
                          tech: 'Premiere Pro / LinkedIn',
                          framework: 'Shorts & Executive Video',
                          desc: 'Weekly founder insights, case study carousels, and enterprise outbound.',
                        },
                        {
                          title: 'YouTube Shorts & Multi-Platform Syndication',
                          tech: 'YouTube Studio / Buffer',
                          framework: 'Omni-Channel Video',
                          desc: 'Multi-aspect ratio video cutdowns, automated scheduling, and community posts.',
                        },
                        {
                          title: 'Conversion Funnel Video Ad Sprint',
                          tech: 'Meta Ads / After Effects',
                          framework: 'Performance Marketing',
                          desc: 'Direct-response video hooks, retargeting creatives, and review highlights.',
                        },
                      ]
                    : [
                        {
                          title: `${quickAssignTargetLead.name} Full-Stack Web Sprint`,
                          tech: 'React / Next.js / Tailwind',
                          framework: 'Vite / Edge Runtime',
                          desc: 'Responsive web application build, API integration, and performance polish.',
                        },
                        {
                          title: `${quickAssignTargetLead.name} Client Custom Deployment`,
                          tech: 'WordPress / PHP / Astra',
                          framework: 'Custom Theme',
                          desc: 'Client-requested revisions, cPanel migration, and staging verification.',
                        },
                      ]
                  ).map((template, idx) => (
                    <div
                      key={`tmpl-${idx}`}
                      className="bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-[#F05A28] transition-colors">
                          {template.title}
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                          {template.desc}
                        </p>
                        <div className="text-[10px] text-neutral-400 font-mono pt-0.5">
                          {template.tech}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleInstantCreate(quickAssignTargetLead.name, template.title, template.tech, template.framework);
                          setQuickAssignTargetLead(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#F05A28] hover:bg-[#d94e20] active:scale-98 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
                      >
                        <Zap className="w-3 h-3" />
                        <span>1-Click Assign & Launch</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Custom Name 1-Click Launch */}
                <div className="pt-2 bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={customProjectTitle}
                    onChange={(e) => setCustomProjectTitle(e.target.value)}
                    placeholder={`Or enter custom project name for ${quickAssignTargetLead.name}...`}
                    className="flex-1 w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F05A28]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customProjectTitle.trim()) {
                        handleInstantCreate(quickAssignTargetLead.name, customProjectTitle.trim());
                        setQuickAssignTargetLead(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!customProjectTitle.trim()}
                    onClick={() => {
                      if (customProjectTitle.trim()) {
                        handleInstantCreate(quickAssignTargetLead.name, customProjectTitle.trim());
                        setQuickAssignTargetLead(null);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-[#F05A28] hover:bg-[#d94e20] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                  >
                    Create & Assign
                  </button>
                </div>
              </div>

              {/* Section 2: Reassign Existing Projects with 1-Click */}
              <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Reassign Existing Project to {quickAssignTargetLead.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Single click reassigns project lead
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={reassignSearchQuery}
                    onChange={(e) => setReassignSearchQuery(e.target.value)}
                    placeholder="Search existing project to reassign..."
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {projects
                    .filter((p) => {
                      if (!reassignSearchQuery.trim()) {
                        return p.projectLead.toLowerCase() !== quickAssignTargetLead.name.toLowerCase();
                      }
                      return (
                        p.name.toLowerCase().includes(reassignSearchQuery.toLowerCase()) ||
                        p.projectLead.toLowerCase().includes(reassignSearchQuery.toLowerCase()) ||
                        (p.technology && p.technology.toLowerCase().includes(reassignSearchQuery.toLowerCase()))
                      );
                    })
                    .slice(0, 15)
                    .map((project) => (
                      <div
                        key={`reassign-proj-${project.id}`}
                        className="pt-1.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-neutral-900 dark:text-white truncate">
                            {project.name}
                          </div>
                          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 font-mono">
                            <span>Current Lead: {project.projectLead || 'Unassigned'}</span>
                            <span>·</span>
                            <span>{project.status}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onReassignProjectLead) {
                              onReassignProjectLead(project.id, quickAssignTargetLead.name);
                            }
                            setSuccessToast(`Reassigned "${project.name}" to ${quickAssignTargetLead.name}!`);
                            setTimeout(() => setSuccessToast(null), 3500);
                            setQuickAssignTargetLead(null);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shrink-0"
                        >
                          Assign to {quickAssignTargetLead.name}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono text-[11px]">Digital Coyotes Direct Lead Allocation</span>
              <button
                type="button"
                onClick={() => setQuickAssignTargetLead(null)}
                className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
