module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalTeardown: '<rootDir>/teardown.js',
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
  // Add these to handle async operations better
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  // Suppress the import after teardown error
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  // Suppress specific errors
  silent: true,
  verbose: false
}; 