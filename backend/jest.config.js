module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    '!node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};