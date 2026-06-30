export type ExternalResourceCategory = 'official' | 'blog' | 'practice-questions' | 'community' | 'video';

// `contentUse` is intentionally not rendered in the UI. It documents the
// licensing / copy-policy guidance for each external source so contributors
// and AI assistants (Copilot, Claude) know what may or may not be imported
// into this repo. Keep these strings accurate when adding new resources.
export interface ExternalLearningResource {
  title: string;
  creator: string;
  category: ExternalResourceCategory;
  url: string;
  focus: string;
  whyUseIt: string;
  hasExampleQuestions: boolean;
  contentUse: string;
}

export const externalLearningResources: ExternalLearningResource[] = [
  {
    title: 'ASTQB Foundation Level resources',
    creator: 'ASTQB',
    category: 'official',
    url: 'https://astqb.org/istqb-foundation-level-resources/',
    focus: 'Official member-board syllabus, glossary, sample exams, exam rules, and preparation links.',
    whyUseIt:
      'Use this as a high-trust companion to ISTQB.org because it gathers official Foundation Level preparation material in one place.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy official sample questions or answer explanations into this repository.',
  },
  {
    title: 'ASTQB ISTQB exam questions',
    creator: 'ASTQB',
    category: 'practice-questions',
    url: 'https://astqb.org/istqb-exam-questions',
    focus: 'Official-style sample questions, answer explanations, learning objectives, and exam point values.',
    whyUseIt:
      'Use these questions to calibrate difficulty and answer-elimination habits against a member-board source.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy official or member-board question text into this repository.',
  },
  {
    title: 'Guru99 ISTQB Foundation mock tests',
    creator: 'Guru99',
    category: 'practice-questions',
    url: 'https://www.guru99.com/istqb-certification-quiz.html',
    focus: 'Free online ISTQB mock tests with 40-question practice sessions.',
    whyUseIt:
      'Use it for timed repetition and confidence building after reviewing official syllabus chapters.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy third-party mock-test questions into this repository.',
  },
  {
    title: 'Software Testing Help ISTQB question pattern and tips',
    creator: 'Software Testing Help',
    category: 'blog',
    url: 'https://www.softwaretestinghelp.com/istqb-question-pattern-and-tips-to-solve/',
    focus: 'Question-solving strategy, similar-looking options, and elimination techniques.',
    whyUseIt:
      'Use it to practice the reading discipline needed for CTFL questions with close distractors.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy blog questions, sample papers, or explanations into this repository.',
  },
  {
    title: 'ToolsQA ISTQB Foundation Level tutorial',
    creator: 'ToolsQA',
    category: 'blog',
    url: 'https://www.toolsqa.com/software-testing/istqb-foundation-level/',
    focus: 'Structured ISTQB Foundation tutorial topics, syllabus walkthroughs, and testing fundamentals.',
    whyUseIt:
      'Use it as a secondary explanation when a syllabus concept needs a more tutorial-style introduction.',
    hasExampleQuestions: false,
    contentUse: 'Link and summarize only; do not copy article text into this repository.',
  },
  {
    title: 'ISTQB Guru CTFL v4.0 study guide 2026',
    creator: 'ISTQB Guru',
    category: 'blog',
    url: 'https://istqb.guru/istqb-study-guide/',
    focus: 'CTFL v4.0 study strategy, chapter emphasis, and exam preparation recommendations.',
    whyUseIt:
      'Use it for planning a self-study schedule and comparing chapter priorities with official materials.',
    hasExampleQuestions: false,
    contentUse: 'Link and summarize only; do not copy article text into this repository.',
  },
  {
    title: 'Ministry of Testing ISTQB Foundation discussions',
    creator: 'Ministry of Testing community',
    category: 'community',
    url: 'https://club.ministryoftesting.com/t/how-to-pass-istqb-foundation-certification/34089',
    focus: 'Community discussion about study experience, motivation, and practical value of certification.',
    whyUseIt:
      'Use it to understand how working testers discuss the certification beyond exam mechanics.',
    hasExampleQuestions: false,
    contentUse: 'Link to discussions; do not copy community posts into this repository.',
  },
  {
    title: 'TM SQUARE ISTQB Foundation 4.0 tutorials',
    creator: 'Neeraj Kumar Singh / TM SQUARE',
    category: 'video',
    url: 'https://www.youtube.com/watch?v=bIbkdmHJoHs',
    focus: 'YouTube tutorial series covering CTFL 4.0 syllabus topics, exam structure, and sample-question strategy.',
    whyUseIt:
      'Use it when video explanations are easier than text, especially for test design technique walkthroughs.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy video questions, slides, transcripts, or proprietary materials.',
  },
  {
    title: 'Software Testing Mentor CTFL question explanations',
    creator: 'Software Testing Mentor',
    category: 'video',
    url: 'https://www.youtube.com/watch?v=mqbi7V4Dd5M',
    focus: 'Video explanations of ISTQB Foundation question-solving and answer elimination.',
    whyUseIt:
      'Use it to watch reasoning steps for choosing between close multiple-choice answers.',
    hasExampleQuestions: true,
    contentUse: 'Link only; do not copy video questions, transcripts, or explanations into this repository.',
  },
];
