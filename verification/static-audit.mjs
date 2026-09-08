import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const styles = read("app/styles.scss");
const workflow = read(".github/workflows/verify.yml");
const readme = read("README.md");
const rootLayout = read("app/root.tsx");
const packageJson = JSON.parse(read("package.json"));

assert.doesNotMatch(styles, /https?:\/\/[^)"']+JetBrainsMono/i, "runtime font URLs must not be external");
assert.doesNotMatch(rootLayout, /@fontsource\/jetbrains-mono|raw\.githubusercontent\.com|cdn\.jsdelivr\.net/i, "root layout must not depend on an external or generated JetBrains Mono source");
assert.ok(!packageJson.dependencies?.["@fontsource/jetbrains-mono"], "JetBrains Mono must use the exact supplied reference assets, not Fontsource");
for (const file of [
  "JetBrainsMono-Regular.woff2",
  "JetBrainsMono-Italic.woff2",
  "JetBrainsMono-Medium.woff2",
  "JetBrainsMono-Medium-Italic.woff2",
  "JetBrainsMono-Bold.woff2",
  "JetBrainsMono-Bold-Italic.woff2",
  "JetBrainsMono-ExtraBold.woff2",
  "JetBrainsMono-ExtraBold-Italic.woff2",
]) {
  assert.ok(existsSync(join(root, "public", "assets", "fonts", "JetBrainsMono", file)), `missing pinned JetBrains Mono asset: ${file}`);
  assert.ok(styles.includes(`/assets/fonts/JetBrainsMono/${file}`), `font stylesheet must reference ${file}`);
}
assert.match(styles, /\.programming-language__code[\s\S]*?code\s*\{[\s\S]*?font-family:\s*["']JetBrains Mono["']/, "code element itself must use JetBrains Mono");
assert.ok(existsSync(join(root, "tests", "visual-parity.spec.ts")), "reference visual parity test is required");
assert.ok(existsSync(join(root, "reference", "Dockerfile.backend")), "reference compatibility backend Dockerfile is required");
assert.ok(existsSync(join(root, "reference", "Dockerfile.frontend")), "reference compatibility frontend Dockerfile is required");
assert.ok(existsSync(join(root, "reference", "docker-compose.ci.yml")), "reference CI compose file is required");
assert.match(workflow, /reference\/docker-compose\.ci\.yml/, "CI must use the reproducible reference compatibility harness");
assert.doesNotMatch(workflow, /working-directory:\s*reference-project[\s\S]{0,120}docker compose up -d --build/, "CI must not rely on the obsolete upstream Dockerfile directly");
assert.match(workflow, /kotlin-web-site-jetsites-internship-2026/, "CI must checkout the supplied reference project");
assert.match(workflow, /84328b92e50be7723b28984232caba97d0a4511e/, "CI must pin the supplied reference commit");
assert.match(workflow, /REFERENCE_BASE_URL/, "CI must run visual E2E with the reference base URL");
assert.match(readme, /visual parity/i, "README must document reference visual parity verification");
assert.ok(!existsSync(join(root, "verification", "REVIEW_CHECKLIST.md")), "internal review checklist must not ship");
assert.ok(!existsSync(join(root, "TASK_LINK.txt")), "chat-oriented TASK_LINK.txt must not ship in the public repository");
assert.equal(packageJson.scripts?.["audit:security"], "npm audit --audit-level=low", "standard security audit script is required");
assert.match(packageJson.scripts?.verify ?? "", /audit:security/, "npm run verify must include security audit");
assert.match(workflow, /repro-node22:/, "CI must verify Node 22 reproducibility separately");
assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/, "CI must use read-only repository permissions");

console.log("static-audit: PASS");
