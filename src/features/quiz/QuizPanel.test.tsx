import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuizPanel, type QuizPanelProps } from './QuizPanel';
import type { QuizCopy } from '../../knowledge/types';
import { makeQuestion } from '../../test/factories';

const questions = [makeQuestion()];

const copy = {
  examSimulatorDescription: 'Practice description',
  quizPassResultMessage: 'You passed.',
  quizFailResultMessage: 'You did not pass.',
  practiceEyebrow: 'Chapter quiz',
  examEyebrow: 'Exam simulator',
  examTitle: 'Practice under exam-style scoring',
  practiceTitlePrefix: 'Practice:',
} satisfies QuizCopy;

function renderPanel(overrides: Partial<QuizPanelProps> = {}) {
  const onUpdateAnswer = vi.fn();
  const onSubmitQuiz = vi.fn();
  const onResetQuiz = vi.fn();
  const onSwitchMode = vi.fn();

  const props: QuizPanelProps = {
    activeChapterTitle: 'Chapter 1',
    answers: {},
    isSubmitted: false,
    passedQuiz: false,
    quizMode: 'practice',
    quizQuestions: questions,
    quizSectionRef: createRef<HTMLElement | null>(),
    review: [],
    score: { correct: 0, total: questions.length, percentage: 0 },
    copy,
    onSwitchMode,
    onResetQuiz,
    onSubmitQuiz,
    onUpdateAnswer,
    ...overrides,
  };

  return { props, ...render(<QuizPanel {...props} />), onUpdateAnswer, onSubmitQuiz, onResetQuiz, onSwitchMode };
}

describe('QuizPanel', () => {
  it('renders the current question and its options', () => {
    renderPanel();
    expect(screen.getByText(/What is testing\?/)).toBeInTheDocument();
    expect(screen.getByLabelText('Evaluating software')).toBeInTheDocument();
  });

  it('calls onUpdateAnswer when an option is selected', () => {
    const { onUpdateAnswer } = renderPanel();
    fireEvent.click(screen.getByLabelText('Evaluating software'));
    expect(onUpdateAnswer).toHaveBeenCalledWith('q-1', 1);
  });

  it('calls onSubmitQuiz when the submit button is clicked', () => {
    const { onSubmitQuiz } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Submit answers' }));
    expect(onSubmitQuiz).toHaveBeenCalledTimes(1);
  });

  it('switches mode when the exam button is clicked', () => {
    const { onSwitchMode } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Exam' }));
    expect(onSwitchMode).toHaveBeenCalledWith('exam');
  });

  it('switches back to practice from exam mode', () => {
    const { onSwitchMode, onResetQuiz } = renderPanel({ quizMode: 'exam' });
    fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
    expect(onSwitchMode).toHaveBeenCalledWith('practice');

    fireEvent.click(screen.getByRole('button', { name: 'Reset quiz' }));
    expect(onResetQuiz).toHaveBeenCalledTimes(1);
  });

  it('renders the result view when submitted', () => {
    renderPanel({
      isSubmitted: true,
      passedQuiz: true,
      score: { correct: 1, total: 1, percentage: 100 },
      review: [
        {
          questionId: 'q-1',
          prompt: 'What is testing?',
          selectedOptionIndex: 1,
          correctOptionIndex: 1,
          isCorrect: true,
          explanation: 'Testing evaluates software.',
          reference: 'CTFL 1.1',
        },
      ],
    });
    expect(screen.getByRole('status')).toHaveTextContent(/Score: 1\/1 \(100%\)/);
    expect(screen.getByText('You passed.')).toBeInTheDocument();
  });

  it('shows the time-up banner when the exam was auto-submitted', () => {
    renderPanel({ isSubmitted: true, timedOut: true });
    expect(screen.getByText(/Time's up/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted automatically/i)).toBeInTheDocument();
  });

  it('omits the time-up banner for a manually submitted quiz', () => {
    renderPanel({ isSubmitted: true, timedOut: false });
    expect(screen.queryByText(/Time's up/i)).not.toBeInTheDocument();
  });
});
