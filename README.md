# CTFL 4.0 Study Lab — Unofficial ISTQB® Foundation Exam Prep

![CI/CD](https://img.shields.io/github/actions/workflow/status/darekwojciechowski/istqb-foundation-4-study-lab/ci.yml?branch=main&style=flat-square&logo=github-actions&logoColor=white&label=CI%2FCD)
![Deploy](https://img.shields.io/github/actions/workflow/status/darekwojciechowski/istqb-foundation-4-study-lab/pages.yml?branch=main&style=flat-square&logo=github-pages&logoColor=white&label=Deploy)
![Node](https://img.shields.io/badge/node-%3E%3D24-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/npm/v/react?label=React&style=flat-square&logo=react&logoColor=white&color=61DAFB)
![TypeScript](https://img.shields.io/npm/v/typescript?label=TypeScript&style=flat-square&logo=typescript&logoColor=white&color=3178C6)
![Vite](https://img.shields.io/npm/v/vite?label=Vite&style=flat-square&logo=vite&logoColor=white&color=646CFF)
![Vitest](https://img.shields.io/npm/v/vitest?label=Vitest&style=flat-square&logo=vitest&logoColor=white&color=6E9F18)
![Playwright](https://img.shields.io/npm/v/@playwright/test?label=Playwright&style=flat-square&logo=playwright&logoColor=white&color=2EAD33)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**[Live demo →](https://darekwojciechowski.github.io/istqb-foundation-4-study-lab/)**

Tired of reading CTFL notes and not knowing if anything is sticking? This app turns passive study into active practice — original quizzes, fast-recall flashcards, and real-world scenario drills, all in your browser with no account required.

Built for people preparing for the **ISTQB Certified Tester Foundation Level (CTFL) v4.0** exam.

> **Important:** This is an independent, unofficial project. ISTQB® and CTFL® names are used only to identify the certification being studied. Official syllabus, glossary, and sample exams remain the source of truth. See [DISCLAIMER.md](DISCLAIMER.md) for full details.

## Preview

[![App preview](assets/app-preview.gif)](https://darekwojciechowski.github.io/istqb-foundation-4-study-lab/)

## What you get

- **Practice quiz** — 120+ original multiple-choice questions covering all six syllabus areas, with instant rationale feedback after every answer
- **Exam simulator** — 40 questions, 60-minute countdown timer, audio chimes at start/end, scored against the 26/40 passing threshold
- **Flashcards** — shuffled active-recall cards to drill key terms and concepts
- **Scenario drills** — short real-world prompts that train you to explain testing concepts the way you would in a job interview or on the exam
- **Chapter summaries** — learning goals, key concepts, and study tactics for each of the six CTFL 4.0 syllabus areas
- **Progress tracking** — browser-local, no sign-in, no server, no ads; your progress persists across sessions

## How to use the app

Open the [live demo](https://darekwojciechowski.github.io/istqb-foundation-4-study-lab/) and follow these steps:

1. **Pick a chapter** — use the syllabus chapter panel on the left to focus on one area, or leave it on the first chapter to start from the beginning.
2. **Choose a mode** — toggle between **Practice** (immediate feedback after each answer) and **Exam** (all answers revealed at the end with a pass/fail score).
3. **Answer questions** — submit your answers and review the rationale for each one; understanding *why* matters more than memorising answers.
4. **Drill flashcards** — scroll to the Flashcards section and hit Shuffle to get a fresh set; say the answer aloud before flipping.
5. **Try a scenario** — the Scenario section gives you a real-world testing situation to explain; use it to practice speaking about concepts, not just recognising them.
6. **Track your progress** — mark chapters as reviewed using the chapter panel; everything is saved automatically in your browser.

For a focused study plan from zero to exam-ready, see [docs/fast-cert-prep.md](docs/fast-cert-prep.md).

## Exam quick reference

**Syllabus areas:**

1. Fundamentals of Testing
2. Testing Throughout the Software Development Lifecycle
3. Static Testing
4. Test Analysis and Design
5. Managing the Test Activities
6. Test Tools

Always verify current details with your exam provider and the official ISTQB materials.

## Tech stack

| Area | Library | Version | Role |
|---|---|---|---|
| UI | React | 19 | Component model, concurrent rendering |
| Language | TypeScript | 6 (strict) | End-to-end type safety |
| Bundler | Vite | 8 | Dev server, production build, code splitting |
| Unit tests | Vitest + Testing Library | 4 / 16 | Component and logic tests under jsdom |
| E2E tests | Playwright | 1.61 | Real-browser quiz and progress coverage |
| Linting | ESLint + typescript-eslint | 10 / 8 | Style and correctness checks |
| CI/CD | GitHub Actions | — | Lint → unit test → build → deploy to Pages |
| Fonts | Fontsource variable fonts | — | Inter (body) + Space Grotesk (headings), self-hosted |

## Getting started locally

**Requirements:** Node.js 24+, npm, Git.

```bash
git clone https://github.com/darekwojciechowski/istqb-foundation-4-study-lab.git
cd istqb-foundation-4-study-lab
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173/`).

**macOS launcher** (installs deps automatically, opens browser):

```bash
./scripts/run-macos.command
```

**Windows launcher:**

```bat
scripts\run-windows.cmd
```

For a full local setup guide and troubleshooting, see [docs/running.md](docs/running.md).

## Architecture

The app is a **pack-driven study shell** — the React component tree has no knowledge of the subject being studied. All content and UI copy flows through a single `KnowledgePack` object defined in [`src/knowledge/types.ts`](src/knowledge/types.ts).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://mermaid.ink/svg/JSV7aW5pdDogeyJ0aGVtZSI6ICJkYXJrIiwgInRoZW1lVmFyaWFibGVzIjogeyJwcmltYXJ5Q29sb3IiOiAiIzFmMjkzNyIsICJtYWluQmtnIjogIiMxZjI5MzciLCAiY2x1c3RlckJrZyI6ICIjMTExODI3IiwgImNsdXN0ZXJCb3JkZXIiOiAiIzM3NDE1MSIsICJsaW5lQ29sb3IiOiAiIzljYTNhZiIsICJmb250RmFtaWx5IjogIlNlZ29lIFVJLCBzYW5zLXNlcmlmIiwgImVkZ2VMYWJlbEJhY2tncm91bmQiOiAiIzExMTgyNyJ9LCAiZmxvd2NoYXJ0IjogeyJ3cmFwcGluZ1dpZHRoIjogNTAwLCAic3ViR3JhcGhUaXRsZU1hcmdpbiI6IHsidG9wIjogOCwgImJvdHRvbSI6IDh9fSwgIm1heFRleHRTaXplIjogMTAwMDAwfX0lJQpncmFwaCBURAogICAgc3ViZ3JhcGggQ29udGVudCBbIktub3dsZWRnZSZuYnNwO1BhY2smbmJzcDsoc3dhcHBhYmxlJm5ic3A7Y29udGVudCkiXQogICAgICAgIGRpcmVjdGlvbiBMUgogICAgICAgIEFbInNyYy9kYXRhPGJyLz48c21hbGw-cXVlc3Rpb25zIMK3IGZsYXNoY2FyZHMgwrcgc2NlbmFyaW9zPC9zbWFsbD4iXTo6OmRhdGEKICAgICAgICBCWyJjdXJyZW50S25vd2xlZGdlUGFjazxici8-PHNtYWxsPnN3YXAgZGF0YSDihpIgcmVwdXJwb3NlIGFwcDwvc21hbGw-Il06OjpkYXRhCiAgICBlbmQKCiAgICBzdWJncmFwaCBMb2dpYyBbIlN0YXRlJm5ic3A7YW5kJm5ic3A7UHVyZSZuYnNwO0xvZ2ljIl0KICAgICAgICBkaXJlY3Rpb24gTFIKICAgICAgICBEWyJ1c2VRdWl6T3JjaGVzdHJhdGlvbjxici8-PHNtYWxsPnNpbmdsZSBzdGF0ZSBob29rPC9zbWFsbD4iXTo6OnByb2MKICAgICAgICBFWyJsaWIgcXVpeiDCtyBzcnM8YnIvPjxzbWFsbD5wdXJlIMK3IGRldGVybWluaXN0aWMgwrcgc2VlZGVkPC9zbWFsbD4iXTo6OnByb2MKICAgICAgICBGWyJ1c2VQcm9ncmVzc1N5bmM8YnIvPjxzbWFsbD5wZXJzaXN0ZW5jZSBob29rPC9zbWFsbD4iXTo6OnByb2MKICAgIGVuZAoKICAgIHN1YmdyYXBoIFZpZXcgWyJSZWFjdCZuYnNwO1VJIl0KICAgICAgICBkaXJlY3Rpb24gTFIKICAgICAgICBHWyJBcHAudHN4PGJyLz48c21hbGw-Y29tcG9zaXRpb24gc2hlbGw8L3NtYWxsPiJdOjo6dWkKICAgICAgICBIWyJRdWl6UGFuZWwgwrcgRXhhbVRpbWVyPGJyLz48c21hbGw-KyBzZWN0aW9uIGNvbXBvbmVudHM8L3NtYWxsPiJdOjo6dWkKICAgIGVuZAoKICAgIHN1YmdyYXBoIFN0b3JlIFsiQnJvd3NlciJdCiAgICAgICAgSVsibG9jYWxTdG9yYWdlPGJyLz48c21hbGw-TGVhcm5lclByb2dyZXNzPC9zbWFsbD4iXTo6OnVpCiAgICBlbmQKCiAgICBzdWJncmFwaCBRdWFsaXR5IFsiUXVhbGl0eSZuYnNwO0dhdGUiXQogICAgICAgIFRbIlZpdGVzdCArIFBsYXl3cmlnaHQ8YnIvPjxzbWFsbD4xNjEgdW5pdCDCtyA0OCBlMmUgwrcgNCBicm93c2Vyczwvc21hbGw-Il06Ojp0ZXN0CiAgICBlbmQKCiAgICBBIC0tPiBCCiAgICBCIC0tPiBECiAgICBEIC0tPiBFCiAgICBEIC0tPiBHCiAgICBHIC0tPiBICiAgICBEIC0tPiBGCiAgICBGIDwtLT58InJlYWQgLyB3cml0ZSJ8IEkKICAgIFQgLS4tPnx1bml0fCBFCiAgICBUIC0uLT58ZTJlfCBICgogICAgY2xhc3NEZWYgZGF0YSBmaWxsOiMxNzI1NTQsc3Ryb2tlOiM2MGE1ZmEsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZGJlYWZlLHJ4Ojgscnk6ODsKICAgIGNsYXNzRGVmIHByb2MgZmlsbDojMmUxMDY1LHN0cm9rZTojYTc4YmZhLHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2YzZThmZixyeDo4LHJ5Ojg7CiAgICBjbGFzc0RlZiB1aSBmaWxsOiMwNjRlM2Isc3Ryb2tlOiMzNGQzOTksc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojZDFmYWU1LHJ4Ojgscnk6ODsKICAgIGNsYXNzRGVmIHRlc3QgZmlsbDojNDIyMDA2LHN0cm9rZTojZjU5ZTBiLHN0cm9rZS13aWR0aDoycHgsY29sb3I6I2ZlZjNjNyxyeDo4LHJ5Ojg7CiAgICBzdHlsZSBDb250ZW50IGZpbGw6IzExMTgyNyxzdHJva2U6IzM3NDE1MSxzdHJva2Utd2lkdGg6MnB4LHJ4OjEwLHJ5OjEwCiAgICBzdHlsZSBMb2dpYyBmaWxsOiMxMTE4Mjcsc3Ryb2tlOiMzNzQxNTEsc3Ryb2tlLXdpZHRoOjJweCxyeDoxMCxyeToxMAogICAgc3R5bGUgVmlldyBmaWxsOiMxMTE4Mjcsc3Ryb2tlOiMzNzQxNTEsc3Ryb2tlLXdpZHRoOjJweCxyeDoxMCxyeToxMAogICAgc3R5bGUgU3RvcmUgZmlsbDojMTExODI3LHN0cm9rZTojMzc0MTUxLHN0cm9rZS13aWR0aDoycHgscng6MTAscnk6MTAKICAgIHN0eWxlIFF1YWxpdHkgZmlsbDojMTExODI3LHN0cm9rZTojMzc0MTUxLHN0cm9rZS13aWR0aDoycHgscng6MTAscnk6MTAK">
  <img alt="CTFL 4.0 Study Lab architecture: a swappable Knowledge Pack feeds pure state logic and hooks, which drive the React UI and persist learner progress to browser localStorage, all covered by a Vitest and Playwright quality gate" width="820" src="https://mermaid.ink/svg/JSV7aW5pdDogeyJ0aGVtZSI6ICJiYXNlIiwgInRoZW1lVmFyaWFibGVzIjogeyJwcmltYXJ5Q29sb3IiOiAiI2ZmZiIsICJtYWluQmtnIjogIiNmZmYiLCAiY2x1c3RlckJrZyI6ICIjZjlmYWZiIiwgImNsdXN0ZXJCb3JkZXIiOiAiI2U1ZTdlYiIsICJsaW5lQ29sb3IiOiAiIzZiNzI4MCIsICJmb250RmFtaWx5IjogIlNlZ29lIFVJLCBzYW5zLXNlcmlmIiwgImVkZ2VMYWJlbEJhY2tncm91bmQiOiAiI2Y5ZmFmYiJ9LCAiZmxvd2NoYXJ0IjogeyJ3cmFwcGluZ1dpZHRoIjogNTAwLCAic3ViR3JhcGhUaXRsZU1hcmdpbiI6IHsidG9wIjogOCwgImJvdHRvbSI6IDh9fSwgIm1heFRleHRTaXplIjogMTAwMDAwfX0lJQpncmFwaCBURAogICAgc3ViZ3JhcGggQ29udGVudCBbIktub3dsZWRnZSZuYnNwO1BhY2smbmJzcDsoc3dhcHBhYmxlJm5ic3A7Y29udGVudCkiXQogICAgICAgIGRpcmVjdGlvbiBMUgogICAgICAgIEFbInNyYy9kYXRhPGJyLz48c21hbGw-cXVlc3Rpb25zIMK3IGZsYXNoY2FyZHMgwrcgc2NlbmFyaW9zPC9zbWFsbD4iXTo6OmRhdGEKICAgICAgICBCWyJjdXJyZW50S25vd2xlZGdlUGFjazxici8-PHNtYWxsPnN3YXAgZGF0YSDihpIgcmVwdXJwb3NlIGFwcDwvc21hbGw-Il06OjpkYXRhCiAgICBlbmQKCiAgICBzdWJncmFwaCBMb2dpYyBbIlN0YXRlJm5ic3A7YW5kJm5ic3A7UHVyZSZuYnNwO0xvZ2ljIl0KICAgICAgICBkaXJlY3Rpb24gTFIKICAgICAgICBEWyJ1c2VRdWl6T3JjaGVzdHJhdGlvbjxici8-PHNtYWxsPnNpbmdsZSBzdGF0ZSBob29rPC9zbWFsbD4iXTo6OnByb2MKICAgICAgICBFWyJsaWIgcXVpeiDCtyBzcnM8YnIvPjxzbWFsbD5wdXJlIMK3IGRldGVybWluaXN0aWMgwrcgc2VlZGVkPC9zbWFsbD4iXTo6OnByb2MKICAgICAgICBGWyJ1c2VQcm9ncmVzc1N5bmM8YnIvPjxzbWFsbD5wZXJzaXN0ZW5jZSBob29rPC9zbWFsbD4iXTo6OnByb2MKICAgIGVuZAoKICAgIHN1YmdyYXBoIFZpZXcgWyJSZWFjdCZuYnNwO1VJIl0KICAgICAgICBkaXJlY3Rpb24gTFIKICAgICAgICBHWyJBcHAudHN4PGJyLz48c21hbGw-Y29tcG9zaXRpb24gc2hlbGw8L3NtYWxsPiJdOjo6dWkKICAgICAgICBIWyJRdWl6UGFuZWwgwrcgRXhhbVRpbWVyPGJyLz48c21hbGw-KyBzZWN0aW9uIGNvbXBvbmVudHM8L3NtYWxsPiJdOjo6dWkKICAgIGVuZAoKICAgIHN1YmdyYXBoIFN0b3JlIFsiQnJvd3NlciJdCiAgICAgICAgSVsibG9jYWxTdG9yYWdlPGJyLz48c21hbGw-TGVhcm5lclByb2dyZXNzPC9zbWFsbD4iXTo6OnVpCiAgICBlbmQKCiAgICBzdWJncmFwaCBRdWFsaXR5IFsiUXVhbGl0eSZuYnNwO0dhdGUiXQogICAgICAgIFRbIlZpdGVzdCArIFBsYXl3cmlnaHQ8YnIvPjxzbWFsbD4xNjEgdW5pdCDCtyA0OCBlMmUgwrcgNCBicm93c2Vyczwvc21hbGw-Il06Ojp0ZXN0CiAgICBlbmQKCiAgICBBIC0tPiBCCiAgICBCIC0tPiBECiAgICBEIC0tPiBFCiAgICBEIC0tPiBHCiAgICBHIC0tPiBICiAgICBEIC0tPiBGCiAgICBGIDwtLT58InJlYWQgLyB3cml0ZSJ8IEkKICAgIFQgLS4tPnx1bml0fCBFCiAgICBUIC0uLT58ZTJlfCBICgogICAgY2xhc3NEZWYgZGF0YSBmaWxsOiNlZmY2ZmYsc3Ryb2tlOiMzYjgyZjYsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojMWUzYThhLHJ4Ojgscnk6ODsKICAgIGNsYXNzRGVmIHByb2MgZmlsbDojZjVmM2ZmLHN0cm9rZTojOGI1Y2Y2LHN0cm9rZS13aWR0aDoycHgsY29sb3I6IzRjMWQ5NSxyeDo4LHJ5Ojg7CiAgICBjbGFzc0RlZiB1aSBmaWxsOiNlY2ZkZjUsc3Ryb2tlOiMxMGI5ODEsc3Ryb2tlLXdpZHRoOjJweCxjb2xvcjojMDY0ZTNiLHJ4Ojgscnk6ODsKICAgIGNsYXNzRGVmIHRlc3QgZmlsbDojZmZmYmViLHN0cm9rZTojZjU5ZTBiLHN0cm9rZS13aWR0aDoycHgsY29sb3I6IzkyNDAwZSxyeDo4LHJ5Ojg7CiAgICBzdHlsZSBDb250ZW50IGZpbGw6I2Y5ZmFmYixzdHJva2U6I2U1ZTdlYixzdHJva2Utd2lkdGg6MnB4LHJ4OjEwLHJ5OjEwCiAgICBzdHlsZSBMb2dpYyBmaWxsOiNmOWZhZmIsc3Ryb2tlOiNlNWU3ZWIsc3Ryb2tlLXdpZHRoOjJweCxyeDoxMCxyeToxMAogICAgc3R5bGUgVmlldyBmaWxsOiNmOWZhZmIsc3Ryb2tlOiNlNWU3ZWIsc3Ryb2tlLXdpZHRoOjJweCxyeDoxMCxyeToxMAogICAgc3R5bGUgU3RvcmUgZmlsbDojZjlmYWZiLHN0cm9rZTojZTVlN2ViLHN0cm9rZS13aWR0aDoycHgscng6MTAscnk6MTAKICAgIHN0eWxlIFF1YWxpdHkgZmlsbDojZjlmYWZiLHN0cm9rZTojZTVlN2ViLHN0cm9rZS13aWR0aDoycHgscng6MTAscnk6MTAK">
</picture>

Key design decisions:

- **Type-enforced pack contract**: the `KnowledgePack` interface ([`src/knowledge/types.ts`](src/knowledge/types.ts)) uses `DeepReadonly<T>` and a `NonEmptyReadonlyArray` guard — a missing `meta` or empty `syllabusChapters` fails the build, not runtime. A complete "World Capitals & Geography" demo pack proves zero subject leakage ([`src/App.demoPack.test.tsx`](src/App.demoPack.test.tsx)).
- **Pure logic, extracted hooks**: quiz/progress/SRS rules are pure, React-free functions in [`src/lib/`](src/lib/) driven by focused hooks (`useQuizOrchestration`, `useProgressSync`, `useExamTimer`) — the layering shown above, each unit-tested in isolation.
- **Content-integrity tests**: beyond the unit/e2e runs above, dedicated tests guard answer distribution, per-chapter minimums, and English-only copy.

## Switching to another certificate or topic

The shell is fully reusable. To adapt it to a different certification or subject:

1. Author a new pack module (use [`src/knowledge/demoKnowledgePack.ts`](src/knowledge/demoKnowledgePack.ts) as a template).
2. Point the app at it by editing [`src/knowledge/currentKnowledgePack.ts`](src/knowledge/currentKnowledgePack.ts).
3. The TypeScript compiler enforces the contract — missing required fields fail the build immediately.
4. Optional sections auto-hide when their arrays are empty, so you only build what you need.

For the full walkthrough — authoring a pack, one-time repo-branding edits (`package.json`, Vite base path, `index.html`, favicon), and verification steps — see [docs/swapping.md](docs/swapping.md).

## License

MIT — see [LICENSE](LICENSE).

The bundled Inter and Space Grotesk fonts are licensed under the SIL Open Font License v1.1 — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Disclaimer

Provided for educational purposes only, with no warranty and no guarantee of exam success. See [DISCLAIMER.md](DISCLAIMER.md).
