import { useMemo, useRef, useState, type RefObject } from 'react';
import type { ScenarioPrompt } from '../data/flashcards';
import type { AppliedTechnique, SyllabusChapter } from '../data/syllabus';
import { useExamTimer } from '../features/quiz/useExamTimer';
import { useFlashcardReview, type FlashcardReviewResult } from '../features/quiz/useFlashcardReview';
import { useQuizState, type QuizMode, type UseQuizStateResult } from '../features/quiz/useQuizState';
import type { DeepReadonly, KnowledgePack } from '../knowledge/types';
import { playExamEnd, playExamStart } from '../lib/examAudio';
import { recordCardGrade, recordQuizResult, toggleChapterComplete, type LearnerProgress } from '../lib/progress';
import { createQuizSeed, shuffleBySeed, type ChapterId } from '../lib/quiz';
import type { CardGrade } from '../lib/srs';
import { useProgressSync } from './useProgressSync';

const EXAM_WARNING_MILESTONES_MS = [5 * 60_000, 60_000];
const QUIZ_RESET_CONFIRMATION_MESSAGE =
  'Changing chapter or quiz mode will clear your current quiz answers. Do you want to continue?';

export interface UseQuizOrchestrationOptions {
  pack: KnowledgePack;
}

export interface QuizOrchestrationResult {
  activeChapterId: ChapterId;
  activeChapter: DeepReadonly<SyllabusChapter>;
  progress: LearnerProgress;
  completionPercentage: number;
  activeChapterCompleted: boolean;
  quiz: UseQuizStateResult;
  flashcardReview: FlashcardReviewResult;
  chapterScenario: DeepReadonly<ScenarioPrompt> | undefined;
  shuffledTechniques: ReadonlyArray<DeepReadonly<AppliedTechnique>>;
  remainingMs: number;
  examInProgress: boolean;
  examTimedOut: boolean;
  announcement: string;
  quizSectionRef: RefObject<HTMLElement | null>;
  resetQuiz: (nextMode?: QuizMode, nextChapterId?: ChapterId, shouldScroll?: boolean) => void;
  submitQuiz: () => void;
  toggleChapterReview: () => void;
  randomizeScenario: () => void;
}

