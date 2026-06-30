import type { ReactNode } from 'react';

export interface CollapsiblePanelProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsiblePanel({
  eyebrow,
  title,
  children,
  defaultOpen = false,
}: CollapsiblePanelProps) {
  return (
    <details className="panel collapsible-panel" open={defaultOpen}>
      <summary className="collapsible-panel__summary">
        <div className="collapsible-panel__heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <span className="collapsible-panel__chevron" aria-hidden="true" />
      </summary>
      <div className="collapsible-panel__body">{children}</div>
    </details>
  );
}
