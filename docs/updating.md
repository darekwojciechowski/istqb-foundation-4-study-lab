# Updating dependencies

This guide explains how to keep the project's npm dependencies up to date.

See [running.md](running.md) for Node.js and npm setup requirements.

## Check for outdated packages

```bash
npm outdated
```

This lists every package where a newer version is available, along with the current, wanted (within your semver range), and latest (absolute newest) versions.

## Apply safe updates

```bash
npm update
```

Updates every package to the highest version allowed by the `^` ranges in `package.json`. This is safe to run at any time — it cannot introduce breaking changes by itself.

## Check for security vulnerabilities

```bash
npm audit
```

To automatically fix low-risk issues:

```bash
npm audit fix
```

For issues that require a breaking-version upgrade, `npm audit` will tell you which package to update manually.

## Upgrade to a new major version

`npm update` stops at the semver boundary. To jump to a new major version of a specific package, install it explicitly:

```bash
npm install <package>@latest
```

Example:

```bash
npm install vite@latest
```

To upgrade all packages at once across major boundaries, use the `npm-check-updates` tool (no install required):

```bash
npx npm-check-updates -u
npm install
```

`-u` rewrites `package.json` with the latest version ranges before installing.

## Verify after updating

Run the full quality check suite to confirm nothing broke:

```bash
npm run build
npm test -- --run
npm run lint
```

What each command checks:

- `npm run build` — type-checks and produces a production bundle; catches type regressions introduced by new package types.
- `npm test -- --run` — runs the Vitest suite once; catches runtime regressions.
- `npm run lint` — catches style and lint rule changes from updated ESLint plugins.

## Commit the update

Always commit `package.json` and `package-lock.json` together so the lockfile stays in sync:

```bash
git add package.json package-lock.json
git commit -m "chore(deps): update dependencies"
```
