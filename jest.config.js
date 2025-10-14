module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            useESM: true,
        }],
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/domain/(.*)$': '<rootDir>/domain/$1',
        '^@/application/(.*)$': '<rootDir>/application/$1',
        '^@/infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
        '^@/presentation/(.*)$': '<rootDir>/presentation/$1',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(uuid)/)',
    ],
    preset: 'ts-jest',
    extensionsToTreatAsEsm: ['.ts'],
};
