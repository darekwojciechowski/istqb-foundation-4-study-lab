import { PanelHeader } from '../components/PanelHeader';
import type { SyllabusChapter } from '../data/syllabus';
import type { DeepReadonly } from '../knowledge/types';
import type { ChapterId } from '../lib/quiz';

export interface StudyPathSectionProps {
  syllabusChapters: ReadonlyArray<DeepReadonly<SyllabusChapter>>;
  eyebrow: string;
  chapterPanelTitle: string;
  activeChapterId: ChapterId;
  completedChapterIds: ChapterId[];
  completionPercentage: number;
  onSelectChapter: (chapterId: ChapterId) => void;
}

export function StudyPathSection({
  syllabusChapters,
  eyebrow,
  chapterPanelTitle,
  activeChapterId,
  completedChapterIds,
  completionPercentage,
  onSelectChapter,
}: StudyPathSectionProps) {
  return (
    <div className="panel">
      <PanelHeader
        eyebrow={eyebrow}
        title={`${syllabusChapters.length} ${chapterPanelTitle}`}
        accessory={<span className="progress-pill" data-testid="progress-pill">{completionPercentage}% complete</span>}
      />
      <nav className="chapter-list" aria-label="Chapter navigation">
        {syllabusChapters.map((chapter) => (
          <button
            type="button"
            className={chapter.id === activeChapterId ? 'chapter-card active' : 'chapter-card'}
            data-testid="chapter-card"
            aria-current={chapter.id === activeChapterId ? 'true' : undefined}
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
          >
            <span className="chapter-card__meta">
              <span>Chapter {chapter.order}</span>
              {completedChapterIds.includes(chapter.id) ? <em>Completed</em> : null}
            </span>
            <strong>{chapter.title}</strong>
            <small>{chapter.summary}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}
