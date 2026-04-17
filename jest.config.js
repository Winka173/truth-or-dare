/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        diagnostics: false,
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          resolveJsonModule: true,
          strict: false,
        },
      },
    ],
  },
  collectCoverageFrom: [
    'utils/**/*.ts',
    'store/slices/**/*.ts',
    'hooks/**/*.ts',
    '!**/__tests__/**',
    '!**/*.d.ts',
  ],
};
