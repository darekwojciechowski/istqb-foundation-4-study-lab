import type { ExternalLearningResource } from '../data/externalResources';
import type { Flashcard, ScenarioPrompt } from '../data/flashcards';
import type { AppliedTechnique, OfficialResource, OfficialSampleExam, OfficialSyllabusGuide, SyllabusChapter, SyllabusSprint } from '../data/syllabus';
import type { PracticeQuestion, QuestionDifficulty } from '../lib/quiz';

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

export type DeepReadonly<T> = T extends Primitive | ((...args: never[]) => unknown)
  ? T
  : T extends ReadonlyArray<infer Item>
    ? ReadonlyArray<DeepReadonly<Item>>
    : T extends Array<infer Item>
      ? ReadonlyArray<DeepReadonly<Item>>
      : { readonly [Key in keyof T]: DeepReadonly<T[Key]> };

export interface ShellCopy {
  readonly appTitle: string;
  readonly sourceNotice: string;
}

export interface HeroCopy {
  readonly heroDescription: string;
  readonly heroStartPracticeLabel: string;
  readonly heroStartExamLabel: string;
}

export interface StudyPathCopy {
  readonly studyPathEyebrow: string;
  readonly chapterPanelTitle: string;
}

export interface ChapterOverviewCopy {
  readonly chapterLearningGoalsLabel: string;
  readonly chapterKeyConceptsLabel: string;
  readonly chapterStudyTacticsLabel: string;
  readonly chapterMarkReviewedLabel: string;
  readonly chapterMarkNotReviewedLabel: string;
}

export interface QuizCopy {
  readonly examSimulatorDescription: string;
  readonly quizPassResultMessage: string;
  readonly quizFailResultMessage: string;
  readonly practiceEyebrow: string;
  readonly examEyebrow: string;
  readonly examTitle: string;
  readonly practiceTitlePrefix: string;
}

export interface FlashcardCopy {
  readonly flashcardsEyebrow: string;
  readonly flashcardsTitlePrefix: string;
  readonly flashcardsShowAnswerLabel: string;
  readonly flashcardsAgainLabel: string;
  readonly flashcardsGoodLabel: string;
  readonly flashcardsEasyLabel: string;
  readonly flashcardsMasteryLabel: string;
  readonly flashcardsLevelLabel: string;
  readonly flashcardsEmptyLabel: string;
}

export interface ScenarioCopy {
  readonly scenarioEyebrow: string;
  readonly scenarioTitle: string;
  readonly scenarioShuffleLabel: string;
  readonly scenarioCoachingHintLabel: string;
}

export interface AppliedTechniquesCopy {
  readonly appliedTechniquesEyebrow: string;
  readonly appliedTechniquesTitle: string;
  readonly appliedTechniquesIntro: string;
  readonly appliedTechniqueExpectedLabel: string;
  readonly appliedTechniqueExampleLabel: string;
}

export interface OfficialReferencesCopy {
  readonly officialReferencesEyebrow: string;
  readonly officialReferencesTitle: string;
}

export interface OfficialSampleExamsCopy {
  readonly officialSampleExamsEyebrow: string;
  readonly officialSampleExamsTitle: string;
  readonly officialSampleExamsDescription: string;
}

export interface OfficialSyllabusCopy {
  readonly officialSyllabusEyebrow: string;
  readonly officialSyllabusTitle: string;
  readonly officialSyllabusDescription: string;
  readonly officialSyllabusLinkLabel: string;
  readonly syllabusSprintDrillLabel: string;
  readonly syllabusSprintPayoffLabel: string;
}

export interface ExternalResourcesCopy {
  readonly externalResourcesEyebrow: string;
  readonly externalResourcesTitle: string;
  readonly externalResourcesIntro: string;
}

export interface RecentAttemptsCopy {
  readonly recentAttemptsEyebrow: string;
  readonly recentAttemptsTitle: string;
}

export interface LegalCopy {
  readonly legalDisclaimerIntro: string;
  readonly legalDisclaimerDetails: string;
}

export type KnowledgePackMeta =
  ShellCopy &
  HeroCopy &
  StudyPathCopy &
  ChapterOverviewCopy &
  QuizCopy &
  FlashcardCopy &
  ScenarioCopy &
  AppliedTechniquesCopy &
  OfficialReferencesCopy &
  OfficialSampleExamsCopy &
  OfficialSyllabusCopy &
  ExternalResourcesCopy &
  RecentAttemptsCopy &
  LegalCopy;

export interface KnowledgePackPassingRule {
  readonly thresholdPercentage: number;
}

export interface KnowledgePackProgressConfig {
  readonly storageKey: string;
  readonly packId: string;
  readonly schemaVersion: number;
}

export interface SyllabusContent {
  readonly meta: DeepReadonly<KnowledgePackMeta>;
  readonly syllabusChapters: DeepReadonly<NonEmptyReadonlyArray<SyllabusChapter>>;
  readonly officialResources: DeepReadonly<ReadonlyArray<OfficialResource>>;
  readonly officialSampleExams: DeepReadonly<ReadonlyArray<OfficialSampleExam>>;
  readonly officialSyllabusGuide: DeepReadonly<OfficialSyllabusGuide>;
  readonly syllabusAccelerator: DeepReadonly<ReadonlyArray<SyllabusSprint>>;
}

export interface ProgressDomain {
  readonly progress: DeepReadonly<KnowledgePackProgressConfig>;
}

export interface KnowledgePack {
  readonly meta: DeepReadonly<KnowledgePackMeta>;
  readonly examFacts: DeepReadonly<{
    questionCount: number;
    durationMinutes: number;
    passingScore: number;
    passingPercentage: number;
  }>;
  readonly syllabusChapters: DeepReadonly<NonEmptyReadonlyArray<SyllabusChapter>>;
  readonly questions: DeepReadonly<ReadonlyArray<PracticeQuestion>>;
  readonly flashcards: DeepReadonly<ReadonlyArray<Flashcard>>;
  readonly scenarios: DeepReadonly<ReadonlyArray<ScenarioPrompt>>;
  readonly officialResources: DeepReadonly<ReadonlyArray<OfficialResource>>;
  readonly officialSampleExams: DeepReadonly<ReadonlyArray<OfficialSampleExam>>;
  readonly officialSyllabusGuide?: DeepReadonly<OfficialSyllabusGuide>;
  readonly syllabusAccelerator: DeepReadonly<ReadonlyArray<SyllabusSprint>>;
  readonly appliedTechniques: DeepReadonly<ReadonlyArray<AppliedTechnique>>;
  readonly externalLearningResources: DeepReadonly<ReadonlyArray<ExternalLearningResource>>;
  readonly progress: DeepReadonly<KnowledgePackProgressConfig>;
  readonly passingRule: DeepReadonly<KnowledgePackPassingRule>;
  readonly quiz: DeepReadonly<{
    practiceQuestionCount: number;
    supportedDifficulties: ReadonlyArray<QuestionDifficulty>;
  }>;
}
