import React, { useState, useMemo } from 'react';
import { Project, PriorityLevel, ProjectStatus, RemoteTeamMember } from '../types/project';
import {
  Search,
  ExternalLink,
  Play,
  Copy,
  Check,
  Edit2,
  HardDrive,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
  teamMembers?: RemoteTeamMember[];
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
  onExportCSV: () => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  teamMembers,
  onSelectProject,
  onEditProject,
  onStartTimer,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'srNo' | 'name' | 'priorityScore' | 'deadline' | 'loggedHours'>('priorityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleCopyCredentials = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const uniqueLeads = useMemo(() => {
    const leads = new Set<string>();
    if (teamMembers) {
      teamMembers.forEach((m) => leads.add(m.name));
    }
    projects.forEach((p) => {
      if (p.projectLead) leads.add(p.projectLead);
    });
    return Array.from(leads).sort();
  }, [projects, teamMembers]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          search === '' ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.projectLead.toLowerCase().includes(search.toLowerCase()) ||
          (p.subLead && p.subLead.toLowerCase().includes(search.toLowerCase())) ||
          (p.technology && p.technology.toLowerCase().includes(search.toLowerCase())) ||
          (p.hosting && p.hosting.toLowerCase().includes(search.toLowerCase())) ||
          (p.remark && p.remark.toLowerCase().includes(search.toLowerCase()));

        const matchesLead =
          leadFilter === 'All' || p.projectLead.toLowerCase() === leadFilter.toLowerCase();

        const matchesStatus =
          statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesPriority =
          priorityFilter === 'All' || p.priorityLevel === priorityFilter;

        return matchesSearch && matchesLead && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA || '').toLowerCase();
          valB = ((valB as string) || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [projects, search, leadFilter, statusFilter, priorityFilter, sortField, sortOrder]);

  // Overall metric counts
  const totalCount = projects.length;
  const inProcessCount = projects.filter((p) => p.status === 'In process').length;
  const clientChangeCount = projects.filter((p) => p.status === 'Changes from Client').length;
  const liveCount = projects.filter((p) => p.status === 'Live').length;
  const totalTrackedHours = projects.reduce((acc, p) => acc + (p.loggedHours || 0), 0);

  return (
    <div className="space-y-5">
      {/* Metrics Row - High legibility, dual day/night mode */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Projects</div>
          <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Enterprise registry</div>
        </div>

        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">In Active Sprints</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
            {inProcessCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Ongoing development</div>
        </div>

        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Client Changes</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {clientChangeCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Requires immediate review</div>
        </div>

        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 shadow-sm transition-colors">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Live In Production</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {liveCount}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Active deployments</div>
        </div>

        <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 col-span-2 sm:col-span-1 shadow-sm transition-colors">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Total Team Hours</div>
          <div className="text-xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
            {totalTrackedHours.toFixed(1)}h
          </div>
          <div className="text-xs text-neutral-500 mt-1">Tracked across projects</div>
        </div>
      </div>

      {/* Control Strip: Search & Segmented Filters */}
      <div className="bg-white dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm transition-colors">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, leads, credentials, remarks, tech..."
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Lead Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 dark:text-neutral-400 shrink-0">Lead:</span>
            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Leads</option>
              {uniqueLeads.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 dark:text-neutral-400 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Changes from Client">Changes from Client</option>
              <option value="In process">In Process</option>
              <option value="Pending from client">Pending Client</option>
              <option value="Schedule Meeting">Schedule Meeting</option>
              <option value="Live">Live</option>
              <option value="Planning">Planning</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 dark:text-neutral-400 shrink-0">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded text-xs transition-colors whitespace-nowrap ml-auto"
            title="Download CSV export"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main High-Density Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900/60 shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs select-none">
                <th
                  onClick={() => handleSort('srNo')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-12"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    {sortField === 'srNo' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white min-w-[200px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Project & Stack</span>
                    {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priorityScore')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    {sortField === 'priorityScore' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold w-36">Lead & Sub</th>
                <th className="py-2.5 px-3 font-semibold w-36">Status</th>
                <th
                  onClick={() => handleSort('deadline')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-32"
                >
                  <div className="flex items-center gap-1">
                    <span>Deadline</span>
                    {sortField === 'deadline' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('loggedHours')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Time Tracked</span>
                    {sortField === 'loggedHours' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold min-w-[180px]">Hosting / Auth</th>
                <th className="py-2.5 px-3 font-semibold text-right pr-4 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-500">
                    No matching projects found for current search/filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const isCopied = copiedId === project.id;
                  const progressPct = Math.min(
                    100,
                    Math.round(((project.loggedHours || 0) / (project.estimatedHours || 40)) * 100)
                  );

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Sr No */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-400 dark:text-neutral-500 text-xs">
                        {project.srNo}
                      </td>

                      {/* Project Name & Tech */}
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          <span>{project.name}</span>
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-neutral-400 hover:text-indigo-600 dark:text-neutral-500 dark:hover:text-indigo-400 transition-colors"
                              title="Visit live site"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                          <span>{project.technology || 'Web'}</span>
                          {project.framework && (
                            <>
                              <span className="text-neutral-300 dark:text-neutral-600">/</span>
                              <span>{project.framework}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono tabular-nums font-semibold text-xs ${
                              project.priorityLevel === 'P1'
                                ? 'text-rose-600 dark:text-rose-400'
                                : project.priorityLevel === 'P2'
                                ? 'text-amber-600 dark:text-amber-400'
                                : project.priorityLevel === 'P3'
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {project.priorityLevel}
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-600">·</span>
                          <span className="font-mono tabular-nums text-[11px] text-neutral-500 dark:text-neutral-400">
                            {project.priorityScore}
                          </span>
                        </div>
                        {project.clientUrgencyFlag && (
                          <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Client blocker
                          </div>
                        )}
                      </td>

                      {/* Lead & Sub */}
                      <td className="py-2.5 px-3">
                        <div className="text-neutral-900 dark:text-neutral-200 font-medium">{project.projectLead}</div>
                        {project.subLead && (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            Sub: {project.subLead}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-medium ${
                            project.status === 'Live'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : project.status === 'Changes from Client'
                              ? 'text-amber-600 dark:text-amber-300'
                              : project.status === 'In process'
                              ? 'text-indigo-600 dark:text-indigo-300'
                              : project.status === 'Schedule Meeting'
                              ? 'text-purple-600 dark:text-purple-300'
                              : 'text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {project.status}
                        </span>
                        {project.lastChange && (
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[120px]">
                            {project.lastChange}
                          </div>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                        {project.deadline || '—'}
                      </td>

                      {/* Time Tracked Progress */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums mb-1">
                          <span className="text-neutral-800 dark:text-neutral-200">{project.loggedHours}h</span>
                          <span className="text-neutral-400 dark:text-neutral-500">/ {project.estimatedHours}h</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progressPct > 90 ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Hosting / Credentials Snippet */}
                      <td className="py-2.5 px-3">
                        {project.hosting ? (
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <span
                              className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate"
                              title={project.hosting}
                            >
                              {project.hosting}
                            </span>
                            <button
                              onClick={(e) => handleCopyCredentials(project.id, project.hosting, e)}
                              className="text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-white p-1 transition-colors shrink-0"
                              title="Copy credentials"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-600">—</span>
                        )}
                        {project.backup && (
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <HardDrive className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
                            <span>Mega Backup saved</span>
                          </div>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-2.5 px-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartTimer(project);
                            }}
                            className="p-1 text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                            title="Start tracking time on this project"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProject(project);
                            }}
                            className="p-1 text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
