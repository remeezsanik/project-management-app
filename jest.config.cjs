// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^next/router$': '<rootDir>/__mocks__/next/router.cjs',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1', // New mapping for hooks
    // "^sonner$": "<rootDir>/components/sonner",
  },
};