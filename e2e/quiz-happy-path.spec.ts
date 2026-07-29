import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { expect, test } from './fixtures/test';
import { PRACTICE_TOTAL } from './pages/QuizPanelPage';
import { REQ } from './requirements';

const { meta } = knowledgePack;

test.describe('practice quiz', () => {
  test(
    'answering every question correctly yields a perfect score, the pass message, and a recorded attempt',
    {
      tag: ['@smoke', '@critical'],
      annotation: [
        { type: 'requirement', description: REQ.PRACTICE_SCORING },
        { type: 'requirement', description: REQ.ATTEMPT_HISTORY },
      ],
    },
    async ({ app, quiz, studyPath }) => {
      await test.step('arrange: open the app on the first chapter', async () => {
        await app.goto();
        await expect(app.heading).toBeVisible();
        await studyPath.selectChapter(0);
      });

      await test.step('act: answer every question correctly and submit', async () => {
        await quiz.answerAll({ correct: true });
        await quiz.submit();
      });

      await test.step('assert: a perfect score, the pass message, and one recorded attempt', async () => {
        await expect(quiz.result).toBeVisible();
        await expect(quiz.result).toContainText(`Score: ${PRACTICE_TOTAL}/${PRACTICE_TOTAL} (100%)`);
        await expect(quiz.result).toContainText(meta.quizPassResultMessage);

        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(1);
        await expect(app.attemptItems.first()).toContainText(`practice - ${PRACTICE_TOTAL}/${PRACTICE_TOTAL}`);
      });
    },
  );

  test(
    'answering every question incorrectly yields a zero score and the fail message',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.PRACTICE_SCORING }],
    },
    async ({ app, quiz, studyPath }) => {
      await test.step('arrange: open the app on the first chapter', async () => {
        await app.goto();
        await studyPath.selectChapter(0);
      });

      await test.step('act: answer every question incorrectly and submit', async () => {
        await quiz.answerAll({ correct: false });
        await quiz.submit();
      });

      await test.step('assert: a zero score and the fail message', async () => {
        await expect(quiz.result).toBeVisible();
        await expect(quiz.result).toContainText(`Score: 0/${PRACTICE_TOTAL} (0%)`);
        await expect(quiz.result).toContainText(meta.quizFailResultMessage);
      });
    },
  );
});
