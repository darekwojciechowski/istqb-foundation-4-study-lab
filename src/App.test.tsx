import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { knowledgePack } from './knowledge/currentKnowledgePack';

describe('App', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    window.localStorage.clear();
  });

  describe('rendering', () => {
    it('renders the active knowledge pack title and exam facts', () => {
      render(<App />);

      const examFacts = screen.getByLabelText(/exam facts/i);

      expect(screen.getByRole('heading', { name: /CTFL 4\.0 Study Lab/i })).toBeInTheDocument();
      expect(examFacts).toHaveTextContent(`${knowledgePack.examFacts.questionCount}`);
      expect(examFacts).toHaveTextContent(
        `${knowledgePack.examFacts.passingScore}/${knowledgePack.examFacts.questionCount}`,
      );
    });

    it('renders source notice text from the active knowledge pack', () => {
      render(<App />);

      const sourceNotice = screen.getByText(/Source and trademark note/i).closest('section');

      expect(sourceNotice).toHaveTextContent(knowledgePack.meta.sourceNotice);
    });

    it('renders legal disclaimer text from the active knowledge pack', () => {
      render(<App />);

      const footer = screen.getByRole('contentinfo');

      expect(footer).toHaveTextContent(knowledgePack.meta.legalDisclaimerIntro);
      expect(footer).toHaveTextContent(knowledgePack.meta.legalDisclaimerDetails);
    });

    it('renders exam simulator description from the active knowledge pack', () => {
      render(<App />);

      expect(screen.getByText(knowledgePack.meta.examSimulatorDescription)).toBeInTheDocument();
    });

    it('renders practice tool header actions in responsive header action slots', () => {
      render(<App />);

      expect(screen.getByTestId('flashcard-mastery').closest('[data-testid="panel-heading-accessory"]')).not.toBeNull();
      expect(screen.getByRole('button', { name: /Shuffle scenario/i }).closest('[data-testid="panel-heading-accessory"]')).not.toBeNull();
    });

    it('renders header actions in anchored responsive panel headings', () => {
      render(<App />);

      expect(screen.getByTestId('flashcard-mastery').closest('[data-testid="panel-heading"]')).not.toBeNull();
      expect(screen.getByRole('button', { name: /Shuffle scenario/i }).closest('[data-testid="panel-heading"]')).not.toBeNull();
    });

    it('links official sample exam sets as source material', () => {
      render(<App />);

      expect(screen.getByRole('heading', { name: /Official sample exams/i })).toBeInTheDocument();
      expect(screen.getByText(knowledgePack.meta.officialSampleExamsDescription)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sample Exam A questions/i })).toHaveAttribute(
        'href',
        expect.stringContaining('istqb.org'),
      );
      expect(screen.getByRole('link', { name: /Sample Exam D answers/i })).toHaveAttribute(
        'href',
        expect.stringContaining('istqb.org'),
      );
    });

    it('renders curated external learning resources', () => {
      render(<App />);

      expect(screen.getByRole('heading', { name: /Curated external learning resources/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ASTQB Foundation Level resources/i })).toHaveAttribute(
        'href',
        expect.stringContaining('astqb.org'),
      );
      expect(screen.getByRole('link', { name: /TM SQUARE ISTQB Foundation 4.0 tutorials/i })).toHaveAttribute(
        'href',
        expect.stringContaining('youtube.com'),
      );
    });

    it('renders the syllabus accelerator section', () => {
      render(<App />);

      const syllabusFacts = screen.getByLabelText(/official syllabus facts/i);

      expect(screen.getByRole('heading', { name: /Official syllabus accelerator/i })).toBeInTheDocument();
      expect(screen.getByText(knowledgePack.meta.officialSyllabusDescription)).toBeInTheDocument();
      expect(syllabusFacts).toHaveTextContent(/64 learning objectives/i);
      expect(screen.getByRole('link', { name: knowledgePack.meta.officialSyllabusLinkLabel })).toHaveAttribute(
        'href',
        expect.stringContaining('istqb.org'),
      );
    });

    it('renders a dynamic chapter panel title from active pack data', () => {
      render(<App />);

      expect(
        screen.getByRole('heading', { name: `${knowledgePack.syllabusChapters.length} ${knowledgePack.meta.chapterPanelTitle}` }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Six syllabus chapters/i })).not.toBeInTheDocument();
    });

    it('renders a safe fallback when the knowledge pack has no syllabus chapters', async () => {
      vi.resetModules();
      vi.doMock('./knowledge/currentKnowledgePack', () => ({
        knowledgePack: {
          ...knowledgePack,
          syllabusChapters: [],
        },
      }));

      const { default: AppWithEmptyChapters } = await import('./App');

      render(<AppWithEmptyChapters />);

      expect(screen.getByLabelText(/knowledge pack unavailable/i)).toBeInTheDocument();
      expect(screen.getByText(/does not define any syllabus chapters/i)).toBeInTheDocument();

      vi.doUnmock('./knowledge/currentKnowledgePack');
    });
  });

  describe('accessibility', () => {
    it('exposes a skip link that targets the quiz section', () => {
      render(<App />);

      const skipLink = screen.getByRole('link', { name: /Skip to quiz/i });
      expect(skipLink).toHaveAttribute('href', '#quiz');
      expect(screen.getByLabelText(/Interactive quiz/i)).toHaveAttribute('id', 'quiz');
    });

    it('exposes the chapter list as a labelled navigation landmark', () => {
      render(<App />);

      expect(screen.getByRole('navigation', { name: /Chapter navigation/i })).toBeInTheDocument();
    });

    it('marks the active chapter with aria-current and moves it on selection', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<App />);

      const firstChapter = screen.getByRole('button', { name: new RegExp(knowledgePack.syllabusChapters[0].title, 'i') });
      const secondChapter = screen.getByRole('button', { name: new RegExp(knowledgePack.syllabusChapters[1].title, 'i') });

      expect(firstChapter).toHaveAttribute('aria-current', 'true');
      expect(secondChapter).not.toHaveAttribute('aria-current');

      fireEvent.click(secondChapter);

      expect(secondChapter).toHaveAttribute('aria-current', 'true');
      expect(firstChapter).not.toHaveAttribute('aria-current');

      confirm.mockRestore();
    });

    it('reflects the selected quiz mode through aria-pressed', () => {
      render(<App />);

      const practiceButton = screen.getByRole('button', { name: 'Practice' });
      const examButton = screen.getByRole('button', { name: 'Exam' });

      expect(practiceButton).toHaveAttribute('aria-pressed', 'true');
      expect(examButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(examButton);

      expect(examButton).toHaveAttribute('aria-pressed', 'true');
      expect(practiceButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('announces context changes in a polite live region', () => {
      render(<App />);

      const announcer = screen.getByTestId('live-announcer');
      expect(announcer).toHaveTextContent('');

      fireEvent.click(screen.getByRole('button', { name: 'Exam' }));
      expect(announcer).toHaveTextContent(/Switched to exam mode/i);

      fireEvent.click(screen.getByRole('button', { name: /Shuffle scenario/i }));
      expect(announcer).toHaveTextContent(/Scenario updated/i);
    });
  });

  describe('progress', () => {
    it('sanitizes stale completed chapter ids from stored progress', async () => {
      const storageKey = knowledgePack.progress.storageKey;

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          completedChapterIds: ['chapter-from-older-pack'],
          quizAttempts: [],
        }),
      );

      render(<App />);

      expect(screen.getByTestId('progress-pill')).toHaveTextContent('0% complete');
      expect(screen.getByRole('button', { name: /Mark chapter as reviewed/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Mark chapter as not reviewed/i })).not.toBeInTheDocument();

      await waitFor(() => {
        const savedProgress = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as { completedChapterIds?: string[] };
        expect(savedProgress.completedChapterIds).toEqual([]);
      });
    });

    it('does not render quiz attempts persisted for another knowledge pack', async () => {
      const storageKey = knowledgePack.progress.storageKey;

      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          packId: 'legacy-pack',
          schemaVersion: knowledgePack.progress.schemaVersion,
          completedChapterIds: [knowledgePack.syllabusChapters[0].id],
          quizAttempts: [
            {
              mode: 'exam',
              correct: 40,
              total: 40,
              takenAt: '2026-05-12T08:00:00.000Z',
            },
          ],
        }),
      );

      render(<App />);

      expect(screen.queryByRole('heading', { name: /Your local progress/i })).not.toBeInTheDocument();

      await waitFor(() => {
        const savedProgress = JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as {
          packId?: string;
          completedChapterIds?: string[];
          quizAttempts?: unknown[];
        };
        expect(savedProgress.packId).toBe(knowledgePack.progress.packId);
        expect(savedProgress.completedChapterIds).toEqual([]);
        expect(savedProgress.quizAttempts).toEqual([]);
      });
    });

    it('toggles the active chapter reviewed state on repeated clicks', () => {
      render(<App />);

      const markButton = screen.getByRole('button', { name: /Mark chapter as reviewed/i });

      fireEvent.click(markButton);
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mark chapter as not reviewed/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Mark chapter as not reviewed/i }));
      expect(screen.queryByText(/Completed/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Mark chapter as reviewed/i })).toBeInTheDocument();
    });
  });

  describe('quiz interaction', () => {
    it('renders quiz outcome copy from the active knowledge pack', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

      expect(screen.getByText(knowledgePack.meta.quizFailResultMessage)).toBeInTheDocument();
    });

    it('announces quiz results in a live status region', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));

      const result = screen.getByRole('status');
      expect(result).toHaveAttribute('aria-live', 'polite');
      expect(result).toHaveAttribute('aria-atomic', 'true');
      expect(result).toHaveTextContent(/Score:/i);
    });

    it('moves the user to the quiz section when starting practice from the hero', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Start chapter practice/i }));

      const quizSection = screen.getByLabelText(/Interactive quiz/i);

      expect(quizSection.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
      expect(quizSection).toHaveFocus();
    });

    it('resets quiz without scrolling when selecting a chapter from study path', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App />);

      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);
      expect(firstOption).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: /Testing Throughout the Software Development Lifecycle/i }));

      expect(
        screen.getByRole('heading', { name: /Practice: Testing Throughout the Software Development Lifecycle/i }),
      ).toBeInTheDocument();
      expect(screen.queryAllByRole('radio').filter((r) => (r as HTMLInputElement).checked)).toHaveLength(0);
      expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();

      confirm.mockRestore();
    });

    it('keeps draft quiz answers when the learner cancels a chapter change', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<App />);

      const initialTitle = `Practice: ${knowledgePack.syllabusChapters[0].title}`;
      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);

      fireEvent.click(screen.getByRole('button', { name: new RegExp(knowledgePack.syllabusChapters[1].title, 'i') }));

      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('clear your current quiz answers'));
      expect(screen.getByRole('heading', { name: initialTitle })).toBeInTheDocument();
      expect(firstOption).toBeChecked();

      confirm.mockRestore();
    });

    it('clears draft quiz answers when the learner confirms a mode change', () => {
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App />);

      fireEvent.click(screen.getAllByRole('radio')[0]);
      fireEvent.click(screen.getByRole('button', { name: 'Exam' }));

      expect(confirm).toHaveBeenCalledWith(expect.stringContaining('clear your current quiz answers'));
      expect(screen.getByRole('heading', { name: /Practice under exam-style scoring/i })).toBeInTheDocument();
      expect(screen.queryAllByRole('radio').filter((r) => (r as HTMLInputElement).checked)).toHaveLength(0);

      confirm.mockRestore();
    });

    it('reveals the flashcard answer only after Show answer is clicked', () => {
      render(<App />);

      expect(screen.getByTestId('flashcard-prompt')).toBeInTheDocument();
      expect(screen.queryByTestId('flashcard-answer')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /Show answer/i }));

      expect(screen.getByTestId('flashcard-answer')).toBeInTheDocument();
      expect(screen.getByRole('group', { name: /Rate your recall/i })).toBeInTheDocument();
    });

    it('shows the per-card mastery level starting at the lowest box', () => {
      render(<App />);

      expect(screen.getByTestId('flashcard-level')).toHaveTextContent('0 / 4');
    });

    it('shows mastery progress out of the chapter flashcard count', () => {
      render(<App />);

      const defaultChapterId = knowledgePack.syllabusChapters[0].id;
      const chapterFlashcardCount = knowledgePack.flashcards.filter(
        (flashcard) => flashcard.chapterId === defaultChapterId,
      ).length;

      expect(screen.getByTestId('flashcard-mastery')).toHaveTextContent(`0 / ${chapterFlashcardCount} mastered`);
    });

    it('hides the answer again and keeps mastery accurate after grading a card', () => {
      render(<App />);

      const defaultChapterId = knowledgePack.syllabusChapters[0].id;
      const chapterFlashcardCount = knowledgePack.flashcards.filter(
        (flashcard) => flashcard.chapterId === defaultChapterId,
      ).length;

      fireEvent.click(screen.getByRole('button', { name: /Show answer/i }));
      fireEvent.click(screen.getByRole('button', { name: /^Good$/i }));

      // A single "Good" only moves the card to box 1, so nothing is mastered yet and
      // the next card is presented with its answer hidden.
      expect(screen.queryByTestId('flashcard-answer')).toBeNull();
      expect(screen.getByRole('button', { name: /Show answer/i })).toBeInTheDocument();
      expect(screen.getByTestId('flashcard-mastery')).toHaveTextContent(`0 / ${chapterFlashcardCount} mastered`);
    });

    it('reviews a flashcard that belongs to the active chapter', () => {
      render(<App />);

      const defaultChapterId = knowledgePack.syllabusChapters[0].id;
      const chapterPromptSet = new Set(
        knowledgePack.flashcards
          .filter((flashcard) => flashcard.chapterId === defaultChapterId)
          .map((flashcard) => flashcard.prompt),
      );

      const currentPrompt = screen.getByTestId('flashcard-prompt').textContent ?? '';
      expect(chapterPromptSet.has(currentPrompt)).toBe(true);

      fireEvent.click(screen.getByRole('button', { name: /Show answer/i }));
      fireEvent.click(screen.getByRole('button', { name: /^Again$/i }));

      const nextPrompt = screen.getByTestId('flashcard-prompt').textContent ?? '';
      expect(chapterPromptSet.has(nextPrompt)).toBe(true);
    });

    it('reshuffles the scenario drill from the scenario panel button', () => {
      const randomUUID = vi
        .spyOn(globalThis.crypto, 'randomUUID')
        .mockReturnValueOnce('00000000-0000-4000-8000-000000000000')
        .mockReturnValueOnce('00000000-0000-4000-8000-000000000001');
      const defaultChapterId = knowledgePack.syllabusChapters[0].id;
      const chapterScenarioCount = knowledgePack.scenarios.filter(
        (scenario) => scenario.chapterId === defaultChapterId,
      ).length;

      render(<App />);
      const initialScenario = screen.getByLabelText(/Scenario drill prompt/i).textContent;

      fireEvent.click(screen.getByRole('button', { name: /Shuffle scenario/i }));

      const shuffledScenario = screen.getByLabelText(/Scenario drill prompt/i).textContent;

      if (chapterScenarioCount > 1) {
        expect(shuffledScenario).not.toBe(initialScenario);
      } else {
        expect(shuffledScenario).toBe(initialScenario);
      }

      randomUUID.mockRestore();
    });

    it('shows a non-blocking unanswered-question indicator that updates as answers are given', () => {
      render(<App />);

      const hint = screen.getByTestId('quiz-progress-hint');
      expect(hint).toHaveTextContent(/still unanswered/i);

      fireEvent.click(screen.getAllByRole('radio')[0]);

      expect(screen.getByTestId('quiz-progress-hint')).toHaveTextContent(/^1 of /i);
    });

    it('shows a fixed countdown timer only while an exam is in progress', () => {
      render(<App />);

      expect(screen.queryByRole('timer')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Exam' }));

      const timer = screen.getByRole('timer', { name: /time remaining in exam/i });
      expect(timer).toHaveTextContent(`${String(knowledgePack.examFacts.durationMinutes).padStart(2, '0')}:00`);
    });

    it('hides the countdown timer once the exam is submitted', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Exam' }));
      expect(screen.getByRole('timer')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Submit answers/i }));
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });
  });
});
