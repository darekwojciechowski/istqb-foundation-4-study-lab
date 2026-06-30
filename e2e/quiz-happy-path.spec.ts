import { expect, test } from '@playwright/test';
import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { PRACTICE_TOTAL, answerFirstChapterAndSubmit, clearProgress, expandAttemptsPanel } from './helpers';

const { meta } = knowledgePack;

test.beforeEach(async ({ page }) => {
  await clearProgress(page);
});

test.describe('practice quiz', () => {
  test('answering every question correctly yields a perfect score, the pass message, and a recorded attempt', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await answerFirstChapterAndSubmit(page, true);

    const resultStatus = page.getByRole('status');
    await expect(resultStatus).toBeVisible();
    await expect(resultStatus).toContainText(`Score: ${PRACTICE_TOTAL}/${PRACTICE_TOTAL} (100%)`);
    await expect(resultStatus).toContainText(meta.quizPassResultMessage);

    await expandAttemptsPanel(page);
    const attemptsList = page.getByTestId('attempt-list');
    await expect(attemptsList).toBeVisible();
    await expect(attemptsList.locator('li')).toHaveCount(1);
  });

  test('answering every question incorrectly yields a zero score and the fail message', async ({ page }) => {
    await page.goto('/');

    await answerFirstChapterAndSubmit(page, false);

    const resultStatus = page.getByRole('status');
    await expect(resultStatus).toBeVisible();
    await expect(resultStatus).toContainText(`Score: 0/${PRACTICE_TOTAL} (0%)`);
    await expect(resultStatus).toContainText(meta.quizFailResultMessage);
  });
});
