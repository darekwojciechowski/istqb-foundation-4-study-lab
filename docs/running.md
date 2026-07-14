# Running the CTFL 4.0 Study Lab

This guide explains how to run the app locally, verify it, and build it for static hosting.

## Requirements

- Node.js 26 or newer
- npm
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

## Install dependencies

From the repository root:

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser.

## Start on macOS with the launcher script

The repository includes a macOS launcher in the `scripts/` directory:

```bash
./scripts/run-macos.command
```

You can also double-click `scripts/run-macos.command` in Finder.

The script will:

1. move to the repository directory
2. check that Node.js and npm are available
3. install dependencies with `npm ci` if `node_modules/` is missing
4. start Vite and open the app in your default browser

If macOS blocks the file because it was downloaded from the internet, open Terminal and run:

```bash
chmod +x scripts/run-macos.command
./scripts/run-macos.command
```

## Start on Windows with the launcher script

The repository includes a Windows launcher in the `scripts/` directory:

```bat
scripts\run-windows.cmd
```

You can also double-click `scripts\run-windows.cmd` in File Explorer.

The script will:

1. move to the repository directory
2. check that Node.js and npm are available
3. install dependencies with `npm ci` if `node_modules\` is missing
4. start Vite and open the app in your default browser

## Run quality checks

Run all checks before opening a pull request:

```bash
npm run lint
npm test -- --run
npm run build
```

What each command does:

- `npm run lint` checks TypeScript and React code style.
- `npm test -- --run` runs the Vitest test suite once.
- `npm run build` type-checks and creates a production bundle in `dist/`.

## Keep dependencies current

See [updating.md](updating.md) for how to check for outdated packages, apply safe updates, audit for vulnerabilities, and upgrade across major versions.

## Preview the production build

After `npm run build`:

```bash
npm run preview
```

Open the local preview URL printed by Vite.

## Troubleshooting

### The app does not start

Try reinstalling dependencies:

```bash
rm -rf node_modules
npm ci
```

### Tests fail after content changes

Content tests protect the public repository rules:

- all learner-facing content must stay in English
- official and third-party questions must be linked, not copied
- each quiz question must have four options, one correct answer, and a rationale

Fix the content data, then rerun:

```bash
npm test -- --run
```

### Build fails with TypeScript errors

Read the first TypeScript error, fix the referenced file, then rerun:

```bash
npm run build
```

## Deployment note

The app is a static Vite build. The `dist/` directory can be hosted on GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any static hosting provider.

### GitHub Pages (one-time setup)

1. Push the repository to GitHub.
2. Open **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions**.
4. The `.github/workflows/pages.yml` workflow will build and deploy `dist/` automatically on every push to `main`.

The live demo will be available at:

```
https://<owner>.github.io/<repo-name>/
```
