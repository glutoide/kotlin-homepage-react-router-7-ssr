import type { ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import GlobalHeader from "@jetbrains/kotlin-web-site-ui/out/components/header";
import GlobalFooter from "@jetbrains/kotlin-web-site-ui/out/components/footer-compact";
import { ThemeProvider } from "@rescui/ui-contexts";

import "@rescui/typography/lib/font-jb-sans-auto.css";
import "highlight.js/styles/github.css";
import "./styles.scss";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="page__index-new page_restyled_v2">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="global-layout">
          <GlobalHeader searchConfig={{ searchAlgoliaId: "", searchAlgoliaApiKey: "", searchAlgoliaIndexName: "" }}
            productWebUrl="https://github.com/JetBrains/kotlin/releases/tag/v1.6.20"
            hasSearch={false}
            dropdownTheme="dark"
            currentUrl="/"
          />
          {children}
          <ThemeProvider theme="dark">
            <GlobalFooter />
          </ThemeProvider>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Unexpected error";
  return <main className="kto-layout-container">{message}</main>;
}
