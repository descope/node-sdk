import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

export default {
	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	collectCoverage: true,
	coverageDirectory: '../coverage',

	collectCoverageFrom: ['<rootDir>/**/*.{js,jsx,ts,tsx}'],
	coveragePathIgnorePatterns: ['testutils', 'index.tsx'],

	// A set of global variables that need to be available in all test environments
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	},

	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleDirectories: ['node_modules', 'src'],

	setupFilesAfterEnv: ['<rootDir>/testutils/jestSetup.ts'],
	rootDir: compilerOptions.baseUrl,
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>'
	}),

	testTimeout: 2000
};