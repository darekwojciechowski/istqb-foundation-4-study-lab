import type { Locator, Page } from '@playwright/test';
import { knowledgePack } from '../../src/knowledge/currentKnowledgePack';

const { meta } = knowledgePack;

/** The chapter navigation panel and the chapter review toggle. */
export class StudyPathPage {
  readonly chapterCards: Locator;
  readonly markReviewedButton: Locator;
  readonly markNotReviewedButton: Locator;

  constructor(page: Page) {
    this.chapterCards = page.getByTestId('chapter-card');
    this.markReviewedButton = page.getByRole('button', { name: meta.chapterMarkReviewedLabel });
    this.markNotReviewedButton = page.getByRole('button', { name: meta.chapterMarkNotReviewedLabel });
  }

  /** `index` is zero-based over the rendered chapter cards. */
  chapterCard(index: number): Locator {
    return this.chapterCards.nth(index);
  }

  async selectChapter(index: number): Promise<void> {
    const card = this.chapterCard(index);
    await card.waitFor({ state: 'visible' });
    await card.click();
  }

  async markReviewed(): Promise<void> {
    await this.markReviewedButton.click();
  }

  async markNotReviewed(): Promise<void> {
    await this.markNotReviewedButton.click();
  }
}
