import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      ".next/**",
      "dist/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/fechas.ts",
        "src/lib/validadores.ts",
        "src/lib/bloqueos-contextuales.ts",
        "src/store/onboarding-store.ts",
      ],
    },
  },
});
