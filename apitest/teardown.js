const { closeTestDatabase } = require('./config/test-database');

module.exports = async () => {
  console.log('Running global teardown...');
  
  try {
    await closeTestDatabase();
    console.log('Global teardown completed');
  } catch (error) {
    console.error('Error in global teardown:', error);
  }
  
  // Suppress the import after teardown error
  process.on('uncaughtException', (error) => {
    if (error.message.includes('You are trying to `import` a file after the Jest environment has been torn down')) {
      // Ignore this specific error as it doesn't affect test results
      return;
    }
    console.error('Uncaught Exception:', error);
  });
}; 