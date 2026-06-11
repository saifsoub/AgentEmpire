// S/ University — the first official "Harvard-level" agents university.
// Owners enroll their agents to elevate capabilities; a resident team of
// experts educates the agent and an examination board tests it to make sure
// the new skills are applied successfully before certification is granted.

export type UniversityProgram = {
  id: string;
  name: string;
  school: string;
  focus: string;
  outcome: string;
  facultyLead: string;
  sessions: string[];
  passMark: number;
};

export type FacultyExpert = {
  id: string;
  name: string;
  title: string;
  speciality: string;
};

export const universityFaculty: FacultyExpert[] = [
  { id: 'dean-amara', name: 'Dean Amara', title: 'Dean of S/ University', speciality: 'Curriculum governance and certification standards' },
  { id: 'prof-vance', name: 'Prof. Vance', title: 'Chair of Design Engineering', speciality: 'Agent design capability — layout, brand systems, visual judgement' },
  { id: 'prof-imani', name: 'Prof. Imani', title: 'Chair of Operations', speciality: 'Workflow decomposition, tool routing, execution reliability' },
  { id: 'prof-okafor', name: 'Prof. Okafor', title: 'Head of the Examination Board', speciality: 'Adversarial testing, evaluation rubrics, applied-skill verification' },
  { id: 'coach-lin', name: 'Coach Lin', title: 'Resident Training Coach', speciality: 'Rehearsal drills, feedback loops, retake preparation' },
];

export const universityPrograms: UniversityProgram[] = [
  {
    id: 'design-elevation',
    name: 'Design Capability Elevation',
    school: 'School of Design Engineering',
    focus: 'Elevates an agent’s designing capabilities: composition, brand systems, and visual quality control.',
    outcome: 'Agent ships design work that passes the Examination Board’s applied-skill review on real briefs.',
    facultyLead: 'Prof. Vance',
    sessions: ['Design foundations studio', 'Brand system workshop', 'Critique gauntlet with resident experts', 'Live brief rehearsal', 'Portfolio defense prep'],
    passMark: 85,
  },
  {
    id: 'execution-mastery',
    name: 'Execution & Workflow Mastery',
    school: 'School of Operations',
    focus: 'Decomposing objectives, routing tools, and finishing work with evidence attached.',
    outcome: 'Agent runs multi-step objectives end-to-end with verifiable artifacts.',
    facultyLead: 'Prof. Imani',
    sessions: ['Objective decomposition lab', 'Tool routing clinic', 'Evidence discipline seminar', 'Failure-recovery drills', 'Capstone run review'],
    passMark: 80,
  },
  {
    id: 'commerce-conduct',
    name: 'Commerce & Financial Conduct',
    school: 'School of Commerce',
    focus: 'Safe wallet usage, spend discipline, and the approval etiquette of S/ Banking.',
    outcome: 'Agent requests spends correctly, respects limits, and never moves money without human approval.',
    facultyLead: 'Dean Amara',
    sessions: ['S/ Banking protocol induction', 'Spend-request simulations', 'Limit and policy drills', 'Approval-flow etiquette', 'Conduct board review'],
    passMark: 90,
  },
];

export function getProgram(programId: string) {
  return universityPrograms.find((program) => program.id === programId);
}

// Progress advances one session at a time; each completed session with the
// faculty team contributes equally toward exam readiness.
export function sessionProgressStep(program: UniversityProgram) {
  return Math.ceil(100 / program.sessions.length);
}

// The Examination Board scores applied skill from demonstrated training.
// Deterministic: an under-trained agent cannot pass, which is the point of
// "educate and test to make sure capabilities are applied successfully".
export function computeExamScore(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress)));
}

export function examPassed(score: number, passMark: number) {
  return score >= passMark;
}
