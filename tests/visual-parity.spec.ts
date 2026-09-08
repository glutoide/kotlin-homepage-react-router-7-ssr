import { expect, test, type Browser, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const referenceBaseURL = process.env.REFERENCE_BASE_URL;

const viewports = [
  { name: "desktop-1440", width: 1440, height: 1000, maxDiffPixelRatio: 0.08 },
  { name: "desktop-1024", width: 1024, height: 1000, maxDiffPixelRatio: 0.08 },
  { name: "tablet-900", width: 900, height: 1000, maxDiffPixelRatio: 0.09 },
  { name: "mobile-390", width: 390, height: 844, maxDiffPixelRatio: 0.1 },
  { name: "mobile-320", width: 320, height: 720, maxDiffPixelRatio: 0.1 },
] as const;

const anchors = [
  { name: "top", selector: null },
  { name: "latest", selector: ".latest-from-kotlin-section" },
  { name: "why", selector: ".why-kotlin-section" },
  { name: "usage", selector: ".usage-section" },
  { name: "start", selector: ".start-section" },
] as const;

const metricSelectors = [
  ".header-section",
  ".latest-from-kotlin-section",
  ".why-kotlin-section",
  ".usage-section",
  ".start-section",
] as const;

type LayoutMetrics = {
  pageHeight: number;
  containerWidth: number;
  sections: Record<string, { top: number; width: number; height: number }>;
};

async function preparePage(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      iframe { visibility: hidden !important; }
    `,
  });

  await page.waitForFunction(() => document.readyState !== "loading");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
  });

  const conciseTab = page.getByText("Concise", { exact: true }).first();
  if ((await conciseTab.count()) > 0) {
    await conciseTab.click();
  }
}

async function newStablePage(browser: Browser, viewport: { width: number; height: number }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => window.localStorage.clear());
  await context.route(/youtube(?:-nocookie)?\.com|ytimg\.com/, (route) => route.abort());
  return { context, page: await context.newPage() };
}

async function captureViewportAt(page: Page, selector: string | null) {
  // StartSection sits at the bottom of the document. A viewport screenshot
  // after scrollIntoView({ block: "start" }) cannot actually align it to the
  // top because the browser hits max scroll; the result then includes a
  // footer whose upgraded component height is intentionally allowed to vary.
  // Compare the StartSection itself so this gate measures the section under
  // migration rather than unrelated footer pixels.
  if (selector === ".start-section") {
    const section = page.locator(selector).first();
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(25);
    return section.screenshot({ animations: "disabled" });
  }

  if (selector === null) {
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    await page.locator(selector).first().evaluate((element) => {
      element.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
    });
  }
  await page.waitForTimeout(25);
  return page.screenshot({ animations: "disabled" });
}

async function collectLayoutMetrics(page: Page): Promise<LayoutMetrics> {
  return page.evaluate((selectors) => {
    const sections: LayoutMetrics["sections"] = {};
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing visual-parity selector: ${selector}`);
      const rect = element.getBoundingClientRect();
      sections[selector] = {
        top: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height,
      };
    }
    const container = document.querySelector(".kto-layout-container");
    if (!container) throw new Error("Missing .kto-layout-container");
    return {
      pageHeight: document.documentElement.scrollHeight,
      containerWidth: container.getBoundingClientRect().width,
      sections,
    };
  }, metricSelectors);
}

function expectLayoutParity(reference: LayoutMetrics, migrated: LayoutMetrics) {
  expect(Math.abs(migrated.containerWidth - reference.containerWidth)).toBeLessThanOrEqual(2);
  expect(Math.abs(migrated.pageHeight - reference.pageHeight)).toBeLessThanOrEqual(
    Math.max(48, reference.pageHeight * 0.02),
  );

  for (const selector of metricSelectors) {
    const expected = reference.sections[selector];
    const actual = migrated.sections[selector];
    expect(Math.abs(actual.top - expected.top), `${selector} top`).toBeLessThanOrEqual(Math.max(48, expected.top * 0.015));
    expect(Math.abs(actual.width - expected.width), `${selector} width`).toBeLessThanOrEqual(4);
    expect(Math.abs(actual.height - expected.height), `${selector} height`).toBeLessThanOrEqual(
      Math.max(32, expected.height * 0.04),
    );
  }
}

async function writeReferenceSnapshot(testInfo: TestInfo, name: string, screenshot: Buffer) {
  const path = testInfo.snapshotPath(`${name}.png`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, screenshot);
}

test.describe("visual parity with the supplied JetBrains reference", () => {
  test.skip(!referenceBaseURL, "Set REFERENCE_BASE_URL to run reference visual parity checks.");

  for (const viewport of viewports) {
    test(`matches the supplied reference at ${viewport.name}`, async ({ browser }, testInfo) => {
      const reference = await newStablePage(browser, viewport);
      const migrated = await newStablePage(browser, viewport);

      try {
        await preparePage(reference.page, referenceBaseURL!);
        await preparePage(migrated.page, "http://127.0.0.1:3000/");

        expectLayoutParity(
          await collectLayoutMetrics(reference.page),
          await collectLayoutMetrics(migrated.page),
        );

        for (const anchor of anchors) {
          const referenceScreenshot = await captureViewportAt(reference.page, anchor.selector);
          const migratedScreenshot = await captureViewportAt(migrated.page, anchor.selector);
          const snapshotName = `runtime-reference-${viewport.name}-${anchor.name}`;
          await writeReferenceSnapshot(testInfo, snapshotName, referenceScreenshot);
          expect(migratedScreenshot).toMatchSnapshot(`${snapshotName}.png`, {
            threshold: 0.2,
            maxDiffPixelRatio: viewport.maxDiffPixelRatio,
          });
        }
      } finally {
        await reference.context.close();
        await migrated.context.close();
      }
    });
  }
});
