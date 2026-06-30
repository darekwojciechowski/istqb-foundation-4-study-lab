// owns pack-contract / meta-completeness checks
// cross-file note: questions.test.ts owns per-question semantic content checks
import { describe, expect, it } from 'vitest';
import { knowledgePack } from '../knowledge/currentKnowledgePack';

describe('study content integrity', () => {
  it('exposes required metadata and runtime contract for the active knowledge pack', () => {
    const requiredMetaFields: Array<[keyof typeof knowledgePack.meta, number]> = [
      ['appTitle', 5],
      ['heroDescription', 20],
      ['sourceNotice', 20],
      ['legalDisclaimerIntro', 40],
      ['legalDisclaimerDetails', 40],
      ['examSimulatorDescription', 20],
      ['officialSampleExamsDescription', 20],
      ['officialSyllabusDescription', 20],
      ['officialSyllabusLinkLabel', 10],
      ['quizPassResultMessage', 10],
      ['quizFailResultMessage', 10],
      ['appliedTechniquesEyebrow', 5],
      ['appliedTechniquesTitle', 10],
      ['appliedTechniquesIntro', 20],
      ['flashcardsShowAnswerLabel', 3],
      ['flashcardsAgainLabel', 2],
      ['flashcardsGoodLabel', 2],
      ['flashcardsEasyLabel', 2],
      ['flashcardsMasteryLabel', 3],
      ['flashcardsLevelLabel', 3],
      ['flashcardsEmptyLabel', 10],
    ];

    requiredMetaFields.forEach(([field, minLength]) => {
      expect(knowledgePack.meta[field].trim().length).toBeGreaterThan(minLength);
    });

    // Every meta field is user-facing copy: guard that the pack defines all of them as
    // non-empty strings so a future pack author cannot silently drop a section's heading.
    Object.entries(knowledgePack.meta).forEach(([field, value]) => {
      expect(typeof value, `meta.${field} must be a string`).toBe('string');
      expect((value as string).trim().length, `meta.${field} must be non-empty`).toBeGreaterThan(0);
    });

    expect(knowledgePack.examFacts.questionCount).toBeGreaterThan(0);
    expect(knowledgePack.examFacts.durationMinutes).toBeGreaterThan(0);
    expect(knowledgePack.examFacts.passingScore).toBeGreaterThan(0);
    expect(knowledgePack.examFacts.passingScore).toBeLessThanOrEqual(knowledgePack.examFacts.questionCount);
    expect(knowledgePack.examFacts.passingPercentage).toBeGreaterThan(0);
    expect(knowledgePack.examFacts.passingPercentage).toBeLessThanOrEqual(100);

    expect(knowledgePack.progress.storageKey.length).toBeGreaterThan(5);
    expect(knowledgePack.passingRule.thresholdPercentage).toBeGreaterThan(0);
    expect(knowledgePack.passingRule.thresholdPercentage).toBeLessThanOrEqual(100);

    expect(knowledgePack.quiz.practiceQuestionCount).toBeGreaterThan(0);
    expect(knowledgePack.quiz.practiceQuestionCount).toBeLessThanOrEqual(knowledgePack.questions.length);
    expect(knowledgePack.quiz.supportedDifficulties.length).toBeGreaterThan(0);
  });

  it('exposes non-empty top-level collections in the active knowledge pack contract', () => {
    expect(knowledgePack.syllabusChapters.length).toBeGreaterThan(0);
    expect(knowledgePack.questions.length).toBeGreaterThan(0);
    expect(knowledgePack.flashcards.length).toBeGreaterThan(0);
    expect(knowledgePack.scenarios.length).toBeGreaterThan(0);
    expect(knowledgePack.quiz.supportedDifficulties.length).toBeGreaterThan(0);
  });

  it('keeps chapter references consistent across active-pack collections', () => {
    const chapterIds = new Set(knowledgePack.syllabusChapters.map((chapter) => chapter.id));

    expect(chapterIds.size).toBeGreaterThan(0);
    expect(knowledgePack.questions.length).toBeGreaterThan(0);

    knowledgePack.questions.forEach((question) => {
      expect(chapterIds.has(question.chapterId)).toBe(true);
    });

    knowledgePack.flashcards.forEach((flashcard) => {
      expect(chapterIds.has(flashcard.chapterId)).toBe(true);
    });

    knowledgePack.scenarios.forEach((scenario) => {
      expect(chapterIds.has(scenario.chapterId)).toBe(true);
    });

    knowledgePack.syllabusAccelerator.forEach((sprint) => {
      expect(sprint.chapterIds.length).toBeGreaterThan(0);
      sprint.chapterIds.forEach((chapterId) => {
        expect(chapterIds.has(chapterId)).toBe(true);
      });
    });
  });

  it('provides at least 8 flashcards for each chapter', () => {
    const flashcardCountByChapter = new Map<string, number>();

    knowledgePack.syllabusChapters.forEach((chapter) => {
      flashcardCountByChapter.set(chapter.id, 0);
    });

    knowledgePack.flashcards.forEach((flashcard) => {
      flashcardCountByChapter.set(flashcard.chapterId, (flashcardCountByChapter.get(flashcard.chapterId) ?? 0) + 1);
    });

    flashcardCountByChapter.forEach((flashcardCount) => {
      expect(flashcardCount).toBeGreaterThanOrEqual(8);
    });
  });

  it('provides at least 4 scenario drills for each chapter', () => {
    const scenarioCountByChapter = new Map<string, number>();

    knowledgePack.syllabusChapters.forEach((chapter) => {
      scenarioCountByChapter.set(chapter.id, 0);
    });

    knowledgePack.scenarios.forEach((scenario) => {
      scenarioCountByChapter.set(scenario.chapterId, (scenarioCountByChapter.get(scenario.chapterId) ?? 0) + 1);
    });

    scenarioCountByChapter.forEach((scenarioCount) => {
      expect(scenarioCount).toBeGreaterThanOrEqual(4);
    });
  });

  it('keeps flashcard ids unique in the active pack', () => {
    const flashcardIds = knowledgePack.flashcards.map((flashcard) => flashcard.id);
    const uniqueFlashcardIds = new Set(flashcardIds);

    expect(uniqueFlashcardIds.size).toBe(flashcardIds.length);
  });

  it('keeps scenario ids unique in the active pack', () => {
    const scenarioIds = knowledgePack.scenarios.map((scenario) => scenario.id);
    const uniqueScenarioIds = new Set(scenarioIds);

    expect(uniqueScenarioIds.size).toBe(scenarioIds.length);
  });

  it('exposes a non-empty applied-techniques reference owned by the active pack', () => {
    expect(knowledgePack.appliedTechniques.length).toBeGreaterThan(0);

    const techniqueIds = knowledgePack.appliedTechniques.map((technique) => technique.id);
    expect(new Set(techniqueIds).size).toBe(techniqueIds.length);

    knowledgePack.appliedTechniques.forEach((technique) => {
      expect(technique.technique.trim().length).toBeGreaterThan(0);
      expect(technique.reference.trim().length).toBeGreaterThan(0);
      expect(technique.expectedPractice.trim().length).toBeGreaterThan(0);
      expect(technique.illustrativeExample.trim().length).toBeGreaterThan(0);
    });
  });

  it('keeps question and resource contracts valid for the active pack', () => {
    const supportedDifficulties = new Set(knowledgePack.quiz.supportedDifficulties);

    knowledgePack.questions.forEach((question) => {
      expect(question.prompt.trim().length).toBeGreaterThan(20);
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(question.correctOptionIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctOptionIndex).toBeLessThan(question.options.length);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
      expect(supportedDifficulties.has(question.difficulty)).toBe(true);
    });

    knowledgePack.officialSampleExams.forEach((exam) => {
      expect(exam.questionsUrl).toMatch(/^https:\/\//);
      expect(exam.answersUrl).toMatch(/^https:\/\//);
      expect(exam.redistributionPolicy.trim().length).toBeGreaterThan(10);
    });

    const officialSyllabusGuide = knowledgePack.officialSyllabusGuide;
    if (officialSyllabusGuide) {
      expect(officialSyllabusGuide.title.trim().length).toBeGreaterThan(10);
      expect(officialSyllabusGuide.officialUrl).toMatch(/^https:\/\//);
      expect(officialSyllabusGuide.usagePolicy.trim().length).toBeGreaterThan(10);
      officialSyllabusGuide.stats.forEach((stat) => {
        expect(stat.label.trim().length).toBeGreaterThan(0);
        expect(stat.value).toBeGreaterThanOrEqual(0);
      });
    }

    knowledgePack.externalLearningResources.forEach((resource) => {
      expect(resource.title.trim().length).toBeGreaterThan(5);
      expect(resource.url).toMatch(/^https:\/\//);
      expect(resource.contentUse.trim().length).toBeGreaterThan(5);
    });

    const serializedContent = JSON.stringify({
      flashcards: knowledgePack.flashcards,
      questions: knowledgePack.questions,
      scenarios: knowledgePack.scenarios,
      syllabusChapters: knowledgePack.syllabusChapters,
    });
    const nonAsciiCharacter = Array.from(serializedContent).find((character) => character.charCodeAt(0) > 127);
    expect(nonAsciiCharacter).toBeUndefined();
  });
});
