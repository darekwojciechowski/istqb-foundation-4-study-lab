import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { OfficialSampleExam } from '../data/syllabus';
import type { DeepReadonly } from '../knowledge/types';

export interface OfficialSampleExamsSectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export interface OfficialSampleExamsSectionProps {
  officialSampleExams: ReadonlyArray<DeepReadonly<OfficialSampleExam>>;
  copy: OfficialSampleExamsSectionCopy;
}

export function OfficialSampleExamsSection({
  officialSampleExams,
  copy,
}: OfficialSampleExamsSectionProps) {
  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <p className="muted">{copy.description}</p>
      <div className="sample-exam-grid">
        {officialSampleExams.map((sampleExam) => (
          <article key={sampleExam.set} className="sample-exam-card">
            <h3>Sample Exam {sampleExam.set}</h3>
            <p>{sampleExam.version}</p>
            <div className="sample-exam-links">
              <a href={sampleExam.questionsUrl} target="_blank" rel="noreferrer">
                Sample Exam {sampleExam.set} questions
              </a>
              <a href={sampleExam.answersUrl} target="_blank" rel="noreferrer">
                Sample Exam {sampleExam.set} answers
              </a>
            </div>
            <small>{sampleExam.redistributionPolicy}</small>
          </article>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
