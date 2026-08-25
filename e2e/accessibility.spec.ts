import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { Result } from 'axe-core';
import { expect, test } from './fixtures/test';
import { REQ } from './requirements';

/**
 * Automated WCAG scans of the three states a learner actually sits in.
 *
 * The AAA tag is included deliberately: the whole AAA ruleset is a real target here
 * rather than aspiration, with exactly one rule traded away by an explicit design
 * decision (see DISABLED_RULES). Automated scanning catches roughly a third of WCAG
 * issues: a green run is a floor, not a claim of conformance.
 */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag2aaa'];

/**
 * `color-contrast-enhanced` is the AAA (7:1) contrast rule, and it is off by decision
 * rather than by convenience.
 *
 * The decision: the design refresh traded the AAA 7:1 contrast target for AA
 * (>=4.5:1) in order to use the electric-blue accent palette, which cannot reach 7:1
 * against this app's dark surfaces without desaturating into grey. Every other AAA
 * rule stays switched on, so the relaxation is scoped to contrast alone rather than
 * dropping the tier wholesale.
 */
const DISABLED_RULES = ['color-contrast-enhanced'];

/** Renders violations as an actionable failure message instead of a diff of `[]`. */
function formatViolations(violations: Result[]): string {
  if (violations.length === 0) {
    return 'no accessibility violations';
  }

  return violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => `      - ${node.target.join(' ')}\n        ${node.failureSummary?.replace(/\n/g, ' ') ?? ''}`)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n${targets}`;
    })
    .join('\n');
}

/**
 * Asserts on the *rule ids* rather than the raw violation objects. Each violation
 * carries every matched node's full HTML, so a failing `toEqual([])` on the objects
 * themselves spends minutes serialising a diff and trips the test timeout — the
 * detail belongs in the message, which `formatViolations` supplies.
 */
async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .disableRules(DISABLED_RULES)
    .analyze();

  expect(
    results.violations.map((violation) => violation.id),
    formatViolations(results.violations),
  ).toEqual([]);
}

test.describe('accessibility', () => {
  // axe evaluates the rendered DOM and computed styles, which are engine-independent
  // for these rules. Running one engine keeps the matrix fast; cross-browser rendering
  // differences are covered by the functional specs.
  test.skip(({ browserName }) => browserName !== 'chromium', 'axe results are engine-independent');

  test(
    'the landing state has no automated WCAG violations',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.ACCESSIBILITY_SCAN }],
    },
    async ({ app, page }) => {
      await app.goto();

      await expectNoViolations(page);
    },
  );

  test(
    'the active chapter is marked as the current page for assistive tech',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.ACCESSIBILITY_SCAN }],
    },
    async ({ app, studyPath }) => {
      await app.goto();

      // "page" is the token that is announced as "current page"; a bare "true" is valid
      // ARIA but says only "current", which is what this navigation used to expose.
      await expect(studyPath.chapterCard(0)).toHaveAttribute('aria-current', 'page');
      await expect(studyPath.chapterCard(1)).not.toHaveAttribute('aria-current');

      await studyPath.selectChapter(1);

      await expect(studyPath.chapterCard(1)).toHaveAttribute('aria-current', 'page');
      await expect(studyPath.chapterCard(0)).not.toHaveAttribute('aria-current');
    },
  );

  test(
    'the mid-quiz state with drafted answers has no automated WCAG violations',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.ACCESSIBILITY_SCAN }],
    },
    async ({ app, quiz, page }) => {
      await app.goto();
      await quiz.questionCards.first().getByRole('radio').first().check();
      await expect(quiz.radios({ checked: true })).toHaveCount(1);

      await expectNoViolations(page);
    },
  );

  test(
    'the submitted results state has no automated WCAG violations',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.ACCESSIBILITY_SCAN }],
    },
    async ({ app, quiz, page }) => {
      await app.goto();
      await quiz.answerAll({ correct: true });
      await quiz.submit();
      await expect(quiz.result).toBeVisible();

      await expectNoViolations(page);
    },
  );
});
