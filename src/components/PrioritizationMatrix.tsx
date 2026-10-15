import React, { useState, useMemo } from 'react';
import { Project, PrioritizationWeights, PriorityLevel, RemoteTeamMember } from '../types/project';
import {
  DEFAULT_WEIGHTS,
  generateSmartRecommendations,
  Recommendation
} from '../utils/prioritization';
import {
  Zap,
  Sliders,
  AlertCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  Play,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PrioritizationMatrixProps {
  projects: Project[];
  teamMembers?: RemoteTeamMember[];
  weights: PrioritizationWeights;
  onUpdateWeights: (newWeights: PrioritizationWeights) => void;
  onRunAutoPrioritize: () => void;
  onSelectProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
}

export const PrioritizationMatrix: React.FC<PrioritizationMatrixProps> = ({
  projects,
  teamMembers,
  weights,
  onUpdateWeights,
  onRunAutoPrioritize,
  onSelectProject,
  onStartTimer,
}) => {
  const [selectedLead, setSelectedLead] = useState<string>('Sakshi');
  const [showWeightSliders, setShowWeightSliders] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const leadOptions = useMemo(() => {
    if (teamMembers && teamMembers.length > 0) {
      return teamMembers.map((m) => m.name);
    }
    return ['Sakshi', 'Aishwarya', 'Suraj', 'Hasina', 'Kunal'];
  }, [teamMembers]);

  const recommendations = useMemo(() => {
    return generateSmartRecommendations(projects);
  }, [projects]);

  const p1Projects = useMemo(() => projects.filter((p) => p.priorityLevel === 'P1'), [projects]);
  const p2Projects = useMemo(() => projects.filter((p) => p.priorityLevel === 'P2'), [projects]);
  const p3Projects = useMemo(() => projects.filter((p) => p.priorityLevel === 'P3'), [projects]);
  const p4Projects = useMemo(() => projects.filter((p) => p.priorityLevel === 'P4'), [projects]);

  // Lead filtered focus queue
  const leadQueue = useMemo(() => {
    return projects
      .filter((p) => p.projectLead.toLowerCase() === selectedLead.toLowerCase() && p.status !== 'Live')
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [projects, selectedLead]);

  const handleRunAlgorithm = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      onRunAutoPrioritize();
      setIsRecalculating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Algorithm Status & Quick Trigger */}
      <div className="bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-display text-neutral-900 dark:text-white">
              Automated Prioritization Engine
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              [Algorithmic Dispatch]
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Continuously calculates optimal execution sequences across all 71 projects by evaluating client modification requests, impending delivery deadlines, and remote lead workload capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            {showWeightSliders ? 'Hide Weights' : 'Tune Weights'}
          </button>

          <button
            onClick={handleRunAlgorithm}
            disabled={isRecalculating}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Re-scoring Queue...' : 'Recalculate Priorities'}
          </button>
        </div>
      </div>

      {/* Weight Tuning Panel (Expandable) */}
      {showWeightSliders && (
        <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs shadow-sm transition-colors">
          <div>
            <div className="flex justify-between font-medium text-neutral-800 dark:text-neutral-300 mb-1">
              <span>Client Changes Weight</span>
              <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">{weights.clientChangesWeight}pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={weights.clientChangesWeight}
              onChange={(e) =>
                onUpdateWeights({ ...weights, clientChangesWeight: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 dark:accent-indigo-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Boosts projects with active revision or feedback tickets from clients.
            </p>
          </div>

          <div>
            <div className="flex justify-between font-medium text-neutral-800 dark:text-neutral-300 mb-1">
              <span>Deadline Proximity Weight</span>
              <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">{weights.deadlineProximityWeight}pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={weights.deadlineProximityWeight}
              onChange={(e) =>
                onUpdateWeights({ ...weights, deadlineProximityWeight: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 dark:accent-indigo-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Boosts tasks approaching delivery date or currently overdue.
            </p>
          </div>

          <div>
            <div className="flex justify-between font-medium text-neutral-800 dark:text-neutral-300 mb-1">
              <span>Lead Workload Balancing</span>
              <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">{weights.leadWorkloadWeight}pts</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.leadWorkloadWeight}
              onChange={(e) =>
                onUpdateWeights({ ...weights, leadWorkloadWeight: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 dark:accent-indigo-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Prioritizes tasks for overloaded project leads to clear bottlenecks.
            </p>
          </div>
        </div>
      )}

      {/* Smart Recommendations Strip */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-neutral-800/20 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Smart Prioritization Alerts ({recommendations.length} Action Items)</span>
            </div>
            <span className="text-[11px] text-neutral-500">Automated triage suggestions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800/80 rounded-md p-3 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span className="truncate">{rec.projectName}</span>
                    <span className="font-mono text-[10px] text-neutral-500">Lead: {rec.lead}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1 text-[11px] line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800/60 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {rec.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Daily Focus Planner */}
      <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Remote Lead Daily Focus Queue
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Individual morning standup sequence calculated by priority score.
            </p>
          </div>

          {/* Lead Picker */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-md text-xs">
            {leadOptions.map((lead) => (
              <button
                key={lead}
                onClick={() => setSelectedLead(lead)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedLead === lead
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {lead}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Queue Items */}
        <div className="space-y-2">
          {leadQueue.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No active tasks for {selectedLead}. All projects may be in production (Live).
            </div>
          ) : (
            leadQueue.slice(0, 6).map((project, idx) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800/80 rounded-md p-3 text-xs flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono tabular-nums text-neutral-400 dark:text-neutral-500 text-xs w-4">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                      <span className="truncate">{project.name}</span>
                      <span
                        className={`font-mono text-[10px] font-semibold ${
                          project.priorityLevel === 'P1'
                            ? 'text-rose-600 dark:text-rose-400'
                            : project.priorityLevel === 'P2'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-sky-600 dark:text-sky-400'
                        }`}
                      >
                        {project.priorityLevel} ({project.priorityScore} pts)
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate max-w-xl">
                      {project.remark || project.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono tabular-nums text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                    Deadline: {project.deadline || 'Flexible'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTimer(project);
                    }}
                    className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors"
                    title="Track time on this project"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4 Quadrants Priority Distribution */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Agency Workload Matrix (4 Quadrants)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quadrant 1: P1 Critical */}
          <div className="bg-white dark:bg-neutral-900/60 border border-rose-200 dark:border-rose-900/30 rounded-lg p-4 space-y-3 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">P1 · Critical</span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Immediate Execution</span>
              </div>
              <span className="font-mono tabular-nums text-xs font-semibold text-rose-600 dark:text-rose-400">
                {p1Projects.length} Projects
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {p1Projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {p.projectLead} · {p.status}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-medium text-[11px] shrink-0">
                    {p.priorityScore}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quadrant 2: P2 High */}
          <div className="bg-white dark:bg-neutral-900/60 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 space-y-3 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">P2 · High</span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Active Deliverables</span>
              </div>
              <span className="font-mono tabular-nums text-xs font-semibold text-amber-600 dark:text-amber-400">
                {p2Projects.length} Projects
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {p2Projects.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {p.projectLead} · {p.status}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400 font-medium text-[11px] shrink-0">
                    {p.priorityScore}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quadrant 3: P3 Medium */}
          <div className="bg-white dark:bg-neutral-900/60 border border-sky-200 dark:border-sky-900/30 rounded-lg p-4 space-y-3 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">P3 · Medium</span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Scoping & Discovery</span>
              </div>
              <span className="font-mono tabular-nums text-xs font-semibold text-sky-600 dark:text-sky-400">
                {p3Projects.length} Projects
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {p3Projects.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {p.projectLead} · {p.status}
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-sky-600 dark:text-sky-400 font-medium text-[11px] shrink-0">
                    {p.priorityScore}pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quadrant 4: P4 Low / Live */}
          <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-neutral-600 dark:text-neutral-400 text-xs">P4 · Low / Live</span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Production Maintenance</span>
              </div>
              <span className="font-mono tabular-nums text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                {p4Projects.length} Projects
              </span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {p4Projects.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p)}
                  className="bg-neutral-50 dark:bg-neutral-800/30 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{p.name}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {p.projectLead} · Live Site
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-neutral-500 dark:text-neutral-400 font-medium text-[11px] shrink-0">
                    {p.priorityScore}pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
