import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { expect, test } from './fixtures/test';
import { EXAM_TOTAL } from './pages/QuizPanelPage';
import { REQ } from './requirements';

const { meta } = knowledgePack;

/**
 * Boundary value analysis on the single most important rule in the product.
 *
 * The pass decision is `hasPassed` (src/lib/quiz.ts), which derives the required
 * correct count from `passingRule.thresholdPercentage` — not from the display-only
 * `examFacts.passingScore`, which nothing reads. For a 40-question exam at 65%:
 * ceil(40 x 0.65) = 26, so the boundary sits between 25 (fail) and 26 (pass).
 *
 * The expectations below are deliberately *literal*. Deriving them from
 * `passingRule.thresholdPercentage` would make the suite agree with whatever
 * threshold the app happens to ship — including an off-by-one — which is precisely
 * the defect this spec exists to catch. The configuration guard test keeps the
 * literals honest: change the exam size or the cut score and it fails loudly,
 * pointing here.
 */
const ASSUMED_EXAM_TOTAL = 40;
const ASSUMED_THRESHOLD_PERCENTAGE = 65;

interface CutScoreCase {
  correct: number;
  percentage: number;
  shouldPass: boolean;
  label: string;
}

const cases: CutScoreCase[] = [
  { correct: 25, percentage: 63, shouldPass: false, label: 'one below the cut score fails' },
  { correct: 26, percentage: 65, shouldPass: true, label: 'exactly the cut score passes' },
  { correct: 27, percentage: 68, shouldPass: true, label: 'one above the cut score passes' },
];

test.describe('exam cut score', () => {
  // Each case answers EXAM_TOTAL radios in a serial loop.
  test.slow();

  test(
    'the exam configuration matches the boundary cases asserted below',
    {
      tag: ['@smoke', '@critical'],
      annotation: [{ type: 'requirement', description: REQ.EXAM_CUT_SCORE }],
    },
    async () => {
      expect(EXAM_TOTAL, 'exam question count the cut-score cases assume').toBe(ASSUMED_EXAM_TOTAL);
      expect(
        knowledgePack.passingRule.thresholdPercentage,
        'pass threshold the cut-score cases assume',
      ).toBe(ASSUMED_THRESHOLD_PERCENTAGE);
    },
  );

  for (const { correct, percentage, shouldPass, label } of cases) {
    test(
      `${label}: ${correct}/${ASSUMED_EXAM_TOTAL}`,
      {
        tag: ['@critical', '@slow'],
        annotation: [{ type: 'requirement', description: REQ.EXAM_CUT_SCORE }],
      },
      async ({ app, quiz }) => {
        await test.step('arrange: open the app in exam mode', async () => {
          await app.goto();
          await quiz.switchToExam();
          await expect(quiz.questionCards).toHaveCount(ASSUMED_EXAM_TOTAL);
        });

        await test.step(`act: answer exactly ${correct} of ${ASSUMED_EXAM_TOTAL} correctly and submit`, async () => {
          await quiz.answerExactly(correct);
          await quiz.submit();
        });

        await test.step('assert: the score, the pass/fail verdict, and the recorded attempt', async () => {
          await expect(quiz.result).toBeVisible();
          await expect(quiz.result).toContainText(
            `Score: ${correct}/${ASSUMED_EXAM_TOTAL} (${percentage}%)`,
          );
          await expect(quiz.result).toContainText(
            shouldPass ? meta.quizPassResultMessage : meta.quizFailResultMessage,
          );

          await app.expandAttempts();
          await expect(app.attemptItems).toHaveCount(1);
          await expect(app.attemptItems.first()).toContainText(
            `exam - ${correct}/${ASSUMED_EXAM_TOTAL}`,
          );
        });
      },
    );
  }
});
