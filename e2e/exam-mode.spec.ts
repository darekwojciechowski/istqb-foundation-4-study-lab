import { expect, test } from '@playwright/test';
import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { EXAM_TOTAL, answerAll, clearProgress, expandAttemptsPanel, switchToExam } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearProgress(page);
});

test.describe('exam mode', () => {
  // The exam answers EXAM_TOTAL radios in a serial loop; give it extra headroom on
  // slower runners and across the browser matrix.
  test.slow();

  test('learner can switch to exam mode, see the countdown timer, answer all questions, and see the attempt recorded', async ({
    page,
  }) => {
    await page.goto('/');

    await switchToExam(page);
    await expect(page.getByRole('button', { name: 'Exam', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('timer')).toBeVisible();

    await answerAll(page, { correct: true });

    const resultStatus = page.getByRole('status');
    await expect(resultStatus).toBeVisible();
    await expect(resultStatus).toContainText(`Score: ${EXAM_TOTAL}/${EXAM_TOTAL} (100%)`);

    await expandAttemptsPanel(page);
    const attemptsList = page.getByTestId('attempt-list');
    await expect(attemptsList).toBeVisible();
    await expect(attemptsList.locator('li')).toHaveCount(1);
  });

  test('an exam attempt survives a page reload via localStorage', async ({ page }) => {
    await page.goto('/');
    await switchToExam(page);
    await answerAll(page, { correct: true });

    const attemptsList = page.getByTestId('attempt-list');
    await expect(attemptsList.locator('li')).toHaveCount(1);
    const attemptTextBeforeReload = await attemptsList.locator('li').first().textContent();
    expect(attemptTextBeforeReload).not.toBeNull();

    await page.reload();

    await expandAttemptsPanel(page);
    const attemptsListAfter = page.getByTestId('attempt-list');
    await expect(attemptsListAfter).toBeVisible();
    await expect(attemptsListAfter.locator('li')).toHaveCount(1);
    await expect(attemptsListAfter.locator('li').first()).toHaveText(attemptTextBeforeReload as string);
  });

  test('when the exam timer expires the quiz auto-submits and records the attempt', async ({ page }) => {
    // Freeze the clock before the app boots, then fast-forward past the deadline.
    // The timer deadline is Date.now()-based, so advancing the frozen clock trips onExpire.
    await page.clock.install();
    await page.goto('/');

    await switchToExam(page);
    await expect(page.getByRole('timer')).toBeVisible();

    await page.clock.fastForward(knowledgePack.examFacts.durationMinutes * 60_000 + 1_000);

    const resultStatus = page.getByRole('status');
    await expect(resultStatus).toBeVisible();
    await expect(resultStatus).toContainText("Time's up");

    await expandAttemptsPanel(page);
    const attemptsList = page.getByTestId('attempt-list');
    await expect(attemptsList).toBeVisible();
    await expect(attemptsList.locator('li')).toHaveCount(1);
  });
});
