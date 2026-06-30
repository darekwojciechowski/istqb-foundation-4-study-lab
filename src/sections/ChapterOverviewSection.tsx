import type { SyllabusChapter } from '../data/syllabus';
import type { ChapterOverviewCopy, DeepReadonly } from '../knowledge/types';

export interface ChapterOverviewSectionProps {
  activeChapter: DeepReadonly<SyllabusChapter>;
  activeChapterCompleted: boolean;
  activeChapterWeight: string;
  copy: ChapterOverviewCopy;
  onToggleChapterReview: () => void;
}

export function ChapterOverviewSection({
  activeChapter,
  activeChapterCompleted,
  activeChapterWeight,
  copy,
  onToggleChapterReview,
}: ChapterOverviewSectionProps) {
  return (
    <article className="panel">
      <p className="eyebrow">{activeChapterWeight}</p>
      <h2>{activeChapter.title}</h2>
      <p>{activeChapter.summary}</p>
      <h3>{copy.chapterLearningGoalsLabel}</h3>
      <ul>
        {activeChapter.learningGoals.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>
      <h3>{copy.chapterKeyConceptsLabel}</h3>
      <div className="tag-list">
        {activeChapter.keyConcepts.map((concept) => (
          <span key={concept}>{concept}</span>
        ))}
      </div>
      <h3>{copy.chapterStudyTacticsLabel}</h3>
      <ul>
        {activeChapter.studyTactics.map((tactic) => (
          <li key={tactic}>{tactic}</li>
        ))}
      </ul>
      <button type="button" onClick={onToggleChapterReview}>
        {activeChapterCompleted ? copy.chapterMarkNotReviewedLabel : copy.chapterMarkReviewedLabel}
      </button>
    </article>
  );
}
