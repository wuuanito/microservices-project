const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    asunto: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    usuarioEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    prioridad: {
      type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
      allowNull: false,
      defaultValue: 'Media'
    },
    estado: {
      type: DataTypes.ENUM('Abierto', 'En Progreso', 'Pendiente', 'Cerrado'),
      allowNull: false,
      defaultValue: 'Abierto'
    },
    asignadoA: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fechaCreacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ultimaActualizacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fechaCierre: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: true
    },
    etiquetas: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'tickets',
    timestamps: true,
    hooks: {
      beforeUpdate: (ticket) => {
        ticket.ultimaActualizacion = new Date().toISOString().split('T')[0];
        if (ticket.estado === 'Cerrado' && !ticket.fechaCierre) {
          ticket.fechaCierre = new Date().toISOString().split('T')[0];
        }
      }
    }
  });

  return Ticket;
};