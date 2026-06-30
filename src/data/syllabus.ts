import type { ChapterId } from '../lib/quiz';

export interface OfficialResource {
  label: string;
  url: string;
}

export interface OfficialSampleExam {
  set: 'A' | 'B' | 'C' | 'D';
  version: string;
  questionsUrl: string;
  answersUrl: string;
  redistributionPolicy: string;
}

export interface OfficialSyllabusGuide {
  title: string;
  officialUrl: string;
  stats: { label: string; value: number }[];
  usagePolicy: string;
}

export interface SyllabusSprint {
  title: string;
  chapterIds: ChapterId[];
  learningOutcome: string;
  drill: string;
  payoff: string;
}

export interface AppliedTechnique {
  id: string;
  technique: string;
  reference: string;
  expectedPractice: string;
  illustrativeExample: string;
}

export interface SyllabusChapter {
  id: ChapterId;
  order: number;
  title: string;
  weight: {
    expectedQuestions: number;
    percentage: number;
  };
  summary: string;
  learningGoals: string[];
  keyConcepts: string[];
  studyTactics: string[];
}

export const syllabusChapters: SyllabusChapter[] = [
  {
    id: 'fundamentals',
    order: 1,
    title: 'Fundamentals of Testing',
    weight: { expectedQuestions: 8, percentage: 20 },
    summary:
      'Understand why testing exists, what it can and cannot prove, and how testing principles shape everyday decisions.',
    learningGoals: [
      'Explain testing objectives and the difference between testing and debugging.',
      'Recognize the seven testing principles and their consequences.',
      'Connect test activities to quality, risk, and stakeholder confidence.',
    ],
    keyConcepts: ['error', 'defect', 'failure', 'test objective', 'testware', 'confirmation testing', 'regression testing'],
    studyTactics: [
      'Create one real-life example for each testing principle.',
      'Practice explaining why exhaustive testing is impossible in one minute.',
      'Compare testing and debugging with a cause-and-effect diagram.',
    ],
  },
  {
    id: 'sdlc',
    order: 2,
    title: 'Testing Throughout the Software Development Lifecycle',
    weight: { expectedQuestions: 5, percentage: 12.5 },
    summary:
      'Learn how test levels, test types, maintenance testing, and development models change the tester contribution.',
    learningGoals: [
      'Compare component testing, component integration testing, system testing, system integration testing, and acceptance testing.',
      'Distinguish functional, non-functional, white-box, and change-related test types.',
      'Explain how shift-left and DevOps influence testing work.',
    ],
    keyConcepts: ['test level', 'test type', 'shift-left', 'test-first approach', 'maintenance testing', 'impact analysis'],
    studyTactics: [
      'Map a feature from requirement to acceptance testing.',
      'Write a mini checklist for regression testing after a hotfix.',
      'Classify examples by test level and test type until the distinction feels natural.',
    ],
  },
  {
    id: 'static-testing',
    order: 3,
    title: 'Static Testing',
    weight: { expectedQuestions: 4, percentage: 10 },
    summary:
      'Use reviews and static analysis to find defects before execution and improve shared understanding.',
    learningGoals: [
      'Explain the value of static testing compared with dynamic testing.',
      'Identify work products that can be reviewed.',
      'Recognize review roles, review types, and useful feedback practices.',
    ],
    keyConcepts: ['static testing', 'review', 'walkthrough', 'technical review', 'inspection', 'static analysis'],
    studyTactics: [
      'Review a short user story and list ambiguities before writing tests.',
      'Practice matching review types to project situations.',
      'Separate defect discovery feedback from personal criticism in sample comments.',
    ],
  },
  {
    id: 'test-techniques',
    order: 4,
    title: 'Test Analysis and Design',
    weight: { expectedQuestions: 11, percentage: 27.5 },
    summary:
      'Turn test conditions into effective test cases using black-box, white-box, and experience-based techniques.',
    learningGoals: [
      'Apply equivalence partitioning, boundary value analysis, decision tables, and state transition testing.',
      'Understand statement and branch coverage at foundation level.',
      'Use exploratory testing and error guessing when experience is valuable.',
    ],
    keyConcepts: [
      'equivalence partitioning',
      'boundary value analysis',
      'decision table',
      'state transition',
      'statement coverage',
      'branch coverage',
      'exploratory testing',
    ],
    studyTactics: [
      'Draw boundaries for numeric inputs and name the partitions out loud.',
      'Convert business rules into a compact decision table.',
      'Calculate simple coverage percentages from tiny code snippets.',
    ],
  },
  {
    id: 'test-management',
    order: 5,
    title: 'Managing the Test Activities',
    weight: { expectedQuestions: 9, percentage: 22.5 },
    summary:
      'Plan, monitor, control, estimate, prioritize, and communicate testing work using risk and useful metrics.',
    learningGoals: [
      'Explain test planning, estimation, monitoring, and control.',
      'Use product risk to prioritize test effort.',
      'Understand defect reports, configuration management, and entry/exit criteria.',
    ],
    keyConcepts: [
      'test plan',
      'test strategy',
      'risk',
      'product risk',
      'project risk',
      'residual risk',
      'defect report',
      'test monitoring',
      'test control',
      'configuration management',
    ],
    studyTactics: [
      'Rank sample risks by likelihood and impact.',
      'Write a defect report that another person could reproduce.',
      'Choose metrics that would actually change a test management decision.',
    ],
  },
  {
    id: 'test-tools',
    order: 6,
    title: 'Test Tools',
    weight: { expectedQuestions: 3, percentage: 7.5 },
    summary:
      'Recognize tool categories, automation benefits, automation risks, and sensible tool adoption steps.',
    learningGoals: [
      'Identify common tool support for test activities.',
      'Explain benefits and risks of test automation.',
      'Describe factors that influence successful tool adoption.',
    ],
    keyConcepts: ['test automation', 'tool support', 'pilot project', 'maintainability', 'false positive', 'false negative'],
    studyTactics: [
      'List what should be automated and what still needs human judgment.',
      'Explain why record-and-playback alone can create fragile tests.',
      'Design a small pilot before committing to a tool rollout.',
    ],
  },
];

