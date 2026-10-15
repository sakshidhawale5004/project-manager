import { Project, PriorityLevel, PrioritizationWeights } from '../types/project';

export const DEFAULT_WEIGHTS: PrioritizationWeights = {
  clientChangesWeight: 40,
  deadlineProximityWeight: 35,
  leadWorkloadWeight: 15,
  unblockedStatusWeight: 10,
};

export function calculateProjectPriority(
  project: Project,
  weights: PrioritizationWeights = DEFAULT_WEIGHTS,
  leadProjectCounts: Record<string, number> = {}
): { score: number; level: PriorityLevel; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Status Factor
  switch (project.status) {
    case 'Changes from Client':
      score += weights.clientChangesWeight;
      reasons.push('Client revision requested (high urgency)');
      break;
    case 'In process':
      score += weights.unblockedStatusWeight * 2.5; // ~25 pts
      reasons.push('Active sprint deliverable');
      break;
    case 'Schedule Meeting':
      score += weights.clientChangesWeight * 0.75; // ~30 pts
      reasons.push('Discovery meeting needed to unblock');
      break;
    case 'Pending from client':
      score += weights.unblockedStatusWeight * 1.5; // ~15 pts
      reasons.push('Follow-up needed with client');
      break;
    case 'Planning':
      score += weights.unblockedStatusWeight * 1.2; // ~12 pts
      reasons.push('Architecture & scoping phase');
      break;
    case 'Live':
      score += 5;
      reasons.push('Production maintenance');
      break;
  }

  // 2. Deadline Proximity
  if (project.deadline) {
    const deadlineDate = new Date(project.deadline).getTime();
    const now = new Date('2026-10-15T00:33:44').getTime(); // Current system simulated time
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      score += weights.deadlineProximityWeight * 1.3; // Overdue bonus
      reasons.push(`Target deadline was ${Math.abs(diffDays)}d ago (overdue)`);
    } else if (diffDays <= 2) {
      score += weights.deadlineProximityWeight;
      reasons.push(`Due in ${diffDays}d (imminent)`);
    } else if (diffDays <= 7) {
      score += weights.deadlineProximityWeight * 0.75;
      reasons.push(`Due in ${diffDays}d (this week)`);
    } else if (diffDays <= 14) {
      score += weights.deadlineProximityWeight * 0.45;
      reasons.push(`Due in ${diffDays}d (next 2 weeks)`);
    } else {
      score += 5;
    }
  }

  // 3. Lead Workload Factor (Balance team bottlenecks)
  const leadLoad = leadProjectCounts[project.projectLead] || 0;
  if (leadLoad > 15) {
    score += weights.leadWorkloadWeight * 0.8;
    reasons.push(`High load on lead ${project.projectLead} (${leadLoad} active)`);
  } else if (leadLoad > 8) {
    score += weights.leadWorkloadWeight * 0.5;
  }

  // 4. Client Urgency Flag
  if (project.clientUrgencyFlag) {
    score += 15;
    reasons.push('Flagged by remote lead as client blocker');
  }

  // Bound score between 0 and 100
  score = Math.min(100, Math.max(5, Math.round(score)));

  // Determine Level
  let level: PriorityLevel = 'P4';
  if (score >= 82) {
    level = 'P1';
  } else if (score >= 62) {
    level = 'P2';
  } else if (score >= 38) {
    level = 'P3';
  } else {
    level = 'P4';
  }

  return { score, level, reasons };
}

export function autoPrioritizeProjects(
  projects: Project[],
  weights: PrioritizationWeights = DEFAULT_WEIGHTS
): Project[] {
  // Compute lead load counts
  const leadCounts: Record<string, number> = {};
  for (const p of projects) {
    if (p.status !== 'Live') {
      leadCounts[p.projectLead] = (leadCounts[p.projectLead] || 0) + 1;
    }
  }

  return projects.map((p) => {
    const { score, level } = calculateProjectPriority(p, weights, leadCounts);
    return {
      ...p,
      priorityScore: score,
      priorityLevel: level,
    };
  });
}

export interface Recommendation {
  id: string;
  projectId: string;
  projectName: string;
  lead: string;
  type: 'urgent_client' | 'deadline_warning' | 'meeting_needed' | 'workload_bottleneck';
  title: string;
  description: string;
  suggestedAction: string;
}

export function generateSmartRecommendations(projects: Project[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const p of projects) {
    if (p.status === 'Changes from Client') {
      recommendations.push({
        id: `rec-${p.id}-client`,
        projectId: p.id,
        projectName: p.name,
        lead: p.projectLead,
        type: 'urgent_client',
        title: `Client Changes Requested on ${p.name}`,
        description: `${p.projectLead} needs to review requested edits: "${p.remark || 'Client feedback awaiting implementation'}"`,
        suggestedAction: 'Prioritize in current morning sprint and notify client upon staging deploy.',
      });
    }

    if (p.status === 'Schedule Meeting') {
      recommendations.push({
        id: `rec-${p.id}-meeting`,
        projectId: p.id,
        projectName: p.name,
        lead: p.projectLead,
        type: 'meeting_needed',
        title: `Discovery Call Pending for ${p.name}`,
        description: `Project is awaiting discovery meeting to lock wireframes and milestones.`,
        suggestedAction: 'Send calendar invite to stakeholders and prepare staging review link.',
      });
    }

    if (p.status === 'In process' && p.deadline) {
      const deadlineDate = new Date(p.deadline).getTime();
      const now = new Date('2026-10-15T00:33:44').getTime();
      const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 4) {
        recommendations.push({
          id: `rec-${p.id}-deadline`,
          projectId: p.id,
          projectName: p.name,
          lead: p.projectLead,
          type: 'deadline_warning',
          title: `${p.name} Deadline in ${diffDays} Day${diffDays === 1 ? '' : 's'}`,
          description: `Current target delivery is ${p.deadline}. Staging QA and client signoff pending.`,
          suggestedAction: 'Allocate extra dev hours and verify hosting credentials before final push.',
        });
      }
    }
  }

  return recommendations;
}
