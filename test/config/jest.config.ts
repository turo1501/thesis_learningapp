import type { Config } from 'jest';
import { defaults } from 'jest-config';

const config: Config = {
  verbose: true,
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../client/src/$1',
    '^@test/(.*)$': '<rootDir>/$1',
    '^@server/(.*)$': '<rootDir>/../server/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/mock/fileMock.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/config/jest.setup.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '../client/src/**/*.{ts,tsx}',
    '../server/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.d.ts',
    '!**/types/**',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/e2e/'
  ],
  projects: [
    {
      displayName: 'client',
      testMatch: ['<rootDir>/unit/client/**/*.test.{ts,tsx}', '<rootDir>/unit/client/**/*.spec.{ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        '<rootDir>/config/jest.setup.ts'
      ],
    },
    {
      displayName: 'server',
      testMatch: ['<rootDir>/unit/server/**/*.test.{ts,tsx}', '<rootDir>/unit/server/**/*.spec.{ts,tsx}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: [
        '<rootDir>/config/jest.setup.server.ts'
      ],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/integration/**/*.test.{ts,tsx}', '<rootDir>/integration/**/*.spec.{ts,tsx}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: [
        '<rootDir>/config/jest.setup.server.ts'
      ],
    }
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results/junit',
      outputName: 'results.xml',
    }]
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;
