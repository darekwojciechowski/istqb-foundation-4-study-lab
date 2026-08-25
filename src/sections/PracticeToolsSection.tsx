import { PanelHeader } from '../components/PanelHeader';
import type { ScenarioPrompt } from '../data/flashcards';
import type { SyllabusChapter } from '../data/syllabus';
import type { FlashcardReviewResult } from '../features/quiz/useFlashcardReview';
import type { DeepReadonly } from '../knowledge/types';

export interface PracticeToolsSectionCopy {
  flashcardsEyebrow: string;
  flashcardsTitlePrefix: string;
  flashcardsShowAnswerLabel: string;
  flashcardsAgainLabel: string;
  flashcardsGoodLabel: string;
  flashcardsEasyLabel: string;
  flashcardsMasteryLabel: string;
  flashcardsLevelLabel: string;
  flashcardsEmptyLabel: string;
  scenarioEyebrow: string;
  scenarioTitle: string;
  scenarioShuffleLabel: string;
  scenarioCoachingHintLabel: string;
}

export interface PracticeToolsSectionProps {
  activeChapter: DeepReadonly<SyllabusChapter>;
  flashcardReview: FlashcardReviewResult;
  chapterScenario: DeepReadonly<ScenarioPrompt> | undefined;
  copy: PracticeToolsSectionCopy;
  onRandomizeScenario: () => void;
}

export function PracticeToolsSection({
  activeChapter,
  flashcardReview,
  chapterScenario,
  copy,
  onRandomizeScenario,
}: PracticeToolsSectionProps) {
  const { currentCard, isRevealed, masteredCount, totalCount, currentBox, maxBox, reveal, grade } =
    flashcardReview;

  return (
    <section className="grid two-columns">
      <div className="panel">
        <PanelHeader
          eyebrow={copy.flashcardsEyebrow}
          title={`${copy.flashcardsTitlePrefix} ${activeChapter.title}`}
          accessory={
            <p className="flashcard-mastery" data-testid="flashcard-mastery">
              {masteredCount} / {totalCount} {copy.flashcardsMasteryLabel}
            </p>
          }
        />
        {currentCard ? (
          <div className="flashcard-review">
            <p className="flashcard-prompt" data-testid="flashcard-prompt">
              {currentCard.prompt}
            </p>
            {/* The level used to live in an aria-label on this paragraph while every
                visible child was aria-hidden, so a screen reader announced the label
                with no number attached. Real text in a visually-hidden span carries the
                state instead; the dots and figures beside it are decoration. */}
            <p className="flashcard-level" data-testid="flashcard-level">
              <span className="sr-only" data-testid="flashcard-level-status">
                {copy.flashcardsLevelLabel} {currentBox} / {maxBox}
              </span>
              <span aria-hidden="true">{copy.flashcardsLevelLabel}</span>
              <span className="flashcard-level-dots" aria-hidden="true">
                <span className="flashcard-level-dots-filled">{'●'.repeat(currentBox)}</span>
                {'○'.repeat(maxBox - currentBox)}
              </span>
              <span aria-hidden="true">
                {currentBox} / {maxBox}
              </span>
            </p>
            {isRevealed ? (
              <>
                <p className="flashcard-answer" data-testid="flashcard-answer">
                  {currentCard.answer}
                </p>
                <div className="flashcard-grades" role="group" aria-label="Rate your recall">
                  <button type="button" className="secondary" onClick={() => grade('again')}>
                    {copy.flashcardsAgainLabel}
                  </button>
                  <button type="button" className="secondary" onClick={() => grade('good')}>
                    {copy.flashcardsGoodLabel}
                  </button>
                  <button type="button" className="secondary" onClick={() => grade('easy')}>
                    {copy.flashcardsEasyLabel}
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={reveal}>
                {copy.flashcardsShowAnswerLabel}
              </button>
            )}
          </div>
        ) : (
          <p>{copy.flashcardsEmptyLabel}</p>
        )}
      </div>

      <div className="panel">
        <PanelHeader
          eyebrow={copy.scenarioEyebrow}
          title={copy.scenarioTitle}
          accessory={
            <button type="button" className="secondary" onClick={onRandomizeScenario}>
              {copy.scenarioShuffleLabel}
            </button>
          }
        />
        {chapterScenario ? (
          <>
            {/* An aria-label here *replaced* the prompt for assistive tech — the label
                becomes the accessible name of the paragraph, so the drill itself went
                unread. A visually-hidden heading names the passage without hiding it. */}
            <h3 className="sr-only">Scenario drill prompt</h3>
            <p data-testid="scenario-prompt">{chapterScenario.prompt}</p>
            <div className="hint">
              <strong>{copy.scenarioCoachingHintLabel}:</strong> {chapterScenario.coachingHint}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
