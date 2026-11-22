// Browser tests for the hub page and the shared files (see MAINTAINING.md, Tests).
// No local server: tests/sites.mjs answers https://legilly.com/ from this folder.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.mjs",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    viewport: { width: 1200, height: 800 },
    colorScheme: "light",
    // A browser already on the machine can be used instead of Playwright's own download.
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
});
