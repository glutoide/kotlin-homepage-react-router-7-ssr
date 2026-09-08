import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function collectSource(dir: string): string {
  return readdirSync(dir)
    .flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory()
        ? [collectSource(path)]
        : /\.(ts|tsx|css|scss)$/.test(name)
          ? [readFileSync(path, "utf8")]
          : [];
    })
    .join("\n");
}

const root = process.cwd();
const source = collectSource(join(root, "app"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tsconfig = JSON.parse(readFileSync(join(root, "tsconfig.json"), "utf8"));
const reactRouterConfig = readFileSync(join(root, "react-router.config.ts"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
const allDependencies = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

describe("JetBrains homepage migration acceptance", () => {
  it("is a React Router 7 Framework Mode project with SSR explicitly enabled", () => {
    expect(allDependencies["react-router"]).toMatch(/(?:^|[~^])7\./);
    expect(pkg.scripts?.build).toMatch(/react-router\s+build/);
    expect(source).toMatch(/from\s+["']react-router/);
    expect(reactRouterConfig).toMatch(/ssr\s*:\s*true/);
  });

  it("uses strict TypeScript and continues to use ReSCUI", () => {
    expect(tsconfig.compilerOptions?.strict).toBe(true);
    expect(Object.keys(allDependencies).some((name) => name.startsWith("@rescui/"))).toBe(true);
    expect(source).toMatch(/@rescui\//);
  });

  it("keeps the original homepage content and all five major sections", () => {
    const requiredText = [
      "A modern programming language that makes developers happier",
      "Latest from Kotlin",
      "Kotlin 1.6.0 is released",
      "The new AWS SDK for Kotlin with Coroutines support",
      "Introducing kotlinx.coroutines 1.6.0",
      "Results of the Kotlin Features Survey 2021",
      "Why Kotlin",
      "Modern, concise and safe programming language",
      "A productive way to write server",
      "Cross-platform layer for native applications",
      "Big, friendly and helpful",
      "Concise",
      "Safe",
      "Expressive",
      "Interoperable",
      "Multiplatform",
      "Kotlin Usage Highlights",
      "Gradle",
      "Corda",
      "Evernote",
      "Coursera",
      "Spring",
      "Atlassian",
      "Start using Kotlin today!",
      "Build your first app in your favorite IDE",
    ];

    for (const text of requiredText) expect(source).toContain(text);
  });

  it("ships every local original asset referenced by the migrated page", () => {
    const references = [...source.matchAll(/["'](\/original-assets\/[^"']+)["']/g)].map(
      (match) => match[1],
    );

    expect(new Set(references).size).toBeGreaterThan(0);
    for (const reference of new Set(references)) {
      expect(existsSync(join(root, "public", reference.slice(1))), reference).toBe(true);
    }
  });

  it("removes known render-time SSR blockers from migrated components", () => {
    const header = readFileSync(join(root, "app", "components", "HeaderSection.tsx"), "utf8");
    const programmingLanguage = readFileSync(
      join(root, "app", "components", "ProgrammingLanguage.tsx"),
      "utf8",
    );
    const usage = readFileSync(join(root, "app", "components", "UsageSection.tsx"), "utf8");

    expect(header).not.toMatch(/window\.innerWidth/);
    expect(programmingLanguage).not.toMatch(/Math\.random|document\.createElement/);
    expect(usage).not.toMatch(/const\s+savedOrder\s*=\s*localStorage/);
  });

  it("documents reproducible production verification and includes CI", () => {
    expect(readme).toMatch(/npm\s+ci/i);
    expect(readme).toMatch(/npm\s+run\s+build/i);
    expect(readme).toMatch(/npm\s+run\s+start/i);
    expect(readme).toMatch(/npm\s+run\s+verify/i);
    expect(existsSync(join(root, ".github", "workflows", "verify.yml"))).toBe(true);
  });
});
