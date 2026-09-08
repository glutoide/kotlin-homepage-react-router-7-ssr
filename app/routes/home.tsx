import type { Route } from "./+types/home";
import { HomePage } from "../components/HomePage";
import { pickInitialProgrammingLanguageTab } from "../lib/programmingLanguage";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Kotlin Programming Language" },
    {
      name: "description",
      content: "A modern programming language that makes developers happier.",
    },
  ];
}

export function loader(_: Route.LoaderArgs) {
  return { initialTabIndex: pickInitialProgrammingLanguageTab() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <HomePage initialTabIndex={loaderData.initialTabIndex} />;
}
