import type { ReactNode } from 'react';

export interface PanelHeaderProps {
  eyebrow: string;
  title: string;
  accessory?: ReactNode;
}

export function PanelHeader({ eyebrow, title, accessory }: PanelHeaderProps) {
  return (
    <div className="panel-heading panel-heading--anchored-action" data-testid="panel-heading">
      <div className="panel-heading__copy">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {accessory ? <div className="panel-heading__accessory" data-testid="panel-heading-accessory">{accessory}</div> : null}
    </div>
  );
}
