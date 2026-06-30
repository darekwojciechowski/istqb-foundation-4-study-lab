import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { OfficialResource } from '../data/syllabus';
import type { DeepReadonly } from '../knowledge/types';

export interface OfficialReferencesSectionCopy {
  eyebrow: string;
  title: string;
}

export interface OfficialReferencesSectionProps {
  officialResources: ReadonlyArray<DeepReadonly<OfficialResource>>;
  copy: OfficialReferencesSectionCopy;
}

export function OfficialReferencesSection({ officialResources, copy }: OfficialReferencesSectionProps) {
  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <ul className="resource-list">
        {officialResources.map((resource) => (
          <li key={resource.url}>
            <a href={resource.url} target="_blank" rel="noreferrer">
              {resource.label}
            </a>
          </li>
        ))}
      </ul>
    </CollapsiblePanel>
  );
}
