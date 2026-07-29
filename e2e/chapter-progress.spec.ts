import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { expect, test } from './fixtures/test';
import { PRACTICE_TOTAL } from './pages/QuizPanelPage';
import { REQ } from './requirements';

/**
 * The completion pill rounds completed/total chapters, so one reviewed chapter has a
 * single exact expected value. Deriving it from the pack keeps the assertion precise
 * (and retrying) rather than a loose "went up" comparison.
 */
const ONE_CHAPTER_PERCENTAGE = Math.round((1 / knowledgePack.syllabusChapters.length) * 100);

test.describe('chapter progress', () => {
  test(
    'marking a chapter reviewed raises completion %, flags the card Completed, and persists',
    {
      tag: ['@smoke', '@critical'],
      annotation: [{ type: 'requirement', description: REQ.CHAPTER_PROGRESS }],
    },
    async ({ app, studyPath }) => {
      await test.step('arrange: open the app with no stored progress', async () => {
        await app.goto();
        await expect(app.progressPill).toHaveText('0% complete');
      });

      await test.step('act: mark the active chapter reviewed', async () => {
        await studyPath.markReviewed();
      });

      await test.step('assert: completion rises to exactly one chapter and the card is flagged', async () => {
        await expect(app.progressPill).toHaveText(`${ONE_CHAPTER_PERCENTAGE}% complete`);
        await expect(studyPath.chapterCard(0)).toContainText('Completed');
      });

      await test.step('assert: the flag survives a reload', async () => {
        await app.reload();
        await expect(studyPath.chapterCard(0)).toContainText('Completed');
        await expect(app.progressPill).toHaveText(`${ONE_CHAPTER_PERCENTAGE}% complete`);
      });

      await test.step('assert: unmarking returns completion to zero', async () => {
        await studyPath.markNotReviewed();
        await expect(app.progressPill).toHaveText('0% complete');
        await expect(studyPath.chapterCard(0)).not.toContainText('Completed');
      });
    },
  );

  test(
    'submitting two quizzes accumulates two recorded attempts',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.ATTEMPT_HISTORY }],
    },
    async ({ app, quiz, studyPath }) => {
      await test.step('arrange: open the app on the first chapter', async () => {
        await app.goto();
      });

      await test.step('act: submit a first practice attempt', async () => {
        await studyPath.selectChapter(0);
        await quiz.answerAll({ correct: true });
        await quiz.submit();
      });

      await test.step('assert: one attempt is recorded', async () => {
        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(1);
      });

      await test.step('act: re-select the active chapter for a fresh quiz and submit again', async () => {
        // Re-selecting the active chapter resets to a fresh, unsubmitted quiz.
        await studyPath.selectChapter(0);
        await quiz.answerAll({ correct: true });
        await quiz.submit();
      });

      await test.step('assert: two attempts are recorded', async () => {
        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(2);
        await expect(app.attemptItems.first()).toContainText(`practice - ${PRACTICE_TOTAL}/${PRACTICE_TOTAL}`);
      });
    },
  );

  test(
    'switching mode with draft answers prompts a confirm that dismiss cancels and accept commits',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.QUIZ_RESET_GUARD }],
    },
    async ({ app, quiz, page }) => {
      const firstAnswer = quiz.questionCards.first().getByRole('radio').first();

      await test.step('arrange: draft an answer in practice mode', async () => {
        await app.goto();
        await firstAnswer.check();
      });

      await test.step('act + assert: dismissing the confirm keeps practice mode and the draft', async () => {
        page.once('dialog', (dialog) => dialog.dismiss());
        await quiz.modeButton('exam').click();
        await expect(quiz.modeButton('practice')).toHaveAttribute('aria-pressed', 'true');
        await expect(firstAnswer).toBeChecked();
      });

      await test.step('act + assert: accepting the confirm switches to exam with answers cleared', async () => {
        page.once('dialog', (dialog) => dialog.accept());
        await quiz.modeButton('exam').click();
        await expect(page.getByRole('timer')).toBeVisible();
        await expect(quiz.modeButton('exam')).toHaveAttribute('aria-pressed', 'true');
        await expect(quiz.radios({ checked: true })).toHaveCount(0);
      });
    },
  );
});
