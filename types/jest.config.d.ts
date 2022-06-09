declare const _default: {
    clearMocks: boolean;
    collectCoverage: boolean;
    coverageDirectory: string;
    collectCoverageFrom: string[];
    coveragePathIgnorePatterns: string[];
    globals: {
        'ts-jest': {
            tsconfig: string;
        };
    };
    preset: string;
    transform: {
        '^.+\\.(ts|tsx)$': string;
        '^.+\\.(js)$': string;
    };
    transformIgnorePatterns: never[];
    testPathIgnorePatterns: string[];
    moduleDirectories: string[];
    moduleNameMapper: {
        [key: string]: string | string[];
    } | undefined;
    modulePaths: string[];
    rootDir: string;
    testTimeout: number;
};
export default _default;
