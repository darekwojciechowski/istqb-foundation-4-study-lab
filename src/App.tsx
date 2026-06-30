import { useEffect } from 'react';
import './App.css';
import { ExamTimer } from './features/quiz/ExamTimer';
import { QuizPanel } from './features/quiz/QuizPanel';
import { useQuizOrchestration } from './hooks/useQuizOrchestration';
import { knowledgePack } from './knowledge/currentKnowledgePack';
import type { KnowledgePack } from './knowledge/types';
import { AppliedTechniquesReferenceSection } from './sections/AppliedTechniquesReferenceSection';
import { ChapterOverviewSection } from './sections/ChapterOverviewSection';
import { ExternalLearningResourcesSection } from './sections/ExternalLearningResourcesSection';
import { HeroSection } from './sections/HeroSection';
import { LegalFooter } from './sections/LegalFooter';
import { OfficialReferencesSection } from './sections/OfficialReferencesSection';
import { OfficialSampleExamsSection } from './sections/OfficialSampleExamsSection';
import { OfficialSyllabusAcceleratorSection } from './sections/OfficialSyllabusAcceleratorSection';
import { PracticeToolsSection } from './sections/PracticeToolsSection';
import { RecentAttemptsSection } from './sections/RecentAttemptsSection';
import { StudyPathSection } from './sections/StudyPathSection';

