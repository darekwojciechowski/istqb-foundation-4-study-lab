/**
 * Requirement identifiers attached to e2e tests as Playwright annotations.
 *
 * Keeping them in one typed map makes them typo-proof and machine-readable: a
 * traceability matrix can be generated from the suite itself (`--reporter=json`
 * exposes each test's annotations) without a hand-maintained document.
 */
export const REQ = {
  PRACTICE_SCORING: 'REQ-QUIZ-001 — a practice attempt is scored and reported with pass/fail messaging',
  EXAM_CUT_SCORE: 'REQ-QUIZ-002 — an exam passes at or above the configured cut score and fails below it',
  EXAM_TIMER: 'REQ-QUIZ-003 — an exam runs against a countdown that auto-submits on expiry',
  QUIZ_RESET_GUARD: 'REQ-QUIZ-004 — changing chapter or mode with draft answers is confirmed before discarding',
  CHAPTER_PROGRESS: 'REQ-PROG-001 — marking a chapter reviewed updates completion and is reversible',
  ATTEMPT_HISTORY: 'REQ-PROG-002 — submitted attempts accumulate in the attempt history',
  PROGRESS_PERSISTENCE: 'REQ-PROG-003 — progress survives a page reload via local storage',
  PROGRESS_RECOVERY: 'REQ-PROG-004 — corrupted stored progress is discarded and the app boots to a clean default state',
  FLASHCARD_REVIEW: 'REQ-CARD-001 — a flashcard can be revealed, graded, and replaced by the next card',
  FLASHCARD_MASTERY: 'REQ-CARD-002 — mastering the last card in a chapter completes the deck and the mastery state persists',
  SCENARIO_SHUFFLE: 'REQ-SCEN-001 — a scenario drill can be shuffled to a different prompt',
  KEYBOARD_JOURNEY: 'REQ-A11Y-001 — the full practice journey is completable without a pointer',
  ACCESSIBILITY_SCAN: 'REQ-A11Y-002 — the app raises no automated WCAG violations in its main states',
} as const;

export type RequirementId = (typeof REQ)[keyof typeof REQ];
