import Button from "@rescui/button";
import { useTextStyles } from "@rescui/typography";
import cn from "classnames";
import { Container, Section } from "./Layout";

const newsData = [
  {
    title: "Kotlin 1.6.0 is released",
    link: "https://blog.jetbrains.com/kotlin/2021/11/kotlin-1-6-0-is-released/",
    tag: "blog.jetbrains.com",
  },
  {
    title: "The new AWS SDK for Kotlin with Coroutines support",
    link: "https://blog.jetbrains.com/kotlin/2022/01/the-new-aws-sdk-for-kotlin-with-coroutines-support/",
    tag: "blog.jetbrains.com",
  },
  {
    title: "Introducing kotlinx.coroutines 1.6.0",
    link: "https://blog.jetbrains.com/kotlin/2021/12/introducing-kotlinx-coroutines-1-6-0/",
    tag: "blog.jetbrains.com",
  },
  {
    title: "Results of the Kotlin Features Survey 2021",
    link: "https://blog.jetbrains.com/kotlin/2021/12/kotlin-features-survey-2021-results/",
    tag: "blog.jetbrains.com",
  },
];

export function LatestFromKotlinSection() {
  const textCn = useTextStyles();
  return (
    <div>
      <Section className="latest-from-kotlin-section">
        <Container>
          <h2 className={textCn("rs-h1")}>Latest from Kotlin</h2>
          <div className="kto-offset-top-32">
            <a
              href="https://blog.jetbrains.com/kotlin/2022/04/kotlin-1-6-20-released/"
              target="_blank"
              rel="noopener noreferrer"
              className="latest-from-kotlin-section__banner-link"
            >
              <picture>
                <source
                  media="(max-width: 537px)"
                  srcSet="/original-assets/assets/images/index/banners/kotlin-1.6.20-mobile.png"
                />
                <img
                  src="/original-assets/assets/images/index/banners/kotlin-1.6.20.png"
                  alt="Kotlin 1.6.20 released"
                  width="100%"
                />
              </picture>
            </a>
          </div>

          <div className="kto-grid kto-grid-gap-32 kto-offset-top-32">
            {newsData.map((news) => (
              <div key={news.title} className="kto-col-3 kto-col-md-6 kto-col-sm-12">
                <p className={textCn("rs-text-3")}>{news.tag}</p>
                <h3 className={cn(textCn("rs-text-2"), "kto-offset-top-8")}>
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={textCn("rs-link", { external: true })}
                  >
                    {news.title}
                  </a>
                </h3>
              </div>
            ))}
          </div>

          <div className="latest-from-kotlin-section__button kto-offset-top-32">
            <Button mode="outline" size="l" href="https://blog.jetbrains.com/kotlin/" target="_blank">
              Kotlin blog
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
