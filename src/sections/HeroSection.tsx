import type { KnowledgePack } from '../knowledge/types';

export interface HeroSectionCopy {
  appTitle: string;
  heroDescription: string;
  startPracticeLabel: string;
  startExamLabel: string;
}

export interface HeroSectionProps {
  copy: HeroSectionCopy;
  examFacts: KnowledgePack['examFacts'];
  onStartPractice: () => void;
  onStartExam: () => void;
}

export function HeroSection({ copy, examFacts, onStartPractice, onStartExam }: HeroSectionProps) {
  return (
    <header className="hero">
      <div>
        {(() => {
          const [title, subtitle] = copy.appTitle.split(' — ');
          const titleLines = title.split(/(?=Study Lab)/);
          return (
            <>
              <h1>
                {titleLines[0]}
                {titleLines.length > 1 && <><br />{titleLines[1]}</>}
              </h1>
              {subtitle && (
                <p className="hero-subtitle">
                  {subtitle.split(/(?=Exam )/)[0]}
                  <br />{subtitle.split(/(?=Exam )/)[1]}
                </p>
              )}
            </>
          );
        })()}
        <p className="hero-copy">{copy.heroDescription}</p>
        <div className="hero-actions" aria-label="Primary learning actions">
          <button type="button" onClick={onStartPractice}>
            {copy.startPracticeLabel}
          </button>
          <button type="button" className="secondary" onClick={onStartExam}>
            {copy.startExamLabel}
          </button>
        </div>
      </div>
      <aside className="exam-card" aria-label="Exam facts">
        <dl className="exam-stats">
          <div className="exam-stat">
            <dt>Questions</dt>
            <dd>{examFacts.questionCount}</dd>
          </div>
          <div className="exam-stat">
            <dt>Duration</dt>
            <dd>{examFacts.durationMinutes} min</dd>
          </div>
          <div className="exam-stat">
            <dt>Passing score</dt>
            <dd>{examFacts.passingScore}/{examFacts.questionCount}</dd>
          </div>
          <div className="exam-stat">
            <dt>Pass threshold</dt>
            <dd>{examFacts.passingPercentage}%</dd>
          </div>
        </dl>
      </aside>
    </header>
  );
}
