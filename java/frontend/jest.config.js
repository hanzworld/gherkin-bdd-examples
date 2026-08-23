module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/test/**/*.steps.ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'results',
        outputName: 'junit.xml',
      },
    ],
  ],
};
