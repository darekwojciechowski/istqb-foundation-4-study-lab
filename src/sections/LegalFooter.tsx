export interface LegalFooterProps {
  intro: string;
  details: string;
}

export function LegalFooter({ intro, details }: LegalFooterProps) {
  return (
    <footer className="legal-footer">
      <p>
        <strong>Legal disclaimer:</strong> {intro}
      </p>
      <p>{details}</p>
    </footer>
  );
}
