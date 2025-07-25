const mysql = require('mysql2/promise');

async function checkDatabaseAndLogin() {
  console.log('🔍 Diagnosing Login Issues...');
  
  try {
    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'devspace'
    };
    
    console.log('1. Checking database connection...');
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('Please check your database configuration in server/.env');
      return;
    }
    
    // Check if users table exists
    console.log('\n2. Checking users table structure...');
    try {
      const [rows] = await connection.execute('DESCRIBE users');
      console.log('✅ Users table exists with columns:');
      rows.forEach(row => {
        console.log(`   - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${row.Default ? `DEFAULT ${row.Default}` : ''}`);
      });
      
      // Check specifically for avatar_icon column
      const avatarIconColumn = rows.find(row => row.Field === 'avatar_icon');
      if (avatarIconColumn) {
        console.log('✅ avatar_icon column exists');
      } else {
        console.log('❌ avatar_icon column missing - this might be the issue!');
        console.log('Run this SQL to fix:');
        console.log('ALTER TABLE users ADD COLUMN avatar_icon ENUM(\'user\', \'code\', \'star\', \'zap\') DEFAULT \'user\';');
      }
    } catch (error) {
      console.log('❌ Users table check failed:', error.message);
    }
    
    // Check if any users exist
    console.log('\n3. Checking for existing users...');
    try {
      const [users] = await connection.execute('SELECT id, username, email FROM users LIMIT 5');
      if (users.length > 0) {
        console.log('✅ Found users:');
        users.forEach(user => {
          console.log(`   - ${user.username} (${user.email})`);
        });
      } else {
        console.log('❌ No users found in database');
        console.log('You might need to register a user first');
      }
    } catch (error) {
      console.log('❌ User check failed:', error.message);
    }
    
    await connection.end();
    
    console.log('\n4. Next steps:');
    console.log('If avatar_icon column is missing:');
    console.log('   cd server && npx sequelize-cli db:migrate');
    console.log('Or manually run the ALTER TABLE command above');
    console.log('\nThen restart the server:');
    console.log('   cd server && npm run dev');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.log('\nManual steps to fix login:');
    console.log('1. Check if MySQL/database is running');
    console.log('2. Verify database credentials in server/.env');
    console.log('3. Run database migrations: cd server && npx sequelize-cli db:migrate');
    console.log('4. Start server: cd server && npm run dev');
  }
}

checkDatabaseAndLogin().catch(console.error);