export default function App({ pack = knowledgePack }: { pack?: KnowledgePack } = {}) {
  const meta = pack.meta;

  const {
    activeChapterId,
    activeChapter,
    progress,
    completionPercentage,
    activeChapterCompleted,
    quiz,
    flashcardReview,
    chapterScenario,
    shuffledTechniques,
    remainingMs,
    examInProgress,
    examTimedOut,
    announcement,
    quizSectionRef,
    resetQuiz,
    submitQuiz,
    toggleChapterReview,
    randomizeScenario,
  } = useQuizOrchestration({ pack });

  useEffect(() => {
    document.title = meta.appTitle;
  }, [meta.appTitle]);

  if (pack.syllabusChapters.length === 0) {
    return (
      <main>
        <section className="panel" aria-label="Knowledge pack unavailable">
          <p className="eyebrow">Configuration issue</p>
          <h1>{meta.appTitle}</h1>
          <p>This knowledge pack does not define any syllabus chapters yet. Add at least one chapter to continue.</p>
        </section>
      </main>
    );
  }

  const activeChapterWeight = `${activeChapter.weight.percentage}% of the exam, about ${activeChapter.weight.expectedQuestions} questions`;

  return (
    <main>
      <a className="skip-link" href="#quiz">
        Skip to quiz
      </a>
      <div className="sr-only" aria-live="polite" data-testid="live-announcer">
        {announcement}
      </div>

      {examInProgress ? <ExamTimer remainingMs={remainingMs} /> : null}

      <HeroSection
        copy={{
          appTitle: meta.appTitle,
          heroDescription: meta.heroDescription,
          startPracticeLabel: meta.heroStartPracticeLabel,
          startExamLabel: meta.heroStartExamLabel,
        }}
        examFacts={pack.examFacts}
        onStartPractice={() => resetQuiz('practice', activeChapterId)}
        onStartExam={() => resetQuiz('exam', activeChapterId)}
      />

      <section className="notice">
        <strong>Source and trademark note:</strong> {meta.sourceNotice}
      </section>

      <section className="grid two-columns">
        <StudyPathSection
          syllabusChapters={pack.syllabusChapters}
          eyebrow={meta.studyPathEyebrow}
          chapterPanelTitle={meta.chapterPanelTitle}
          activeChapterId={activeChapterId}
          completedChapterIds={[...progress.completedChapterIds]}
          completionPercentage={completionPercentage}
          onSelectChapter={(chapterId) => resetQuiz('practice', chapterId, false)}
        />
        <ChapterOverviewSection
          activeChapter={activeChapter}
          activeChapterCompleted={activeChapterCompleted}
          activeChapterWeight={activeChapterWeight}
          copy={{
            chapterLearningGoalsLabel: meta.chapterLearningGoalsLabel,
            chapterKeyConceptsLabel: meta.chapterKeyConceptsLabel,
            chapterStudyTacticsLabel: meta.chapterStudyTacticsLabel,
            chapterMarkReviewedLabel: meta.chapterMarkReviewedLabel,
            chapterMarkNotReviewedLabel: meta.chapterMarkNotReviewedLabel,
          }}
          onToggleChapterReview={toggleChapterReview}
        />
      </section>

      <QuizPanel
        id="quiz"
        activeChapterTitle={activeChapter.title}
        answers={quiz.answers}
        copy={{
          examSimulatorDescription: meta.examSimulatorDescription,
          quizPassResultMessage: meta.quizPassResultMessage,
          quizFailResultMessage: meta.quizFailResultMessage,
          practiceEyebrow: meta.practiceEyebrow,
          examEyebrow: meta.examEyebrow,
          examTitle: meta.examTitle,
          practiceTitlePrefix: meta.practiceTitlePrefix,
        }}
        isSubmitted={quiz.isSubmitted}
        onResetQuiz={() => resetQuiz()}
        onSubmitQuiz={submitQuiz}
        onSwitchMode={(mode) => resetQuiz(mode)}
        onUpdateAnswer={quiz.updateAnswer}
        passedQuiz={quiz.passedQuiz}
        quizMode={quiz.quizMode}
        quizQuestions={quiz.quizQuestions}
        quizSectionRef={quizSectionRef}
        review={quiz.review}
        score={quiz.score}
        timedOut={examTimedOut}
      />

      <PracticeToolsSection
        activeChapter={activeChapter}
        flashcardReview={flashcardReview}
        chapterScenario={chapterScenario}
        copy={{
          flashcardsEyebrow: meta.flashcardsEyebrow,
          flashcardsTitlePrefix: meta.flashcardsTitlePrefix,
          flashcardsShowAnswerLabel: meta.flashcardsShowAnswerLabel,
          flashcardsAgainLabel: meta.flashcardsAgainLabel,
          flashcardsGoodLabel: meta.flashcardsGoodLabel,
          flashcardsEasyLabel: meta.flashcardsEasyLabel,
          flashcardsMasteryLabel: meta.flashcardsMasteryLabel,
          flashcardsLevelLabel: meta.flashcardsLevelLabel,
          flashcardsEmptyLabel: meta.flashcardsEmptyLabel,
          scenarioEyebrow: meta.scenarioEyebrow,
          scenarioTitle: meta.scenarioTitle,
          scenarioShuffleLabel: meta.scenarioShuffleLabel,
          scenarioCoachingHintLabel: meta.scenarioCoachingHintLabel,
        }}
        onRandomizeScenario={randomizeScenario}
      />

      {shuffledTechniques.length > 0 ? (
        <AppliedTechniquesReferenceSection
          techniques={shuffledTechniques}
          copy={{
            eyebrow: meta.appliedTechniquesEyebrow,
            title: meta.appliedTechniquesTitle,
            intro: meta.appliedTechniquesIntro,
            expectedLabel: meta.appliedTechniqueExpectedLabel,
            exampleLabel: meta.appliedTechniqueExampleLabel,
          }}
        />
      ) : null}

      {pack.officialResources.length > 0 ? (
        <OfficialReferencesSection
          officialResources={pack.officialResources}
          copy={{
            eyebrow: meta.officialReferencesEyebrow,
            title: meta.officialReferencesTitle,
          }}
        />
      ) : null}
      {pack.syllabusAccelerator.length > 0 && pack.officialSyllabusGuide ? (
        <OfficialSyllabusAcceleratorSection
          syllabusAccelerator={pack.syllabusAccelerator}
          officialSyllabusGuide={pack.officialSyllabusGuide}
          copy={{
            eyebrow: meta.officialSyllabusEyebrow,
            title: meta.officialSyllabusTitle,
            description: meta.officialSyllabusDescription,
            linkLabel: meta.officialSyllabusLinkLabel,
            drillLabel: meta.syllabusSprintDrillLabel,
            payoffLabel: meta.syllabusSprintPayoffLabel,
          }}
        />
      ) : null}
      {pack.officialSampleExams.length > 0 ? (
        <OfficialSampleExamsSection
          officialSampleExams={pack.officialSampleExams}
          copy={{
            eyebrow: meta.officialSampleExamsEyebrow,
            title: meta.officialSampleExamsTitle,
            description: meta.officialSampleExamsDescription,
          }}
        />
      ) : null}
      {pack.externalLearningResources.length > 0 ? (
        <ExternalLearningResourcesSection
          externalLearningResources={pack.externalLearningResources}
          copy={{
            eyebrow: meta.externalResourcesEyebrow,
            title: meta.externalResourcesTitle,
            intro: meta.externalResourcesIntro,
          }}
        />
      ) : null}

      <RecentAttemptsSection
        attempts={progress.quizAttempts}
        copy={{
          eyebrow: meta.recentAttemptsEyebrow,
          title: meta.recentAttemptsTitle,
        }}
      />
      <LegalFooter intro={meta.legalDisclaimerIntro} details={meta.legalDisclaimerDetails} />
    </main>
  );
}
