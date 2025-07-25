const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function fixLoginIssues() {
  console.log('🔧 Fixing Login Issues...');
  
  try {
    // Check if we're in the right directory
    console.log('1. Checking current directory...');
    const { stdout: pwd } = await execAsync('pwd');
    console.log('Current directory:', pwd.trim());
    
    // Navigate to server directory if needed
    const serverPath = '/home/groot/CLASS/DevSpace/server';
    
    // Check if migration is needed
    console.log('\n2. Checking database migration status...');
    try {
      const { stdout } = await execAsync(`cd ${serverPath} && npx sequelize-cli db:migrate:status`);
      console.log('Migration status:');
      console.log(stdout);
    } catch (error) {
      console.log('Migration status check failed, proceeding with migration...');
    }
    
    // Run migrations
    console.log('\n3. Running database migrations...');
    try {
      const { stdout } = await execAsync(`cd ${serverPath} && npx sequelize-cli db:migrate`);
      console.log('Migration output:');
      console.log(stdout);
      console.log('✅ Migrations completed');
    } catch (error) {
      console.log('❌ Migration failed:', error.message);
      console.log('You may need to run this manually:');
      console.log('cd server && npx sequelize-cli db:migrate');
    }
    
    // Check if server can start
    console.log('\n4. Testing server startup...');
    console.log('Note: You should manually start the server with:');
    console.log('cd server && npm run dev');
    
    console.log('\n5. Alternative fix - Update existing users:');
    console.log('If migration doesn\'t work, you can manually add the column:');
    console.log('ALTER TABLE users ADD COLUMN avatar_icon ENUM(\'user\', \'code\', \'star\', \'zap\') DEFAULT \'user\';');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    
    console.log('\n🔧 Manual fix steps:');
    console.log('1. cd server');
    console.log('2. npx sequelize-cli db:migrate');
    console.log('3. npm run dev');
    console.log('\nOr connect to your database and run:');
    console.log('ALTER TABLE users ADD COLUMN avatar_icon ENUM(\'user\', \'code\', \'star\', \'zap\') DEFAULT \'user\';');
  }
}

fixLoginIssues().catch(console.error);
