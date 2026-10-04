import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxInject: 'import { h, Fragment, getLocale } from "/src/i18n.js";',
  },
});
