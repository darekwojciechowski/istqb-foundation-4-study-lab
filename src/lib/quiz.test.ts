import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  buildAnswerReview,
  hasPassed,
  prepareQuizQuestions,
  scoreQuiz,
  selectQuestions,
  type PracticeQuestion,
} from './quiz';
import { makeQuestion } from '../test/factories';

const questions: PracticeQuestion[] = [
  makeQuestion({
    id: 'q1',
    chapterId: 'fundamentals',
    difficulty: 'foundation',
    prompt: 'What is the primary purpose of testing?',
    options: ['To prove there are no defects', 'To reduce risk by finding information', 'To replace reviews', 'To remove debugging'],
    correctOptionIndex: 1,
    explanation: 'Testing provides information about quality and risk.',
    reference: 'CTFL 4.0 chapter 1',
  }),
  makeQuestion({
    id: 'q2',
    chapterId: 'static-testing',
    difficulty: 'intermediate',
    prompt: 'Which activity is static testing?',
    options: ['Unit test execution', 'Code review', 'Load test execution', 'System test automation'],
    correctOptionIndex: 1,
    explanation: 'Reviews are static because code is not executed.',
    reference: 'CTFL 4.0 chapter 3',
  }),
  makeQuestion({
    id: 'q3',
    chapterId: 'test-techniques',
    difficulty: 'exam',
    prompt: 'Which technique is black-box?',
    options: ['Statement coverage', 'Decision coverage', 'Equivalence partitioning', 'Code review'],
    correctOptionIndex: 2,
    explanation: 'Equivalence partitioning derives tests from externally visible behavior.',
    reference: 'CTFL 4.0 chapter 4',
  }),
];

describe('scoreQuiz', () => {
  it('returns zero scores when there are no questions', () => {
    expect(scoreQuiz([], {})).toEqual({ correct: 0, total: 0, percentage: 0 });
  });

  it('counts correct answers and returns a rounded percentage', () => {
    const result = scoreQuiz(questions, { q1: 1, q2: 0, q3: 2 });

    expect(result.correct).toBe(2);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(67);
  });

  it('treats unanswered questions as incorrect', () => {
    const result = scoreQuiz(questions, { q1: 1 });

    expect(result.correct).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(33);
  });
});

describe('hasPassed', () => {
  it('returns false when total is 0', () => {
    expect(hasPassed({ correct: 0, total: 0, percentage: 0 })).toBe(false);
  });

  it('uses the ISTQB Foundation exam threshold of 26 out of 40 by default', () => {
    expect(hasPassed({ correct: 26, total: 40, percentage: 65 })).toBe(true);
    expect(hasPassed({ correct: 25, total: 40, percentage: 63 })).toBe(false);
  });

  it('supports caller-provided pass threshold percentage', () => {
    expect(hasPassed({ correct: 5, total: 10, percentage: 50 }, 50)).toBe(true);
    expect(hasPassed({ correct: 5, total: 10, percentage: 50 }, 60)).toBe(false);
  });

  it('scales the passing score for smaller practice sets', () => {
    expect(hasPassed({ correct: 2, total: 3, percentage: 67 })).toBe(true);
    expect(hasPassed({ correct: 1, total: 3, percentage: 33 })).toBe(false);
  });

  it('falls back to the default threshold when the provided value is non-finite', () => {
    const score = { correct: 7, total: 10, percentage: 70 };

    expect(hasPassed(score, Number.NaN)).toBe(true);
    expect(hasPassed(score, Number.POSITIVE_INFINITY)).toBe(true);
    expect(hasPassed(score, Number.NEGATIVE_INFINITY)).toBe(true);
  });

  it('falls back to the default threshold when the provided value is out of bounds', () => {
    const score = { correct: 7, total: 10, percentage: 70 };

    expect(hasPassed(score, 0)).toBe(true);
    expect(hasPassed(score, -5)).toBe(true);
    expect(hasPassed(score, 101)).toBe(true);
  });

  it('accepts 100 as the upper inclusive threshold boundary', () => {
    expect(hasPassed({ correct: 10, total: 10, percentage: 100 }, 100)).toBe(true);
    expect(hasPassed({ correct: 9, total: 10, percentage: 90 }, 100)).toBe(false);
  });
});

