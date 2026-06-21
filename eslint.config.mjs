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
  ]),
  // Project-level overrides
  {
    rules: {
      // Large pre-existing codebase uses `any` extensively in form handlers and
      // dynamic store data. Downgrade from error to warning until progressively
      // typed over time.
      "@typescript-eslint/no-explicit-any": "warn",
      // setState-in-effect is a pattern used intentionally in form-sync effects
      // throughout this codebase. Track as warning.
      "react-hooks/set-state-in-effect": "warn",
      // Convencion del codebase: identificadores con prefijo `_` son
      // intencionalmente sin usar (parametros de signatura obligatoria,
      // destructurados para excluir un campo del rest, etc.).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;
