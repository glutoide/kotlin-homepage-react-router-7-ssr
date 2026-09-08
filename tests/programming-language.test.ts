import { describe, expect, it } from "vitest";
import { programmingLanguageTabs } from "../app/data/programmingLanguage";
import { pickInitialProgrammingLanguageTab } from "../app/lib/programmingLanguage";

describe("programming language initial tab", () => {
  it("keeps the original five-tab content", () => {
    expect(programmingLanguageTabs.map((tab) => tab.title)).toEqual([
      "Concise",
      "Safe",
      "Expressive",
      "Interoperable",
      "Multiplatform",
    ]);
  });

  it("maps the random source to a valid tab index", () => {
    expect(pickInitialProgrammingLanguageTab(() => 0)).toBe(0);
    expect(pickInitialProgrammingLanguageTab(() => 0.2)).toBe(1);
    expect(pickInitialProgrammingLanguageTab(() => 0.999999)).toBe(programmingLanguageTabs.length - 1);
  });
});
