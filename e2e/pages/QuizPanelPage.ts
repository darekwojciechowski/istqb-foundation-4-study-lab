import type { Locator, Page } from '@playwright/test';
import { questions } from '../../src/data/questions';
import { knowledgePack } from '../../src/knowledge/currentKnowledgePack';

/** Questions in an exam attempt — capped by the available bank size. */
export const EXAM_TOTAL = Math.min(knowledgePack.examFacts.questionCount, questions.length);

/** Questions in a practice attempt for the active chapter. */
export const PRACTICE_TOTAL = knowledgePack.quiz.practiceQuestionCount;

export type QuizMode = 'practice' | 'exam';

/**
 * The interactive quiz panel: mode switcher, question cards, submission, results.
 */
export class QuizPanelPage {
  readonly questionCards: Locator;
  readonly submitButton: Locator;
  readonly resetButton: Locator;
  readonly result: Locator;
  readonly progressHint: Locator;
  readonly modeGroup: Locator;

  constructor(private readonly page: Page) {
    this.questionCards = page.getByTestId('question-card');
    this.submitButton = page.getByRole('button', { name: 'Submit answers' });
    this.resetButton = page.getByRole('button', { name: 'Reset quiz' });
    this.result = page.getByRole('status');
    this.progressHint = page.getByTestId('quiz-progress-hint');
    this.modeGroup = page.getByRole('group', { name: 'Quiz mode' });
  }

  modeButton(mode: QuizMode): Locator {
    return this.page.getByRole('button', { name: mode === 'exam' ? 'Exam' : 'Practice', exact: true });
  }

  radios(options: { checked?: boolean } = {}): Locator {
    return this.page.getByRole('radio', options);
  }

  /** Switches to exam mode and waits for the countdown timer to appear. */
  async switchToExam(): Promise<void> {
    await this.modeButton('exam').click();
    await this.page.getByRole('timer').waitFor({ state: 'visible' });
  }

  /** Answers every rendered question card, correctly or incorrectly. */
  async answerAll({ correct }: { correct: boolean } = { correct: true }): Promise<void> {
    const count = await this.cardCount();
    await this.answerExactly(correct ? count : 0);
  }

  /**
   * Answers the first `correctCount` question cards correctly and every remaining
   * card incorrectly — the lever the cut-score boundary tests pull.
   */
  async answerExactly(correctCount: number): Promise<void> {
    const count = await this.cardCount();
    if (correctCount > count) {
      throw new Error(`Cannot answer ${correctCount} of only ${count} rendered questions correctly`);
    }

    for (let index = 0; index < count; index += 1) {
      await this.answerCard(this.questionCards.nth(index), index < correctCount);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  private async cardCount(): Promise<number> {
    const count = await this.questionCards.count();
    if (count === 0) {
      throw new Error('No question cards rendered');
    }

    return count;
  }

  /**
   * Selects one option on a single question card.
   *
   * Options are shuffled per question at runtime, so the target radio's DOM position
   * is unknown. We match by option *text*: the radio group `name` is the question id,
   * the real bank gives the correct option text, and each radio's accessible name is
   * its option text (the label wraps the input and a text span).
   */
  private async answerCard(card: Locator, correct: boolean): Promise<void> {
    const questionId = await card.getByRole('radio').first().getAttribute('name');
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
}
