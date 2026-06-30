import { useCallback, useMemo, useState } from 'react';
import type { Flashcard } from '../../data/flashcards';
import type { DeepReadonly } from '../../knowledge/types';
import {
  countMastered,
  gradeCard,
  getCardState,
  selectNextCardId,
  MAX_BOX,
  type CardGrade,
  type CardStates,
} from '../../lib/srs';

const MAX_RECENT = 5;

export interface UseFlashcardReviewOptions {
  flashcards: ReadonlyArray<DeepReadonly<Flashcard>>;
  activeChapterId: string;
  cardStates: CardStates;
  onGrade: (cardId: string, grade: CardGrade) => void;
}

export interface FlashcardReviewResult {
  currentCard: DeepReadonly<Flashcard> | undefined;
  isRevealed: boolean;
  masteredCount: number;
  totalCount: number;
  currentBox: number;
  maxBox: number;
  reveal: () => void;
  grade: (grade: CardGrade) => void;
}

interface ReviewSession {
  chapterId: string;
  currentId: string | undefined;
  isRevealed: boolean;
  recentIds: string[];
  step: number;
}

function startSession(
  chapterId: string,
  chapterCardIds: readonly string[],
  cardStates: CardStates,
): ReviewSession {
  return {
    chapterId,
    currentId: selectNextCardId(chapterCardIds, cardStates, { seed: `${chapterId}:0`, recentIds: [] }),
    isRevealed: false,
    recentIds: [],
    step: 0,
  };
}

/**
 * Drives one-card-at-a-time mastery-box flashcard review for the active chapter.
 *
 * Session state (which card, revealed, recently seen) lives here; durable mastery
 * lives in progress via the `onGrade` callback. Card selection is calendar-free:
 * the next card is chosen by box weighting plus an in-session lag (see lib/srs).
 */
export function useFlashcardReview({
  flashcards,
  activeChapterId,
  cardStates,
  onGrade,
}: UseFlashcardReviewOptions): FlashcardReviewResult {
  const chapterCards = useMemo(
    () => flashcards.filter((flashcard) => flashcard.chapterId === activeChapterId),
    [flashcards, activeChapterId],
  );
  const chapterCardIds = useMemo(() => chapterCards.map((card) => card.id), [chapterCards]);

  const [session, setSession] = useState<ReviewSession>(() =>
    startSession(activeChapterId, chapterCardIds, cardStates),
  );

  // Reset the session when the active chapter changes (adjust-state-on-prop-change
  // pattern — runs during render, before paint, with no effect).
  if (session.chapterId !== activeChapterId) {
    setSession(startSession(activeChapterId, chapterCardIds, cardStates));
  }

  const currentCard = chapterCards.find((card) => card.id === session.currentId);
  const masteredCount = countMastered(chapterCardIds, cardStates);
  const currentBox = session.currentId ? getCardState(cardStates, session.currentId).box : 0;

  const reveal = useCallback(() => {
    setSession((current) => (current.isRevealed ? current : { ...current, isRevealed: true }));
  }, []);

  const grade = useCallback(
    (nextGrade: CardGrade) => {
      const { currentId, chapterId, step, recentIds } = session;
      if (!currentId) {
        return;
      }

      onGrade(currentId, nextGrade);

      // Select against the post-grade boxes so a just-mastered card is deprioritised.
      const nextStates: CardStates = {
        ...cardStates,
        [currentId]: gradeCard(getCardState(cardStates, currentId), nextGrade),
      };
      const nextRecentIds = [currentId, ...recentIds].slice(0, MAX_RECENT);
      const nextId = selectNextCardId(chapterCardIds, nextStates, {
        seed: `${chapterId}:${step + 1}`,
        recentIds: nextRecentIds,
      });

      setSession({
        chapterId,
        currentId: nextId,
        isRevealed: false,
        recentIds: nextRecentIds,
        step: step + 1,
      });
    },
    [cardStates, chapterCardIds, onGrade, session],
  );

  return {
    currentCard,
    isRevealed: session.isRevealed,
    masteredCount,
    totalCount: chapterCardIds.length,
    currentBox,
    maxBox: MAX_BOX,
    reveal,
    grade,
  };
}
