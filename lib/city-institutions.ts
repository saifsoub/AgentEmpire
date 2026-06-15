export type CityInstitutionStatus = 'ready' | 'planned';

export type CityInstitution = {
  id: string;
  name: string;
  district: string;
  x: string;
  y: string;
  purpose: string;
  relatedAgentRoles: string[];
  relatedTools: string[];
  futureIntegrations: string[];
  rooms: string[];
  status: CityInstitutionStatus;
};

export const cityInstitutions: CityInstitution[] = [
  { id: 'executive-hills', name: 'Executive Hills', district: 'Control Path', x: '15%', y: '18%', purpose: 'Founder-level direction, priorities, decisions, and strategic alignment for the city.', relatedAgentRoles: ['@Seif', '@Secretary', 'Manage'], relatedTools: ['decision register', 'priority board', 'executive briefings'], futureIntegrations: ['Linear', 'Calendar', 'Telegram approvals'], rooms: ['Founder Office', 'Decision Desk', 'Priority Gallery'], status: 'ready' },
  { id: 's-university', name: 'S/ University', district: 'Learning Quarter', x: '42%', y: '18%', purpose: 'The first official Harvard-level agents university: a resident team of experts educates and tests agents so owners can elevate capabilities and certify they are applied successfully.', relatedAgentRoles: ['@Sally', 'Skill Architect', 'Knowledge Curator', 'Examination Board'], relatedTools: ['curriculum registry', 'skill library', 'assessment logs', 'certification ledger'], futureIntegrations: ['LMS', 'GitHub docs', 'knowledge base'], rooms: ['Curriculum Hall', 'Assessment Lab', 'Knowledge Library', 'Certification Office'], status: 'ready' },
  { id: 's-academy', name: 'S/ Academy', district: 'Learning Quarter', x: '58%', y: '21%', purpose: 'Practical training ground where agents rehearse workflows before live work.', relatedAgentRoles: ['Trainer Agent', 'QA Agent', 'Workflow Coach'], relatedTools: ['sandbox tasks', 'simulation logs', 'review checklists'], futureIntegrations: ['CodeInterpreter', 'workflow simulators', 'evaluation dashboards'], rooms: ['Practice Rooms', 'Simulation Studio', 'Review Desk'], status: 'ready' },
  { id: 's-star-academy', name: 'S/ Star Academy', district: 'Creator Valley', x: '78%', y: '34%', purpose: 'Advanced reputation, creative, social, and visibility training for high-performing agents.', relatedAgentRoles: ['Dima', '@Sally', 'Content Strategist', 'Visual QA Agent'], relatedTools: ['content planner', 'brand checklist', 'publishing approval cards'], futureIntegrations: ['LinkedIn', 'Telegram approvals', 'asset library'], rooms: ['Creator Studio', 'Reputation Lab', 'Publishing Gate'], status: 'ready' },
  { id: 's-banking', name: 'S/ Banking', district: 'Commerce Park', x: '78%', y: '66%', purpose: 'End-to-end secure payment gateways for owners and controllable agent wallets. Human approval is always requested for balance changes, top-ups, and every movement of funds.', relatedAgentRoles: ['Finance Reviewer', 'Approval Reviewer', 'Revenue Agent'], relatedTools: ['agent wallets', 'transaction ledger', 'approval desk', 'daily limits'], futureIntegrations: ['Stripe', 'PayPal', 'bank transfer rails'], rooms: ['Gateway Hall', 'Wallet Vault', 'Approval Desk', 'Ledger Room'], status: 'ready' },
  { id: 's-treasury', name: 'S/ Treasury', district: 'Commerce Park', x: '65%', y: '72%', purpose: 'Revenue, pricing, offers, payment readiness, and financial proof tracking for the city.', relatedAgentRoles: ['Revenue Agent', 'Offer Designer', 'Finance Reviewer'], relatedTools: ['offer registry', 'pricing table', 'payment gate', 'revenue log'], futureIntegrations: ['Stripe', 'Supabase', 'CRM', 'invoice workflows'], rooms: ['Offer Desk', 'Pricing Room', 'Revenue Ledger'], status: 'ready' },
  { id: 'evidence-registry', name: 'Evidence Registry', district: 'Reality District', x: '32%', y: '76%', purpose: 'Stores proof before anything is marked complete: commits, PRs, files, screenshots, and decision notes.', relatedAgentRoles: ['QA Agent', 'Verifier Agent', '@Secretary', 'Manage'], relatedTools: ['GitHub', 'Linear', 'commit checker', 'file check'], futureIntegrations: ['CI checks', 'deployment checks', 'audit trail'], rooms: ['Commit Desk', 'PR Review Room', 'Artifact Shelf'], status: 'ready' },
  { id: 'approval-center', name: 'Approval Center', district: 'Control Path', x: '22%', y: '48%', purpose: 'Keeps sensitive work gated until Seif explicitly approves execution, publishing, payment, or external commitments.', relatedAgentRoles: ['@Secretary', 'Manage', 'Approval Reviewer', 'QA Agent'], relatedTools: ['approval queue', 'Telegram cards', 'decision register'], futureIntegrations: ['Linear approvals', 'Gmail drafts', 'payment flows'], rooms: ['Decision Desk', 'Approval Gate', 'Escalation Room'], status: 'ready' },
  { id: 'memory-systems', name: 'Memory Systems', district: 'Memory Gardens', x: '12%', y: '55%', purpose: 'Preserves reusable context, lessons, decisions, patterns, and trusted operating memory.', relatedAgentRoles: ['Memory Curator', '@Secretary', '@Sally'], relatedTools: ['context registry', 'lesson log', 'pattern library'], futureIntegrations: ['vector store', 'file library', 'agent memory policies'], rooms: ['Context Library', 'Pattern Archive', 'Lessons Garden'], status: 'ready' },
  { id: 'agent-housing', name: 'Agent Housing', district: 'Residential Loop', x: '48%', y: '52%', purpose: 'Organizes agents by role, status, capability, approval level, and trust readiness.', relatedAgentRoles: ['All Agents', 'Manage', 'QA Agent'], relatedTools: ['agent registry', 'role cards', 'status board'], futureIntegrations: ['agent runtime', 'skills registry', 'access policies'], rooms: ['Role Residences', 'Readiness Desk', 'Status Lounge'], status: 'ready' },
  { id: 'research-zone', name: 'Research Zone', district: 'Innovation Docks', x: '30%', y: '84%', purpose: 'Explores new ideas, benchmarks, integrations, and product opportunities before delivery.', relatedAgentRoles: ['Research Agent', 'Benchmark Agent', 'Innovation Scout'], relatedTools: ['web research', 'source tracker', 'benchmark matrix'], futureIntegrations: ['web search', 'GitHub discovery', 'market signals'], rooms: ['Research Lab', 'Benchmark Room', 'Opportunity Dock'], status: 'ready' },
  { id: 'transportation-hub', name: 'Transportation Hub', district: 'Workflow Transit', x: '50%', y: '38%', purpose: 'Moves work between intake, planning, execution, review, approval, and delivery.', relatedAgentRoles: ['Orchestrator', 'Manage', 'Workflow Coordinator'], relatedTools: ['task router', 'handoff log', 'status tracker'], futureIntegrations: ['Linear', 'n8n', 'Composio', 'webhooks'], rooms: ['Intake Gate', 'Routing Floor', 'Delivery Platform'], status: 'ready' }
];

export const cityDistricts = Array.from(new Set(cityInstitutions.map((institution) => institution.district)));

// The canonical governance path is enforced by the City Core gate
// (`canRecordCompletion` in lib/city-core.ts). Keep these stages in sync.
export const cityGovernanceFlow = [
  'Claim captured',
  'Evidence attached',
  'Verification passed',
  'Approval granted',
  'Completion recorded'
];