export const officialResources: OfficialResource[] = [
  {
    label: 'ISTQB CTFL v4.0 overview',
    url: 'https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0',
  },
  {
    label: 'ISTQB CTFL v4.0 syllabus downloads',
    url: 'https://istqb.org/sdm_categories/certified-tester-foundation-level-ctfl-v4-0/',
  },
  {
    label: 'ISTQB glossary',
    url: 'https://glossary.istqb.org/',
  },
];

export const officialSampleExams: OfficialSampleExam[] = [
  {
    set: 'A',
    version: 'v1.7',
    questionsUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-a-questions_v1-6/',
    answersUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-a-answers_v1-6/',
    redistributionPolicy: 'Link only. Do not copy or redistribute official question text without written permission.',
  },
  {
    set: 'B',
    version: 'v1.7',
    questionsUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-b-questions_v1-6/',
    answersUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-b-answers_v1-6/',
    redistributionPolicy: 'Link only. Do not copy or redistribute official question text without written permission.',
  },
  {
    set: 'C',
    version: 'v1.6',
    questionsUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-c-questions_v1-5/',
    answersUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-c-answers_v1-5/',
    redistributionPolicy: 'Link only. Do not copy or redistribute official question text without written permission.',
  },
  {
    set: 'D',
    version: 'v1.5',
    questionsUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-d-questions_v1-4/',
    answersUrl: 'https://www.istqb.org/sdm_downloads/istqb_ctfl_v4-0_sample-exam-d-answers_v1-4/',
    redistributionPolicy: 'Link only. Do not copy or redistribute official question text without written permission.',
  },
];

export const officialSyllabusGuide: OfficialSyllabusGuide = {
  title: 'ISTQB CTFL v4.0.1 syllabus learning guide',
  officialUrl: 'https://istqb.org/sdm_downloads/istqb-certified-tester-foundation-level-syllabus-v4-0/',
  stats: [
    { label: 'learning objectives', value: 64 },
    { label: 'business outcomes', value: 14 },
    { label: 'minutes minimum accredited training', value: 1135 },
  ],
  usagePolicy:
    'This app uses original, paraphrased study prompts based on the public syllabus structure. Link to the official syllabus and do not copy syllabus text into this repository.',
};

