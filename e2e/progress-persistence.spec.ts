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
});
