import { expect, test } from "@playwright/test";

const hydrationPattern = /hydration|did not match|server rendered html|text content does not match/i;

function watchApplicationErrors(page: import("@playwright/test").Page) {
  const pageErrors: string[] = [];
  const hydrationErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && hydrationPattern.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });

  return { pageErrors, hydrationErrors };
}

async function expectLocalImagesLoaded(page: import("@playwright/test").Page) {
  await expect
    .poll(async () =>
      page.locator('img[src^="/original-assets/"]').evaluateAll((images) =>
        images.every((image) => {
          const element = image as HTMLImageElement;
          return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
        }),
      ),
    )
    .toBe(true);
}

test("returns the complete homepage in raw SSR HTML", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("text/html");

  const html = await response.text();
  for (const text of [
    "A modern programming language that makes developers happier",
    "Latest from Kotlin",
    "Why Kotlin",
    "Kotlin Usage Highlights",
    "Start using Kotlin today!",
  ]) {
    expect(html).toContain(text);
  }

  expect(html).toContain("programming-code");
  expect(html).toContain("Sort:");
  expect(html.length).toBeGreaterThan(5000);
});

test("is useful before hydration when JavaScript is disabled", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();

  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "A modern programming language that makes developers happier",
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Latest from Kotlin", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why Kotlin", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kotlin Usage Highlights", exact: true })).toBeVisible();
    await expect(page.getByText("Start using Kotlin today!", { exact: false })).toBeVisible();
    await expect(page.getByTestId("programming-code")).not.toBeEmpty();
  } finally {
    await context.close();
  }
});

test("hydrates cleanly and preserves desktop interactions", async ({ page }) => {
  const errors = watchApplicationErrors(page);
  const failedLocalAssets: string[] = [];

  page.on("response", (response) => {
    if (response.url().includes("/original-assets/") && response.status() >= 400) {
      failedLocalAssets.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A modern programming language that makes developers happier",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest from Kotlin", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Why Kotlin", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kotlin Usage Highlights", exact: true })).toBeVisible();
  await expect(page.getByText("Start using Kotlin today!", { exact: false })).toBeVisible();

  for (const title of ["Multiplatform Mobile", "Server-side", "Web Frontend", "Android"]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(5);
  await expect(page.locator('[role="tab"][aria-selected="true"]')).toHaveCount(1);

  let previousCode = await page.getByTestId("programming-code").textContent();
  for (const name of ["Concise", "Safe", "Expressive", "Interoperable", "Multiplatform"]) {
    const tab = page.getByRole("tab", { name, exact: true });
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const currentCode = await page.getByTestId("programming-code").textContent();
    expect(currentCode).toBeTruthy();
    if (name !== "Concise") expect(currentCode).not.toBe(previousCode);
    previousCode = currentCode;
  }

  const sortButton = page.getByRole("button", { name: /^Sort:/ });
  const before = await sortButton.textContent();
  await sortButton.click();
  const after = await sortButton.textContent();
  expect(after).not.toBe(before);

  const sortedCompanies = await page
    .getByTestId("testimonial-card")
    .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-company")));
  expect(sortedCompanies).toEqual(["Atlassian", "Corda", "Coursera", "Evernote", "Gradle", "Spring"]);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: /^Sort:/ })).toHaveText(after ?? "");

  await expectLocalImagesLoaded(page);
  const monoFaces = await page.evaluate(async () => {
    const faces = await document.fonts.load('14px "JetBrains Mono"');
    return faces.length;
  });
  expect(monoFaces).toBeGreaterThan(0);
  expect(await page.getByTestId("programming-code").evaluate((element) => getComputedStyle(element).fontFamily)).toContain("JetBrains Mono");
  const fontResources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.includes("/assets/fonts/JetBrainsMono/")),
  );
  expect(fontResources.length).toBeGreaterThan(0);
  const appOrigin = new URL(page.url()).origin;
  expect(fontResources.every((name) => new URL(name).origin === appOrigin)).toBe(true);
  expect(fontResources.every((name) => name.endsWith(".woff2"))).toBe(true);
  expect(failedLocalAssets).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.hydrationErrors).toEqual([]);

});

test("preserves responsive card behavior and has no horizontal overflow", async ({ page }) => {
  const errors = watchApplicationErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Multiplatform Mobile", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Server-side", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Web Frontend", exact: true })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Android", exact: true })).toBeHidden();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(2);
  await expectLocalImagesLoaded(page);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.hydrationErrors).toEqual([]);

});

test("preserves the supplied narrow-screen behavior and tab interaction", async ({ page }) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const metrics = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll("a,button")).find(
        (element) => element.textContent?.trim() === "Learn about Kotlin Multiplatform",
      ) as HTMLElement | undefined;
      if (!button) throw new Error("Missing Kotlin Multiplatform CTA");
      const rect = button.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        buttonHeight: rect.height,
        whiteSpace: getComputedStyle(button).whiteSpace,
      };
    });

    // The supplied 2026 reference intentionally keeps this ReSCUI CTA on one
    // line, so it protrudes slightly below ~390px instead of wrapping.
    expect(metrics.overflow).toBeLessThanOrEqual(Math.max(4, 395 - width));
    expect(metrics.buttonHeight).toBeGreaterThanOrEqual(50);
    expect(metrics.buttonHeight).toBeLessThanOrEqual(54);
    expect(metrics.whiteSpace).toBe("nowrap");
  }

  await page.getByRole("tab", { name: "Multiplatform", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Multiplatform", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("keeps the original responsive header-card grid and banner source", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const desktopCards = ["Multiplatform Mobile", "Server-side", "Web Frontend", "Android"];
  const desktopBoxes = [];
  for (const title of desktopCards) {
    const box = await page.getByRole("heading", { name: title, exact: true }).locator("xpath=ancestor::a[1]").boundingBox();
    expect(box).not.toBeNull();
    desktopBoxes.push(box!);
  }
  expect(Math.max(...desktopBoxes.map((box) => box.y)) - Math.min(...desktopBoxes.map((box) => box.y))).toBeLessThan(4);
  const desktopBannerSrc = await page.locator('.latest-from-kotlin-section picture img').evaluate((image) => (image as HTMLImageElement).currentSrc);
  expect(desktopBannerSrc).toContain("kotlin-1.6.20.png");

  await page.setViewportSize({ width: 900, height: 1000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  const first = await page.getByRole("heading", { name: "Multiplatform Mobile", exact: true }).locator("xpath=ancestor::a[1]").boundingBox();
  const second = await page.getByRole("heading", { name: "Server-side", exact: true }).locator("xpath=ancestor::a[1]").boundingBox();
  const third = await page.getByRole("heading", { name: "Web Frontend", exact: true }).locator("xpath=ancestor::a[1]").boundingBox();
  expect(first && second && third).toBeTruthy();
  expect(Math.abs(first!.y - second!.y)).toBeLessThan(4);
  expect(third!.y).toBeGreaterThan(first!.y + 20);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  const mobileBannerSrc = await page.locator('.latest-from-kotlin-section picture img').evaluate((image) => (image as HTMLImageElement).currentSrc);
  expect(mobileBannerSrc).toContain("kotlin-1.6.20-mobile.png");
});
