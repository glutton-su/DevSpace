// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress database-related errors during tests
  const message = args.join(' ');
  if (message.includes('Register error:') || 
      message.includes('Get user profile error:') || 
      message.includes('Get projects error:') ||
      message.includes('Update user profile error:')) {
    return; // Don't log these errors during tests
  }
  originalConsoleError(...args);
};

// Suppress the import after teardown error more comprehensively
process.on('uncaughtException', (error) => {
  if (error.message.includes('You are trying to `import` a file after the Jest environment has been torn down') ||
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('ClientHandshake.handshakeResult')) {
    // Ignore these specific errors as they don't affect test results
    return;
  }
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && (
      reason.message.includes('You are trying to `import` a file after the Jest environment has been torn down') ||
      reason.message.includes('Cannot read properties of undefined') ||
      reason.message.includes('ClientHandshake.handshakeResult'))) {
    // Ignore these specific errors as they don't affect test results
    return;
  }
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Additional handler for the specific MySQL2 error
process.on('exit', (code) => {
  // Suppress the import after teardown error on process exit
  if (code === 0) {
    return;
  }
});

// Override console.log to filter out the specific error
const originalConsoleLog = console.log;
console.log = (...args) => {
  const message = args.join(' ');
  if (message.includes('You are trying to `import` a file after the Jest environment has been torn down')) {
    return; // Don't log this specific error
  }
  originalConsoleLog(...args);
}; 