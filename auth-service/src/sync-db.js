// auth-service/src/sync-db.js
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const config = require('./config/app.config');
const logger = require('./utils/logger');

// Definir modelos manualmente para este script
const syncDatabase = async () => {
  try {
    // Crear una nueva instancia de Sequelize con credenciales directas
 const sequelize = new Sequelize('auth_service_db', 'root', 'root', {
  host: 'localhost',  // Usar localhost en lugar de host.docker.internal
  port: 3306,
  dialect: 'mysql',
  logging: console.log
});

    // Definir modelo User
    const User = sequelize.define('User', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('director', 'administrador', 'empleado'),
        defaultValue: 'empleado'
      },
      department: {
        type: Sequelize.ENUM(
          'informatica', 
          'administracion', 
          'internacional', 
          'compras', 
          'gerencia', 
          'oficina_tecnica', 
          'calidad', 
          'laboratorio', 
          'rrhh', 
          'logistica', 
          'mantenimiento', 
          'softgel', 
          'produccion',
          'sin_departamento'
        ),
        defaultValue: 'sin_departamento'
      },
      jobTitle: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      timestamps: true,
      paranoid: true,
      tableName: 'users'
    });

    // Definir modelo Token
    const Token = sequelize.define('Token', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('refresh', 'reset_password'),
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isRevoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    }, {
      timestamps: true,
      tableName: 'tokens'
    });

    // Definir relaciones
    User.hasMany(Token, { foreignKey: 'userId' });
    Token.belongsTo(User, { foreignKey: 'userId' });

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: true });
    
    logger.info('Database synchronized successfully. All tables recreated.');
    
    // Crear usuario administrador inicial
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'director',
      department: 'informatica',
      jobTitle: 'Director de Informática',
      isActive: true
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