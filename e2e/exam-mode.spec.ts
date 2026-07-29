import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { expect, test } from './fixtures/test';
import { EXAM_TOTAL } from './pages/QuizPanelPage';
import { REQ } from './requirements';

test.describe('exam mode', () => {
  // The exam answers EXAM_TOTAL radios in a serial loop; give it extra headroom on
  // slower runners and across the browser matrix.
  test.slow();

  test(
    'learner can switch to exam mode, see the countdown timer, answer all questions, and see the attempt recorded',
    {
      tag: ['@critical', '@slow'],
      annotation: [
        { type: 'requirement', description: REQ.EXAM_TIMER },
        { type: 'requirement', description: REQ.ATTEMPT_HISTORY },
      ],
    },
    async ({ app, quiz, page }) => {
      await test.step('arrange: open the app and switch to exam mode', async () => {
        await app.goto();
        await quiz.switchToExam();
        await expect(quiz.modeButton('exam')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('timer')).toBeVisible();
      });

      await test.step('act: answer every exam question correctly and submit', async () => {
        await quiz.answerAll({ correct: true });
        await quiz.submit();
      });

      await test.step('assert: a perfect exam score and one recorded attempt', async () => {
        await expect(quiz.result).toBeVisible();
        await expect(quiz.result).toContainText(`Score: ${EXAM_TOTAL}/${EXAM_TOTAL} (100%)`);

        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(1);
      });
    },
  );

  // Reload survival is deliberately covered once, in `progress-persistence.spec.ts`:
  // persistence is mode-agnostic (one storage key), so an exam-flavoured copy of that
  // journey costs 40 extra radio interactions to prove nothing new.

  test(
    'when the exam timer expires the quiz auto-submits and records the attempt',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.EXAM_TIMER }],
    },
    async ({ app, quiz, page }) => {
      await test.step('arrange: freeze the clock, then start an exam', async () => {
        // Freeze the clock before the app boots, then fast-forward past the deadline.
        // The timer deadline is Date.now()-based, so advancing the frozen clock trips onExpire.
        await page.clock.install();
        await app.goto();
        await quiz.switchToExam();
        await expect(page.getByRole('timer')).toBeVisible();
      });

      await test.step('act: fast-forward past the exam deadline', async () => {
        await page.clock.fastForward(knowledgePack.examFacts.durationMinutes * 60_000 + 1_000);
      });

      await test.step('assert: the exam auto-submitted and recorded an attempt', async () => {
        await expect(quiz.result).toBeVisible();
        await expect(quiz.result).toContainText("Time's up");

        await app.expandAttempts();
        await expect(app.attemptItems).toHaveCount(1);
      });
    },
  );
});
