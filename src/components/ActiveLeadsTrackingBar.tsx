import React, { useState } from 'react';
import { Project, RemoteTeamMember } from '../types/project';
import {
  Play,
  Pause,
  Square,
  Clock,
  Zap,
  Users,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  CheckCircle2,
  PlusCircle,
  Activity
} from 'lucide-react';

interface ActiveLeadsTrackingBarProps {
  members: RemoteTeamMember[];
  projects: Project[];
  activeTimer: {
    isRunning: boolean;
    projectId: string;
    projectName: string;
    member: string;
    seconds: number;
    description: string;
  };
  onTogglePrimaryTimer: () => void;
  onStopAndLogPrimaryTimer: () => void;
  onStartTrackingLead: (leadName: string, projectId?: string) => void;
  onStopTrackingLead: (leadName: string) => void;
  onTrackAllActiveLeads: () => void;
  onPauseAllActiveLeads: () => void;
  onOpenManualTimeLog: () => void;
  onSwitchPrimaryTimerLead: (leadName: string) => void;
}

export const ActiveLeadsTrackingBar: React.FC<ActiveLeadsTrackingBarProps> = ({
  members,
  projects,
  activeTimer,
  onTogglePrimaryTimer,
  onStopAndLogPrimaryTimer,
  onStartTrackingLead,
  onStopTrackingLead,
  onTrackAllActiveLeads,
  onPauseAllActiveLeads,
  onOpenManualTimeLog,
  onSwitchPrimaryTimerLead,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Leads who are tracking or active
  const trackingMembers = members.filter((m) => m.status === 'tracking');
  const activeMembers = members.filter((m) => m.status === 'active' || m.status === 'tracking');

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = Math.floor(totalSecs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format seconds to human readable e.g. 5h 24m
  const formatHoursMins = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Total seconds tracked today across all team leads
  const totalTrackedTodaySecs = members.reduce(
    (acc, m) => acc + (m.trackedTodaySeconds || 0),
    0
  );

  return (
    <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 dark:from-neutral-950 dark:via-neutral-900 dark:to-black text-white border-b border-orange-500/30 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Main Bar Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Active Leads Tracking Status */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 font-semibold text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <Activity className="w-3.5 h-3.5" />
              <span>ACTIVE LEADS TRACKING</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-neutral-300 font-mono text-[11px]">
              <span className="text-white font-bold">{trackingMembers.length}</span>
              <span className="text-neutral-400">of {members.length} Leads Tracking Live</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">{formatHoursMins(totalTrackedTodaySecs)}</span>
              <span className="text-neutral-400">Logged Today</span>
            </div>
          </div>

          {/* Center: Primary Focused Live Lead Timer */}
          <div className="flex items-center gap-2.5 bg-black/40 border border-neutral-800 rounded-lg px-3 py-1.5 shadow-inner">
            <span className="text-neutral-400 font-mono text-[10px] hidden md:inline">
              FOCUSED LEAD:
            </span>

            {/* Lead Selector Dropdown */}
            <select
              value={activeTimer.member}
              onChange={(e) => onSwitchPrimaryTimerLead(e.target.value)}
              className="bg-neutral-800/90 text-white font-semibold font-mono text-xs rounded px-2 py-0.5 border border-neutral-700 focus:outline-none focus:border-[#F05A28] cursor-pointer"
              title="Switch focused tracking lead"
            >
              {members.map((m) => (
                <option key={`opt-${m.id}`} value={m.name}>
                  {m.name} ({m.status === 'tracking' ? '● Tracking' : m.status})
                </option>
              ))}
            </select>

            {/* Current Project Badge */}
            <span
              className="hidden lg:inline-block max-w-[140px] truncate text-[11px] text-neutral-300 font-mono bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700"
              title={activeTimer.projectName || 'Active Sprint'}
            >
              {activeTimer.projectName || 'Active Sprint'}
            </span>

            {/* Digital Clock Display */}
            <div className="flex items-center gap-1 font-mono text-sm font-bold text-emerald-400 bg-neutral-950 px-2.5 py-0.5 rounded border border-emerald-500/30 tabular-nums shadow-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{formatTime(activeTimer.seconds)}</span>
            </div>

            {/* Primary Timer Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onTogglePrimaryTimer}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  activeTimer.isRunning
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}
                title={activeTimer.isRunning ? 'Pause active timer' : 'Resume active timer'}
              >
                {activeTimer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onStopAndLogPrimaryTimer}
                className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer transition-colors"
                title="Stop & Log Session Hours to Project"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Global Mass Tracking Controls & Toggle */}
          <div className="flex items-center gap-1.5">
            {trackingMembers.length < activeMembers.length ? (
              <button
                type="button"
                onClick={onTrackAllActiveLeads}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#F05A28] hover:bg-[#d94e20] active:scale-98 text-white font-semibold text-[11px] font-mono shadow-xs cursor-pointer transition-all"
                title="Start live time tracking for all active team leads"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline">Track All Active Leads</span>
                <span className="sm:hidden">Track All</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPauseAllActiveLeads}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-semibold text-[11px] font-mono shadow-xs cursor-pointer transition-all"
                title="Pause live tracking for all active leads"
              >
                <Pause className="w-3 h-3" />
                <span>Pause All Leads</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenManualTimeLog}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer hidden md:flex"
              title="Manual Time Log Entry"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse team lead chips' : 'Expand all team lead chips'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Lead Tracking Chips Row */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#F05A28]" /> Leads:
            </span>

            {members.map((member) => {
              const isTracking = member.status === 'tracking';
              const isPrimary = activeTimer.member.toLowerCase() === member.name.toLowerCase();

              return (
                <div
                  key={`bar-lead-${member.id}`}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs shrink-0 transition-all ${
                    isTracking
                      ? isPrimary
                        ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 ring-1 ring-emerald-500/30'
                        : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                      : member.status === 'active'
                      ? 'bg-neutral-800/60 border-neutral-700/80 text-neutral-300 hover:border-neutral-600'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {/* Lead Avatar & Status Dot */}
                  <div className="relative">
                    <div className="w-5 h-5 rounded-md bg-neutral-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-neutral-900 ${
                        isTracking
                          ? 'bg-emerald-400 animate-pulse'
                          : member.status === 'active'
                          ? 'bg-indigo-400'
                          : 'bg-neutral-600'
                      }`}
                    />
                  </div>

                  {/* Name & Today's Tracked Time */}
                  <div
                    className="flex flex-col cursor-pointer"
                    onClick={() => onSwitchPrimaryTimerLead(member.name)}
                    title={`Click to focus ${member.name} in primary timer`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-[11px] text-white">{member.name}</span>
                      {member.name.toLowerCase() === 'saniya' && (
                        <span className="text-[9px] px-1 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800 font-mono">
                          Social
                        </span>
                      )}
                      {member.name.toLowerCase() === 'kunal' && (
                        <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                          Social
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                      {formatHoursMins(member.trackedTodaySeconds || 0)} today
                    </span>
                  </div>

                  {/* 1-Click Track / Stop Actions for this Lead */}
                  {isTracking ? (
                    <button
                      type="button"
                      onClick={() => onStopTrackingLead(member.name)}
                      className="ml-1 p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                      title={`Stop and log hours for ${member.name}`}
                    >
                      <Square className="w-2.5 h-2.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartTrackingLead(member.name)}
                      className="ml-1 p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                      title={`Start live tracking for ${member.name}`}
                    >
                      <Play className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
