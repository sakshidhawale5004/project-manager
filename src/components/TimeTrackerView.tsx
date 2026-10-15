import React, { useState } from 'react';
import { Project, RemoteTeamMember, TimeEntry } from '../types/project';
import {
  Play,
  Pause,
  Square,
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  UserCheck,
  TrendingUp,
  Tag,
  Trash2
} from 'lucide-react';

interface TimeTrackerViewProps {
  projects: Project[];
  teamMembers: RemoteTeamMember[];
  timeEntries: TimeEntry[];
  activeTimer: {
    isRunning: boolean;
    projectId: string;
    projectName: string;
    member: string;
    seconds: number;
    description: string;
  };
  onStartCustomTimer: (projectId: string, member: string, description: string) => void;
  onToggleTimer: () => void;
  onStopAndLogTimer: () => void;
  onAddManualTimeEntry: (entry: Omit<TimeEntry, 'id' | 'timestamp'>) => void;
  onDeleteTimeEntry: (id: string) => void;
}

export const TimeTrackerView: React.FC<TimeTrackerViewProps> = ({
  projects,
  teamMembers,
  timeEntries,
  activeTimer,
  onStartCustomTimer,
  onToggleTimer,
  onStopAndLogTimer,
  onAddManualTimeEntry,
  onDeleteTimeEntry,
}) => {
  // Timer setup state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedMember, setSelectedMember] = useState<string>('Sakshi');
  const [taskDescription, setTaskDescription] = useState<string>('');

  // Manual entry modal/form state
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  const [manualProjId, setManualProjId] = useState<string>(projects[0]?.id || '');
  const [manualMember, setManualMember] = useState<string>('Sakshi');
  const [manualDate, setManualDate] = useState<string>('2026-10-15');
  const [manualHours, setManualHours] = useState<number>(1);
  const [manualMins, setManualMins] = useState<number>(30);
  const [manualDesc, setManualDesc] = useState<string>('');
  const [manualCategory, setManualCategory] = useState<TimeEntry['category']>('development');
  const [manualBillable, setManualBillable] = useState<boolean>(true);

  // Filter for history
  const [filterMember, setFilterMember] = useState<string>('All');

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (!selectedProjectId) return;
    onStartCustomTimer(selectedProjectId, selectedMember, taskDescription);
  };

  const handleSaveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === manualProjId);
    if (!proj) return;

    const totalSeconds = manualHours * 3600 + manualMins * 60;
    onAddManualTimeEntry({
      projectId: manualProjId,
      projectName: proj.name,
      member: manualMember,
      date: manualDate,
      durationSeconds: totalSeconds,
      description: manualDesc || 'Project task sprint',
      billable: manualBillable,
      category: manualCategory,
    });

    setManualDesc('');
    setShowManualForm(false);
  };

  const filteredEntries = timeEntries.filter(
    (entry) => filterMember === 'All' || entry.member === filterMember
  );

  const totalTrackedSeconds = filteredEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalTrackedHours = (totalTrackedSeconds / 3600).toFixed(1);
  const billableCount = filteredEntries.filter((e) => e.billable).length;
  const billablePercent = filteredEntries.length > 0 ? Math.round((billableCount / filteredEntries.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Active Live Timer Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Remote Live Timer Engine
              </span>
              {activeTimer.isRunning && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                  [RECORDING ACTIVE]
                </span>
              )}
            </div>

            {/* Huge Monospace Timer Display */}
            <div className="text-4xl sm:text-5xl font-mono tabular-nums font-bold text-neutral-900 dark:text-white tracking-wider">
              {formatTimer(activeTimer.seconds)}
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span>Current Project:</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                {activeTimer.projectName || 'No project selected'}
              </span>
              {activeTimer.member && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-600">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400">Engineer: {activeTimer.member}</span>
                </>
              )}
            </div>
          </div>

          {/* Controls & Configuration */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!activeTimer.isRunning && activeTimer.seconds === 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500 max-w-[200px]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Task notes (e.g. client feedback update)..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 min-w-[220px]"
                />

                <button
                  onClick={handleStartTimer}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Timer
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleTimer}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md text-xs font-medium transition-colors"
                >
                  {activeTimer.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Resume
                    </>
                  )}
                </button>
                <button
                  onClick={onStopAndLogTimer}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-medium transition-colors shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  Finish & Log
                </button>
              </div>
            )}

            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md text-xs transition-colors border border-neutral-300 dark:border-neutral-700/60"
            >
              <Plus className="w-3.5 h-3.5" />
              Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Manual Time Entry Drawer/Form */}
      {showManualForm && (
        <form
          onSubmit={handleSaveManualEntry}
          className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 rounded-lg p-4 space-y-4 text-xs shadow-sm transition-colors"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <h4 className="font-semibold text-neutral-900 dark:text-white">Log Past Work Hours</h4>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Target Project</label>
              <select
                value={manualProjId}
                onChange={(e) => setManualProjId(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Remote Engineer</label>
              <select
                value={manualMember}
                onChange={(e) => setManualMember(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Time Spent</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={manualHours}
                  onChange={(e) => setManualHours(Number(e.target.value))}
                  className="w-16 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-800 dark:text-neutral-200 font-mono"
                  placeholder="Hrs"
                />
                <span className="text-neutral-500">h</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={manualMins}
                  onChange={(e) => setManualMins(Number(e.target.value))}
                  className="w-16 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-800 dark:text-neutral-200 font-mono"
                  placeholder="Min"
                />
                <span className="text-neutral-500">m</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Task Work Summary</label>
              <input
                type="text"
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder="What was completed during this block?"
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-neutral-500 dark:text-neutral-400 mb-1">Category</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as any)}
                  className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-800 dark:text-neutral-200"
                >
                  <option value="development">Development</option>
                  <option value="bugfix">Bugfix / Revision</option>
                  <option value="design">Design & Wireframe</option>
                  <option value="client_meeting">Client Meeting</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={manualBillable}
                  onChange={(e) => setManualBillable(e.target.checked)}
                  className="rounded accent-indigo-600 dark:accent-indigo-500"
                />
                <label htmlFor="billable" className="text-neutral-700 dark:text-neutral-300 select-none">
                  Billable
                </label>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium ml-auto shadow-xs"
              >
                Log Entry
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Remote Team Live Presence Board */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Remote Engineering Team Status
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Live capacity and activity overview for distributed agency staff.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembers.map((member) => {
            const hrsToday = (member.trackedTodaySeconds / 3600).toFixed(1);
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-2.5 shadow-sm transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${member.avatarBg}`}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{member.role}</div>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[11px] font-medium ${
                      member.status === 'tracking'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : member.status === 'active'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {member.status === 'tracking'
                      ? 'Tracking'
                      : member.status === 'active'
                      ? 'Active'
                      : 'Idle'}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {member.currentProject ? (
                      <span className="truncate max-w-[150px] inline-block">
                        Working on: {member.currentProject}
                      </span>
                    ) : (
                      'In standup / review'
                    )}
                  </span>
                  <span className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200 font-medium">
                    {hrsToday}h today
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timesheet Audit Log Table */}
      <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-3 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Timesheet Audit Records</h3>
            <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {totalTrackedHours}h total · {billablePercent}% billable
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Filter Engineer:</span>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none"
            >
              <option value="All">All Engineers</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs">
                <th className="py-2 px-3 font-semibold w-24">Date</th>
                <th className="py-2 px-3 font-semibold w-28">Member</th>
                <th className="py-2 px-3 font-semibold min-w-[160px]">Project</th>
                <th className="py-2 px-3 font-semibold min-w-[200px]">Description</th>
                <th className="py-2 px-3 font-semibold w-24">Category</th>
                <th className="py-2 px-3 font-semibold text-right w-24">Duration</th>
                <th className="py-2 px-3 font-semibold text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No time entries recorded yet.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const hrs = (entry.durationSeconds / 3600).toFixed(1);
                  return (
                    <tr key={entry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                      <td className="py-2 px-3 font-mono text-neutral-500 dark:text-neutral-400 text-[11px]">
                        {entry.date}
                      </td>
                      <td className="py-2 px-3 text-neutral-800 dark:text-neutral-200 font-medium">
                        {entry.member}
                      </td>
                      <td className="py-2 px-3 text-neutral-900 dark:text-white font-medium">
                        {entry.projectName}
                      </td>
                      <td className="py-2 px-3 text-neutral-600 dark:text-neutral-300 truncate max-w-xs">
                        {entry.description}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">
                          {entry.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200 font-medium">
                        {hrs}h
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => onDeleteTimeEntry(entry.id)}
                          className="text-neutral-400 hover:text-rose-600 dark:text-neutral-500 dark:hover:text-rose-400 transition-colors p-1"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
