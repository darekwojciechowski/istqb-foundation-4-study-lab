import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeQuestion } from '../../test/factories';
import { useQuizState } from './useQuizState';

const FIXED_SEED = 'useQuizState-test-seed';

const questions = [
  makeQuestion({ id: 'q-1', chapterId: 'ch-1', correctOptionIndex: 1 }),
  makeQuestion({ id: 'q-2', chapterId: 'ch-1', prompt: 'Second question?' }),
  makeQuestion({ id: 'q-3', chapterId: 'ch-2', prompt: 'Third question?', correctOptionIndex: 0 }),
];

const defaultOptions = {
  questions,
  practiceCount: 2,
  examCount: 3,
  practiceChapterId: 'ch-1',
  passingPercentage: 65,
  initialSeed: FIXED_SEED,
} as const;

describe('useQuizState', () => {
  it('starts in practice mode with no answers and no submission', () => {
    const { result } = renderHook(() => useQuizState(defaultOptions));

    expect(result.current.quizMode).toBe('practice');
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.answers).toEqual({});
  });

  it('limits practice question count to practiceCount or the available pool', () => {
    const { result } = renderHook(() => useQuizState({ ...defaultOptions, practiceCount: 1 }));

    expect(result.current.quizQuestions).toHaveLength(1);
  });

  it('scores a correct selection as one correct answer', () => {
    const { result } = renderHook(() => useQuizState(defaultOptions));

    const firstQuestion = result.current.quizQuestions[0];
    expect(firstQuestion).toBeDefined();

    act(() => {
      result.current.updateAnswer(firstQuestion!.id, firstQuestion!.correctOptionIndex);
    });

    expect(result.current.answers[firstQuestion!.id]).toBe(firstQuestion!.correctOptionIndex);
    expect(result.current.score.correct).toBe(1);
  });

  it('reports the quiz as submitted once the learner submits', () => {
    const { result } = renderHook(() => useQuizState(defaultOptions));

    act(() => {
      result.current.markSubmitted();
    });

    expect(result.current.isSubmitted).toBe(true);
  });

  it('discards draft answers and the previous result when switching to exam mode', () => {
    const { result } = renderHook(() => useQuizState(defaultOptions));

    act(() => {
      const firstQuestion = result.current.quizQuestions[0];
      if (firstQuestion) result.current.updateAnswer(firstQuestion.id, 0);
      result.current.markSubmitted();
    });

    expect(result.current.isSubmitted).toBe(true);

    act(() => {
      result.current.applyContext({ mode: 'exam', seed: 'new-seed' });
    });

    expect(result.current.quizMode).toBe('exam');
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.answers).toEqual({});
  });

  it('draws exam questions from every chapter up to the exam size', () => {
    const { result } = renderHook(() => useQuizState({ ...defaultOptions, examCount: 3 }));

    act(() => {
      result.current.applyContext({ mode: 'exam', seed: 'exam-seed' });
    });

    expect(result.current.quizMode).toBe('exam');
    expect(result.current.quizQuestions).toHaveLength(3);
    const chapterIds = new Set(result.current.quizQuestions.map((q) => q.chapterId));
    expect(chapterIds.size).toBeGreaterThan(0);
  });

  it('reports draft answers only between the first answer and submission', () => {
    const { result } = renderHook(() => useQuizState(defaultOptions));

    expect(result.current.hasDraftAnswers()).toBe(false);

    act(() => {
      const firstQuestion = result.current.quizQuestions[0];
      if (firstQuestion) result.current.updateAnswer(firstQuestion.id, 0);
    });

    expect(result.current.hasDraftAnswers()).toBe(true);

    act(() => {
      result.current.markSubmitted();
    });

    expect(result.current.hasDraftAnswers()).toBe(false);
  });

  it('limits practice questions to the active chapter', () => {
    const { result } = renderHook(() => useQuizState({ ...defaultOptions, practiceCount: 5 }));

    const chapterIds = new Set(result.current.quizQuestions.map((q) => q.chapterId));
    expect(chapterIds.size).toBe(1);
    expect(chapterIds.has('ch-1')).toBe(true);
  });
});
