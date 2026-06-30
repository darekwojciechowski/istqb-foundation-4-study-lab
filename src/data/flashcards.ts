import type { ChapterId } from '../lib/quiz';

export interface Flashcard<TChapterId extends string = string> {
  id: string;
  chapterId: ChapterId<TChapterId>;
  prompt: string;
  answer: string;
}

export interface ScenarioPrompt<TChapterId extends string = string> {
  id: string;
  chapterId: ChapterId<TChapterId>;
  prompt: string;
  coachingHint: string;
}

export const flashcards: Flashcard[] = [
  {
    id: 'flash-fundamentals-1',
    chapterId: 'fundamentals',
    prompt: 'What is the difference between testing and debugging?',
    answer:
      'Testing finds failures. Debugging finds and fixes the cause.',
  },
  {
    id: 'flash-fundamentals-2',
    chapterId: 'fundamentals',
    prompt: 'Why is exhaustive testing usually impossible?',
    answer:
      'There are too many inputs, states, and paths to try them all. We pick tests based on risk.',
  },
  {
    id: 'flash-fundamentals-3',
    chapterId: 'fundamentals',
    prompt: 'What does the absence-of-errors fallacy warn about?',
    answer:
      'Few bugs is not enough. If the product solves the wrong problem, it still fails users.',
  },
  {
    id: 'flash-fundamentals-4',
    chapterId: 'fundamentals',
    prompt: 'How are error, defect, and failure related?',
    answer:
      'A person makes an error. The error puts a defect in the work. When run, the defect can cause a failure.',
  },
  {
    id: 'flash-fundamentals-5',
    chapterId: 'fundamentals',
    prompt: 'What is the difference between confirmation testing and regression testing?',
    answer:
      'Confirmation testing checks the fix works. Regression testing checks nothing else broke.',
  },
  {
    id: 'flash-fundamentals-6',
    chapterId: 'fundamentals',
    prompt: 'Why can independent testing improve outcomes?',
    answer:
      'Fresh eyes spot bugs the author misses. They also challenge assumptions.',
  },
  {
    id: 'flash-fundamentals-7',
    chapterId: 'fundamentals',
    prompt: 'Why does early testing usually reduce cost?',
    answer:
      'Bugs found early are cheap to fix. Bugs found late are expensive.',
  },
  {
    id: 'flash-fundamentals-8',
    chapterId: 'fundamentals',
    prompt: 'What should testing provide to stakeholders?',
    answer:
      'Facts and risk info to help them decide. Not a promise of zero bugs.',
  },
  {
    id: 'flash-sdlc-1',
    chapterId: 'sdlc',
    prompt: 'Name the common CTFL test levels.',
    answer:
      'Component, component integration, system, system integration, and acceptance.',
  },
  {
    id: 'flash-sdlc-2',
    chapterId: 'sdlc',
    prompt: 'What does shift-left testing try to achieve?',
    answer:
      'Test earlier. Find bugs sooner, when they cost less.',
  },
  {
    id: 'flash-sdlc-3',
    chapterId: 'sdlc',
    prompt: 'How do test levels differ from test types?',
    answer:
      'Levels say WHEN we test. Types say WHAT quality we check.',
  },
  {
    id: 'flash-sdlc-4',
    chapterId: 'sdlc',
    prompt: 'What commonly triggers maintenance testing?',
    answer:
      'Fixes, new features, env changes, infrastructure updates, or retired interfaces.',
  },
  {
    id: 'flash-sdlc-5',
    chapterId: 'sdlc',
    prompt: 'Why is impact analysis important after a change?',
    answer:
      'It shows what the change can break. We then test those risky areas, not everything.',
  },
  {
    id: 'flash-sdlc-6',
    chapterId: 'sdlc',
    prompt: 'What is the core benefit of test-first approaches like TDD, ATDD, or BDD?',
    answer:
      'They make behavior clear before coding and give fast feedback during work.',
  },
  {
    id: 'flash-sdlc-7',
    chapterId: 'sdlc',
    prompt: 'How does DevOps influence testing work?',
    answer:
      'It pushes fast, constant feedback. Tests run often in the pipeline along with frequent releases.',
  },
  {
    id: 'flash-sdlc-8',
    chapterId: 'sdlc',
    prompt: 'What perspectives can acceptance testing cover?',
    answer:
      'User needs, business goals, legal rules, and contracts.',
  },
  {
    id: 'flash-static-1',
    chapterId: 'static-testing',
    prompt: 'What makes static testing static?',
    answer:
      'We check the work without running the code. Examples: reviews and static analysis.',
  },
  {
    id: 'flash-static-2',
    chapterId: 'static-testing',
    prompt: 'Give two examples of work products that can be reviewed.',
    answer: 'Requirements, user stories, designs, code, test cases, plans, contracts, and user docs.',
  },
  {
    id: 'flash-static-3',
    chapterId: 'static-testing',
    prompt: 'What is a key benefit of static testing compared with dynamic testing?',
    answer:
      'It catches unclear, missing, or wrong info before code exists. Prevents bugs early.',
  },
  {
    id: 'flash-static-4',
    chapterId: 'static-testing',
    prompt: 'How do walkthrough, technical review, and inspection differ at a high level?',
    answer:
      'They differ in formality and roles. Inspection is the most formal one.',
  },
  {
    id: 'flash-static-5',
    chapterId: 'static-testing',
    prompt: 'What does a moderator do in a formal review?',
    answer:
      'Runs the review. Keeps it on track and makes sure the goals are met.',
  },
  {
    id: 'flash-static-6',
    chapterId: 'static-testing',
    prompt: 'What does a scribe contribute in reviews?',
    answer:
      'Writes down bugs, decisions, and action items so they can be tracked.',
  },
  {
    id: 'flash-static-7',
    chapterId: 'static-testing',
    prompt: 'What can static analysis tools find in code?',
    answer:
      'Dead code, risky patterns, style issues, and likely bugs - all without running the code.',
  },
  {
    id: 'flash-static-8',
    chapterId: 'static-testing',
    prompt: 'What makes review feedback effective?',
    answer:
      'Be specific, polite, and focus on the work - not the person.',
  },
  {
    id: 'flash-techniques-1',
    chapterId: 'test-techniques',
    prompt: 'When is decision table testing especially useful?',
    answer: 'When different mixes of inputs or rules lead to different actions.',
  },
  {
    id: 'flash-techniques-2',
    chapterId: 'test-techniques',
    prompt: 'How is statement coverage calculated?',
    answer: 'Statements run divided by total statements, times 100%.',
  },
  {
    id: 'flash-techniques-3',
    chapterId: 'test-techniques',
    prompt: 'What is the purpose of equivalence partitioning?',
    answer:
      'Group inputs that act the same. Test one value from each group.',
  },
  {
    id: 'flash-techniques-4',
    chapterId: 'test-techniques',
    prompt: 'How does 2-value boundary value analysis differ from 3-value?',
    answer:
      '2-value: the boundary and one value just outside. 3-value: also the value just inside.',
  },
  {
    id: 'flash-techniques-5',
    chapterId: 'test-techniques',
    prompt: 'When is state transition testing a strong choice?',
    answer:
      'When behavior depends on past steps - moving between states changes what is allowed.',
  },
  {
    id: 'flash-techniques-6',
    chapterId: 'test-techniques',
    prompt: 'Why are decision tables useful for business rules?',
    answer:
      'They list all condition mixes and their actions, so missing or clashing rules pop out.',
  },
  {
    id: 'flash-techniques-7',
    chapterId: 'test-techniques',
    prompt: 'How do exploratory and scripted testing complement each other?',
    answer:
      'Scripted tests are repeatable and traceable. Exploratory tests adapt fast and find new risks.',
  },
  {
    id: 'flash-techniques-8',
    chapterId: 'test-techniques',
    prompt: 'How are statement coverage and branch coverage related?',
    answer:
      'Branch coverage is stronger. 100% statements does not mean every true/false path was tested.',
  },
  {
    id: 'flash-management-1',
    chapterId: 'test-management',
    prompt: 'What two dimensions commonly define product risk exposure?',
    answer: 'How likely it is to happen, and how bad it would be if it does.',
  },
  {
    id: 'flash-management-2',
    chapterId: 'test-management',
    prompt: 'What is the purpose of test control?',
    answer:
      'Use what we see to act. Change test order, focus, or resources to fix problems.',
  },
  {
    id: 'flash-management-3',
    chapterId: 'test-management',
    prompt: 'What is the difference between a test strategy and a test plan?',
    answer:
      'Strategy = the big picture approach. Plan = the concrete scope, dates, people, and tasks.',
  },
  {
    id: 'flash-management-4',
    chapterId: 'test-management',
    prompt: 'Why are entry and exit criteria useful?',
    answer:
      'Clear rules for when to start and when to stop testing. Easier to decide and to be transparent.',
  },
  {
    id: 'flash-management-5',
    chapterId: 'test-management',
    prompt: 'What kind of metrics are useful in test monitoring?',
    answer:
      'Ones that help us decide: progress vs plan, open bug trends, and risky areas still open.',
  },
  {
    id: 'flash-management-6',
    chapterId: 'test-management',
    prompt: 'What information should a high-quality defect report include?',
    answer:
      'Steps to reproduce, environment, data, expected vs actual result, and the impact.',
  },
  {
    id: 'flash-management-7',
    chapterId: 'test-management',
    prompt: 'What is residual risk in test reporting?',
    answer:
      'The risk left after testing - open bugs and areas we did not cover well.',
  },
  {
    id: 'flash-management-8',
    chapterId: 'test-management',
    prompt: 'How do product risk and project risk differ?',
    answer:
      'Product risk = bad quality in the product. Project risk = threats to delivery, time, or people.',
  },
  {
    id: 'flash-tools-1',
    chapterId: 'test-tools',
    prompt: 'Why can test automation still require maintenance?',
    answer:
      'It relies on UI, data, timing, and expected results - all of which change as the product changes.',
  },
  {
    id: 'flash-tools-2',
    chapterId: 'test-tools',
    prompt: 'What is the difference between a false positive and a false negative?',
    answer:
      'False positive: cries wolf about a fake bug. False negative: misses a real bug.',
  },
  {
    id: 'flash-tools-3',
    chapterId: 'test-tools',
    prompt: 'Which activities can test tools support?',
    answer:
      'Planning, test design, running tests, comparing results, tracking bugs, and reporting.',
  },
  {
    id: 'flash-tools-4',
    chapterId: 'test-tools',
    prompt: 'What is a realistic benefit of automation?',
    answer:
      'Fast, repeatable checks. People are freed to think, design, and explore.',
  },
  {
    id: 'flash-tools-5',
    chapterId: 'test-tools',
    prompt: 'What is a common automation risk besides false results?',
    answer:
      'Hard-to-maintain checks become brittle, costly, and people stop trusting them.',
  },
  {
    id: 'flash-tools-6',
    chapterId: 'test-tools',
    prompt: 'Why is a pilot project recommended before broad tool rollout?',
    answer:
      'A pilot proves fit, integration, skills, and upkeep cost - before a big spend.',
  },
  {
    id: 'flash-tools-7',
    chapterId: 'test-tools',
    prompt: 'Why is tool qualification and governance important?',
    answer:
      'Set clear owners, rules, and data checks so we can trust the tool output.',
  },
  {
    id: 'flash-tools-8',
    chapterId: 'test-tools',
    prompt: 'Why do teams still need human testing skills when tools are in place?',
    answer:
      'Tools just run steps. People design tests, judge risk, investigate, and adapt.',
  },
];

