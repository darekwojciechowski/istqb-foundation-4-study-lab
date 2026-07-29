import type { Locator, Page } from '@playwright/test';
import { knowledgePack } from '../../src/knowledge/currentKnowledgePack';
import type { CardGrade } from '../../src/lib/srs';

const { meta } = knowledgePack;

const GRADE_LABELS: Record<CardGrade, string> = {
  again: meta.flashcardsAgainLabel,
  good: meta.flashcardsGoodLabel,
  easy: meta.flashcardsEasyLabel,
};

/** The mastery-box flashcard deck for the active chapter. */
export class FlashcardDeckPage {
  readonly prompt: Locator;
  readonly answer: Locator;
  readonly mastery: Locator;
  readonly level: Locator;
  readonly gradeGroup: Locator;
  readonly showAnswerButton: Locator;

  constructor(private readonly page: Page) {
    this.prompt = page.getByTestId('flashcard-prompt');
    this.answer = page.getByTestId('flashcard-answer');
    this.mastery = page.getByTestId('flashcard-mastery');
    this.level = page.getByTestId('flashcard-level');
    this.gradeGroup = page.getByRole('group', { name: 'Rate your recall' });
    this.showAnswerButton = page.getByRole('button', { name: meta.flashcardsShowAnswerLabel });
  }

  async showAnswer(): Promise<void> {
    await this.showAnswerButton.click();
  }

  async grade(grade: CardGrade): Promise<void> {
    await this.page.getByRole('button', { name: GRADE_LABELS[grade], exact: true }).click();
  }

  /** One full reveal-and-grade round trip on the current card. */
  async reviewCard(grade: CardGrade): Promise<void> {
    await this.showAnswer();
    await this.grade(grade);
  }
}
