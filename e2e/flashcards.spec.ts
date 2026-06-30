import { expect, test } from '@playwright/test';
import { knowledgePack } from '../src/knowledge/currentKnowledgePack';
import { MAX_BOX } from '../src/lib/srs';
import { clearProgress } from './helpers';

const { meta } = knowledgePack;

test.beforeEach(async ({ page }) => {
  await clearProgress(page);
});

test.describe('flashcards SRS', () => {
  test('learner can reveal a card, grade it, and advance to the next card', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('flashcard-prompt')).toBeVisible();
    await expect(page.getByTestId('flashcard-level')).toHaveAttribute(
      'aria-label',
      `${meta.flashcardsLevelLabel} 0 / ${MAX_BOX}`,
    );

    await page.getByRole('button', { name: meta.flashcardsShowAnswerLabel }).click();
    await expect(page.getByTestId('flashcard-answer')).toBeVisible();
    await expect(page.getByRole('group', { name: 'Rate your recall' })).toBeVisible();

    await page.getByRole('button', { name: meta.flashcardsGoodLabel, exact: true }).click();

    await expect(page.getByTestId('flashcard-answer')).toBeHidden();
    await expect(page.getByRole('button', { name: meta.flashcardsShowAnswerLabel })).toBeVisible();
    await expect(page.getByTestId('live-announcer')).toHaveText('Card rated. Showing the next card.');
  });

  test('grading every card as Easy masters the whole chapter and persists across reload', async ({ page }) => {
    // Mastering a full chapter takes dozens of reveal/grade round-trips, which is
    // legitimately slow on CI WebKit; triple the default timeout rather than flake.
    test.slow();
    await page.goto('/');

    const mastery = page.getByTestId('flashcard-mastery');
    const total = Number(/\d+\s*\/\s*(\d+)/.exec((await mastery.textContent()) ?? '')?.[1] ?? 0);
    expect(total).toBeGreaterThan(0);

    const showAnswer = page.getByRole('button', { name: meta.flashcardsShowAnswerLabel });
    const gradeEasy = page.getByRole('button', { name: meta.flashcardsEasyLabel, exact: true });

    // Each Easy grade moves a card +2 boxes (0->2->4=mastered), so two passes per
    // card suffice; the extra headroom absorbs the weighted/lagged card selection.
    let mastered = 0;
    for (let i = 0; i < total * 10 && mastered < total; i += 1) {
      await showAnswer.click();
      await gradeEasy.click();
      // Reading the counter every grade dominates runtime on WebKit; sample it once
      // per chapter-sized batch instead, while still breaking out as soon as we hit total.
      if (i % total === total - 1) {
        mastered = Number(/(\d+)\s*\/\s*\d+/.exec((await mastery.textContent()) ?? '')?.[1] ?? 0);
      }
    }

    mastered = Number(/(\d+)\s*\/\s*\d+/.exec((await mastery.textContent()) ?? '')?.[1] ?? 0);
    expect(mastered).toBe(total);
    await expect(mastery).toContainText(`${total} / ${total} ${meta.flashcardsMasteryLabel}`);

    await page.reload();
    await expect(page.getByTestId('flashcard-mastery')).toContainText(`${total} / ${total} ${meta.flashcardsMasteryLabel}`);
  });
});

test.describe('scenario drills', () => {
  test('learner can read a scenario with its coaching hint and shuffle to a different one', async ({ page }) => {
    await page.goto('/');

    const scenarioPrompt = page.getByLabel('Scenario drill prompt');
    await expect(scenarioPrompt).toBeVisible();
    await expect(page.getByText(meta.scenarioCoachingHintLabel)).toBeVisible();

    const promptBeforeShuffle = await scenarioPrompt.textContent();
    expect(promptBeforeShuffle).not.toBeNull();

    await page.getByRole('button', { name: meta.scenarioShuffleLabel }).click();

    await expect(page.getByTestId('live-announcer')).toHaveText('Scenario updated.');
    await expect(scenarioPrompt).toBeVisible();
    // The default (first) chapter ships multiple scenarios, so shuffle must change the prompt.
    await expect(scenarioPrompt).not.toHaveText(promptBeforeShuffle as string);
  });
});
