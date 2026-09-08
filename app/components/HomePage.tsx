import { ThemeProvider } from "@rescui/ui-contexts";
import { HeaderSection } from "./HeaderSection";
import { LatestFromKotlinSection } from "./LatestFromKotlinSection";
import { WhyKotlinSection } from "./WhyKotlinSection";
import { UsageSection } from "./UsageSection";
import { StartSection } from "./StartSection";

function OverviewPageContent({ initialTabIndex }: { initialTabIndex: number }) {
  return (
    <div className="overview-page">
      <HeaderSection />
      <LatestFromKotlinSection />
      <WhyKotlinSection initialTabIndex={initialTabIndex} />
      <UsageSection />
      <StartSection />
    </div>
  );
}

export function HomePage({ initialTabIndex }: { initialTabIndex: number }) {
  return (
    <ThemeProvider theme="dark">
      <OverviewPageContent initialTabIndex={initialTabIndex} />
    </ThemeProvider>
  );
}
