import type { Locator, Page } from '@playwright/test';

/**
 * The application shell: navigation, the global progress read-out, the live
 * announcer, and the collapsible recent-attempts panel.
 */
export class AppPage {
  readonly heading: Locator;
  readonly progressPill: Locator;
  readonly announcer: Locator;
  readonly skipLink: Locator;
  readonly attemptItems: Locator;

  private readonly attemptsPanel: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.progressPill = page.getByTestId('progress-pill');
    this.announcer = page.getByTestId('live-announcer');
    this.skipLink = page.getByRole('link', { name: 'Skip to quiz' });
    this.attemptItems = page.getByTestId('attempt-list').locator('li');
    this.attemptsPanel = page.locator('details:has([data-testid="attempt-list"])');
  }

  /**
   * The suite's single navigation entry point.
   *
   * Intentionally relative: the production bundle is served under a base path
   * (`/istqb-foundation-4-study-lab/`), and `goto('/')` would resolve against the
   * origin and drop that path. Routing every spec through here keeps the switch
   * from dev server to production preview a one-line change in the config.
   */
  async goto(): Promise<void> {
    await this.page.goto('./');
    await this.heading.waitFor({ state: 'visible' });
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  /** Opens the recent-attempts `<details>` panel if it is not already open. */
  async expandAttempts(): Promise<void> {
    await this.attemptsPanel.waitFor({ state: 'attached' });
    const isOpen = await this.attemptsPanel.evaluate((el: HTMLDetailsElement) => el.open);
    if (!isOpen) {
      await this.attemptsPanel.locator('summary').click();
    }
  }
}
