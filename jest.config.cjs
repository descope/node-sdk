module.exports = {
  clearMocks: true,

  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['lib/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 74,
      functions: 97,
      lines: 97,
      statements: 97,
    },
  },

  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
    BUILD_VERSION: 'one.two.three',
  },

  preset: 'ts-jest',
  moduleDirectories: ['node_modules', 'lib'],

  testTimeout: 2000,

  roots: ['lib'],
};
