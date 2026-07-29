# Test strategy

> Hand-written above the marker, generated below it. Run `npm run docs:traceability`
> after changing the e2e suite; do not edit the generated section by hand.

## Scope

This document covers the automated tests for the CTFL 4.0 Study Lab: what each layer
is responsible for, which risks the suite is defending against, and which requirement
is covered by which spec.

## Layers

| Layer | Tool | Runs against | Answers |
| --- | --- | --- | --- |
| Unit / component | Vitest + Testing Library (jsdom) | Modules and React components in isolation | Is the logic correct — scoring, SRS boxes, progress sanitisation, timer arithmetic, component rendering? |
| End-to-end | Playwright, four browser projects | The **production bundle** served by `vite preview` under its deployed base path | Does a real learner's journey work in a real browser, including persistence, base-path resolution, and accessibility? |

The split is deliberate: the e2e suite owns journeys, browser behaviour and the
shipped artifact; everything that can be settled by a pure function or a single
component belongs in Vitest, where it costs milliseconds instead of seconds.

## Risk register

| Risk | Why it matters | Defence |
| --- | --- | --- |
| Progress silently lost or corrupted | Progress is browser-local with no backend or account — a bad write is unrecoverable for the learner | `REQ-PROG-003`, `REQ-PROG-004`; `src/lib/progress.ts` unit tests |
| The app breaks only under its deployed base path | GitHub Pages serves the app from a sub-path; a dev-server-only suite cannot see such a break | Whole e2e suite runs against `vite preview` at the production base path |
| Wrong exam verdict at the cut score | An off-by-one at the pass threshold misleads someone about exam readiness | `REQ-QUIZ-002` — boundary value analysis at 25/26/27 of 40, with literal expectations |
| Draft answers discarded without warning | Losing a part-finished attempt to a stray click is the most annoying possible bug | `REQ-QUIZ-004` — full decision table, drafts present and absent |
| Inaccessible to keyboard or assistive tech | The app targets WCAG AA and is a study tool people use for long sessions | `REQ-A11Y-001`, `REQ-A11Y-002` |

## Conventions

- Specs address elements by role, label, then `data-testid`; never by CSS class.
- Assertions use retrying `expect()` — no fixed waits, no one-shot `textContent()`
  reads that are then asserted on.
- Fixtures (`e2e/fixtures/`) supply page objects, wipe stored progress, seed hostile
  storage, and fail any test that raises an uncaught page error.
- Every requirement id lives in `e2e/requirements.ts` and reaches the report as a
  Playwright annotation, which is what makes the matrix below derivable.

<!-- BEGIN GENERATED MATRIX -->

## Requirement traceability matrix

_Generated from `npx playwright test --list --reporter=json` on 2026-07-29._

| Requirement | Covered by | Tags |
| --- | --- | --- |
| **REQ-A11Y-001**<br>the full practice journey is completable without a pointer | `e2e/keyboard-journey.spec.ts:42` — a learner can complete and submit a practice quiz without ever using a pointer | critical |
| **REQ-A11Y-002**<br>the app raises no automated WCAG violations in its main states | `e2e/accessibility.spec.ts:67` — the landing state has no automated WCAG violations<br>`e2e/accessibility.spec.ts:80` — the mid-quiz state with drafted answers has no automated WCAG violations<br>`e2e/accessibility.spec.ts:95` — the submitted results state has no automated WCAG violations | critical |
| **REQ-CARD-001**<br>a flashcard can be revealed, graded, and replaced by the next card | `e2e/flashcards.spec.ts:54` — learner can reveal a card, grade it, and advance to the next card | smoke |
| **REQ-CARD-002**<br>mastering the last card in a chapter completes the deck and the mastery state persists | `e2e/flashcards.spec.ts:88` — the final Easy grade masters the chapter and the mastery state persists across reload | critical |
| **REQ-PROG-001**<br>marking a chapter reviewed updates completion and is reversible | `e2e/chapter-progress.spec.ts:14` — marking a chapter reviewed raises completion %, flags the card Completed, and persists | critical smoke |
| **REQ-PROG-002**<br>submitted attempts accumulate in the attempt history | `e2e/chapter-progress.spec.ts:49` — submitting two quizzes accumulates two recorded attempts<br>`e2e/exam-mode.spec.ts:11` — learner can switch to exam mode, see the countdown timer, answer all questions, and see the attempt recorded<br>`e2e/quiz-happy-path.spec.ts:9` — answering every question correctly yields a perfect score, the pass message, and a recorded attempt | critical slow smoke |
| **REQ-PROG-003**<br>progress survives a page reload via local storage | `e2e/progress-persistence.spec.ts:5` — a recorded practice attempt survives a page reload via localStorage | critical smoke |
| **REQ-PROG-004**<br>corrupted stored progress is discarded and the app boots to a clean default state | `e2e/progress-recovery.spec.ts:23` — unparseable stored progress is discarded and the app boots clean<br>`e2e/progress-recovery.spec.ts:44` — progress from a different pack or schema version is discarded<br>`e2e/progress-recovery.spec.ts:72` — garbage attempt and card-state entries are pruned from otherwise current progress | critical |
| **REQ-QUIZ-001**<br>a practice attempt is scored and reported with pass/fail messaging | `e2e/keyboard-journey.spec.ts:42` — a learner can complete and submit a practice quiz without ever using a pointer<br>`e2e/quiz-happy-path.spec.ts:9` — answering every question correctly yields a perfect score, the pass message, and a recorded attempt<br>`e2e/quiz-happy-path.spec.ts:42` — answering every question incorrectly yields a zero score and the fail message | critical smoke |
| **REQ-QUIZ-002**<br>an exam passes at or above the configured cut score and fails below it | `e2e/exam-cut-score.spec.ts:43` — the exam configuration matches the boundary cases asserted below<br>`e2e/exam-cut-score.spec.ts:59` — one below the cut score fails: 25/40<br>`e2e/exam-cut-score.spec.ts:59` — exactly the cut score passes: 26/40<br>`e2e/exam-cut-score.spec.ts:59` — one above the cut score passes: 27/40 | critical slow smoke |
| **REQ-QUIZ-003**<br>an exam runs against a countdown that auto-submits on expiry | `e2e/exam-mode.spec.ts:11` — learner can switch to exam mode, see the countdown timer, answer all questions, and see the attempt recorded<br>`e2e/exam-mode.spec.ts:47` — when the exam timer expires the quiz auto-submits and records the attempt | critical slow |
| **REQ-QUIZ-004**<br>changing chapter or mode with draft answers is confirmed before discarding | `e2e/chapter-progress.spec.ts:86` — switching mode with no draft answers switches immediately without a confirm<br>`e2e/chapter-progress.spec.ts:118` — switching mode with draft answers prompts a confirm that dismiss cancels and accept commits | critical |
| **REQ-SCEN-001**<br>a scenario drill can be shuffled to a different prompt | `e2e/flashcards.spec.ts:137` — learner can read a scenario with its coaching hint and shuffle to a different one | smoke |

**Totals:** 23 e2e scenarios covering 13 of 13 requirements.

<!-- END GENERATED MATRIX -->
