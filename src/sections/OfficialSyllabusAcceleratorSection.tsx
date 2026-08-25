import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { OfficialSyllabusGuide, SyllabusSprint } from '../data/syllabus';
import type { DeepReadonly } from '../knowledge/types';

export interface OfficialSyllabusAcceleratorSectionCopy {
  eyebrow: string;
  title: string;
  description: string;
  linkLabel: string;
  drillLabel: string;
  payoffLabel: string;
}

export interface OfficialSyllabusAcceleratorSectionProps {
  syllabusAccelerator: ReadonlyArray<DeepReadonly<SyllabusSprint>>;
  officialSyllabusGuide: DeepReadonly<OfficialSyllabusGuide>;
  copy: OfficialSyllabusAcceleratorSectionCopy;
}

export function OfficialSyllabusAcceleratorSection({
  syllabusAccelerator,
  officialSyllabusGuide,
  copy,
}: OfficialSyllabusAcceleratorSectionProps) {
  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <p className="muted">{copy.description}</p>
      {/* A description list rather than a labelled div: the old aria-label sat on a div
          with no role and was ignored, leaving the figures as loose text. dt/dd pairs
          state the relationship itself, the same way the hero's exam facts do. */}
      <dl className="syllabus-stats" data-testid="syllabus-stats">
        {officialSyllabusGuide.stats.map((stat) => (
          <div className="syllabus-stat" key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="syllabus-sprint-grid">
        {syllabusAccelerator.map((sprint) => (
          <article key={sprint.title} className="syllabus-sprint-card">
            <h3>{sprint.title}</h3>
            <p>{sprint.learningOutcome}</p>
            <p>
              <strong>{copy.drillLabel}:</strong> {sprint.drill}
            </p>
            <p>
              <strong>{copy.payoffLabel}:</strong> {sprint.payoff}
            </p>
          </article>
        ))}
      </div>
      <p className="muted usage-policy">{officialSyllabusGuide.usagePolicy}</p>
      <a href={officialSyllabusGuide.officialUrl} target="_blank" rel="noreferrer">
        {copy.linkLabel}
      </a>
    </CollapsiblePanel>
  );
}
