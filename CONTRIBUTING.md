# Contributing

Thank you for helping improve the CTFL 4.0 Study Lab.

## Ground rules

- Use English for all repository content.
- Keep the project independent and unofficial.
- Do not copy official ISTQB sample exam questions, paid training material, books, dumps, or any copyrighted content without a compatible license.
- Write original questions and explanations in your own words.
- Keep changes focused and easy to review.

## Local setup

Use Node 24 locally to match the CI baseline (`.nvmrc`):

```bash
nvm use
```

```bash
npm install
npm run dev
```

## Adapting to a new subject

To use this shell for a different certificate or topic, author a new pack in `src/knowledge/` satisfying the `KnowledgePack` contract in `src/knowledge/types.ts`. Do not edit components in `src/sections/` or `src/features/` — all subject copy goes through the pack's `meta` fields. See [`src/knowledge/demoKnowledgePack.ts`](src/knowledge/demoKnowledgePack.ts) for a complete worked example and [docs/swapping.md](docs/swapping.md) for the full walkthrough.

## Before opening a pull request

Run:

```bash
npm run lint
npm test -- --run
npm run build
```

## Adding practice questions

Practice questions live in `src/data/questions.ts`.

Each question must include:

- a stable `id`
- a valid CTFL 4.0 chapter id
- exactly four answer options
- one correct answer index
- a concise explanation
- a syllabus reference

Good questions test understanding, not memorization of wording. Avoid trick questions unless the trick reflects a real exam misconception and the explanation teaches the concept.

## Adding flashcards or scenarios

Flashcards and scenarios live in `src/data/flashcards.ts`.

Use flashcards for active recall and scenarios for practical explanation. Keep prompts short enough to review quickly during study sessions.

## Reporting content issues

If a question is ambiguous, outdated, too close to official exam wording, or misaligned with the syllabus, open a content improvement issue.
