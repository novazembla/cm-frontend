import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "en",
    "de"
  ],
  extract: {
    input: "./{components,config,hooks,pages,services}/**/*.{ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json",
    defaultNS: 'common'
  },
});