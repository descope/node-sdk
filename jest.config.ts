import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  collectCoverage: true,
  coverageDirectory: '../coverage',

  collectCoverageFrom: ['<rootDir>/**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: ['testutils', 'index.ts'],

  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },

  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleDirectories: ['node_modules', 'lib'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/lib/' }),
  modulePaths: ['<rootDir>'],
  rootDir: compilerOptions.baseUrl,
  testTimeout: 2000,
};
