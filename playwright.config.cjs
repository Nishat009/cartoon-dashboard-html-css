const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4300', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }
  ],
  webServer: {
    command: 'npm.cmd run start -- --port 4300',
    cwd: './frontend',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
