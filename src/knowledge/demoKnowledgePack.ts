import type { KnowledgePack } from './types';

/**
 * A second, deliberately non-ISTQB knowledge pack ("World Capitals & Geography").
 *
 * It exists to prove the founding premise: swapping only the pack re-skins the entire
 * app with no component or logic edits. It intentionally omits the certification-only
 * sections (official resources, sample exams, syllabus guide, applied techniques) to
 * exercise their optional rendering. Kept small and ASCII-only; it is a fixture, so it
 * is not held to the active pack's per-chapter content minimums.
 */
export const demoKnowledgePack: KnowledgePack = {
  meta: {
    appTitle: 'World Capitals Study Lab',
    chapterPanelTitle: 'regions',
    heroDescription:
      'A small study space for learning the capitals and geography of the world through active recall and short timed quizzes.',
    sourceNotice:
      'This is an original, independent study demo. All questions and notes are written from scratch.',
    legalDisclaimerIntro:
      'This is an independent educational demo created for learning purposes. Content is provided "as is" with no warranty and no guarantee of correctness.',
    legalDisclaimerDetails:
      'To the maximum extent permitted by law, the maintainers accept no responsibility for decisions, losses, or any other use of this demo. Always verify geographic facts with an authoritative reference.',
    examSimulatorDescription:
      'The timed quiz draws from the available questions and is ready to grow as more are added.',
    officialSampleExamsDescription: 'No official sample sets are bundled with this demo pack.',
    officialSyllabusDescription: 'This demo has no official syllabus.',
    officialSyllabusLinkLabel: 'Open the reference',
    quizPassResultMessage: 'You reached the passing threshold. Review the explanations to reinforce recall.',
    quizFailResultMessage: 'You are below the passing threshold. Review the explanations, then try again.',
    appliedTechniquesEyebrow: 'Applied techniques',
    appliedTechniquesTitle: 'Working knowledge',
    appliedTechniquesIntro: 'Short summaries of the techniques expected in this subject.',
    appliedTechniqueExpectedLabel: 'Expected practice',
    appliedTechniqueExampleLabel: 'Example',
    studyPathEyebrow: 'Study path',
    heroStartPracticeLabel: 'Start region practice',
    heroStartExamLabel: 'Start timed quiz',
    practiceEyebrow: 'Region quiz',
    examEyebrow: 'Timed quiz',
    examTitle: 'Practice under timed scoring',
    practiceTitlePrefix: 'Practice:',
    flashcardsEyebrow: 'Flashcards',
    flashcardsTitlePrefix: 'Active recall for',
    flashcardsShowAnswerLabel: 'Show answer',
    flashcardsAgainLabel: 'Again',
    flashcardsGoodLabel: 'Good',
    flashcardsEasyLabel: 'Easy',
    flashcardsMasteryLabel: 'mastered',
    flashcardsLevelLabel: 'Mastery level',
    flashcardsEmptyLabel: 'No flashcards are available for this region yet.',
    scenarioEyebrow: 'Scenario drill',
    scenarioTitle: 'Explain it in your own words',
    scenarioShuffleLabel: 'Shuffle scenario',
    scenarioCoachingHintLabel: 'Coaching hint',
    officialReferencesEyebrow: 'References',
    officialReferencesTitle: 'Trusted references',
    officialSampleExamsEyebrow: 'Practice material',
    officialSampleExamsTitle: 'Sample quizzes',
    officialSyllabusEyebrow: 'Learning map',
    officialSyllabusTitle: 'Study accelerator',
    syllabusSprintDrillLabel: 'Drill',
    syllabusSprintPayoffLabel: 'Why it matters',
    externalResourcesEyebrow: 'Extra study material',
    externalResourcesTitle: 'Curated external learning resources',
    externalResourcesIntro:
      'Atlases, map quizzes, and communities with extra explanations and ready-made practice at the original source.',
    recentAttemptsEyebrow: 'Recent attempts',
    recentAttemptsTitle: 'Your local progress',
    chapterLearningGoalsLabel: 'Learning goals',
    chapterKeyConceptsLabel: 'Key concepts',
    chapterStudyTacticsLabel: 'Study tactics',
    chapterMarkReviewedLabel: 'Mark chapter as reviewed',
    chapterMarkNotReviewedLabel: 'Mark chapter as not reviewed',
  },
  examFacts: {
    questionCount: 4,
    durationMinutes: 10,
    passingScore: 3,
    passingPercentage: 65,
  },
  syllabusChapters: [
    {
      id: 'europe',
      order: 1,
      title: 'Capitals of Europe',
      weight: { expectedQuestions: 2, percentage: 50 },
      summary: 'Learn the capital cities of major European countries and a few geographic landmarks.',
      learningGoals: ['Recall capitals of large European countries', 'Match countries to their regions'],
      keyConcepts: ['Capital city', 'Region', 'Border country'],
      studyTactics: ['Group countries by region', 'Use active recall on a blank map'],
    },
    {
      id: 'asia',
      order: 2,
      title: 'Capitals of Asia',
      weight: { expectedQuestions: 2, percentage: 50 },
      summary: 'Learn the capital cities of major Asian countries and basic regional geography.',
      learningGoals: ['Recall capitals of large Asian countries', 'Distinguish East, South, and Southeast Asia'],
      keyConcepts: ['Capital city', 'Subregion', 'Landlocked country'],
      studyTactics: ['Cluster by subregion', 'Quiz yourself on outliers first'],
    },
  ],
  questions: [
    {
      id: 'europe-1',
      chapterId: 'europe',
      difficulty: 'foundation',
      prompt: 'What is the capital city of France?',
      options: ['Lyon', 'Paris', 'Marseille', 'Nice'],
      correctOptionIndex: 1,
      explanation: 'Paris is the capital and most populous city of France.',
      reference: 'Geography basics - Western Europe',
    },
    {
      id: 'europe-2',
      chapterId: 'europe',
      difficulty: 'foundation',
      prompt: 'Which city is the capital of Spain?',
      options: ['Barcelona', 'Seville', 'Madrid', 'Valencia'],
      correctOptionIndex: 2,
      explanation: 'Madrid is the capital of Spain, located in the centre of the country.',
      reference: 'Geography basics - Southern Europe',
    },
    {
      id: 'asia-1',
      chapterId: 'asia',
      difficulty: 'foundation',
      prompt: 'What is the capital city of Japan?',
      options: ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'],
      correctOptionIndex: 2,
      explanation: 'Tokyo is the capital of Japan and one of the largest cities in the world.',
      reference: 'Geography basics - East Asia',
    },
    {
      id: 'asia-2',
      chapterId: 'asia',
      difficulty: 'foundation',
      prompt: 'Which city is the capital of South Korea?',
      options: ['Busan', 'Seoul', 'Incheon', 'Daegu'],
      correctOptionIndex: 1,
      explanation: 'Seoul is the capital and largest metropolitan area of South Korea.',
      reference: 'Geography basics - East Asia',
    },
  ],
  flashcards: [
    { id: 'fc-europe-1', chapterId: 'europe', prompt: 'Capital of Germany?', answer: 'Berlin' },
    { id: 'fc-europe-2', chapterId: 'europe', prompt: 'Capital of Italy?', answer: 'Rome' },
    { id: 'fc-asia-1', chapterId: 'asia', prompt: 'Capital of India?', answer: 'New Delhi' },
    { id: 'fc-asia-2', chapterId: 'asia', prompt: 'Capital of Thailand?', answer: 'Bangkok' },
  ],
  scenarios: [
    {
      id: 'sc-europe-1',
      chapterId: 'europe',
      prompt: 'A friend lists Geneva as the capital of Switzerland. How do you respond?',
      coachingHint: 'The capital of Switzerland is Bern, not Geneva or Zurich.',
    },
    {
      id: 'sc-asia-1',
      chapterId: 'asia',
      prompt: 'Someone says the capital of Australia is Sydney. Correct them.',
      coachingHint: 'Canberra is the capital of Australia; Sydney is the largest city.',
    },
  ],
  officialResources: [],
  officialSampleExams: [],
  syllabusAccelerator: [],
  appliedTechniques: [],
  externalLearningResources: [],
  progress: {
    storageKey: 'world-capitals-progress',
    packId: 'world-capitals',
    schemaVersion: 2,
  },
  passingRule: {
    thresholdPercentage: 65,
  },
  quiz: {
    practiceQuestionCount: 2,
    supportedDifficulties: ['foundation'],
  },
};
