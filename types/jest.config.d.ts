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
    moduleDirectories: string[];
    rootDir: string;
    moduleNameMapper: {
        [key: string]: string | string[];
    } | undefined;
    testTimeout: number;
};
export default _default;
