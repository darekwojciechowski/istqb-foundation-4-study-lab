import type { SyllabusChapter } from '../data/syllabus';
import type { PracticeQuestion } from '../lib/quiz';

export function makeQuestion(overrides: Partial<PracticeQuestion> = {}): PracticeQuestion {
  return {
    id: 'q-1',
    chapterId: 'ch-1',
    difficulty: 'foundation',
    prompt: 'What is testing?',
    options: ['Guessing', 'Evaluating software', 'Coding', 'Documenting'],
    correctOptionIndex: 1,
    explanation: 'Testing evaluates software against expected behaviour.',
    reference: 'CTFL 1.1',
    ...overrides,
  };
}

export function makeChapter(overrides: Partial<SyllabusChapter> = {}): SyllabusChapter {
  return {
    id: 'ch-1',
    order: 1,
    title: 'Chapter 1',
    weight: { expectedQuestions: 5, percentage: 20 },
    summary: '',
    learningGoals: [],
    keyConcepts: [],
    studyTactics: [],
    ...overrides,
  };
}
