// owns semantic content checks (per-question correctness, uniqueness, author log)
// cross-file note: contentIntegrity.test.ts owns pack-contract / meta-completeness checks
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { questions } from './questions';
import { syllabusChapters } from './syllabus';

describe('questions data — semantic checks', () => {
  it('covers every syllabus chapter with at least one question', () => {
    const covered = new Set(questions.map((question) => question.chapterId));
    const missing = syllabusChapters.filter((chapter) => !covered.has(chapter.id)).map((chapter) => chapter.id);
    expect(missing).toEqual([]);
  });

  it('has a non-empty trimmed explanation for every question', () => {
    const offenders = questions.filter(
      (question) => typeof question.explanation !== 'string' || question.explanation.trim().length === 0,
    );
    expect(offenders.map((question) => question.id)).toEqual([]);
  });

  it('does not concentrate more than 70% of correct answers on a single option index', () => {
    const counts = new Map<number, number>();
    for (const question of questions) {
      counts.set(question.correctOptionIndex, (counts.get(question.correctOptionIndex) ?? 0) + 1);
    }
    const max = Math.max(...counts.values());
    const ratio = max / questions.length;
    expect(ratio).toBeLessThanOrEqual(0.7);
  });

  it('has unique prompt text across the bank', () => {
    const seen = new Map<string, string>();
    const duplicates: string[] = [];
    for (const question of questions) {
      const key = question.prompt.trim();
      const prior = seen.get(key);
      if (prior) {
        duplicates.push(`${prior} / ${question.id}`);
      } else {
        seen.set(key, question.id);
      }
    }
    expect(duplicates).toEqual([]);
  });

  it('meets the per-chapter minimum-count guard derived from exam weights', () => {
    const byChapter = new Map<string, number>();
    for (const question of questions) {
      byChapter.set(question.chapterId, (byChapter.get(question.chapterId) ?? 0) + 1);
    }
    const offenders = syllabusChapters
      .map((chapter) => {
        const have = byChapter.get(chapter.id) ?? 0;
        const min = Math.floor(chapter.weight.expectedQuestions * 0.9);
        return { id: chapter.id, have, min };
      })
      .filter((row) => row.have < row.min);
    expect(offenders).toEqual([]);
  });

  it('covers all three difficulty levels in every chapter with at least six questions', () => {
    const difficultiesByChapter = new Map<string, Set<string>>();
    const countsByChapter = new Map<string, number>();
    for (const question of questions) {
      countsByChapter.set(question.chapterId, (countsByChapter.get(question.chapterId) ?? 0) + 1);
      const set = difficultiesByChapter.get(question.chapterId) ?? new Set<string>();
      set.add(question.difficulty);
      difficultiesByChapter.set(question.chapterId, set);
    }
    const required = ['foundation', 'intermediate', 'exam'];
    const offenders: string[] = [];
    for (const [chapterId, count] of countsByChapter) {
      if (count < 6) continue;
      const present = difficultiesByChapter.get(chapterId) ?? new Set<string>();
      const missing = required.filter((difficulty) => !present.has(difficulty));
      if (missing.length > 0) {
        offenders.push(`${chapterId}: missing ${missing.join(', ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('records every question id in the author log when the log file exists', () => {
    const logPath = resolve(__dirname, '../../.agents/authoring/question-sources.md');
    if (!existsSync(logPath)) {
      return;
    }
    const log = readFileSync(logPath, 'utf8');
    const missing = questions.map((question) => question.id).filter((id) => !log.includes(`| ${id} |`));
    expect(missing).toEqual([]);
  });
});
