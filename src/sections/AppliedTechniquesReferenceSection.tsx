import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { AppliedTechnique } from '../data/syllabus';
import type { DeepReadonly } from '../knowledge/types';

export interface AppliedTechniquesReferenceSectionCopy {
  eyebrow: string;
  title: string;
  intro: string;
  expectedLabel: string;
  exampleLabel: string;
}

export interface AppliedTechniquesReferenceSectionProps {
  techniques: ReadonlyArray<DeepReadonly<AppliedTechnique>>;
  copy: AppliedTechniquesReferenceSectionCopy;
}

export function AppliedTechniquesReferenceSection({
  techniques,
  copy,
}: AppliedTechniquesReferenceSectionProps) {
  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <p>{copy.intro}</p>
      <ul className="applied-techniques-list">
        {techniques.map((entry) => (
          <li key={entry.id}>
            <h3>
              {entry.technique}{' '}
              <span className="syllabus-ref">{entry.reference}</span>
            </h3>
            <p>
              <strong>{copy.expectedLabel}:</strong> {entry.expectedPractice}
            </p>
            <p>
              <strong>{copy.exampleLabel}:</strong> {entry.illustrativeExample}
            </p>
          </li>
        ))}
      </ul>
    </CollapsiblePanel>
  );
}
