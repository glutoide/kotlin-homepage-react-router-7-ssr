# Kotlin Homepage — React Router 7 Framework Mode SSR

A migration of the supplied Kotlin homepage test project to **React Router 7 Framework Mode** with server-side rendering.

**Original assignment:** https://github.com/JetBrains/kotlin-web-site-jetsites-internship-2026/blob/84328b92e50be7723b28984232caba97d0a4511e/TASK.md

**Pinned reference commit:** `84328b92e50be7723b28984232caba97d0a4511e`

## What changed

- Replaced the Flask/Jinja application shell with React Router 7 Framework Mode.
- Enabled production SSR (`ssr: true`) and deterministic hydration.
- Kept ReSCUI components and the JetBrains Kotlin header/footer UI.
- Preserved the supplied homepage content, responsive layout, interactions, and intentionally non-functional single-page navigation links.
- Preserved the original random initial code-tab behavior without hydration mismatch by selecting it in the route loader and hydrating with the same loader data.
- Moved browser-only behavior (`localStorage`, viewport-specific presentation) out of server render paths.
- Kept syntax highlighting deterministic during SSR without render-time DOM construction.
- Self-hosts the exact JetBrains Mono WOFF2 files from the pinned supplied commit; the browser does not fetch the code font from a third-party runtime CDN.

## Requirements

- Node.js 20 or newer
- npm

The project is verified on Node.js 20 and Node.js 22.

## Run locally

```bash
npm ci
npm run dev
```

Development server: `http://localhost:5173`

Production SSR:

```bash
npm run build
npm run start
```

Production server: `http://localhost:3000`

## Verification

Install Chromium once:

```bash
npx playwright install chromium
```

Run the complete application verification:

```bash
npm run verify
```

It runs:

1. repository/static contract checks;
2. React Router type generation and TypeScript checking;
3. Vitest tests;
4. production client + SSR build;
5. Playwright SSR/hydration/interaction/responsive tests;
6. `npm audit --audit-level=low`.

The browser acceptance suite covers raw server-rendered HTML, JavaScript-disabled rendering, clean hydration, all code tabs, persisted sorting, local assets, pinned self-hosted JetBrains Mono, mobile card behavior, responsive banners, and the supplied narrow-screen CTA behavior.

## Reference visual parity

GitHub Actions performs an additional comparison against the **exact supplied JetBrains source commit**. The workflow checks out the reference separately and starts it with compatibility Dockerfiles from `reference/` because the upstream `python:3.6` image is no longer reliably buildable in current CI. The compatibility layer changes the obsolete runtime/build environment only; the reference page source, assets, locked frontend dependencies, and target commit remain unchanged.

With the reference running at port 9000, the same check can be run with:

```bash
REFERENCE_BASE_URL=http://127.0.0.1:9000/ npm run test:visual
```

The Playwright comparison uses the same Chromium engine for both pages at 1440, 1024, 900, 390, and 320 px widths. It normalizes animations, embedded videos, persisted state, and the random code-tab choice before comparing stable page content and container geometry. Small differences from upgraded ReSCUI versions are tolerated, consistent with the assignment.

## Project structure

```text
app/                    React Router application and page components
public/original-assets/ supplied page images and logos
public/assets/fonts/     JetBrains Mono files from the pinned supplied commit
reference/              CI-only compatibility harness for the pinned legacy reference
tests/                  unit, SSR/hydration, responsive and visual-parity tests
verification/           dependency-free static repository acceptance
```

## Provenance and licenses

The migration is based on JetBrains source commit `84328b92e50be7723b28984232caba97d0a4511e`.

Original asset provenance is documented in `SOURCE_PROVENANCE.txt`. The supplied JetBrains source license and JetBrains Mono OFL license are retained under `THIRD_PARTY_LICENSES/`.
