declare module "@jetbrains/kotlin-web-site-ui/out/components/header" {
  import type { ComponentType } from "react";

  interface SearchConfig {
    searchAlgoliaId: string;
    searchAlgoliaApiKey: string;
    searchAlgoliaIndexName: string;
  }

  interface GlobalHeaderProps {
    searchConfig: SearchConfig;
    productWebUrl: string;
    hasSearch: boolean;
    dropdownTheme: "dark" | "light";
    currentUrl: string;
  }

  const GlobalHeader: ComponentType<GlobalHeaderProps>;
  export default GlobalHeader;
}

declare module "@jetbrains/kotlin-web-site-ui/out/components/footer-compact" {
  import type { ComponentType } from "react";

  const GlobalFooter: ComponentType<Record<string, never>>;
  export default GlobalFooter;
}
