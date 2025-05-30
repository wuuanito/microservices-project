// auth-service/src/models/user.model.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('director', 'administrador', 'empleado'),
      defaultValue: 'empleado'
    },
    department: {
      type: DataTypes.ENUM(
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
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true, // Soft delete (deletedAt column)
    tableName: 'users'
  });

  return User;
};