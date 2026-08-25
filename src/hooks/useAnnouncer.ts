import { useState } from 'react';

/**
 * Zero-width space. Invisible on screen and silent in every screen reader, so appending
 * it changes the text node without changing what a learner sees or hears.
 *
 * Written as an escape on purpose: a literal U+200B in source is invisible, and the next
 * person to tidy this file would have no way to see what they were deleting.
 */
const SILENT_MARKER = '\u200B';

export interface UseAnnouncerResult {
  /** The string to render inside the live region. */
  announcement: string;
  /** Announces a message, even if it is identical to the previous one. */
  announce: (message: string) => void;
}

/**
 * Owns the text of the app's polite live region.
 *
 * The problem this solves: repeating an announcement verbatim is the common case here —
 * grading a second flashcard or shuffling a second scenario produces the same sentence as
 * the first. With a plain `useState<string>`, React bails out of the update when the next
 * state is `Object.is`-equal to the current one, so the text node never changes and
 * assistive technology announces nothing from the second identical message onward.
 *
 * The fix is a sequence counter: every call alternates a trailing zero-width space, so the
 * rendered string differs from its predecessor on every announcement while staying visually
 * and aurally identical.
 *
 * Deliberately *not* solved by keying or remounting the live region — a region that did not
 * exist in the DOM before its content changed is frequently not announced at all.
 */
export function useAnnouncer(): UseAnnouncerResult {
  const [state, setState] = useState({ text: '', sequence: 0 });

  function announce(message: string) {
    setState((current) => ({ text: message, sequence: current.sequence + 1 }));
  }

  return {
    announcement: state.sequence % 2 === 1 ? `${state.text}${SILENT_MARKER}` : state.text,
    announce,
  };
}