describe('selectQuestions', () => {
  it('returns a deterministic sample for a given seed', () => {
    const first = selectQuestions(questions, { count: 2, seed: 'chapter-one' });
    const second = selectQuestions(questions, { count: 2, seed: 'chapter-one' });

    expect(first.map((question) => question.id)).toEqual(second.map((question) => question.id));
    expect(first).toHaveLength(2);
  });

  it('returns an empty array when count is 0', () => {
    expect(selectQuestions(questions, { count: 0 })).toHaveLength(0);
  });

  it('filters by chapter before sampling', () => {
    const selected = selectQuestions(questions, {
      chapterId: 'static-testing',
      count: 2,
      seed: 'static',
    });

    expect(selected.map((question) => question.id)).toEqual(['q2']);
  });

  it('changes question order across seeds for sequential production-style ids', () => {
    const sequentialQuestions = Array.from({ length: 5 }, (_, index) =>
      makeQuestion({ id: `fundamentals-${index + 1}`, chapterId: 'fundamentals', prompt: `Question ${index + 1}?` }),
    );

    const firstOrder = selectQuestions(sequentialQuestions, { count: 5, seed: 'first-click' }).map((question) => question.id);
    const secondOrder = selectQuestions(sequentialQuestions, { count: 5, seed: 'second-click' }).map((question) => question.id);

    expect(firstOrder).not.toEqual(secondOrder);
  });

  it('preserves narrowed chapter-id unions through quiz selection helpers', () => {
    type PackChapterId = 'fundamentals' | 'sdlc';
    const packQuestions: PracticeQuestion<PackChapterId>[] = [
      {
        id: 'pack-q1',
        chapterId: 'fundamentals',
        difficulty: 'foundation',
        prompt: 'Pack-specific chapter question',
        options: ['A', 'B', 'C', 'D'],
        correctOptionIndex: 0,
        explanation: 'Pack-specific explanation',
        reference: 'Pack chapter 1',
      },
      {
        id: 'pack-q2',
        chapterId: 'sdlc',
        difficulty: 'foundation',
        prompt: 'Pack-specific SDLC question',
        options: ['A', 'B', 'C', 'D'],
        correctOptionIndex: 1,
        explanation: 'Pack-specific explanation',
        reference: 'Pack chapter 2',
      },
    ];

    const selected = selectQuestions(packQuestions, { chapterId: 'fundamentals', count: 1, seed: 'pack-seed' });
    expect(selected.map((question) => question.chapterId)).toEqual(['fundamentals']);
    expectTypeOf(selected).toEqualTypeOf<PracticeQuestion<PackChapterId>[]>();
  });
});

describe('prepareQuizQuestions', () => {
  it('returns all available questions when count exceeds the pool', () => {
    const result = prepareQuizQuestions(questions, { count: 100, seed: 'clamp-test' });
    expect(result).toHaveLength(questions.length);
    result.forEach((question) => {
      expect(question.options[question.correctOptionIndex]).toBeDefined();
    });
  });

  it('uses the seed to change question or answer order for a quiz session', () => {
    const firstSession = prepareQuizQuestions(questions, { count: 3, seed: 'first-session' });
    const secondSession = prepareQuizQuestions(questions, { count: 3, seed: 'second-session' });

    expect(firstSession).toHaveLength(3);
    expect(secondSession).toHaveLength(3);
    expect(firstSession.map((question) => `${question.id}:${question.options.join('|')}`)).not.toEqual(
      secondSession.map((question) => `${question.id}:${question.options.join('|')}`),
    );
  });

  it('keeps the correct answer mapped after shuffling answer options', () => {
    const prepared = prepareQuizQuestions(questions, { count: 3, seed: 'option-remap' });
    const preparedQuestion = prepared.find((question) => question.id === 'q1');

    expect(preparedQuestion).toBeDefined();
    expect(preparedQuestion?.options[preparedQuestion.correctOptionIndex]).toBe('To reduce risk by finding information');
  });
});

describe('buildAnswerReview', () => {
  it('marks each answer and keeps the rationale for study review', () => {
    const review = buildAnswerReview(questions, { q1: 1, q2: 0 });

    expect(review).toEqual([
      expect.objectContaining({
        questionId: 'q1',
        selectedOptionIndex: 1,
        correctOptionIndex: 1,
        isCorrect: true,
        explanation: 'Testing provides information about quality and risk.',
      }),
      expect.objectContaining({
        questionId: 'q2',
        selectedOptionIndex: 0,
        correctOptionIndex: 1,
        isCorrect: false,
      }),
      expect.objectContaining({
        questionId: 'q3',
        selectedOptionIndex: undefined,
        correctOptionIndex: 2,
        isCorrect: false,
      }),
    ]);
  });
});
