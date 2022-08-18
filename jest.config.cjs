module.exports = {
	clearMocks: true,

	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['lib/**/*.{js,jsx,ts,tsx}'],

	// A set of global variables that need to be available in all test environments
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.json'
		}
	},

	preset: 'ts-jest',
	moduleDirectories: ['node_modules', 'lib'],

	testTimeout: 2000,

	roots: ['lib']
};
