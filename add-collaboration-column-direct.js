const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCollaborationColumn() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'devspace'
    });
    
    console.log('✅ Connected to database');
    
    console.log('Adding allow_collaboration column to code_snippets table...');
    
    await connection.execute(`
      ALTER TABLE code_snippets 
      ADD COLUMN allow_collaboration TINYINT(1) DEFAULT 0 AFTER is_public
    `);
    
    console.log('✅ Successfully added allow_collaboration column');
    
    // Verify the column was added
    const [results] = await connection.execute('DESCRIBE code_snippets');
    const collaborationColumn = results.find(col => col.Field === 'allow_collaboration');
    
    if (collaborationColumn) {
      console.log('✅ Column verified in database:', collaborationColumn);
    } else {
      console.log('❌ Column not found after creation');
    }
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists in database');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

addCollaborationColumn();
