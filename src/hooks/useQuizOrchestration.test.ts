import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { demoKnowledgePack } from '../knowledge/demoKnowledgePack';
import { useQuizOrchestration } from './useQuizOrchestration';

describe('useQuizOrchestration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initialises with the first chapter active and exam not in progress', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    expect(result.current.activeChapterId).toBe(demoKnowledgePack.syllabusChapters[0].id);
    expect(result.current.examInProgress).toBe(false);
    expect(result.current.completionPercentage).toBe(0);
  });

  it('transitions quiz mode to exam when resetQuiz is called with "exam"', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.resetQuiz('exam');
    });

    expect(result.current.quiz.quizMode).toBe('exam');
    expect(result.current.examInProgress).toBe(true);
  });

  it('submitQuiz marks the quiz as submitted and records the attempt in progress', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.resetQuiz('practice');
    });

    const firstQuestion = result.current.quiz.quizQuestions[0];
    act(() => {
      if (firstQuestion) {
        result.current.quiz.updateAnswer(firstQuestion.id, firstQuestion.correctOptionIndex);
      }
    });

    act(() => {
      result.current.submitQuiz();
    });

    expect(result.current.quiz.isSubmitted).toBe(true);
    expect(result.current.quiz.score.total).toBeGreaterThan(0);
    expect(result.current.progress.quizAttempts).toHaveLength(1);
    expect(result.current.progress.quizAttempts[0]?.mode).toBe('practice');
    expect(result.current.progress.quizAttempts[0]?.correct).toBe(1);
    expect(result.current.progress.quizAttempts[0]?.total).toBe(result.current.quiz.quizQuestions.length);
  });

  it('toggleChapterReview updates completionPercentage and toggles back to 0', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.toggleChapterReview();
    });

    expect(result.current.completionPercentage).toBeGreaterThan(0);

    act(() => {
      result.current.toggleChapterReview();
    });

    expect(result.current.completionPercentage).toBe(0);
  });

  it('chapter switch without draft answers skips the confirm dialog', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const secondChapterId = demoKnowledgePack.syllabusChapters[1].id;

    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.resetQuiz('practice', secondChapterId, false);
    });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result.current.activeChapterId).toBe(secondChapterId);
  });

  it('chapter switch with draft answers triggers confirm; blocks on false, proceeds on true', () => {
    const secondChapterId = demoKnowledgePack.syllabusChapters[1].id;
    const firstChapterId = demoKnowledgePack.syllabusChapters[0].id;

    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      const firstQuestion = result.current.quiz.quizQuestions[0];
      if (firstQuestion) {
        result.current.quiz.updateAnswer(firstQuestion.id, 0);
      }
    });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

    act(() => {
      result.current.resetQuiz('practice', secondChapterId, false);
    });

    expect(result.current.activeChapterId).toBe(firstChapterId);

    confirmSpy.mockReturnValueOnce(true);

    act(() => {
      result.current.resetQuiz('practice', secondChapterId, false);
    });

    expect(result.current.activeChapterId).toBe(secondChapterId);
  });

  describe('exam expiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-submits and records an exam attempt when the timer runs out', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      act(() => {
        result.current.resetQuiz('exam');
      });

      expect(result.current.examInProgress).toBe(true);

      act(() => {
        vi.advanceTimersByTime(demoKnowledgePack.examFacts.durationMinutes * 60_000 + 1_000);
      });

      expect(result.current.examTimedOut).toBe(true);
      expect(result.current.announcement).toBe('Time is up. Your exam has been submitted.');
      expect(result.current.quiz.isSubmitted).toBe(true);
      expect(result.current.progress.quizAttempts).toHaveLength(1);
      expect(result.current.progress.quizAttempts[0]?.mode).toBe('exam');
    });
  });

  describe('flashcard review', () => {
    it('starts on a card for the active chapter with nothing mastered', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      expect(result.current.flashcardReview.totalCount).toBeGreaterThan(0);
      expect(result.current.flashcardReview.masteredCount).toBe(0);
      expect(result.current.flashcardReview.currentCard).toBeDefined();
    });

    it('reveals then grades a card, persisting mastery state in progress', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      act(() => {
        result.current.flashcardReview.reveal();
      });
      expect(result.current.flashcardReview.isRevealed).toBe(true);

      act(() => {
        result.current.flashcardReview.grade('good');
      });

      expect(result.current.flashcardReview.isRevealed).toBe(false);
      expect(Object.keys(result.current.progress.cardStates).length).toBeGreaterThan(0);
      expect(result.current.announcement).toBe('Card rated. Showing the next card.');
    });
  });

  describe('randomizers', () => {
    it('randomizeScenario updates the announcement without throwing', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      expect(() => {
        act(() => {
          result.current.randomizeScenario();
        });
      }).not.toThrow();

      expect(result.current.announcement).toBe('Scenario updated.');
    });
  });
});
