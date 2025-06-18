const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabaseIfNotExists = async (dbName) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    // Primero verificar si la base de datos ya existe
    const [rows] = await connection.execute(
      `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbName]
    );
    
    if (rows.length > 0) {
      console.log(`✅ Database '${dbName}' already exists`);
      return;
    }
    
    // Intentar crear la base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created successfully`);
  } catch (error) {
    if (error.code === 'ER_DBACCESS_DENIED_ERROR' || error.message.includes('Access denied')) {
      console.warn(`⚠️  Warning: Cannot create database '${dbName}' due to insufficient privileges.`);
      console.warn(`   Please create the database manually using:`);
      console.warn(`   CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.warn(`   Or grant CREATE privileges to user '${process.env.DB_USER || 'root'}'`);
      // No lanzar error, continuar con el siguiente
      return;
    }
    console.error(`❌ Error creating database '${dbName}':`, error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

const initializeDatabases = async () => {
  try {
    console.log('🚀 Initializing databases...');
    
    let hasErrors = false;
    
    // Crear base de datos para auth-service
    const authDbName = process.env.AUTH_DB_NAME || 'auth_service_db';
    try {
      await createDatabaseIfNotExists(authDbName);
    } catch (error) {
      hasErrors = true;
      console.error(`Failed to handle auth database: ${error.message}`);
    }
    
    // Crear base de datos para calendar-service
    const calendarDbName = process.env.CALENDAR_DB_NAME || 'calendar_service_db';
    try {
      await createDatabaseIfNotExists(calendarDbName);
    } catch (error) {
      hasErrors = true;
      console.error(`Failed to handle calendar database: ${error.message}`);
    }
    
    // Crear base de datos para informatica-service
    const informaticaDbName = process.env.INFORMATICA_DB_NAME || 'informatica_db';
    try {
      await createDatabaseIfNotExists(informaticaDbName);
    } catch (error) {
      hasErrors = true;
      console.error(`Failed to handle informatica database: ${error.message}`);
    }
    
    if (hasErrors) {
      console.log('⚠️  Database initialization completed with warnings.');
      console.log('   Some databases may need to be created manually.');
      console.log('   The services will attempt to connect to existing databases.');
    } else {
      console.log('✅ All databases initialized successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to initialize databases:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Ensure MySQL is running and accessible');
    console.log('2. Verify database credentials in .env file');
    console.log('3. Create databases manually if needed:');
    console.log(`   CREATE DATABASE IF NOT EXISTS \`${process.env.AUTH_DB_NAME || 'auth_service_db'}\`;`);
    console.log(`   CREATE DATABASE IF NOT EXISTS \`${process.env.CALENDAR_DB_NAME || 'calendar_service_db'}\`;`);
    console.log(`   CREATE DATABASE IF NOT EXISTS \`${process.env.INFORMATICA_DB_NAME || 'informatica_db'}\`;`);
    process.exit(1);
  }
};

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  initializeDatabases();
}

module.exports = { initializeDatabases, createDatabaseIfNotExists };