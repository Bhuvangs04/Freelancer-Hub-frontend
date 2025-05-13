import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";


export default defineConfig([{
  ignores: [
    "src/components/ClientOnboarding.tsx",
    "src/components/FileTransferUtils.tsx",
    "src/components/FreelancerSelection.tsx",
    "src/components/Navbar.tsx",
    "src/components/ProjectCard.tsx",
    "src/components/TaskList.tsx",
    "src/components/ui/chart.tsx",
    "src/components/ui/command.tsx",
    "src/components/ui/textarea.tsx",
    "src/hooks/use-toast.ts",
    "src/lib/api.ts",
    "src/pages/Client/Project-update/ProjectUpdate.tsx",
    "src/pages/Client/client-main-page-add-project/AddProject.tsx",
    "src/pages/Client/freelance-finder/FreelancerList.tsx",
    "src/pages/Freelancer-portfolio.tsx",
    "src/pages/Freelancer/ProfileUpdate.tsx",
    "src/pages/Freelancer/freelancer-place-bid/Freelancer_Card_projects.tsx",
    "tailwind.config.ts"
  ],
},
  { files: ["**/*.{js,mjs,cjs,ts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { files: ["**/*.{js,mjs,cjs,ts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
]);