import React, { useState } from 'react';
import { Project, RemoteTeamMember, TimeEntry } from '../types/project';
import { X, Clock, Check } from 'lucide-react';

interface TimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  teamMembers: RemoteTeamMember[];
  onAddEntry: (entry: Omit<TimeEntry, 'id' | 'timestamp'>) => void;
}

export const TimeLogModal: React.FC<TimeLogModalProps> = ({
  isOpen,
  onClose,
  projects,
  teamMembers,
  onAddEntry,
}) => {
  if (!isOpen) return null;

  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [member, setMember] = useState<string>('Sakshi');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState<number>(1);
  const [minutes, setMinutes] = useState<number>(30);
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TimeEntry['category']>('development');
  const [billable, setBillable] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const totalSeconds = hours * 3600 + minutes * 60;
    onAddEntry({
      projectId,
      projectName: proj.name,
      member,
      date,
      durationSeconds: totalSeconds,
      description: description || 'Sprint task implementation',
      billable,
      category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-lg w-full p-5 text-xs text-neutral-800 dark:text-neutral-200 space-y-4 shadow-2xl transition-colors">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold font-display text-neutral-900 dark:text-white">Log Remote Time Entry</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Select Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.projectLead})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Team Member</label>
              <select
                value={member}
                onChange={(e) => setMember(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Hours & Minutes</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-900 dark:text-neutral-100 font-mono"
                  placeholder="Hrs"
                />
                <span className="text-neutral-500 font-medium">h</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-900 dark:text-neutral-100 font-mono"
                  placeholder="Min"
                />
                <span className="text-neutral-500 font-medium">m</span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              >
                <option value="development">Development</option>
                <option value="bugfix">Bugfix / Changes</option>
                <option value="design">Design & Wireframe</option>
                <option value="client_meeting">Client Meeting</option>
                <option value="deployment">Deployment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Task Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of work completed..."
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 dark:text-neutral-300 font-medium">
              <input
                type="checkbox"
                checked={billable}
                onChange={(e) => setBillable(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Billable to Client</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors cursor-pointer shadow-sm"
              >
                Record Time
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
