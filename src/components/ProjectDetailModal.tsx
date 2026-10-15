import React from 'react';
import { Project } from '../types/project';
import {
  X,
  ExternalLink,
  Play,
  HardDrive,
  Calendar,
  User,
  Server,
  Clock,
  Layers,
  Edit2,
  AlertTriangle
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onStartTimer: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
  onStartTimer,
}) => {
  if (!project) return null;

  const progressPct = Math.min(
    100,
    Math.round(((project.loggedHours || 0) / (project.estimatedHours || 40)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-neutral-800 dark:text-neutral-200 space-y-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-neutral-400 dark:text-neutral-500 text-xs">
                #{project.srNo}
              </span>
              <h2 className="text-lg font-bold font-display text-neutral-900 dark:text-white">
                {project.name}
              </h2>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                  project.priorityLevel === 'P1'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                    : project.priorityLevel === 'P2'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60'
                    : project.priorityLevel === 'P3'
                    ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {project.priorityLevel} · Score: {project.priorityScore}
              </span>
            </div>

            <div className="text-neutral-600 dark:text-neutral-400 mt-1 flex items-center gap-3 text-xs">
              <span>Status: <strong className="text-neutral-900 dark:text-white">{project.status}</strong></span>
              <span>·</span>
              <span>Lead: <strong className="text-neutral-900 dark:text-white">{project.projectLead}</strong></span>
              {project.subLead && (
                <>
                  <span>·</span>
                  <span>Sub: <strong className="text-neutral-900 dark:text-white">{project.subLead}</strong></span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Edit project"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Action CTA Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              onStartTimer(project);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            Start Tracking Time
          </button>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-md font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Visit Live Site
            </a>
          )}

          {project.backup && (
            <a
              href={project.backup}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-md font-medium transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Mega.nz Backup
            </a>
          )}
        </div>

        {/* Time Progress */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Tracked Hours Progress
            </span>
            <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
              {project.loggedHours}h / {project.estimatedHours}h ({progressPct}%)
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPct > 90 ? 'bg-amber-500' : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Initiation Date</div>
            <div className="font-mono text-neutral-800 dark:text-neutral-200">{project.initiationDate || '—'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Target Deadline</div>
            <div className="font-mono text-neutral-800 dark:text-neutral-200">{project.deadline || 'Flexible'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Technology & Language</div>
            <div className="text-neutral-800 dark:text-neutral-200">{project.technology || 'Standard Web Stack'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Framework / Architecture</div>
            <div className="text-neutral-800 dark:text-neutral-200">{project.framework || 'Custom'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Design Stage</div>
            <div className="text-neutral-800 dark:text-neutral-200">{project.design || 'In Review'}</div>
          </div>

          <div className="space-y-1">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Content Readiness</div>
            <div className="text-neutral-800 dark:text-neutral-200">{project.content || 'Drafting'}</div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <div className="text-neutral-500 dark:text-neutral-400 font-medium">Last Recorded Change</div>
            <div className="text-neutral-800 dark:text-neutral-200 font-mono text-[11px]">{project.lastChange || '—'}</div>
          </div>
        </div>

        {/* Hosting & Auth Box */}
        <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2 transition-colors">
          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold">
            <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Hosting & Authentication Details</span>
          </div>
          <div className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 break-all select-all shadow-inner">
            {project.hosting || 'No hosting notes logged yet.'}
          </div>
        </div>

        {/* Remark Note */}
        {project.remark && (
          <div className="bg-neutral-50 dark:bg-neutral-800/20 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-1 transition-colors">
            <div className="text-neutral-600 dark:text-neutral-400 font-medium">Engineer Remarks</div>
            <p className="text-neutral-800 dark:text-neutral-300 leading-relaxed">{project.remark}</p>
          </div>
        )}
      </div>
    </div>
  );
};
