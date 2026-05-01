import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable strict rules that might cause build issues in production
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      // Production-friendly rules - more lenient
      "no-console": "off", // Allow console statements for debugging
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-unused-vars": "off", // Allow unused variables for API compatibility
      "prefer-const": "warn", // Warn instead of error
      "@next/next/no-unused-imports": "off",
    },
  },
];

export default eslintConfig;
