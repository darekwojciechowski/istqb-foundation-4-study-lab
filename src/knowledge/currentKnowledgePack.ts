import { externalLearningResources } from '../data/externalResources';
import { flashcards, scenarios } from '../data/flashcards';
import { questions } from '../data/questions';
import {
  appliedTechniques,
  examFacts,
  officialResources,
  officialSampleExams,
  officialSyllabusGuide,
  syllabusAccelerator,
  syllabusChapters as syllabusChapterData,
} from '../data/syllabus';
import type { KnowledgePack } from './types';

function toNonEmptyArray<T>(items: readonly T[]): [T, ...T[]] {
  if (items.length === 0) {
    throw new Error('knowledgePack.syllabusChapters must include at least one chapter');
  }

  const [firstItem, ...restItems] = items;
  return [firstItem, ...restItems];
}

export const knowledgePack: KnowledgePack = {
  meta: {
    appTitle: 'CTFL 4.0 Study Lab — Unofficial ISTQB® Foundation Exam Preparation',
    chapterPanelTitle: 'syllabus chapters',
    heroDescription:
      'A public, English-only study space for learning core ISTQB Foundation 4.0 ideas through active recall, exam-style practice, and short scenario drills.',
    sourceNotice:
      'This project is independent and unofficial. ISTQB and CTFL names are used descriptively. The app uses original practice questions and links to official resources instead of copying official exam material.',
    legalDisclaimerIntro:
      'This is an independent and unofficial educational project created for learning purposes. It is not affiliated with ISTQB and is not endorsed by or sponsored by ISTQB. Content is provided "as is" with no warranty, no guarantee of correctness, and no guarantee that using this project will lead to passing any certification exam.',
    legalDisclaimerDetails:
      'To the maximum extent permitted by law, the maintainers accept no responsibility or liability for decisions, losses, exam outcomes, outdated information, external links, or any other use of this project. Always verify exam details, syllabus scope, terminology, and sample materials with official ISTQB sources and your exam provider.',
    examSimulatorDescription:
      'The full exam question count is provided by this knowledge pack. The starter simulator uses the currently available original questions and is ready for question-pack growth.',
    officialSampleExamsDescription:
      'ISTQB publishes official CTFL 4.0 sample exam sets. This app links to them as source material and keeps the in-app quiz original to respect redistribution limits.',
    officialSyllabusDescription:
      'The official CTFL v4.0.1 syllabus defines 14 business outcomes and 64 learning objectives. This app turns that structure into original study sprints and keeps the official document as the source of truth.',
    officialSyllabusLinkLabel: 'Open the official CTFL v4.0.1 syllabus',
    quizPassResultMessage: 'You reached the scaled CTFL passing threshold. Review the rationales anyway to strengthen recall.',
    quizFailResultMessage: 'You are below the scaled passing threshold. Review the rationales, then retry the weakest chapter.',
    appliedTechniquesEyebrow: 'Applied techniques reference',
    appliedTechniquesTitle: 'Working knowledge expected at Foundation Level',
    appliedTechniquesIntro:
      'Short, plain-English summaries of the core Foundation Level test design techniques in their applied form — the working knowledge a certified tester is expected to use when the syllabus calls for applying a technique to a real specification.',
    appliedTechniqueExpectedLabel: 'Expected practice',
    appliedTechniqueExampleLabel: 'Illustrative example',
    studyPathEyebrow: 'Study path',
    heroStartPracticeLabel: 'Start chapter practice',
    heroStartExamLabel: 'Start exam simulator',
    practiceEyebrow: 'Chapter quiz',
    examEyebrow: 'Exam simulator',
    examTitle: 'Practice under exam-style scoring',
    practiceTitlePrefix: 'Practice:',
    flashcardsEyebrow: 'Flashcards',
    flashcardsTitlePrefix: 'Active recall for',
    flashcardsShowAnswerLabel: 'Show answer',
    flashcardsAgainLabel: 'Again',
    flashcardsGoodLabel: 'Good',
    flashcardsEasyLabel: 'Easy',
    flashcardsMasteryLabel: 'mastered',
    flashcardsLevelLabel: 'Mastery level',
    flashcardsEmptyLabel: 'No flashcards are available for this chapter yet.',
    scenarioEyebrow: 'Scenario drill',
    scenarioTitle: 'Explain it like an examiner',
    scenarioShuffleLabel: 'Shuffle scenario',
    scenarioCoachingHintLabel: 'Coaching hint',
    officialReferencesEyebrow: 'Official references',
    officialReferencesTitle: 'Use the source of truth',
    officialSampleExamsEyebrow: 'Official practice material',
    officialSampleExamsTitle: 'Official sample exams',
    officialSyllabusEyebrow: 'Syllabus learning map',
    officialSyllabusTitle: 'Official syllabus accelerator',
    syllabusSprintDrillLabel: 'Drill',
    syllabusSprintPayoffLabel: 'Why it matters',
    externalResourcesEyebrow: 'Extra study material',
    externalResourcesTitle: 'Curated external learning resources',
    externalResourcesIntro:
      'Blogs, practice sites, communities, and YouTube channels with extra explanations and ready-made practice at the original source.',
    recentAttemptsEyebrow: 'Recent attempts',
    recentAttemptsTitle: 'Your local progress',
    chapterLearningGoalsLabel: 'Learning goals',
    chapterKeyConceptsLabel: 'Key concepts',
    chapterStudyTacticsLabel: 'Study tactics',
    chapterMarkReviewedLabel: 'Mark chapter as reviewed',
    chapterMarkNotReviewedLabel: 'Mark chapter as not reviewed',
  },
  examFacts,
  syllabusChapters: toNonEmptyArray(syllabusChapterData),
  questions,
  flashcards,
  scenarios,
  officialResources,
  officialSampleExams,
  officialSyllabusGuide,
  syllabusAccelerator,
  appliedTechniques,
  externalLearningResources,
  progress: {
    storageKey: 'istqb-foundation-4-progress',
    packId: 'istqb-foundation-4',
    schemaVersion: 2,
  },
  passingRule: {
    thresholdPercentage: examFacts.passingPercentage,
  },
  quiz: {
    practiceQuestionCount: 5,
    supportedDifficulties: ['foundation', 'intermediate', 'exam'] as const,
  },
};
