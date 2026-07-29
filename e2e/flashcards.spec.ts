import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { MAX_BOX } from '../src/lib/srs';
import { expect, test } from './fixtures/test';
import { REQ } from './requirements';

const { meta } = knowledgePack;

const FIRST_CHAPTER_ID = knowledgePack.syllabusChapters[0].id;

/** Cards in the default chapter's deck — the denominator of the mastery read-out. */
const CHAPTER_CARD_COUNT = knowledgePack.flashcards.filter(
  (flashcard) => flashcard.chapterId === FIRST_CHAPTER_ID,
).length;

/**
 * Grade budget for mastering the whole deck. Card selection is deterministic but
 * box-weighted and lag-limited, so a card can resurface before every other card has
 * been seen; two Easy grades per card is the floor, and this leaves generous headroom.
 * Overshooting is harmless — grading an already-mastered card leaves it at MAX_BOX.
 */
const MASTERY_GRADE_BUDGET = CHAPTER_CARD_COUNT * 5;

test.describe('flashcards SRS', () => {
  test(
    'learner can reveal a card, grade it, and advance to the next card',
    {
      tag: ['@smoke'],
      annotation: [{ type: 'requirement', description: REQ.FLASHCARD_REVIEW }],
    },
    async ({ app, flashcards }) => {
      await test.step('arrange: open the app on an unstarted deck', async () => {
        await app.goto();
        await expect(flashcards.prompt).toBeVisible();
        await expect(flashcards.level).toHaveAttribute(
          'aria-label',
          `${meta.flashcardsLevelLabel} 0 / ${MAX_BOX}`,
        );
        await expect(flashcards.mastery).toContainText(
          `0 / ${CHAPTER_CARD_COUNT} ${meta.flashcardsMasteryLabel}`,
        );
      });

      await test.step('act: reveal the answer and grade the card Good', async () => {
        await flashcards.showAnswer();
        await expect(flashcards.answer).toBeVisible();
        await expect(flashcards.gradeGroup).toBeVisible();
        await flashcards.grade('good');
      });

      await test.step('assert: the deck advances to the next unrevealed card', async () => {
        await expect(flashcards.answer).toBeHidden();
        await expect(flashcards.showAnswerButton).toBeVisible();
        await expect(app.announcer).toHaveText('Card rated. Showing the next card.');
      });
    },
  );

  test(
    'grading every card as Easy masters the whole chapter and persists across reload',
    {
      tag: ['@slow'],
      annotation: [{ type: 'requirement', description: REQ.FLASHCARD_MASTERY }],
    },
    async ({ app, flashcards }) => {
      // Mastering a full chapter takes dozens of reveal/grade round-trips, which is
      // legitimately slow on CI WebKit; triple the default timeout rather than flake.
      test.slow();

      await test.step('arrange: open the app with nothing mastered', async () => {
        await app.goto();
        await expect(flashcards.mastery).toContainText(
          `0 / ${CHAPTER_CARD_COUNT} ${meta.flashcardsMasteryLabel}`,
        );
      });

      await test.step(`act: grade Easy ${MASTERY_GRADE_BUDGET} times`, async () => {
        for (let index = 0; index < MASTERY_GRADE_BUDGET; index += 1) {
          await flashcards.reviewCard('easy');
        }
      });

      await test.step('assert: the whole deck reads as mastered', async () => {
        await expect(flashcards.mastery).toContainText(
          `${CHAPTER_CARD_COUNT} / ${CHAPTER_CARD_COUNT} ${meta.flashcardsMasteryLabel}`,
        );
      });

      await test.step('assert: mastery survives a reload', async () => {
        await app.reload();
        await expect(flashcards.mastery).toContainText(
          `${CHAPTER_CARD_COUNT} / ${CHAPTER_CARD_COUNT} ${meta.flashcardsMasteryLabel}`,
        );
      });
    },
  );
});

test.describe('scenario drills', () => {
  test(
    'learner can read a scenario with its coaching hint and shuffle to a different one',
    {
      tag: ['@smoke'],
      annotation: [{ type: 'requirement', description: REQ.SCENARIO_SHUFFLE }],
    },
    async ({ app, page }) => {
      const scenarioPrompt = page.getByLabel('Scenario drill prompt');
      let promptBeforeShuffle: string | null = null;

      await test.step('arrange: read the current scenario and its hint', async () => {
        await app.goto();
        await expect(scenarioPrompt).toBeVisible();
        await expect(page.getByText(meta.scenarioCoachingHintLabel)).toBeVisible();

        promptBeforeShuffle = await scenarioPrompt.textContent();
        expect(promptBeforeShuffle).not.toBeNull();
      });

      await test.step('act: shuffle the scenario', async () => {
        await page.getByRole('button', { name: meta.scenarioShuffleLabel }).click();
      });

      await test.step('assert: a different scenario is announced and rendered', async () => {
        await expect(app.announcer).toHaveText('Scenario updated.');
        await expect(scenarioPrompt).toBeVisible();
        // The default (first) chapter ships multiple scenarios, so shuffle must change the prompt.
        await expect(scenarioPrompt).not.toHaveText(promptBeforeShuffle as string);
      });
    },
  );
});
