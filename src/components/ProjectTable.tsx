import React, { useState, useMemo, useEffect } from 'react';
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
  FileSpreadsheet,
  ChevronDown,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react';

interface ProjectTableProps {
  projects: Project[];
  teamMembers?: RemoteTeamMember[];
  globalSearch?: string;
  onSearchChange?: (val: string) => void;
  initialLeadFilter?: string;
  onSelectProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onUpdateLead?: (projectId: string, newLead: string) => void;
  onStartTimer: (project: Project) => void;
  onExportCSV: () => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  teamMembers,
  globalSearch,
  onSearchChange,
  initialLeadFilter,
  onSelectProject,
  onEditProject,
  onUpdateLead,
  onStartTimer,
  onExportCSV,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const search = globalSearch !== undefined ? globalSearch : localSearch;
  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const [leadFilter, setLeadFilter] = useState<string>(initialLeadFilter || 'All');

  useEffect(() => {
    if (initialLeadFilter) {
      setLeadFilter(initialLeadFilter);
    }
  }, [initialLeadFilter]);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active canonical team leads
  const activeTeamLeads = useMemo(() => {
    if (teamMembers && teamMembers.length > 0) {
      return teamMembers.map((m) => m.name);
    }
    return ['Sakshi', 'Aishwarya', 'Suraj', 'Hasina', 'Jorden', 'Saniya', 'Kunal'];
  }, [teamMembers]);

  const activeTeamLeadsLower = useMemo(() => {
    return activeTeamLeads.map((l) => l.toLowerCase());
  }, [activeTeamLeads]);

  // Projects not assigned to any of the 7 active team leads
  const nonLeadProjectsCount = useMemo(() => {
    return projects.filter(
      (p) => !activeTeamLeadsLower.includes((p.projectLead || '').trim().toLowerCase())
    ).length;
  }, [projects, activeTeamLeadsLower]);

  // Custom lead name prompt state
  const [editingCustomLeadProject, setEditingCustomLeadProject] = useState<Project | null>(null);
  const [customLeadInput, setCustomLeadInput] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<'srNo' | 'name' | 'priorityScore' | 'startDate' | 'deadline' | 'loggedHours'>('priorityScore');
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
          leadFilter === 'All'
            ? true
            : leadFilter === 'Non-Team Leads'
            ? !activeTeamLeadsLower.includes((p.projectLead || '').trim().toLowerCase())
            : p.projectLead.toLowerCase() === leadFilter.toLowerCase();

        const matchesStatus =
          statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();

        const matchesPriority =
          priorityFilter === 'All' || p.priorityLevel === priorityFilter;