export function useQuizOrchestration({ pack }: UseQuizOrchestrationOptions): QuizOrchestrationResult {
  const syllabusChapters = pack.syllabusChapters;
  const questions = pack.questions;
  const flashcards = pack.flashcards;
  const scenarios = pack.scenarios;
  const practiceQuestionCount = pack.quiz.practiceQuestionCount;
  const examQuestionCount = Math.min(pack.examFacts.questionCount, questions.length);
  const examDurationMs = pack.examFacts.durationMinutes * 60_000;

  const quizSectionRef = useRef<HTMLElement>(null);
  const [initialSeed] = useState(createQuizSeed);
  const [activeChapterId, setActiveChapterId] = useState<ChapterId>(syllabusChapters[0]?.id ?? '');
  const [scenarioSeed, setScenarioSeed] = useState(initialSeed);
  const [previousScenarioId, setPreviousScenarioId] = useState<string>();
  const [announcement, setAnnouncement] = useState('');
  const [examTimedOut, setExamTimedOut] = useState(false);
  const [progress, setProgress] = useProgressSync(pack);

  const quiz = useQuizState({
    questions,
    practiceCount: practiceQuestionCount,
    examCount: examQuestionCount,
    practiceChapterId: activeChapterId,
    passingPercentage: pack.passingRule.thresholdPercentage,
    initialSeed,
  });

  const activeChapter =
    syllabusChapters.find((chapter) => chapter.id === activeChapterId) ?? syllabusChapters[0];

  function gradeFlashcard(cardId: string, grade: CardGrade) {
    setProgress((currentProgress) => recordCardGrade(currentProgress, cardId, grade));
    setAnnouncement('Card rated. Showing the next card.');
  }

  const flashcardReview = useFlashcardReview({
    flashcards,
    activeChapterId,
    cardStates: progress.cardStates,
    onGrade: gradeFlashcard,
  });

  const shuffledTechniques = useMemo(
    () => shuffleBySeed(pack.appliedTechniques, `${initialSeed}:techniques`),
    [pack.appliedTechniques, initialSeed],
  );

  const chapterScenario = useMemo(() => {
    const chapterScenarios = scenarios.filter((scenario) => scenario.chapterId === activeChapterId);
    const shuffledScenarios = shuffleBySeed(chapterScenarios, `${scenarioSeed}:${activeChapterId}:scenario`);

    if (shuffledScenarios.length <= 1 || !previousScenarioId) {
      return shuffledScenarios[0];
    }

    return shuffledScenarios[0].id === previousScenarioId ? shuffledScenarios[1] : shuffledScenarios[0];
  }, [activeChapterId, previousScenarioId, scenarioSeed, scenarios]);

  const completionPercentage =
    syllabusChapters.length === 0
      ? 0
      : Math.round((progress.completedChapterIds.length / syllabusChapters.length) * 100);
  const activeChapterCompleted = progress.completedChapterIds.includes(activeChapterId);
  const examInProgress = quiz.quizMode === 'exam' && !quiz.isSubmitted;

  function submitQuiz() {
    const attemptScore = quiz.score;
    quiz.markSubmitted();
    playExamEnd();
    setProgress((currentProgress) =>
      recordQuizResult(currentProgress, {
        mode: quiz.quizMode,
        correct: attemptScore.correct,
        total: attemptScore.total,
        takenAt: new Date().toISOString(),
      }),
    );
  }

  function handleExamExpire() {
    setExamTimedOut(true);
    setAnnouncement('Time is up. Your exam has been submitted.');
    submitQuiz();
  }

  const { remainingMs } = useExamTimer({
    active: examInProgress,
    durationMs: examDurationMs,
    resetKey: quiz.quizSeed,
    onExpire: handleExamExpire,
    milestoneMs: EXAM_WARNING_MILESTONES_MS,
    onMilestone: (ms) =>
      setAnnouncement(`${ms === 60_000 ? '1 minute' : '5 minutes'} remaining in your exam.`),
  });

  function resetQuiz(
    nextMode: QuizMode = quiz.quizMode,
    nextChapterId: ChapterId = activeChapterId,
    shouldScrollToQuiz = true,
  ) {
    const changesQuizContext = nextMode !== quiz.quizMode || nextChapterId !== activeChapterId;

    if (quiz.hasDraftAnswers() && changesQuizContext && !window.confirm(QUIZ_RESET_CONFIRMATION_MESSAGE)) {
      return;
    }

    if (nextMode !== quiz.quizMode) {
      setAnnouncement(`Switched to ${nextMode} mode.`);
    } else if (nextChapterId !== activeChapterId) {
      const nextChapterTitle = syllabusChapters.find((chapter) => chapter.id === nextChapterId)?.title;
      if (nextChapterTitle) {
        setAnnouncement(`Now practicing: ${nextChapterTitle}.`);
      }
    }

    const nextSeed = createQuizSeed();

    setActiveChapterId(nextChapterId);
    setScenarioSeed(nextSeed);
    setPreviousScenarioId(undefined);
    setExamTimedOut(false);
    quiz.applyContext({ mode: nextMode, seed: nextSeed });
    if (nextMode === 'exam') {
      playExamStart();
    }

    if (shouldScrollToQuiz) {
      quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      quizSectionRef.current?.focus({ preventScroll: true });
    }
  }

  function toggleChapterReview() {
    setProgress((currentProgress) => toggleChapterComplete(currentProgress, activeChapterId));
  }

  function randomizeScenario() {
    setPreviousScenarioId(chapterScenario?.id);
    setScenarioSeed(createQuizSeed());
    setAnnouncement('Scenario updated.');
  }

  return {
    activeChapterId,
    activeChapter,
    progress,
    completionPercentage,
    activeChapterCompleted,
    quiz,
    flashcardReview,
    chapterScenario,
    shuffledTechniques,
    remainingMs,
    examInProgress,
    examTimedOut,
    announcement,
    quizSectionRef,
    resetQuiz,
    submitQuiz,
    toggleChapterReview,
    randomizeScenario,
  };
}
