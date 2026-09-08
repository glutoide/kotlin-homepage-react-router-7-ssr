declare module "highlight.js/lib/core" {
  export interface HighlightResult {
    value: string;
  }

  export type LanguageDefinition = (hljs: unknown) => unknown;

  interface HighlightJsCore {
    registerLanguage(name: string, language: LanguageDefinition): void;
    highlight(languageName: string, code: string): HighlightResult;
  }

  const hljs: HighlightJsCore;
  export default hljs;
}

declare module "highlight.js/lib/languages/kotlin" {
  import type { LanguageDefinition } from "highlight.js/lib/core";
  const kotlin: LanguageDefinition;
  export default kotlin;
}
