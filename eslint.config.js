import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    plugins: {
      js,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Ignore unused variables
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      // Ignore undeclared types (e.g., ambient/global types)
      "@typescript-eslint/no-undef": "off", // Not a real rule, but if using `no-undef`, disable it
      "no-undef": "off",
    },
    extends: ["plugin:@eslint/js/recommended"],
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
]);
