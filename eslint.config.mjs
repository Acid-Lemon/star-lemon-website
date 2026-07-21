import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    ".claude/**",
    ".opencode/**",
    ".idea/**",
  ]),
  {
    rules: {
      // Most images are user/OSS URLs with runtime dimensions and cannot use next/image safely.
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
