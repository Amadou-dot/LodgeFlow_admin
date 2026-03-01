const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Shared settings
const baseConfig = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'models/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

// Node project — API routes, models, lib utilities (uses MongoDB Memory Server)
const nodeProject = {
  ...baseConfig,
  displayName: 'node',
  testEnvironment: 'node',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^zod$': '<rootDir>/node_modules/zod/index.cjs',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.node.ts'],
  globalSetup: '<rootDir>/__tests__/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/__tests__/setup/globalTeardown.ts',
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.test.ts',
    '<rootDir>/__tests__/integration/**/*.test.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|@clerk|@heroui|@faker-js)/)',
  ],
  testTimeout: 30000,
};

// JSDOM project — components, hooks, validations, existing mock-based API tests
const jsdomConfig = {
  ...baseConfig,
  displayName: 'jsdom',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.jsdom.ts'],
  testMatch: [
    '<rootDir>/__tests__/validations/**/*.test.ts',
    '<rootDir>/__tests__/api/**/*.test.ts',
    '<rootDir>/__tests__/hooks/**/*.test.ts',
    '<rootDir>/__tests__/hooks/**/*.test.tsx',
    '<rootDir>/__tests__/components/**/*.test.tsx',
    '<rootDir>/__tests__/*.test.ts',
    '<rootDir>/__tests__/*.test.tsx',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/__mocks__/',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/__tests__/unit/',
    '<rootDir>/__tests__/integration/',
    '<rootDir>/__tests__/AddExperienceForm.test.tsx',
    '<rootDir>/__tests__/AddExperienceForm.simple.test.tsx',
    '<rootDir>/__tests__/PrintBooking.test.tsx',
    '<rootDir>/__tests__/error.test.tsx',
  ],
  testTimeout: 15000,
};

// next/jest createJestConfig returns an async function
// We resolve the jsdom config and combine with the node project
module.exports = async () => {
  const resolveJsdomConfig = createJestConfig(jsdomConfig);
  const resolvedJsdom = await resolveJsdomConfig();

  return {
    maxWorkers: 1,
    projects: [nodeProject, resolvedJsdom],
  };
};
