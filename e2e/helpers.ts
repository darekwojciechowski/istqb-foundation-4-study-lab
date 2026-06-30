import type { Page } from '@playwright/test';
import { questions } from '../src/data/questions';
import { knowledgePack } from '../src/knowledge/currentKnowledgePack';

const PROGRESS_STORAGE_KEY = knowledgePack.progress.storageKey;

/** Questions in an exam attempt — capped by the available bank size. */
export const EXAM_TOTAL = Math.min(knowledgePack.examFacts.questionCount, questions.length);

/** Questions in a practice attempt for the active chapter. */
export const PRACTICE_TOTAL = knowledgePack.quiz.practiceQuestionCount;

export async function clearProgress(page: Page): Promise<void> {
  // Intent: wipe stored progress once, on the first navigation of each test, then
  // leave later in-test reloads untouched so the persistence specs keep their state.
  // (Mechanism: a sessionStorage sentinel — sessionStorage survives reloads but is
  // scoped to the per-test browser context, so the clear runs exactly once per test.)
  await page.addInitScript((key) => {
    if (!window.sessionStorage.getItem('__e2e_progress_cleared')) {
      window.localStorage.removeItem(key);
      window.sessionStorage.setItem('__e2e_progress_cleared', '1');
    }
  }, PROGRESS_STORAGE_KEY);
}

export interface AnswerAllOptions {
  /** When true, pick each question's correct option; otherwise pick a wrong one. */
  correct: boolean;
}

/**
 * Answers every rendered question card and submits.
 *
 * Options are shuffled per question at runtime, so the correct radio's DOM position
 * is unknown. We match by option *text*: the radio group `name` is the question id,
 * the real bank gives the correct option text, and each radio's accessible name is
 * its option text (the label wraps the input and a text span).
 */
export async function answerAll(page: Page, { correct }: AnswerAllOptions = { correct: true }): Promise<void> {
  const questionCards = page.getByTestId('question-card');
  const count = await questionCards.count();
  if (count === 0) {
    throw new Error('No question cards rendered');
  }

  for (let i = 0; i < count; i += 1) {
    const card = questionCards.nth(i);
    const questionId = await card.locator('input[type="radio"]').first().getAttribute('name');
    const question = questions.find((candidate) => candidate.id === questionId);
    if (!question) {
      throw new Error(`No question found for radio group "${questionId}"`);
    }

    const correctText = question.options[question.correctOptionIndex];
    const targetText = correct ? correctText : question.options.find((option) => option !== correctText);
    if (targetText === undefined) {
      throw new Error(`Question "${questionId}" has no distinct incorrect option`);
    }

    await card.getByRole('radio', { name: targetText, exact: true }).check();
  }

  await page.getByRole('button', { name: 'Submit answers' }).click();
}

export async function answerAllCorrectlyAndSubmit(page: Page): Promise<void> {
  await answerAll(page, { correct: true });
}

export async function answerAllIncorrectlyAndSubmit(page: Page): Promise<void> {
  await answerAll(page, { correct: false });
}

export async function answerFirstChapterAndSubmit(page: Page, correct = true): Promise<void> {
  const firstChapter = page.getByTestId('chapter-card').first();
  await firstChapter.waitFor({ state: 'visible' });
  await firstChapter.click();

  await answerAll(page, { correct });
}

export async function expandAttemptsPanel(page: Page): Promise<void> {
  const details = page.locator('details:has([data-testid="attempt-list"])');
  await details.waitFor({ state: 'attached' });
  const isOpen = await details.evaluate((el: HTMLDetailsElement) => el.open);
  if (!isOpen) {
    await details.locator('summary').click();
  }
}

export async function switchToExam(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Exam', exact: true }).click();
  await page.getByRole('timer').waitFor({ state: 'visible' });
}
