export type ChapterId<TChapterId extends string = string> = TChapterId;

export type QuestionDifficulty = 'foundation' | 'intermediate' | 'exam';

export interface PracticeQuestion<TChapterId extends string = string> {
  id: string;
  chapterId: ChapterId<TChapterId>;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: readonly string[];
  correctOptionIndex: number;
  explanation: string;
  reference: string;
}

export type AnswerMap = Record<string, number | undefined>;

export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface QuestionSelectionOptions<TChapterId extends string = string> {
  count: number;
  chapterId?: ChapterId<TChapterId>;
  seed?: string;
}

export interface AnswerReview {
  questionId: string;
  prompt: string;
  selectedOptionIndex: number | undefined;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
  reference: string;
}

const DEFAULT_PASS_THRESHOLD_PERCENTAGE = 65;

export function scoreQuiz<TChapterId extends string = string>(
  questions: ReadonlyArray<PracticeQuestion<TChapterId>>,
  answers: AnswerMap,
): QuizScore {
  const correct = questions.filter((question) => answers[question.id] === question.correctOptionIndex).length;
  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return { correct, total, percentage };
}

export function hasPassed(score: QuizScore, thresholdPercentage = DEFAULT_PASS_THRESHOLD_PERCENTAGE): boolean {
  if (score.total === 0) {
    return false;
  }

  const safeThresholdPercentage = isValidThresholdPercentage(thresholdPercentage)
    ? thresholdPercentage
    : DEFAULT_PASS_THRESHOLD_PERCENTAGE;
  const requiredCorrect = Math.ceil(score.total * (safeThresholdPercentage / 100));

  return score.correct >= requiredCorrect;
}

export function selectQuestions<TChapterId extends string = string>(
  questions: ReadonlyArray<PracticeQuestion<TChapterId>>,
  { count, chapterId, seed = 'study-lab' }: QuestionSelectionOptions<TChapterId>,
): PracticeQuestion<TChapterId>[] {
  const eligibleQuestions = chapterId
    ? questions.filter((question) => question.chapterId === chapterId)
    : questions;

  return shuffleBySeed(eligibleQuestions, `${seed}:questions`).slice(0, count);
}

export function prepareQuizQuestions<TChapterId extends string = string>(
  questions: ReadonlyArray<PracticeQuestion<TChapterId>>,
  options: QuestionSelectionOptions<TChapterId>,
): PracticeQuestion<TChapterId>[] {
  const seed = options.seed ?? 'study-lab';

  return selectQuestions(questions, options).map((question) => shuffleAnswerOptions(question, seed));
}

export function buildAnswerReview<TChapterId extends string = string>(
  questions: ReadonlyArray<PracticeQuestion<TChapterId>>,
  answers: AnswerMap,
): AnswerReview[] {
  return questions.map((question) => {
    const selectedOptionIndex = answers[question.id];

    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionIndex,
      correctOptionIndex: question.correctOptionIndex,
      isCorrect: selectedOptionIndex === question.correctOptionIndex,
      explanation: question.explanation,
      reference: question.reference,
    };
  });
}

function shuffleAnswerOptions<TChapterId extends string = string>(
  question: PracticeQuestion<TChapterId>,
  seed: string,
): PracticeQuestion<TChapterId> {
  const shuffledOptions = shuffleBySeed(
    question.options.map((option, optionIndex) => ({ option, optionIndex })),
    `${seed}:${question.id}:answers`,
  );

  return {
    ...question,
    options: shuffledOptions.map(({ option }) => option),
    correctOptionIndex: shuffledOptions.findIndex(({ optionIndex }) => optionIndex === question.correctOptionIndex),
  };
}

export function createQuizSeed(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function shuffleBySeed<T>(items: ReadonlyArray<T>, seed: string): T[] {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = stableQuestionWeight(String(index), seed) % (index + 1);
    [shuffledItems[index], shuffledItems[swapIndex]] = [shuffledItems[swapIndex], shuffledItems[index]];
  }

  return shuffledItems;
}

function stableQuestionWeight(questionId: string, seed: string): number {
  const input = `${seed}:${questionId}`;
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function isValidThresholdPercentage(thresholdPercentage: number): boolean {
  return Number.isFinite(thresholdPercentage) && thresholdPercentage > 0 && thresholdPercentage <= 100;
}
