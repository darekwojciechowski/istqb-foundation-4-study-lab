import { expect, test } from '@playwright/test';
import { answerFirstChapterAndSubmit, clearProgress, expandAttemptsPanel } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearProgress(page);
});

test.describe('progress persistence', () => {
  test('a recorded practice attempt survives a page reload via localStorage', async ({ page }) => {
    await page.goto('/');
    await answerFirstChapterAndSubmit(page);

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
});
