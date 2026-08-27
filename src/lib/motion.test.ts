import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './motion';

function stubMatchMedia(matches: boolean) {
  const matchMedia = vi.fn(
    (query: string) => ({ matches, media: query }) as unknown as MediaQueryList,
  );
  vi.stubGlobal('matchMedia', matchMedia);

  return matchMedia;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('reports the preference when the environment states it', () => {
    const matchMedia = stubMatchMedia(true);

    expect(prefersReducedMotion()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('reports no preference when the environment states none', () => {
    stubMatchMedia(false);

    expect(prefersReducedMotion()).toBe(false);
  });

  // jsdom ships no matchMedia at all, so this is the branch the unit suite runs in.
  it('falls back to no preference where matchMedia is unavailable', () => {
    expect(window.matchMedia).toBeUndefined();
    expect(prefersReducedMotion()).toBe(false);
  });
});
