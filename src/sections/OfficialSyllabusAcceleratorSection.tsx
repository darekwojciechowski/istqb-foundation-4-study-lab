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
      <div className="syllabus-stats" aria-label="Official syllabus facts">
        {officialSyllabusGuide.stats.map((stat) => (
          <span key={stat.label}>
            {stat.value} {stat.label}
          </span>
        ))}
      </div>
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
