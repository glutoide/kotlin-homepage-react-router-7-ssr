import { useState } from "react";
import Button from "@rescui/button";
import { Tab, TabList, TabSeparator } from "@rescui/tab-list";
import { useTextStyles } from "@rescui/typography";
import cn from "classnames";
import hljs from "highlight.js/lib/core";
import kotlin from "highlight.js/lib/languages/kotlin";
import { programmingLanguageTabs } from "../data/programmingLanguage";

hljs.registerLanguage("kotlin", kotlin);


export function ProgrammingLanguage({ initialTabIndex }: { initialTabIndex: number }) {
  const textCn = useTextStyles();
  const [activeIndex, setActiveIndex] = useState(initialTabIndex);
  const highlighted = hljs.highlight("kotlin", programmingLanguageTabs[activeIndex].code).value;

  return (
    <div className="kto-grid kto-grid-gap-32 kto-offset-top-96 kto-offset-top-md-48">
      <div className="kto-col-4 kto-col-md-12">
        <h3 className={textCn("rs-h2")}>Modern, concise and safe programming language</h3>
        <p className={cn(textCn("rs-text-2"), "kto-offset-top-32")}>
          Easy to pick up, so you can create powerful applications immediately.
        </p>
        <div className="kto-offset-top-32">
          <Button mode="outline" size="l" href="/docs/getting-started.html">
            Get started
          </Button>
        </div>
      </div>

      <div className="kto-col-8 kto-col-md-12 programming-language__tabs">
        <TabList value={activeIndex} onChange={(value) => setActiveIndex(Number(value))}>
          {programmingLanguageTabs.map((tab) => (
            <Tab key={tab.title}>{tab.title}</Tab>
          ))}
        </TabList>
        <TabSeparator />
        <pre className="programming-language__code kto-offset-top-16">
          <code
            className="hljs"
            data-testid="programming-code"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
}
