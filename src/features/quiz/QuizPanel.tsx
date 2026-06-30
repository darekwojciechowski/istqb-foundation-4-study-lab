import type { RefObject } from 'react';
import { PanelHeader } from '../../components/PanelHeader';
import type { AnswerMap, AnswerReview, PracticeQuestion, QuizScore } from '../../lib/quiz';
import type { QuizCopy } from '../../knowledge/types';
import type { QuizMode } from './useQuizState';

export interface QuizPanelProps {
  id?: string;
  activeChapterTitle: string;
  answers: AnswerMap;
  isSubmitted: boolean;
  passedQuiz: boolean;
  quizMode: QuizMode;
  quizQuestions: ReadonlyArray<PracticeQuestion>;
  quizSectionRef: RefObject<HTMLElement | null>;
  review: AnswerReview[];
  score: QuizScore;
  timedOut?: boolean;
  copy: QuizCopy;
  onSwitchMode: (mode: QuizMode) => void;
  onResetQuiz: () => void;
  onSubmitQuiz: () => void;
  onUpdateAnswer: (questionId: string, optionIndex: number) => void;
}

export function QuizPanel({
  id,
  activeChapterTitle,
  answers,
  copy,
  isSubmitted,
  onResetQuiz,
  onSubmitQuiz,
  onSwitchMode,
  onUpdateAnswer,
  passedQuiz,
  quizMode,
  quizQuestions,
  quizSectionRef,
  review,
  score,
  timedOut = false,
}: QuizPanelProps) {
  const answeredCount = quizQuestions.filter((question) => answers[question.id] !== undefined).length;
  const unansweredCount = quizQuestions.length - answeredCount;

  return (
    <section ref={quizSectionRef} id={id} className="panel" aria-label="Interactive quiz" tabIndex={-1}>
      <PanelHeader
        eyebrow={quizMode === 'exam' ? copy.examEyebrow : copy.practiceEyebrow}
        title={quizMode === 'exam' ? copy.examTitle : `${copy.practiceTitlePrefix} ${activeChapterTitle}`}
        accessory={
          <div className="mode-switcher" role="group" aria-label="Quiz mode">
            <button
              type="button"
              className={quizMode === 'practice' ? 'active' : ''}
              aria-pressed={quizMode === 'practice'}
              onClick={() => onSwitchMode('practice')}
            >
              Practice
            </button>
            <button
              type="button"
              className={quizMode === 'exam' ? 'active' : ''}
              aria-pressed={quizMode === 'exam'}
              onClick={() => onSwitchMode('exam')}
            >
              Exam
            </button>
          </div>
        }
      />
      <p className="muted">{copy.examSimulatorDescription}</p>

      <div className="question-list">
        {quizQuestions.map((question, questionIndex) => (
          <fieldset key={question.id} className="question-card" data-testid="question-card">
            <legend>
              {questionIndex + 1}. {question.prompt}
            </legend>
            {question.options.map((option, optionIndex) => (
              <label key={option} className="option">
                <input
                  type="radio"
                  name={question.id}
                  value={optionIndex}
                  checked={answers[question.id] === optionIndex}
                  onChange={() => onUpdateAnswer(question.id, optionIndex)}
                  disabled={isSubmitted}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ))}
      </div>

      {!isSubmitted && quizQuestions.length > 0 ? (
        <p className="quiz-progress-hint muted" aria-live="polite" data-testid="quiz-progress-hint">
          {unansweredCount === 0
            ? `All ${quizQuestions.length} questions answered.`
            : `${answeredCount} of ${quizQuestions.length} answered — ${unansweredCount} still unanswered.`}
        </p>
      ) : null}

      <div className="quiz-footer">
        <button type="button" onClick={onSubmitQuiz} disabled={isSubmitted || quizQuestions.length === 0}>
          Submit answers
        </button>
        <button type="button" className="secondary" onClick={onResetQuiz}>
          Reset quiz
        </button>
      </div>

      {isSubmitted ? (
        <div className={passedQuiz ? 'result pass' : 'result'} role="status" aria-live="polite" aria-atomic="true">
          {timedOut ? (
            <p className="result-timeout">
              <strong>Time&apos;s up</strong> — your exam was submitted automatically.
            </p>
          ) : null}
          <h3>
            Score: {score.correct}/{score.total} ({score.percentage}%)
          </h3>
          <p>{passedQuiz ? copy.quizPassResultMessage : copy.quizFailResultMessage}</p>
          <div className="review-list">
            {review.map((item) => (
              <article key={item.questionId}>
                <strong>{item.isCorrect ? 'Correct' : 'Review needed'}:</strong> {item.prompt}
                <p>{item.explanation}</p>
                <small>{item.reference}</small>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
