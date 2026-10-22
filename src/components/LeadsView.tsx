import React, { useState, useMemo } from 'react';
import { Project, RemoteTeamMember } from '../types/project';
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
  Sparkles
} from 'lucide-react';

interface LeadsViewProps {
  members: RemoteTeamMember[];
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onFilterByLeadInLedger: (leadName: string) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  members,
  projects,
  onSelectProject,
  onFilterByLeadInLedger,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadSearch, setLeadSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute live statistics for each lead from the projects dataset
  const leadStats = useMemo(() => {
    return members.map((member) => {
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

      const techStacks = Array.from(
        new Set(
          primaryProjects
            .map((p) => p.technology)
            .filter(Boolean)
            .flatMap((t) => t.split('/').map((s) => s.trim()))
        )
      ).slice(0, 5);

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
                key={member.id}
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
                      {techStacks.map((tech) => (
                        <span
                          key={tech}
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
    </div>
  );
};
