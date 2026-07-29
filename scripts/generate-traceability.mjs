#!/usr/bin/env node
// Generates docs/testing/strategy.md from the e2e suite itself.
//
// The requirement -> spec matrix is derived from Playwright's JSON reporter, which
// exposes each test's `requirement` annotations (see e2e/requirements.ts). Nothing
// about the matrix is hand-maintained: if a requirement loses its last test, the
// generated table says so on the next run.
//
// Usage: npm run docs:traceability

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(repoRoot, 'docs', 'testing', 'strategy.md');

const GENERATED_START = '<!-- BEGIN GENERATED MATRIX -->';
const GENERATED_END = '<!-- END GENERATED MATRIX -->';

/** Runs the suite's list mode — no browsers launched, no web server started. */
function collectSuite() {
  const raw = execFileSync(
    'npx',
    ['playwright', 'test', '--list', '--reporter=json', '--project=chromium'],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );

  return JSON.parse(raw);
}

function flattenSpecs(report) {
  const specs = [];

  const walk = (suite, fileHint) => {
    const file = suite.file ?? fileHint;
    for (const child of suite.suites ?? []) {
      walk(child, file);
    }
    for (const spec of suite.specs ?? []) {
      const annotations = spec.tests?.flatMap((test) => test.annotations ?? []) ?? [];
      const tags = spec.tags ?? [];
      specs.push({
        title: spec.title,
        file: spec.file ?? file,
        line: spec.line,
        tags,
        requirements: annotations
          .filter((annotation) => annotation.type === 'requirement')
          .map((annotation) => annotation.description),
      });
    }
  };

  for (const suite of report.suites ?? []) {
    walk(suite, suite.file);
  }

  return specs;
}

/** Reads the requirement catalogue so requirements with no test still appear. */
function readRequirementCatalogue() {
  const source = readFileSync(join(repoRoot, 'e2e', 'requirements.ts'), 'utf8');
  return [...source.matchAll(/'((?:REQ-)[^']+)'/g)].map((match) => match[1]);
}

function buildMatrix(specs, catalogue) {
  const byRequirement = new Map(catalogue.map((requirement) => [requirement, []]));

  for (const spec of specs) {
    for (const requirement of spec.requirements) {
      if (!byRequirement.has(requirement)) {
        byRequirement.set(requirement, []);
      }
      byRequirement.get(requirement).push(spec);
    }
  }

  return byRequirement;
}

function renderMatrix(byRequirement) {
  const rows = [...byRequirement.entries()].sort(([a], [b]) => a.localeCompare(b));

  const lines = [
    '| Requirement | Covered by | Tags |',
    '| --- | --- | --- |',
  ];

  for (const [requirement, specs] of rows) {
    const [id, ...rest] = requirement.split(' — ');
    const description = rest.join(' — ');
    // Parameterised cases share a line number, so the title is what tells them apart.
    const coverage = specs.length === 0
      ? '**none — uncovered**'
      : specs.map((spec) => `\`e2e/${spec.file}:${spec.line}\` — ${spec.title}`).join('<br>');
    const tags = [...new Set(specs.flatMap((spec) => spec.tags))].sort().join(' ') || '—';

    lines.push(`| **${id}**<br>${description} | ${coverage} | ${tags} |`);
  }

  return lines.join('\n');
}

function renderDocument(specs, byRequirement) {
  const uncovered = [...byRequirement.entries()].filter(([, tests]) => tests.length === 0);
  const generatedAt = new Date().toISOString().slice(0, 10);

  return `# Test strategy

> Hand-written above the marker, generated below it. Run \`npm run docs:traceability\`
> after changing the e2e suite; do not edit the generated section by hand.

## Scope

This document covers the automated tests for the CTFL 4.0 Study Lab: what each layer
is responsible for, which risks the suite is defending against, and which requirement
is covered by which spec.

## Layers

| Layer | Tool | Runs against | Answers |
| --- | --- | --- | --- |
| Unit / component | Vitest + Testing Library (jsdom) | Modules and React components in isolation | Is the logic correct — scoring, SRS boxes, progress sanitisation, timer arithmetic, component rendering? |
| End-to-end | Playwright, four browser projects | The **production bundle** served by \`vite preview\` under its deployed base path | Does a real learner's journey work in a real browser, including persistence, base-path resolution, and accessibility? |

The split is deliberate: the e2e suite owns journeys, browser behaviour and the
shipped artifact; everything that can be settled by a pure function or a single
component belongs in Vitest, where it costs milliseconds instead of seconds.

## Risk register

| Risk | Why it matters | Defence |
| --- | --- | --- |
| Progress silently lost or corrupted | Progress is browser-local with no backend or account — a bad write is unrecoverable for the learner | \`REQ-PROG-003\`, \`REQ-PROG-004\`; \`src/lib/progress.ts\` unit tests |
| The app breaks only under its deployed base path | GitHub Pages serves the app from a sub-path; a dev-server-only suite cannot see such a break | Whole e2e suite runs against \`vite preview\` at the production base path |
| Wrong exam verdict at the cut score | An off-by-one at the pass threshold misleads someone about exam readiness | \`REQ-QUIZ-002\` — boundary value analysis at 25/26/27 of 40, with literal expectations |
| Draft answers discarded without warning | Losing a part-finished attempt to a stray click is the most annoying possible bug | \`REQ-QUIZ-004\` — full decision table, drafts present and absent |
| Inaccessible to keyboard or assistive tech | The app targets WCAG AA and is a study tool people use for long sessions | \`REQ-A11Y-001\`, \`REQ-A11Y-002\` |

## Conventions

- Specs address elements by role, label, then \`data-testid\`; never by CSS class.
- Assertions use retrying \`expect()\` — no fixed waits, no one-shot \`textContent()\`
  reads that are then asserted on.
- Fixtures (\`e2e/fixtures/\`) supply page objects, wipe stored progress, seed hostile
  storage, and fail any test that raises an uncaught page error.
- Every requirement id lives in \`e2e/requirements.ts\` and reaches the report as a
  Playwright annotation, which is what makes the matrix below derivable.

${GENERATED_START}

## Requirement traceability matrix

_Generated from \`npx playwright test --list --reporter=json\` on ${generatedAt}._

${renderMatrix(byRequirement)}

**Totals:** ${specs.length} e2e scenarios covering ${byRequirement.size - uncovered.length} of ${byRequirement.size} requirements.${
    uncovered.length > 0
      ? `\n\n**Uncovered requirements:** ${uncovered.map(([requirement]) => requirement.split(' — ')[0]).join(', ')}.`
      : ''
  }

${GENERATED_END}
`;
}

const report = collectSuite();
const specs = flattenSpecs(report);
const catalogue = readRequirementCatalogue();
const byRequirement = buildMatrix(specs, catalogue);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, renderDocument(specs, byRequirement), 'utf8');

console.log(`Wrote ${outputPath} — ${specs.length} scenarios, ${byRequirement.size} requirements.`);
