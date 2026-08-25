import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { demoKnowledgePack } from '../knowledge/demoKnowledgePack';
import { useQuizOrchestration } from './useQuizOrchestration';

/**
 * Drops the zero-width marker `useAnnouncer` alternates so a repeated announcement still
 * changes the live region's text node. It carries no meaning for these assertions.
 */
function spokenText(announcement: string): string {
  return announcement.replace(/\u200B/g, '');
}

describe('useQuizOrchestration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts on the first chapter with no exam running', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    expect(result.current.activeChapterId).toBe(demoKnowledgePack.syllabusChapters[0].id);
    expect(result.current.examInProgress).toBe(false);
    expect(result.current.completionPercentage).toBe(0);
  });

  it('switches to exam mode when an exam is started', () => {
    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.resetQuiz('exam');
    });

    expect(result.current.quiz.quizMode).toBe('exam');
    expect(result.current.examInProgress).toBe(true);
  });

  it('records an attempt in progress when a quiz is submitted', () => {
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

  it('raises and lowers completion as a chapter is reviewed and unreviewed', () => {
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

  it('switches chapter without confirmation when no answers are drafted', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const secondChapterId = demoKnowledgePack.syllabusChapters[1].id;

    const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

    act(() => {
      result.current.resetQuiz('practice', secondChapterId, false);
    });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result.current.activeChapterId).toBe(secondChapterId);
  });

  it('keeps draft answers when a chapter change is cancelled and discards them when confirmed', () => {
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
      expect(spokenText(result.current.announcement)).toBe('Time is up. Your exam has been submitted.');
      expect(result.current.quiz.isSubmitted).toBe(true);
      expect(result.current.progress.quizAttempts).toHaveLength(1);
      expect(result.current.progress.quizAttempts[0]?.mode).toBe('exam');
    });

    /**
     * `handleExamExpire` reads `quiz.score` out of its render closure, and stays correct
     * only because `useExamTimer` re-points its `onExpire` ref every render — the
     * countdown's interval effect deliberately excludes `onExpire` from its dependencies
     * so the clock never restarts.
     *
     * The case above answers nothing, so a stale closure that still reported `exam` and
     * `0` correct would pass it. Answering a known number first is what pins the payload.
     */
    it('records the answers given up to the moment the exam expires', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      act(() => {
        result.current.resetQuiz('exam');
      });

      const answeredCorrectly = 3;
      const examQuestions = result.current.quiz.quizQuestions;
      expect(examQuestions.length).toBeGreaterThan(answeredCorrectly);

      act(() => {
        examQuestions.slice(0, answeredCorrectly).forEach((question) => {
          result.current.quiz.updateAnswer(question.id, question.correctOptionIndex);
        });
      });

      act(() => {
        vi.advanceTimersByTime(demoKnowledgePack.examFacts.durationMinutes * 60_000 + 1_000);
      });

      const recordedAttempt = result.current.progress.quizAttempts[0];
      expect(recordedAttempt?.mode).toBe('exam');
      expect(recordedAttempt?.correct).toBe(answeredCorrectly);
      expect(recordedAttempt?.total).toBe(examQuestions.length);
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
      expect(spokenText(result.current.announcement)).toBe('Card rated. Showing the next card.');
    });
  });

  describe('scenario drill', () => {
    it('announces a scenario change when the drill is reshuffled', () => {
      const { result } = renderHook(() => useQuizOrchestration({ pack: demoKnowledgePack }));

      expect(() => {
        act(() => {
          result.current.randomizeScenario();
        });
      }).not.toThrow();

      expect(spokenText(result.current.announcement)).toBe('Scenario updated.');
    });
  });
});
