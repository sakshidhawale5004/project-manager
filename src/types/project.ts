export type ProjectStatus =
  | 'Live'
  | 'In process'
  | 'Changes from Client'
  | 'Pending from client'
  | 'Schedule Meeting'
  | 'Planning';

export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface Project {
  id: string;
  srNo: number;
  name: string;
  projectLead: string;
  subLead: string;
  liveUrl: string;
  initiationDate: string;
  technology: string;
  framework: string;
  design: string;
  content: string;
  lastChange: string;
  status: ProjectStatus;
  hosting: string;
  deadline: string;
  backup: string;
  remark: string;
  estimatedHours: number;
  loggedHours: number;
  priorityLevel: PriorityLevel;
  priorityScore: number;
  clientUrgencyFlag?: boolean;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  member: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  description: string;
  billable: boolean;
  category: 'development' | 'design' | 'client_meeting' | 'bugfix' | 'deployment';
  timestamp: number;
}

export interface RemoteTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  timezone: string;
  status: 'tracking' | 'active' | 'idle' | 'offline';
  currentProject?: string;
  trackedTodaySeconds: number;
  assignedProjectCount: number;
  avatarBg: string;
}

export interface PrioritizationWeights {
  clientChangesWeight: number; // e.g. 40
  deadlineProximityWeight: number; // e.g. 35
  leadWorkloadWeight: number; // e.g. 15
  unblockedStatusWeight: number; // e.g. 10
}