        return matchesSearch && matchesLead && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'startDate') {
          valA = a.startDate || a.initiationDate || '';
          valB = b.startDate || b.initiationDate || '';
        }

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
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects, leads, credentials, remarks, tech..."
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
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
              {nonLeadProjectsCount > 0 && (
                <option value="Non-Team Leads">⚠️ Non-Team Leads ({nonLeadProjectsCount})</option>
              )}
              <optgroup label="Team Leads">
                {activeTeamLeads.map((lead) => (
                  <option key={`lead-filter-${lead}`} value={lead}>
                    {lead} {lead === 'Saniya' || lead === 'Kunal' ? '(Social Media)' : ''}
                  </option>
                ))}
              </optgroup>
              {uniqueLeads
                .filter((l) => !activeTeamLeadsLower.includes(l.toLowerCase()))
                .length > 0 && (
                <optgroup label="Other Assignees">
                  {uniqueLeads
                    .filter((l) => !activeTeamLeadsLower.includes(l.toLowerCase()))
                    .map((lead) => (
                      <option key={`other-filter-${lead}`} value={lead}>
                        {lead}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>

            {nonLeadProjectsCount > 0 && (
              <button
                type="button"
                onClick={() => setLeadFilter(leadFilter === 'Non-Team Leads' ? 'All' : 'Non-Team Leads')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors border ${
                  leadFilter === 'Non-Team Leads'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                }`}
                title="Filter to projects not assigned to one of the 7 active team leads"
              >
                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{nonLeadProjectsCount} Non-Team Lead{nonLeadProjectsCount > 1 ? 's' : ''}</span>
              </button>
            )}
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
                  onClick={() => handleSort('startDate')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-28"
                >
                  <div className="flex items-center gap-1">
                    <span>Start Date</span>
                    {sortField === 'startDate' && <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('deadline')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-neutral-900 dark:hover:text-white w-28"
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
                  <td colSpan={10} className="py-12 text-center text-neutral-500">
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

                      {/* Lead & Sub - with 1-click change / reassign */}
                      <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                        {(() => {
                          const isRecognizedLead = activeTeamLeadsLower.includes((project.projectLead || '').trim().toLowerCase());
                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <div className="relative inline-block max-w-[160px]">
                                  <select
                                    value={isRecognizedLead ? project.projectLead : '__non_lead__'}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '__custom__') {
                                        setEditingCustomLeadProject(project);
                                        setCustomLeadInput(project.projectLead || '');
                                      } else if (val !== '__non_lead__' && onUpdateLead) {
                                        onUpdateLead(project.id, val);
                                      }
                                    }}
                                    className={`w-full text-xs font-semibold py-1 pl-2 pr-6 rounded border transition-colors cursor-pointer appearance-none truncate ${
                                      !isRecognizedLead
                                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600/70 text-amber-800 dark:text-amber-200 hover:bg-amber-100 shadow-2xs'
                                        : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:border-[#F05A28]/60'
                                    }`}
                                    title={`Current Lead: ${project.projectLead}. Click to change or reassign.`}
                                  >
                                    {!isRecognizedLead && (
                                      <option value="__non_lead__">
                                        ⚠️ {project.projectLead || 'Unassigned'}
                                      </option>
                                    )}
                                    <optgroup label="Reassign to Active Team Lead">
                                      {activeTeamLeads.map((lead) => (
                                        <option key={`row-lead-${project.id}-${lead}`} value={lead}>
                                          {lead} {lead === 'Saniya' || lead === 'Kunal' ? '(Social Media)' : ''}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Other">
                                      <option value="__custom__">✏️ Custom Lead Name...</option>
                                    </optgroup>
                                  </select>
                                  <ChevronDown className={`w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                                    !isRecognizedLead ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'
                                  }`} />
                                </div>

                                {!isRecognizedLead && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold shrink-0"
                                    title="Not in active team roster. Click dropdown to reassign."
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" /> Reassign
                                  </span>
                                )}
                              </div>

                              {project.subLead && (
                                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                                  Sub: {project.subLead}
                                </div>
                              )}
                            </div>
                          );
                        })()}
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

                      {/* Start Date */}
                      <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                        {project.startDate || project.initiationDate || '—'}
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
      {/* Custom Lead Reassignment Modal */}
      {editingCustomLeadProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F05A28]" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Change Project Lead
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomLeadProject(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                {editingCustomLeadProject.name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Current Assignee: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{editingCustomLeadProject.projectLead || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Enter New Lead Name
              </label>
              <input
                type="text"
                value={customLeadInput}
                onChange={(e) => setCustomLeadInput(e.target.value)}
                placeholder="Type lead name (e.g. Saniya, Kunal, Suraj)..."
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F05A28]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customLeadInput.trim() && onUpdateLead) {
                    onUpdateLead(editingCustomLeadProject.id, customLeadInput.trim());
                    setEditingCustomLeadProject(null);
                  }
                }}
              />
            </div>

            {/* Quick Team Lead Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-500 font-medium">Or 1-click assign to an active lead:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeTeamLeads.map((lead) => (
                  <button
                    key={`modal-lead-pick-${lead}`}
                    type="button"
                    onClick={() => {
                      if (onUpdateLead) {
                        onUpdateLead(editingCustomLeadProject.id, lead);
                      }
                      setEditingCustomLeadProject(null);
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-[#F05A28] hover:text-white border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    {lead} {lead === 'Saniya' || lead === 'Kunal' ? '(Social)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingCustomLeadProject(null)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customLeadInput.trim() && onUpdateLead) {
                    onUpdateLead(editingCustomLeadProject.id, customLeadInput.trim());
                  }
                  setEditingCustomLeadProject(null);
                }}
                disabled={!customLeadInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#F05A28] hover:bg-[#d94e20] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Save Lead Name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
