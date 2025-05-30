// auth-service/src/sync-db.js
const { sequelize, User, Token } = require('./models');
const bcrypt = require('bcrypt');
const config = require('./config/app.config');
const logger = require('./utils/logger');

// Función para sincronizar la base de datos
const syncDatabase = async () => {
  try {
    // Sincronizar modelos con la base de datos (force: true eliminará las tablas primero)
    // Usa force: false si no quieres eliminar datos existentes
    await sequelize.sync({ force: true });
    
    logger.info('Database synchronized successfully. All tables recreated.');
    
    // Crear usuario administrador inicial
    const adminPassword = await bcrypt.hash('admin123', config.bcryptSaltRounds);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'director',
      department: 'informatica',
      jobTitle: 'Director de Informática',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    logger.info(`Admin user created with ID: ${adminUser.id}`);
    
    return { success: true, message: 'Database synchronized and admin user created.' };
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    return { success: false, error: error.message };
  }
};

// Si se ejecuta el script directamente
if (require.main === module) {
  syncDatabase()
    .then(result => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} else {
  // Exportar la función para poder usarla desde otros archivos
  module.exports = { syncDatabase };
}