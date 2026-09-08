import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  ssr: {
    noExternal: [
      /^@jetbrains\/kotlin-web-site-ui(?:\/|$)/,
      /^@rescui\//,
      /^@react-hook\//,
      "body-scroll-lock",
      "react-outside-click-handler",
    ],
  },
  plugins: [reactRouter()],
});
