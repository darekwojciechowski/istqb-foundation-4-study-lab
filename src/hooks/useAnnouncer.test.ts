import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAnnouncer } from './useAnnouncer';

/** Strips the zero-width marker the hook alternates, leaving the message itself. */
function spokenText(announcement: string): string {
  return announcement.replace(/\u200B/g, '');
}

describe('useAnnouncer', () => {
  it('starts silent', () => {
    const { result } = renderHook(() => useAnnouncer());

    expect(result.current.announcement).toBe('');
  });

  it('renders the announced message', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Scenario updated.');
    });

    expect(spokenText(result.current.announcement)).toBe('Scenario updated.');
  });

  // The defect this hook exists for: a live region only announces when its text node
  // changes, and repeating an announcement verbatim is the common case (a second
  // flashcard grade, a second shuffle). A plain `useState<string>` bails out of the
  // identical update, and assistive tech falls silent from the second call onward.
  it('produces a different text node when the same message is announced twice', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Card rated. Showing the next card.');
    });
    const firstAnnouncement = result.current.announcement;

    act(() => {
      result.current.announce('Card rated. Showing the next card.');
    });
    const secondAnnouncement = result.current.announcement;

    expect(secondAnnouncement).not.toBe(firstAnnouncement);
    expect(spokenText(firstAnnouncement)).toBe('Card rated. Showing the next card.');
    expect(spokenText(secondAnnouncement)).toBe('Card rated. Showing the next card.');
  });

  it('keeps changing the text node across a run of identical announcements', () => {
    const { result } = renderHook(() => useAnnouncer());
    const announcements: string[] = [];

    for (let call = 0; call < 4; call += 1) {
      act(() => {
        result.current.announce('Card rated. Showing the next card.');
      });
      announcements.push(result.current.announcement);
    }

    const consecutivePairsThatDiffer = announcements.filter(
      (announcement, index) => index === 0 || announcement !== announcements[index - 1],
    );
    expect(consecutivePairsThatDiffer).toHaveLength(announcements.length);
  });
});
