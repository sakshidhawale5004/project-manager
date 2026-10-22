import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, RemoteTeamMember } from '../types/project';
import { ExternalLink, Play, MoreHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';

interface KanbanBoardProps {
  projects: Project[];
  teamMembers?: RemoteTeamMember[];
  globalSearch?: string;
  onClearSearch?: () => void;
  onSelectProject: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onStartTimer: (project: Project) => void;
}

const COLUMNS: { status: ProjectStatus; title: string; color: string }[] = [
  { status: 'In process', title: 'In Process', color: 'text-indigo-600 dark:text-indigo-400 border-indigo-500/40' },
  { status: 'Changes from Client', title: 'Changes from Client', color: 'text-amber-600 dark:text-amber-400 border-amber-500/40' },
  { status: 'Pending from client', title: 'Pending Client', color: 'text-sky-600 dark:text-sky-400 border-sky-500/40' },
  { status: 'Schedule Meeting', title: 'Schedule Meeting', color: 'text-purple-600 dark:text-purple-400 border-purple-500/40' },
  { status: 'Planning', title: 'Planning / Kickoff', color: 'text-neutral-600 dark:text-neutral-400 border-neutral-400 dark:border-neutral-600' },
  { status: 'Live', title: 'Live in Production', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projects,
  teamMembers,
  globalSearch,
  onClearSearch,
  onSelectProject,
  onUpdateStatus,
  onStartTimer,
}) => {
  const [selectedLead, setSelectedLead] = useState<string>('All');

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
    return projects.filter((p) => {
      const matchesLead =
        selectedLead === 'All' || p.projectLead.toLowerCase() === selectedLead.toLowerCase();

      let matchesSearch = true;
      if (globalSearch && globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        matchesSearch = Boolean(
          p.name.toLowerCase().includes(q) ||
          p.projectLead.toLowerCase().includes(q) ||
          (p.subLead && p.subLead.toLowerCase().includes(q)) ||
          (p.technology && p.technology.toLowerCase().includes(q)) ||
          (p.framework && p.framework.toLowerCase().includes(q))
        );
      }

      return matchesLead && matchesSearch;
    });
  }, [projects, selectedLead, globalSearch]);

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 shadow-sm transition-colors">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Remote Sprint Pipeline</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real-time status tracking across remote agency workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {globalSearch && (
            <div className="flex items-center gap-1.5 bg-[#F05A28]/10 text-[#F05A28] border border-[#F05A28]/30 px-2.5 py-1 rounded-md font-mono text-xs">
              <span>Filter: "<strong>{globalSearch}</strong>" ({filteredProjects.length} matches)</span>
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="hover:underline font-bold ml-1 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 dark:text-neutral-400">Filter Lead:</span>
            <select
              value={selectedLead}
              onChange={(e) => setSelectedLead(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All">All Leads ({projects.length})</option>
              {uniqueLeads.map((lead) => (
                <option key={lead} value={lead}>
                  {lead}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colProjects = filteredProjects.filter((p) => p.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-neutral-100/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 min-w-[240px] flex flex-col max-h-[80vh] shadow-xs transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-200 dark:border-neutral-800">
                <span className={`text-xs font-semibold ${col.color.split(' ')[0]}`}>
                  {col.title}
                </span>
                <span className="font-mono tabular-nums text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-800/80 px-2 py-0.5 rounded">
                  {colProjects.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {colProjects.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-600">
                    No items in this stage
                  </div>
                ) : (
                  colProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onSelectProject(p)}
                      className="bg-white dark:bg-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 rounded-md p-3 text-xs space-y-2 cursor-pointer transition-colors shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-white line-clamp-1">
                          {p.name}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-semibold shrink-0 ${
                            p.priorityLevel === 'P1'
                              ? 'text-rose-600 dark:text-rose-400'
                              : p.priorityLevel === 'P2'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {p.priorityLevel}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                        <span>Lead: {p.projectLead}</span>
                        {p.subLead && <span>Sub: {p.subLead}</span>}
                      </div>

                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center justify-between">
                        <span>Start: {p.startDate || p.initiationDate || '—'}</span>
                        {p.deadline && <span>Due: {p.deadline}</span>}
                      </div>

                      {p.remark && (
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 italic">
                          "{p.remark}"
                        </div>
                      )}

                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                        <span className="font-mono tabular-nums text-neutral-600 dark:text-neutral-400">
                          {p.loggedHours}h / {p.estimatedHours}h
                        </span>

                        <div className="flex items-center gap-1.5">
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-neutral-400 hover:text-indigo-600 dark:text-neutral-500 dark:hover:text-indigo-400 p-0.5"
                              title="Visit live site"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartTimer(p);
                            }}
                            className="text-neutral-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 p-0.5"
                            title="Start timer"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Quick stage mover controls */}
                      <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500">
                        <select
                          value={p.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onUpdateStatus(p.id, e.target.value as ProjectStatus)
                          }
                          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded px-1.5 py-0.5 text-neutral-800 dark:text-neutral-300 w-full"
                        >
                          <option value="In process">In Process</option>
                          <option value="Changes from Client">Changes from Client</option>
                          <option value="Pending from client">Pending Client</option>
                          <option value="Schedule Meeting">Schedule Meeting</option>
                          <option value="Planning">Planning</option>
                          <option value="Live">Live</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