export const scenarios: ScenarioPrompt[] = [
  {
    id: 'scenario-fundamentals',
    chapterId: 'fundamentals',
    prompt:
      'A stakeholder asks you to sign off that the release is defect-free after a successful regression run. How would you respond?',
    coachingHint:
      'Use the principle that testing reduces uncertainty but cannot prove the absence of defects. Offer evidence, residual risks, and known coverage limits.',
  },
  {
    id: 'scenario-fundamentals-defect-clustering',
    chapterId: 'fundamentals',
    prompt:
      'Your team has limited time and historical data shows most failures came from discount rules. How would this affect your test focus?',
    coachingHint:
      'Connect defect clustering, risk, and context-dependent testing. Explain why focused testing can be more valuable than equal testing everywhere.',
  },
  {
    id: 'scenario-fundamentals-independent-testing',
    chapterId: 'fundamentals',
    prompt:
      'A developer says their own unit tests are enough because they know the feature best. How would you explain the value of independent testing?',
    coachingHint:
      'Emphasize fresh perspective and reduced confirmation bias while acknowledging that developers still have valuable technical insight.',
  },
  {
    id: 'scenario-fundamentals-early-testing',
    chapterId: 'fundamentals',
    prompt:
      'A product owner wants testers to wait until coding is complete before getting involved. What testing principle would you use to challenge that plan?',
    coachingHint:
      'Use early testing and defect prevention. Explain how reviewing requirements, risks, and examples sooner can reduce rework and cost.',
  },
  {
    id: 'scenario-sdlc',
    chapterId: 'sdlc',
    prompt:
      'A team fixed a small configuration bug in production. What testing would you consider before the patch is released?',
    coachingHint:
      'Think about maintenance testing, impact analysis, confirmation testing, and focused regression testing around affected behavior.',
  },
  {
    id: 'scenario-sdlc-levels-types',
    chapterId: 'sdlc',
    prompt:
      'A stakeholder asks whether performance testing is a system test level or a test type. How would you clarify the difference?',
    coachingHint:
      'Explain that test levels describe where testing happens in the lifecycle, while test types describe the objective of testing.',
  },
  {
    id: 'scenario-sdlc-shift-left',
    chapterId: 'sdlc',
    prompt:
      'Before implementation starts, the team writes acceptance examples for a new refund workflow. How does this support shift-left testing?',
    coachingHint:
      'Connect early clarification, test-first thinking, shared understanding, and fewer late surprises in system or acceptance testing.',
  },
  {
    id: 'scenario-sdlc-system-integration',
    chapterId: 'sdlc',
    prompt:
      'A complete web shop works in isolation, but failures appear when it exchanges stock data with a warehouse platform. Which test level is most relevant?',
    coachingHint:
      'Point to system integration testing because the focus is the interaction between the system under test and an external system.',
  },
  {
    id: 'scenario-static',
    chapterId: 'static-testing',
    prompt:
      'A user story says "the checkout should be fast and secure." What review comments would improve its testability?',
    coachingHint:
      'Ask for measurable performance criteria, security expectations, supported contexts, and acceptance examples.',
  },
  {
    id: 'scenario-static-review-roles',
    chapterId: 'static-testing',
    prompt:
      'A review meeting finds useful defects but nobody records decisions or follow-up actions. What review improvement would you suggest?',
    coachingHint:
      'Point to clear review roles and outcomes. A scribe or agreed recording approach helps turn review findings into trackable action.',
  },
  {
    id: 'scenario-static-analysis',
    chapterId: 'static-testing',
    prompt:
      'A static analysis tool reports unreachable code in a payment validation module. How should the team treat that finding before dynamic testing?',
    coachingHint:
      'Explain that static analysis can reveal anomalies without execution, but findings still need triage to decide whether they indicate real defects.',
  },
  {
    id: 'scenario-static-feedback',
    chapterId: 'static-testing',
    prompt:
      'During a review, comments become personal and the author stops engaging. What feedback practice would improve the review outcome?',
    coachingHint:
      'Focus feedback on the work product, make comments specific and respectful, and keep the goal on defect detection and shared understanding.',
  },
  {
    id: 'scenario-techniques',
    chapterId: 'test-techniques',
    prompt:
      'A loan approval rule depends on income, credit score, and existing debt. Which test technique would you start with and why?',
    coachingHint:
      'Decision table testing is a strong first choice because combinations of conditions drive different decisions.',
  },
  {
    id: 'scenario-techniques-boundaries',
    chapterId: 'test-techniques',
    prompt:
      'A checkout discount applies only for cart totals from 100 to 500 inclusive. Which boundary values would you start with?',
    coachingHint:
      'Use boundary value analysis. Include values just below, at, and just above the boundaries before adding representative partition values.',
  },
  {
    id: 'scenario-techniques-state-transition',
    chapterId: 'test-techniques',
    prompt:
      'An account locks after three failed login attempts and unlocks only after a support reset. Which technique helps model the valid and invalid flows?',
    coachingHint:
      'Use state transition testing because behavior depends on history, states, events, and allowed or forbidden transitions.',
  },
  {
    id: 'scenario-techniques-coverage',
    chapterId: 'test-techniques',
    prompt:
      'A tiny function has 100 percent statement coverage, but nobody tested the false outcome of an important decision. What coverage idea is missing?',
    coachingHint:
      'Explain branch coverage. Executing every statement does not guarantee that each decision outcome has been exercised.',
  },
  {
    id: 'scenario-management',
    chapterId: 'test-management',
    prompt:
      'You have two days left and ten areas still untested. How would risk influence your test plan?',
    coachingHint:
      'Prioritize areas with high likelihood and high impact, explain trade-offs, and communicate residual risk clearly.',
  },
  {
    id: 'scenario-management-reporting',
    chapterId: 'test-management',
    prompt:
      'A release report lists passed tests but omits open critical defects. What information should be added before stakeholders decide?',
    coachingHint:
      'Add residual risks, unresolved high-impact defects, scope limitations, and enough evidence for an informed release decision.',
  },
  {
    id: 'scenario-management-defect-report',
    chapterId: 'test-management',
    prompt:
      'A defect report says only "search is broken" and the developer cannot reproduce it. What information would make the report useful?',
    coachingHint:
      'Include steps to reproduce, test data, environment, expected and actual results, severity or impact, and relevant evidence.',
  },
  {
    id: 'scenario-management-test-control',
    chapterId: 'test-management',
    prompt:
      'Midway through testing, metrics show slow progress in high-risk checkout areas while low-risk cosmetic checks are nearly complete. What control action fits?',
    coachingHint:
      'Use monitoring information to adjust priorities, redirect effort to higher product risk, and communicate the trade-off and residual risk.',
  },
  {
    id: 'scenario-tools',
    chapterId: 'test-tools',
    prompt:
      'A team wants to automate every manual test immediately. What risks and adoption steps would you raise?',
    coachingHint:
      'Discuss maintainability, tool fit, false results, training, pilot projects, and selecting repeatable high-value checks first.',
  },
  {
    id: 'scenario-tools-false-results',
    chapterId: 'test-tools',
    prompt:
      'A UI automation suite often fails when the product is working correctly. How would you explain the risk to the team?',
    coachingHint:
      'Discuss false positives, lost trust in automation, maintenance cost, and the need to stabilize checks before expanding coverage.',
  },
  {
    id: 'scenario-tools-pilot',
    chapterId: 'test-tools',
    prompt:
      'A manager wants to buy an expensive test management tool for the whole organization after one demo. What adoption step would you recommend first?',
    coachingHint:
      'Recommend a pilot to validate fit, integration needs, data quality, training effort, governance, and expected benefits before broad rollout.',
  },
  {
    id: 'scenario-tools-false-negative',
    chapterId: 'test-tools',
    prompt:
      'An automated API check passes even though a required tax field is missing from the response. What kind of tool-result risk does this illustrate?',
    coachingHint:
      'Discuss false negatives and weak assertions. Passing automation can be misleading when checks do not verify the risk that matters.',
  },
];
