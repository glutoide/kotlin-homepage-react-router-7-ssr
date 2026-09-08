import { programmingLanguageTabs } from "../data/programmingLanguage";

export function pickInitialProgrammingLanguageTab(random: () => number = Math.random): number {
  return Math.floor(random() * programmingLanguageTabs.length);
}
