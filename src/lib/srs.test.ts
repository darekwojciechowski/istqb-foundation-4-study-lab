import { describe, expect, it } from 'vitest';
import {
  countMastered,
  createCardState,
  gradeCard,
  getCardState,
  isMastered,
  isValidCardState,
  MASTERED_BOX,
  MAX_BOX,
  sanitizeCardStates,
  selectNextCardId,
  type CardStates,
} from './srs';

describe('createCardState', () => {
  it('starts at box 0 with zero views', () => {
    expect(createCardState()).toEqual({ box: 0, seen: 0 });
  });
});

describe('gradeCard', () => {
  it('drops a card back to box 0 on "again" and increments seen', () => {
    expect(gradeCard({ box: 3, seen: 4 }, 'again')).toEqual({ box: 0, seen: 5 });
  });

  it('advances one box on "good" and two on "easy"', () => {
    expect(gradeCard({ box: 1, seen: 0 }, 'good')).toEqual({ box: 2, seen: 1 });
    expect(gradeCard({ box: 1, seen: 0 }, 'easy')).toEqual({ box: 3, seen: 1 });
  });

  it('never advances past the mastered box', () => {
    expect(gradeCard({ box: MAX_BOX, seen: 0 }, 'good').box).toBe(MAX_BOX);
    expect(gradeCard({ box: MAX_BOX - 1, seen: 0 }, 'easy').box).toBe(MAX_BOX);
  });

  it('records no timestamp anywhere on the card state', () => {
    const graded = gradeCard(createCardState(), 'good');
    expect(Object.keys(graded).sort()).toEqual(['box', 'seen']);
  });
});

describe('mastery counting', () => {
  it('treats only box MASTERED_BOX as mastered', () => {
    const states: CardStates = {
      a: { box: MASTERED_BOX, seen: 3 },
      b: { box: MASTERED_BOX - 1, seen: 2 },
    };
    expect(isMastered(states.a)).toBe(true);
    expect(isMastered(states.b)).toBe(false);
    expect(countMastered(['a', 'b', 'c'], states)).toBe(1);
  });

  it('defaults unseen cards to a fresh box-0 state', () => {
    expect(getCardState({}, 'missing')).toEqual({ box: 0, seen: 0 });
  });
});

describe('selectNextCardId', () => {
  it('returns undefined for an empty set and the only id for a single card', () => {
    expect(selectNextCardId([], {}, { seed: 's' })).toBeUndefined();
    expect(selectNextCardId(['only'], {}, { seed: 's' })).toBe('only');
  });

  it('does not repeat a recent card while the lag window allows alternatives', () => {
    const cardIds = ['a', 'b', 'c', 'd'];
    const next = selectNextCardId(cardIds, {}, { seed: 'pick', recentIds: ['a'], minLag: 1 });
    expect(next).not.toBe('a');
  });

  it('favours lower boxes over mastered cards', () => {
    // Three mastered cards plus one unmastered: across many seeds the unmastered
    // card should be selected far more often than any single mastered card.
    const cardIds = ['m1', 'm2', 'm3', 'weak'];
    const states: CardStates = {
      m1: { box: MASTERED_BOX, seen: 9 },
      m2: { box: MASTERED_BOX, seen: 9 },
      m3: { box: MASTERED_BOX, seen: 9 },
      weak: { box: 0, seen: 0 },
    };

    let weakPicks = 0;
    for (let index = 0; index < 200; index += 1) {
      if (selectNextCardId(cardIds, states, { seed: `seed-${index}`, minLag: 0 }) === 'weak') {
        weakPicks += 1;
      }
    }

    expect(weakPicks).toBeGreaterThan(100);
  });

  it('is deterministic for a given seed', () => {
    const cardIds = ['a', 'b', 'c', 'd', 'e'];
    const first = selectNextCardId(cardIds, {}, { seed: 'fixed', minLag: 0 });
    const second = selectNextCardId(cardIds, {}, { seed: 'fixed', minLag: 0 });
    expect(first).toBe(second);
  });
});

describe('card-state validation', () => {
  it('accepts well-formed states and rejects malformed ones', () => {
    expect(isValidCardState({ box: 2, seen: 5 })).toBe(true);
    expect(isValidCardState({ box: 9, seen: 0 })).toBe(false);
    expect(isValidCardState({ box: 1 })).toBe(false);
    expect(isValidCardState({ box: 1.5, seen: 0 })).toBe(false);
    expect(isValidCardState(null)).toBe(false);
    expect(isValidCardState('nope')).toBe(false);
  });

  it('drops malformed entries when sanitizing a card-state map', () => {
    const sanitized = sanitizeCardStates({
      good: { box: 2, seen: 3 },
      tooHigh: { box: 99, seen: 1 },
      notObject: 7,
    });
    expect(sanitized).toEqual({ good: { box: 2, seen: 3 } });
  });

  it('returns an empty map for non-object input', () => {
    expect(sanitizeCardStates(null)).toEqual({});
    expect(sanitizeCardStates('oops')).toEqual({});
  });
});
