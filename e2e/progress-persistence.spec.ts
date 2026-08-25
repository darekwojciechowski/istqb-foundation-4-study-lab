import { PROGRESS_STORAGE_KEY } from './fixtures/seed';
import { expect, test } from './fixtures/test';
import { REQ } from './requirements';

test.describe('progress persistence', () => {
  test(
    'a recorded practice attempt survives a page reload via localStorage',
    {
      tag: ['@smoke', '@critical'],
      annotation: [{ type: 'requirement', description: REQ.PROGRESS_PERSISTENCE }],
    },
    async ({ app, quiz, studyPath }) => {
      let attemptTextBeforeReload: string | null = null;

      await test.step('arrange: submit a practice attempt on the first chapter', async () => {
        await app.goto();
        await studyPath.selectChapter(0);
        await quiz.answerAll({ correct: true });
        await quiz.submit();

        await expect(app.attemptItems).toHaveCount(1);
        attemptTextBeforeReload = await app.attemptItems.first().textContent();
        expect(attemptTextBeforeReload).not.toBeNull();
      });

      await test.step('act: reload the page', async () => {
        await app.reload();
      });

      await test.step('assert: the same attempt is still listed', async () => {
        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(1);
        await expect(app.attemptItems.first()).toHaveText(attemptTextBeforeReload as string);
      });
    },
  );

  test(
    'a visitor who studies nothing leaves no stored progress behind',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.PROGRESS_DEFERRED_WRITE }],
    },
    async ({ app, flashcards, studyPath, page }) => {
      const storedProgress = () =>
        page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_STORAGE_KEY);

      await test.step('act: open the app and interact with nothing', async () => {
        await app.goto();
        // Wait for the deck as well as the heading: it renders from the same progress
        // state, so a visible card means the mount effects have finished running and a
        // write, if the app were going to make one, has already happened.
        await expect(flashcards.prompt).toBeVisible();
        await expect(app.progressPill).toHaveText('0% complete');
      });

      await test.step('assert: no storage entry was created for the visitor', async () => {
        expect(await storedProgress()).toBeNull();
      });

      // The other half of the guarantee: deferring the write must not become never
      // writing. One real study action has to produce an entry.
      await test.step('assert: the first real study action does persist', async () => {
        await studyPath.markReviewed();
        await expect(app.progressPill).not.toHaveText('0% complete');
        await expect.poll(storedProgress).not.toBeNull();
      });
    },
  );
});
