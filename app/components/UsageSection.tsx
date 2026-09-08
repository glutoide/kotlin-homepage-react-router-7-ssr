import { useEffect, useState } from "react";
import Button from "@rescui/button";
import { cardCn } from "@rescui/card";
import { ThemeProvider } from "@rescui/ui-contexts";
import { useTextStyles } from "@rescui/typography";
import cn from "classnames";
import { Container, Section } from "./Layout";

const testimonials = [
  {
    company: "Gradle",
    logo: "/original-assets/static/js/page/index/images/companies/gradle.svg",
    url: "https://blog.gradle.org/kotlin-meets-gradle",
    text: "Gradle is introducing Kotlin as a language for writing build scripts",
  },
  {
    company: "Corda",
    logo: "/original-assets/static/js/page/index/images/companies/corda.svg",
    url: "https://www.corda.net/2017/01/10/kotlin/",
    text: "Corda is an open-source distributed ledger platform, supported by major banks, and built entirely in Kotlin",
  },
  {
    company: "Evernote",
    logo: "/original-assets/static/js/page/index/images/companies/evernote.svg",
    url: "https://blog.evernote.com/tech/2017/01/26/android-state-library/",
    text: "Evernote recently integrated Kotlin into their Android client",
  },
  {
    company: "Coursera",
    logo: "/original-assets/static/js/page/index/images/companies/coursera.svg",
    url: "https://building.coursera.org/blog/2016/03/16/becoming-bilingual-coursera/",
    text: "Coursera Android app is partially written in Kotlin",
  },
  {
    company: "Spring",
    logo: "/original-assets/static/js/page/index/images/companies/spring.svg",
    url: "https://spring.io/blog/2017/01/04/introducing-kotlin-support-in-spring-framework-5-0",
    text: "Spring makes use of Kotlin's language features to offer more concise APIs",
  },
  {
    company: "Atlassian",
    logo: "/original-assets/static/js/page/index/images/companies/atlassian.svg",
    url: "https://twitter.com/danlew42/status/809065097339564032",
    text: "All new code in the Trello Android app is in Kotlin",
  },
];

function UsageSectionContent() {
  const textCn = useTextStyles();
  const [sortByName, setSortByName] = useState(false);

  useEffect(() => {
    setSortByName(localStorage.getItem("kotlin-testimonials-order") === "name");
  }, []);

  const sortedTestimonials = sortByName
    ? [...testimonials].sort((a, b) => a.company.localeCompare(b.company))
    : testimonials;

  const toggleSort = () => {
    setSortByName((current) => {
      const next = !current;
      localStorage.setItem("kotlin-testimonials-order", next ? "name" : "default");
      return next;
    });
  };

  return (
    <Section className="usage-section">
      <Container>
        <h2 className={textCn("rs-hero")}>Kotlin Usage Highlights</h2>

        <div className="kto-offset-top-16 usage-section__sort">
          <Button mode="outline" size="s" onClick={toggleSort}>
            Sort: {sortByName ? "A-Z" : "Default"}
          </Button>
        </div>

        <div className="kto-grid kto-grid-gap-16 kto-offset-top-48">
          {sortedTestimonials.map((item) => (
            <a
              key={item.company}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="testimonial-card"
              data-company={item.company}
              className={cn(
                cardCn({ theme: "light", mode: "classic", isClickable: true }),
                "usage-section__card kto-col-4 kto-col-md-6 kto-col-sm-12",
              )}
            >
              <img
                src={item.logo}
                alt={item.company}
                className={cn("usage-section__logo", item.company === "Spring" && "usage-section__logo_spring")}
              />
              <p className={cn(textCn("rs-text-2"), "kto-offset-top-8")}>{item.text}</p>
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function UsageSection() {
  return (
    <ThemeProvider theme="light">
      <UsageSectionContent />
    </ThemeProvider>
  );
}