export const syllabusAccelerator: SyllabusSprint[] = [
  {
    title: 'Sprint 1: Testing mindset and vocabulary',
    chapterIds: ['fundamentals', 'static-testing'],
    learningOutcome:
      'Build the foundation language for the exam: why testing is needed, what testing can prove, how failures relate to defects, and how reviews improve work products early.',
    drill:
      'Explain five glossary terms aloud, then review one requirement or user story and list ambiguities before thinking about executable tests.',
    payoff:
      'These topics support many K1/K2 questions where precise wording matters and distractors often confuse testing, debugging, defects, failures, and reviews.',
  },
  {
    title: 'Sprint 2: Lifecycle, levels, and change',
    chapterIds: ['sdlc'],
    learningOutcome:
      'Separate test levels from test types, connect testing to SDLC models, and understand confirmation, regression, maintenance testing, and impact analysis.',
    drill:
      'Take one feature change and map it through component, integration, system, system integration, and acceptance perspectives with one regression risk per level.',
    payoff:
      'This reduces common mistakes where answers mix test levels, test types, and change-related testing activities.',
  },
  {
    title: 'Sprint 3: Apply test design techniques',
    chapterIds: ['test-techniques'],
    learningOutcome:
      'Practice deriving tests from partitions, boundaries, decision rules, states, code coverage ideas, and experience-based heuristics.',
    drill:
      'For one small business rule, create partitions, 2-value and 3-value boundaries, a decision table, and at least one state transition example.',
    payoff:
      'Chapter 4 is the highest-weighted chapter, and its technique questions often require applying a method rather than remembering a definition.',
  },
  {
    title: 'Sprint 4: Manage risk, evidence, and tools',
    chapterIds: ['test-management', 'test-tools'],
    learningOutcome:
      'Use risk to prioritize testing, track progress, report residual risk, write useful defects, keep testware traceable, and judge tool benefits and limitations.',
    drill:
      'Rank three product risks by likelihood and impact, write one defect report, then decide which repeated checks are good automation candidates and why.',
    payoff:
      'Chapter 5 is the second-highest-weighted chapter, and tool questions reward realistic trade-off thinking instead of automation hype.',
  },
];

export const examFacts = {
  questionCount: 40,
  durationMinutes: 60,
  passingScore: 26,
  passingPercentage: 65,
};

export const appliedTechniques: AppliedTechnique[] = [
  {
    id: 'ep',
    technique: 'Equivalence Partitioning',
    reference: 'FL-4.2.2',
    expectedPractice:
      'Split input into groups that behave the same way. Add one group for invalid input. One test per group.',
    illustrativeExample:
      'none < 100, silver 100-499, gold >= 500 -> 3 valid groups + 1 invalid = 4 tests.',
  },
  {
    id: 'bva-2',
    technique: 'Boundary Value Analysis - 2-value method',
    reference: 'FL-4.2.3',
    expectedPractice:
      'Pick the edge value and the value just outside it. Two values per boundary.',
    illustrativeExample:
      'Lower silver boundary 100 -> test 100 (in) and 99 (out).',
  },
  {
    id: 'bva-3',
    technique: 'Boundary Value Analysis - 3-value method',
    reference: 'FL-4.2.3',
    expectedPractice:
      'Pick three values at each boundary: just inside, on, just outside.',
    illustrativeExample:
      'Silver 100-499 -> {99, 100, 101} and {498, 499, 500} = 6 values.',
  },
  {
    id: 'dt',
    technique: 'Decision Table (collapsed rule count)',
    reference: 'FL-4.2.4',
    expectedPractice:
      'Count rules in the decision table. Collapse rules where one input does not change the result.',
    illustrativeExample:
      'Login: valid AND active. Collapsed table has 3 rules.',
  },
  {
    id: 'st',
    technique: 'State Transition (missing transition)',
    reference: 'FL-4.2.5',
    expectedPractice:
      'Check every state has every valid action drawn as an arrow. Missing arrow = missing transition.',
    illustrativeExample:
      'Cart "has_items" needs an arrow back to "empty" when the last item is removed.',
  },
  {
    id: 'sc',
    technique: 'Statement Coverage (minimum tests)',
    reference: 'FL-4.3.1',
    expectedPractice:
      'Statement coverage: one test that runs every line is enough.',
    illustrativeExample:
      'Two ifs, no else -> x=1, y=1 covers all statements in 1 test.',
  },
  {
    id: 'bc',
    technique: 'Branch Coverage (minimum tests)',
    reference: 'FL-4.3.2',
    expectedPractice:
      'Branch coverage: cover every if both true and false. Usually 2 tests.',
    illustrativeExample:
      'Two ifs -> {x=1, y=1} and {x=0, y=0} = 2 tests.',
  },
  {
    id: 'eg',
    technique: 'Error Guessing (defect-pattern lens)',
    reference: 'FL-4.4.1',
    expectedPractice:
      'Pick inputs that have broken software before. Think leap years, empty fields, zero, negatives.',
    illustrativeExample:
      'Date of birth -> 29 February in a non-leap year.',
  },
  {
    id: 'rbt',
    technique: 'Risk-based Prioritisation',
    reference: 'FL-5.1.3',
    expectedPractice:
      'Risk = likelihood times impact. Test the high-risk items first, low-risk last.',
    illustrativeExample:
      'C (H*H) > A (L*H) > B (H*L) > D (L*L).',
  },
  {
    id: 'tc',
    technique: 'Test Conditions from Acceptance Criteria',
    reference: 'FL-5.2.1',
    expectedPractice:
      'Cover the rule on both sides: below, equal, above. Add zero and negative.',
    illustrativeExample:
      '"Cannot withdraw more than balance" -> less, equal, greater, zero, negative.',
  },
];
