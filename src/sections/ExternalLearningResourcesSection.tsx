import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { ExternalLearningResource } from '../data/externalResources';
import type { DeepReadonly } from '../knowledge/types';

export interface ExternalLearningResourcesSectionCopy {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface ExternalLearningResourcesSectionProps {
  externalLearningResources: ReadonlyArray<DeepReadonly<ExternalLearningResource>>;
  copy: ExternalLearningResourcesSectionCopy;
}

export function ExternalLearningResourcesSection({
  externalLearningResources,
  copy,
}: ExternalLearningResourcesSectionProps) {
  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <p className="muted">{copy.intro}</p>
      <div className="resource-card-grid">
        {externalLearningResources.map((resource) => (
          <article key={resource.url} className="resource-card">
            <div className="resource-card-heading">
              <span>{resource.category}</span>
              {resource.hasExampleQuestions ? <em>example questions</em> : null}
            </div>
            <h3>
              <a href={resource.url} target="_blank" rel="noreferrer">
                {resource.title}
              </a>
            </h3>
            <p className="creator">{resource.creator}</p>
            <p>{resource.focus}</p>
            <p>{resource.whyUseIt}</p>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
