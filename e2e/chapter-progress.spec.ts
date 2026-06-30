import { expect, test } from '@playwright/test';
import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { answerFirstChapterAndSubmit, clearProgress, expandAttemptsPanel } from './helpers';

const { meta } = knowledgePack;

function readPercent(text: string | null): number {
  return Number(/(\d+)%/.exec(text ?? '')?.[1] ?? -1);
}

test.beforeEach(async ({ page }) => {
  await clearProgress(page);
});

test.describe('chapter progress', () => {
  test('marking a chapter reviewed raises completion %, flags the card Completed, and persists', async ({ page }) => {
    await page.goto('/');

    const pill = page.getByTestId('progress-pill');
    const before = readPercent(await pill.textContent());

    await page.getByRole('button', { name: meta.chapterMarkReviewedLabel }).click();

    const afterReview = readPercent(await pill.textContent());
    expect(afterReview).toBeGreaterThan(before);
    await expect(page.getByTestId('chapter-card').first()).toContainText('Completed');

    await page.reload();
    await expect(page.getByTestId('chapter-card').first()).toContainText('Completed');

    await page.getByRole('button', { name: meta.chapterMarkNotReviewedLabel }).click();
    const afterUndo = readPercent(await page.getByTestId('progress-pill').textContent());
    expect(afterUndo).toBeLessThan(afterReview);
  });

  test('submitting two quizzes accumulates two recorded attempts, newest first', async ({ page }) => {
    await page.goto('/');

    await answerFirstChapterAndSubmit(page);
    await expandAttemptsPanel(page);
    await expect(page.getByTestId('attempt-list').locator('li')).toHaveCount(1);

    // Re-selecting the active chapter resets to a fresh, unsubmitted quiz.
    await answerFirstChapterAndSubmit(page);
    await expandAttemptsPanel(page);
    await expect(page.getByTestId('attempt-list').locator('li')).toHaveCount(2);
  });

  test('switching mode with draft answers prompts a confirm that dismiss cancels and accept commits', async ({
    page,
  }) => {
    await page.goto('/');

    const practiceButton = page.getByRole('button', { name: 'Practice', exact: true });
    const examButton = page.getByRole('button', { name: 'Exam', exact: true });
    const firstAnswer = page.getByTestId('question-card').first().locator('input[type="radio"]').first();

    // Draft an answer, then dismiss the confirm → stay in practice with the draft intact.
    await firstAnswer.check();
    page.once('dialog', (dialog) => dialog.dismiss());
    await examButton.click();
    await expect(practiceButton).toHaveAttribute('aria-pressed', 'true');
    await expect(firstAnswer).toBeChecked();

    // Accept the confirm → switch to exam mode with answers cleared.
    page.once('dialog', (dialog) => dialog.accept());
    await examButton.click();
    await expect(page.getByRole('timer')).toBeVisible();
    await expect(examButton).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
});
