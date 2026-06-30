import { useMemo, useState } from 'react';
import {
  buildAnswerReview,
  hasPassed,
  prepareQuizQuestions,
  scoreQuiz,
  type AnswerMap,
  type AnswerReview,
  type ChapterId,
  type PracticeQuestion,
  type QuizScore,
} from '../../lib/quiz';

export type QuizMode = 'practice' | 'exam';

export interface UseQuizStateOptions<TChapterId extends string = string> {
  questions: ReadonlyArray<PracticeQuestion<TChapterId>>;
  practiceCount: number;
  examCount: number;
  practiceChapterId: ChapterId<TChapterId>;
  passingPercentage: number;
  initialMode?: QuizMode;
  initialSeed: string;
}

export interface QuizState {
  quizMode: QuizMode;
  quizSeed: string;
  answers: AnswerMap;
  isSubmitted: boolean;
}

export interface QuizDerived<TChapterId extends string = string> {
  quizQuestions: PracticeQuestion<TChapterId>[];
  score: QuizScore;
  review: AnswerReview[];
  passedQuiz: boolean;
}

export interface QuizActions {
  updateAnswer: (questionId: string, optionIndex: number) => void;
  markSubmitted: () => void;
  applyContext: (next: { mode: QuizMode; seed: string }) => void;
  hasDraftAnswers: () => boolean;
}

export interface UseQuizStateResult<TChapterId extends string = string>
  extends QuizState,
    QuizDerived<TChapterId>,
    QuizActions {}

export function useQuizState<TChapterId extends string = string>({
  questions,
  practiceCount,
  examCount,
  practiceChapterId,
  passingPercentage,
  initialMode = 'practice',
  initialSeed,
}: UseQuizStateOptions<TChapterId>): UseQuizStateResult<TChapterId> {
  const [quizMode, setQuizMode] = useState<QuizMode>(initialMode);
  const [quizSeed, setQuizSeed] = useState<string>(initialSeed);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const quizQuestions = useMemo(
    () =>
      prepareQuizQuestions(questions, {
        chapterId: quizMode === 'practice' ? practiceChapterId : undefined,
        count: quizMode === 'practice' ? practiceCount : examCount,
        seed: quizSeed,
      }),
    [questions, practiceChapterId, quizMode, quizSeed, practiceCount, examCount],
  );

  const score = scoreQuiz(quizQuestions, answers);
  const review = buildAnswerReview(quizQuestions, answers);
  const passedQuiz = hasPassed(score, passingPercentage);

  function updateAnswer(questionId: string, optionIndex: number) {
    setAnswers((current) => ({ ...current, [questionId]: optionIndex }));
  }

  function markSubmitted() {
    setIsSubmitted(true);
  }

  function applyContext({ mode, seed }: { mode: QuizMode; seed: string }) {
    setQuizMode(mode);
    setQuizSeed(seed);
    setAnswers({});
    setIsSubmitted(false);
  }

  function hasDraftAnswers() {
    return !isSubmitted && Object.values(answers).some((answer) => answer !== undefined);
  }

  return {
    quizMode,
    quizSeed,
    answers,
    isSubmitted,
    quizQuestions,
    score,
    review,
    passedQuiz,
    updateAnswer,
    markSubmitted,
    applyContext,
    hasDraftAnswers,
  };
}
