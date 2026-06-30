# Swapping the study topic

This app is a generic study shell. All subject content lives in two directories:

- `src/data/` — the questions, flashcards, scenarios, syllabus summaries, and resource lists.
- `src/knowledge/` — the **knowledge pack** that bundles that data plus every user-facing string into one object satisfying the `KnowledgePack` contract in [`src/knowledge/types.ts`](src/knowledge/types.ts).

Everything else (`src/App.tsx`, `src/sections/`, `src/features/`, `src/hooks/`, `src/lib/`, `src/components/`) is topic-agnostic. No section component hardcodes subject copy — every heading, eyebrow, intro, and domain label is read from the pack's `meta`. Swapping the pack re-skins the whole app, including the browser tab title.

[`src/knowledge/demoKnowledgePack.ts`](src/knowledge/demoKnowledgePack.ts) is a complete worked example (a "World Capitals & Geography" pack), and [`src/App.demoPack.test.tsx`](src/App.demoPack.test.tsx) renders the entire app from it and asserts zero ISTQB/CTFL leakage.

## 1. The one code edit

Replace the pack that the app loads by default:

1. Author a new pack module (copy `demoKnowledgePack.ts` as a template, or build fresh `src/data/` modules and assemble them like `currentKnowledgePack.ts`).
2. Point the app at it by editing the export in [`src/knowledge/currentKnowledgePack.ts`](src/knowledge/currentKnowledgePack.ts) (or pass your pack as the `pack` prop to `App`).

The compiler enforces the contract: every `meta` field, `examFacts`, at least one `syllabusChapter`, and the `progress`/`quiz`/`passingRule` config must be present, or the build fails. Certification-only sections (`officialResources`, `officialSampleExams`, `officialSyllabusGuide`, `syllabusAccelerator`, `appliedTechniques`, `externalLearningResources`) are optional/may be empty — empty collections auto-hide their section.

## 2. One-time repo-branding checklist (not code)

These files carry the project's identity rather than its content. Edit them once per fork:

| File | What to change |
| --- | --- |
| `package.json` | `name`, `description`, `keywords`, `author`, `repository`, `bugs`, `homepage` |
| `vite.config.ts` | the production `base` path — set it to `/<your-repo-name>/` for GitHub Pages, or `/` if hosting at a domain root |
| `index.html` | the `<title>` (pre-hydration fallback only — the live tab title comes from `meta.appTitle`), the `description`/Open Graph/Twitter meta tags, and `theme-color` |
| `public/favicon.svg` | replace the `Study` / `Lab` branded mark |
| Docs | `README.md`, `CONTRIBUTING.md`, `DISCLAIMER.md`, `docs/fast-cert-prep.md`, the title in `docs/running.md`, and `CLAUDE.md` are inherently subject-specific |

## 3. What intentionally stays hardcoded

Generic *interaction chrome* describes how the app works, not the subject, so it is **not** pack-configurable (keeping it out of `meta` avoids turning the pack into a full i18n catalog):

- Form controls: `Submit answers`, `Reset quiz`, the `Practice` / `Exam` mode-toggle buttons.
- Status text: the `% complete` pill, the answered/unanswered progress hint, the `Score: x/y (z%)` line, and the `Correct` / `Review needed` review labels.
- Structural sub-headings that label `SyllabusChapter` fields: `Learning goals`, `Key concepts`, `Study tactics`, and `Chapter {n}` / `Completed` / `Mark chapter as reviewed`.

If you need these translated or re-worded, edit the relevant component in `src/sections/` or `src/features/quiz/` directly.

## 4. Verify the swap

```bash
npm run lint
npm test -- --run
npm run build
```

Then `npm run dev` and confirm every section, plus the browser tab title, shows your new topic's copy with no residue from the previous one.
