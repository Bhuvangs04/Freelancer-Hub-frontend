import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    plugins: { js },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Disable unused vars warnings
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Disable undeclared types (no-undef)
      "no-undef": "off",
    },
    // Use the JS recommended rules correctly
    ...js.configs.recommended,
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Vue essential rules
  ...pluginVue.configs["flat/essential"],

  // Use TS parser for .vue files
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
]);
