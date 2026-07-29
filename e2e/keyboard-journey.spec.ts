import type { Page } from '@playwright/test';
import { expect, test } from './fixtures/test';
import { PRACTICE_TOTAL } from './pages/QuizPanelPage';
import { REQ } from './requirements';

interface FocusedElement {
  tag: string;
  type: string;
  /** Radio group name — the question id for a quiz radio. */
  group: string;
  text: string;
  inQuiz: boolean;
}

/** Describes whatever currently holds focus, so the walk can react instead of counting tabs. */
async function describeFocus(page: Page): Promise<FocusedElement | null> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) {
      return null;
    }

    const input = element as HTMLInputElement;
    return {
      tag: element.tagName.toLowerCase(),
      type: input.type ?? '',
      group: input.name ?? '',
      text: (element.textContent ?? '').trim().slice(0, 40),
      inQuiz: element.id === 'quiz' || element.closest('#quiz') !== null,
    };
  });
}

test.describe('keyboard-only journey', () => {
  // WebKit (desktop Safari and mobile-safari alike) ships Safari's "Press Tab to
  // highlight each item" preference off, so Tab reaches form controls but never links
  // or buttons. That is a platform default rather than an app behaviour — asserting it
  // here would test the browser. The markup this spec covers (skip link, native radio
  // groups, real buttons) is engine-independent, and the axe scans run on every state.
  test.skip(({ browserName }) => browserName === 'webkit', 'WebKit does not Tab to links by default');

  test(
    'a learner can complete and submit a practice quiz without ever using a pointer',
    {
      tag: ['@critical'],
      annotation: [
        { type: 'requirement', description: REQ.KEYBOARD_JOURNEY },
        { type: 'requirement', description: REQ.PRACTICE_SCORING },
      ],
    },
    async ({ app, quiz, page }) => {
      await test.step('arrange: open the app (the only non-keyboard action in this test)', async () => {
        await app.goto();
      });

      await test.step('act + assert: the skip link is the first tab stop and jumps to the quiz', async () => {
        await page.keyboard.press('Tab');
        await expect(app.skipLink).toBeFocused();

        await page.keyboard.press('Enter');
        expect(await describeFocus(page)).toMatchObject({ inQuiz: true });
      });

      const answeredGroups = new Set<string>();

      await test.step('act: tab through every radio group, selecting with Space', async () => {
        // Radio groups are arrow-navigated and expose a single tab stop each, so the
        // number of Tab presses between groups is a browser detail, not a contract.
        // Walk forward and react to whatever receives focus, with a bound that cannot
        // outlive the panel: a stuck focus fails on the answered-count assertion below.
        const maxSteps = 60;

        for (let step = 0; step < maxSteps && answeredGroups.size < PRACTICE_TOTAL; step += 1) {
          const focused = await describeFocus(page);

          if (focused?.type === 'radio' && !answeredGroups.has(focused.group)) {
            await page.keyboard.press('Space');
            answeredGroups.add(focused.group);
          }

          if (answeredGroups.size < PRACTICE_TOTAL) {
            await page.keyboard.press('Tab');
          }
        }
      });

      await test.step('assert: every question is answered by keyboard alone', async () => {
        expect(answeredGroups.size).toBe(PRACTICE_TOTAL);
        await expect(quiz.radios({ checked: true })).toHaveCount(PRACTICE_TOTAL);
        await expect(quiz.progressHint).toHaveText(`All ${PRACTICE_TOTAL} questions answered.`);
      });

      await test.step('act: tab to Submit and activate it with Enter', async () => {
        const maxSteps = 20;

        for (let step = 0; step < maxSteps; step += 1) {
          await page.keyboard.press('Tab');
          if (await quiz.submitButton.evaluate((button) => button === document.activeElement)) {
            break;
          }
        }

        await expect(quiz.submitButton).toBeFocused();
        await page.keyboard.press('Enter');
      });

      await test.step('assert: the attempt is scored', async () => {
        await expect(quiz.result).toBeVisible();
        await expect(quiz.result).toContainText(`/${PRACTICE_TOTAL}`);
      });
    },
  );
});
