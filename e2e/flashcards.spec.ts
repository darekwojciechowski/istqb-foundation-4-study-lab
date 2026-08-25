import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { MASTERED_BOX, MAX_BOX, selectNextCardId, type CardStates } from '../src/lib/srs';
import { CURRENT_PROGRESS_METADATA, seedProgress } from './fixtures/seed';
import { expect, test } from './fixtures/test';
import { REQ } from './requirements';

const { meta } = knowledgePack;

const FIRST_CHAPTER_ID = knowledgePack.syllabusChapters[0].id;

const CHAPTER_CARD_IDS = knowledgePack.flashcards
  .filter((flashcard) => flashcard.chapterId === FIRST_CHAPTER_ID)
  .map((flashcard) => flashcard.id);

/** Cards in the default chapter's deck — the denominator of the mastery read-out. */
const CHAPTER_CARD_COUNT = CHAPTER_CARD_IDS.length;

/** An `easy` grade promotes two boxes, so this is exactly one grade short of mastery. */
const ONE_GRADE_SHORT_BOX = MASTERED_BOX - 2;

const CARD_GRADED_ANNOUNCEMENT = 'Card rated. Showing the next card.';

/**
 * The zero-width space `useAnnouncer` alternates so that repeating an announcement still
 * changes the live region's text node. Invisible, silent, and stripped by Playwright's
 * text normalization — only a raw `textContent()` read can see it.
 */
const SILENT_ANNOUNCEMENT_MARKER = '\u200B';

/**
 * Builds a deck where every card is mastered except the one the app will actually
 * open on, leaving that card a single Easy grade short.
 *
 * The first card is chosen by the real box-weighted selector, and lowering a card's
 * box changes those weights — so rather than assume which card surfaces, ask the
 * selector: try each candidate as the unmastered card and keep the one the selector
 * then picks. That makes the seeding self-consistent instead of a guess, which is
 * what the previous `CHAPTER_CARD_COUNT * 5` grade budget was papering over.
 */
function seedOneGradeShortOfFullMastery(): { cardStates: CardStates; targetId: string } {
  for (const candidate of CHAPTER_CARD_IDS) {
    const cardStates: CardStates = Object.fromEntries(
      CHAPTER_CARD_IDS.map((cardId) => [
        cardId,
        { box: cardId === candidate ? ONE_GRADE_SHORT_BOX : MAX_BOX, seen: 3 },
      ]),
    );

    const firstShown = selectNextCardId(CHAPTER_CARD_IDS, cardStates, {
      seed: `${FIRST_CHAPTER_ID}:0`,
      recentIds: [],
    });

    if (firstShown === candidate) {
      return { cardStates, targetId: candidate };
    }
  }

  throw new Error('No self-consistent seeding found: the card selector opened on a mastered card');
}

test.describe('flashcards SRS', () => {
  test(
    'revealing and grading a card advances to the next card',
    {
      tag: ['@smoke'],
      annotation: [{ type: 'requirement', description: REQ.FLASHCARD_REVIEW }],
    },
    async ({ app, flashcards }) => {
      await test.step('arrange: open the app on an unstarted deck', async () => {
        await app.goto();
        await expect(flashcards.prompt).toBeVisible();
        await expect(flashcards.levelStatus).toHaveText(
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
        await expect(app.announcer).toHaveText(CARD_GRADED_ANNOUNCEMENT);
      });
    },
  );

  test(
    'a second identical grade still changes the live region text',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.FLASHCARD_REVIEW }],
    },
    async ({ app, flashcards }) => {
      await test.step('arrange: open the deck', async () => {
        await app.goto();
        await expect(flashcards.prompt).toBeVisible();
      });

      /**
       * Every grade announces the same sentence, and a live region is only spoken when
       * its text node actually changes — so it is the *second* grade that exposes the
       * defect, which is why the first flashcard spec above cannot see it.
       *
       * These assertions read raw `textContent` through `expect.poll` rather than
       * `toHaveText`, because `toHaveText` strips zero-width characters during
       * normalization and would report both grades as identical text. Grading is the
       * only thing that announces in this test, so the marker's parity is deterministic:
       * marked on the first announcement, bare on the second.
       */
      await test.step('act and assert: grade two cards identically', async () => {
        await flashcards.reviewCard('good');
        await expect
          .poll(() => app.announcer.textContent())
          .toBe(`${CARD_GRADED_ANNOUNCEMENT}${SILENT_ANNOUNCEMENT_MARKER}`);

        await flashcards.reviewCard('good');
        await expect.poll(() => app.announcer.textContent()).toBe(CARD_GRADED_ANNOUNCEMENT);
      });
    },
  );

  test(
    'the final Easy grade masters the chapter and the mastery state persists across reload',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.FLASHCARD_MASTERY }],
    },
    async ({ app, flashcards, page }) => {
      const { cardStates } = seedOneGradeShortOfFullMastery();

      await test.step('arrange: open a deck one Easy grade short of full mastery', async () => {
        await seedProgress(page, {
          ...CURRENT_PROGRESS_METADATA,
          completedChapterIds: [],
          quizAttempts: [],
          cardStates,
        });
        await app.goto();

        await expect(flashcards.mastery).toContainText(
          `${CHAPTER_CARD_COUNT - 1} / ${CHAPTER_CARD_COUNT} ${meta.flashcardsMasteryLabel}`,
        );
        // The open card is the unmastered one — the premise the single grade below rests on.
        await expect(flashcards.levelStatus).toHaveText(
          `${meta.flashcardsLevelLabel} ${ONE_GRADE_SHORT_BOX} / ${MAX_BOX}`,
        );
      });

      await test.step('act: grade the last unmastered card Easy exactly once', async () => {
        await flashcards.reviewCard('easy');
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
    'a scenario drill shows its coaching hint and shuffles to a different prompt',
    {
      tag: ['@smoke'],
      annotation: [{ type: 'requirement', description: REQ.SCENARIO_SHUFFLE }],
    },
    async ({ app, page }) => {
      const scenarioPrompt = page.getByTestId('scenario-prompt');
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
