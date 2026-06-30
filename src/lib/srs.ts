// Calendar-free spaced repetition (Leitner-style mastery boxes).
//
// "Spacing" here is measured in cards seen, never wall-clock time: a card carries
// only { box, seen } — deliberately no timestamps, no due dates, no day counters.
// This honours the maintainer constraint (no calendar) while keeping the durable-memory
// benefit of distributed retrieval practice.

export type CardGrade = 'again' | 'good' | 'easy';

export interface CardState {
  /** Leitner box 0..MAX_BOX; box MASTERED_BOX counts as mastered. */
  box: number;
  /** How many times the card has been graded. Drives within-subject progress only. */
  seen: number;
}

export type CardStates = Record<string, CardState>;

export const MIN_BOX = 0;
export const MAX_BOX = 4;
export const MASTERED_BOX = MAX_BOX;
export const DEFAULT_MIN_LAG = 2;

export function createCardState(): CardState {
  return { box: MIN_BOX, seen: 0 };
}

export function getCardState(states: CardStates, cardId: string): CardState {
  return states[cardId] ?? createCardState();
}

export function gradeCard(state: CardState, grade: CardGrade): CardState {
  const seen = state.seen + 1;

  switch (grade) {
    case 'again':
      return { box: MIN_BOX, seen };
    case 'good':
      return { box: Math.min(state.box + 1, MAX_BOX), seen };
    case 'easy':
      return { box: Math.min(state.box + 2, MAX_BOX), seen };
  }
}

export function isMastered(state: CardState): boolean {
  return state.box >= MASTERED_BOX;
}

export function countMastered(cardIds: readonly string[], states: CardStates): number {
  return cardIds.filter((cardId) => isMastered(getCardState(states, cardId))).length;
}

export interface SelectNextCardOptions {
  /** Deterministic seed for the weighted pick — keeps selection testable. */
  seed: string;
  /** Recently shown card ids; the most recent `minLag` are excluded if alternatives exist. */
  recentIds?: readonly string[];
  /** Minimum number of other cards to see before any card may repeat. */
  minLag?: number;
}

export function selectNextCardId(
  cardIds: readonly string[],
  states: CardStates,
  options: SelectNextCardOptions,
): string | undefined {
  if (cardIds.length === 0) {
    return undefined;
  }
  if (cardIds.length === 1) {
    return cardIds[0];
  }

  const minLag = clamp(options.minLag ?? DEFAULT_MIN_LAG, 0, cardIds.length - 1);
  const blocked = new Set((options.recentIds ?? []).slice(0, minLag));
  const pool = cardIds.filter((cardId) => !blocked.has(cardId));
  const eligible = pool.length > 0 ? pool : [...cardIds];

  return weightedPick(eligible, states, options.seed);
}

export function isValidCardState(value: unknown): value is CardState {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { box?: unknown; seen?: unknown };
  return (
    typeof candidate.box === 'number' &&
    Number.isInteger(candidate.box) &&
    candidate.box >= MIN_BOX &&
    candidate.box <= MAX_BOX &&
    typeof candidate.seen === 'number' &&
    Number.isInteger(candidate.seen) &&
    candidate.seen >= 0
  );
}

// Trust boundary: card states come from untrusted localStorage JSON. Keep only
// well-formed entries; their card ids are pruned naturally when no flashcard matches.
export function sanitizeCardStates(value: unknown): CardStates {
  if (value === null || typeof value !== 'object') {
    return {};
  }

  const result: CardStates = {};
  for (const [cardId, state] of Object.entries(value as Record<string, unknown>)) {
    if (isValidCardState(state)) {
      result[cardId] = { box: state.box, seen: state.seen };
    }
  }
  return result;
}

function weightedPick(cardIds: readonly string[], states: CardStates, seed: string): string {
  const weights = cardIds.map((cardId) => boxWeight(getCardState(states, cardId).box));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let target = hashSeed(seed) % totalWeight;

  for (let index = 0; index < cardIds.length; index += 1) {
    target -= weights[index];
    if (target < 0) {
      return cardIds[index];
    }
  }

  return cardIds[cardIds.length - 1];
}

// Lower boxes resurface more often: an unmastered box-0 card is weighted MAX_BOX+1
// times; a mastered box-4 card keeps a weight of 1 so it still recurs occasionally.
function boxWeight(box: number): number {
  return MAX_BOX + 1 - clamp(box, MIN_BOX, MAX_BOX);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}
