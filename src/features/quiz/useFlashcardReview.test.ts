import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Flashcard } from '../../data/flashcards';
import type { CardStates } from '../../lib/srs';
import { useFlashcardReview } from './useFlashcardReview';

const flashcards: Flashcard[] = [
  { id: 'a-1', chapterId: 'alpha', prompt: 'A1?', answer: 'A1.' },
  { id: 'a-2', chapterId: 'alpha', prompt: 'A2?', answer: 'A2.' },
  { id: 'a-3', chapterId: 'alpha', prompt: 'A3?', answer: 'A3.' },
  { id: 'b-1', chapterId: 'beta', prompt: 'B1?', answer: 'B1.' },
];

function setup(activeChapterId: string, cardStates: CardStates = {}) {
  const onGrade = vi.fn();
  const view = renderHook(
    ({ chapterId, states }) =>
      useFlashcardReview({ flashcards, activeChapterId: chapterId, cardStates: states, onGrade }),
    { initialProps: { chapterId: activeChapterId, states: cardStates } },
  );
  return { onGrade, ...view };
}

describe('useFlashcardReview', () => {
  it('starts on a card from the active chapter with the answer hidden', () => {
    const { result } = setup('alpha');

    expect(result.current.currentCard?.chapterId).toBe('alpha');
    expect(result.current.isRevealed).toBe(false);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.masteredCount).toBe(0);
  });

  it('reveals the answer on demand', () => {
    const { result } = setup('alpha');

    act(() => result.current.reveal());

    expect(result.current.isRevealed).toBe(true);
  });

  it('grades the current card once and advances with the answer hidden again', () => {
    const { result, onGrade } = setup('alpha');
    const firstCardId = result.current.currentCard?.id;

    act(() => result.current.reveal());
    act(() => result.current.grade('good'));

    expect(onGrade).toHaveBeenCalledTimes(1);
    expect(onGrade).toHaveBeenCalledWith(firstCardId, 'good');
    expect(result.current.isRevealed).toBe(false);
  });

  it('exposes the current card box level out of the maximum box', () => {
    const { result } = setup('alpha', {
      'a-1': { box: 2, seen: 3 },
      'a-2': { box: 2, seen: 3 },
      'a-3': { box: 2, seen: 3 },
    });

    expect(result.current.currentBox).toBe(2);
    expect(result.current.maxBox).toBe(4);
  });

  it('reports mastery from the supplied card states', () => {
    const { result } = setup('alpha', {
      'a-1': { box: 4, seen: 6 },
      'a-2': { box: 2, seen: 3 },
    });

    expect(result.current.masteredCount).toBe(1);
  });

  it('resets to the new chapter when the active chapter changes', () => {
    const { result, rerender } = setup('alpha');

    act(() => result.current.reveal());
    rerender({ chapterId: 'beta', states: {} });

    expect(result.current.currentCard?.chapterId).toBe('beta');
    expect(result.current.isRevealed).toBe(false);
    expect(result.current.totalCount).toBe(1);
  });
});
