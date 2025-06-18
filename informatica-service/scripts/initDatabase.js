const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 3306
};

async function initDatabase() {
  let connection;
  
  try {
    // Conectar sin especificar base de datos
    connection = await mysql.createConnection(dbConfig);
    
    // Crear base de datos si no existe
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'informatica_db'}`);
    console.log('✅ Base de datos creada o ya existe');
    
    // Cerrar conexión inicial
    await connection.end();
    
    // Reconectar especificando la base de datos
    const dbConfigWithDatabase = {
      ...dbConfig,
      database: process.env.DB_NAME || 'informatica_db'
    };
    connection = await mysql.createConnection(dbConfigWithDatabase);
    
    // Crear tabla equipos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipos (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        ip VARCHAR(15) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        ubicacion VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla equipos creada');
    
    // Crear tabla servidores
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS servidores (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        ip VARCHAR(15) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla servidores creada');
    
    // Crear tabla switches
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS switches (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        ip VARCHAR(15) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        puertos VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla switches creada');
    
    // Crear tabla usuarios_dominio
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios_dominio (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        departamento VARCHAR(50) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        ultimo_acceso DATE,
        grupos TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios_dominio creada');

    // Crear tabla inventario
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        cantidad INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla inventario creada');

    // Insertar datos de ejemplo en inventario
    await connection.execute(`
      INSERT IGNORE INTO inventario (id, nombre, descripcion, cantidad) VALUES
      (1, 'Laptop Dell XPS', 'Laptop para desarrollo', 5),
      (2, 'Monitor LG 27"', 'Monitor para estaciones de trabajo', 10),
      (3, 'Teclado Logitech', 'Teclado inalámbrico', 15),
      (4, 'Mouse Microsoft', 'Mouse ergonómico', 8),
      (5, 'Docking Station', 'Para laptops corporativas', 6),
      (6, 'Cable HDMI', '2 metros de longitud', 20),
      (7, 'Adaptador USB-C', 'Multipuerto', 12)
    `);
    console.log('✅ Datos de ejemplo insertados en inventario');
    
    // Crear tabla cuentas_office
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cuentas_office (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        licencia VARCHAR(100) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activa',
        fecha_expiracion DATE,
        aplicaciones TEXT,
        almacenamiento VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla cuentas_office creada');
    
    // Crear tabla camaras_seguridad
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS camaras_seguridad (
        id VARCHAR(20) PRIMARY KEY,
        ip VARCHAR(15) NOT NULL,
        ubicacion VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        contraseña VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla camaras_seguridad creada');
    
    // Crear tabla programas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS programas (
        id VARCHAR(20) PRIMARY KEY,
        programa VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL,
        contraseña VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla programas creada');
    
    // Crear tabla raspberry
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS raspberry (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        ip VARCHAR(15) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        uso VARCHAR(100) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        ubicacion VARCHAR(100) NOT NULL,
        usuario VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla raspberry creada');
    
    console.log('\n🎉 Base de datos inicializada correctamente');
    console.log('📋 Tablas creadas:');
    console.log('   - equipos');
    console.log('   - servidores');
    console.log('   - switches');
    console.log('   - usuarios_dominio');
    console.log('   - cuentas_office');
    console.log('   - camaras_seguridad');
    console.log('   - programas');
    console.log('   - raspberry');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;