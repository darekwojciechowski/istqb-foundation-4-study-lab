import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { demoKnowledgePack } from './knowledge/demoKnowledgePack';

/**
 * Proof of the founding premise: injecting a completely different subject's knowledge
 * pack re-skins the whole app, with zero ISTQB content and no component edits.
 */
describe('App with a swapped knowledge pack', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    window.localStorage.clear();
  });

  it('renders the demo pack title, chapter, and a question', () => {
    render(<App pack={demoKnowledgePack} />);

    expect(
      screen.getByRole('heading', { name: demoKnowledgePack.meta.appTitle }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Capitals of Europe' })).toBeInTheDocument();
    expect(screen.getByText(/What is the capital city of France\?/i)).toBeInTheDocument();
  });

  it('leaks no ISTQB or CTFL content when driven by the demo pack', () => {
    const { container } = render(<App pack={demoKnowledgePack} />);

    expect(container.textContent ?? '').not.toMatch(/ISTQB|CTFL/i);
  });

  it('sources always-visible section copy from the pack, not hardcoded shell strings', () => {
    const { container } = render(<App pack={demoKnowledgePack} />);
    const text = container.textContent ?? '';

    // Demo-pack copy renders in the always-visible scenario/hero/quiz surfaces...
    expect(screen.getByText(demoKnowledgePack.meta.scenarioTitle)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: demoKnowledgePack.meta.heroStartPracticeLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: demoKnowledgePack.meta.flashcardsShowAnswerLabel }),
    ).toBeInTheDocument();

    // ...and the strings previously hardcoded in those components are gone.
    expect(text).not.toContain('Explain it like an examiner');
    expect(text).not.toContain('Start chapter practice');
    expect(text).not.toContain('Practice under exam-style scoring');
  });

  it('drives the document title from the active pack', () => {
    render(<App pack={demoKnowledgePack} />);

    expect(document.title).toBe(demoKnowledgePack.meta.appTitle);
  });

  it('hides certification-only sections the demo pack omits', () => {
    render(<App pack={demoKnowledgePack} />);

    expect(screen.queryByRole('heading', { name: /Official sample exams/i })).toBeNull();
    expect(screen.queryByRole('heading', { name: /Official syllabus accelerator/i })).toBeNull();
    expect(
      screen.queryByRole('heading', { name: /Curated external learning resources/i }),
    ).toBeNull();
  });
});
