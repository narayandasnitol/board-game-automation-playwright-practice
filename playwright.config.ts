import { defineConfig } from "@playwright/test";
import { envConfig } from "./utils/envConfig";

const customTimeout = 60000;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  timeout: 300000,
  expect: {
    timeout: customTimeout,
  },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,

  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],

  use: {
    headless: true,
    baseURL: envConfig.baseUrl,
    trace: isCI ? "retain-on-failure" : "on",
    video: isCI ? "retain-on-failure" : "on",
    screenshot: "only-on-failure",
    actionTimeout: customTimeout,
    navigationTimeout: customTimeout,

    launchOptions: {
      args: [
        "--disable-web-security",
        "--disable-dev-shm-usage",
      ],
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
});
