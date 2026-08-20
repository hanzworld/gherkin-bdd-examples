const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);

  on('file:preprocessor', createBundler({
    plugins: [createEsbuildPlugin(config)],
  }));

  return config;
}

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-junit-reporter',
    mochaJunitReporterReporterOptions: {
      mochaFile: 'results/junit-[hash].xml',
      toConsole: false,
    },
  },
  e2e: {
    // The Spring Boot app must already be running (`mvn spring-boot:run`)
    // before these specs execute - see the root README for run instructions.
    baseUrl: 'http://localhost:8080',
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents,
    env: {
      // Scenarios tagged @manual have no automated implementation - see
      // scripts/find-manual-tests.mjs and the ManualApproval pipeline
      // stage. Override with `--env tags="..."` to run them anyway.
      tags: 'not @manual',
    },
  },
});
