const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El título es obligatorio'
      },
      len: {
        args: [1, 255],
        msg: 'El título debe tener entre 1 y 255 caracteres'
      }
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  asignado: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El campo asignado es obligatorio'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'completada'),
    allowNull: false,
    defaultValue: 'pendiente',
    validate: {
      isIn: {
        args: [['pendiente', 'en_progreso', 'completada']],
        msg: 'El estado debe ser: pendiente, en_progreso o completada'
      }
    }
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    allowNull: false,
    defaultValue: 'media',
    validate: {
      isIn: {
        args: [['baja', 'media', 'alta']],
        msg: 'La prioridad debe ser: baja, media o alta'
      }
    }
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: {
        msg: 'Debe ser una fecha válida'
      },
      isAfterToday(value) {
        if (value && new Date(value) < new Date()) {
          throw new Error('La fecha de vencimiento no puede ser anterior a hoy');
        }
      }
    }
  },
  fechaCreacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fechaCompletada: {
    type: DataTypes.DATE,
    allowNull: true
  },
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'tareas',
  timestamps: true,
  createdAt: 'creadoEn',
  updatedAt: 'actualizadoEn',
  hooks: {
    beforeUpdate: (tarea, options) => {
      // Si el estado cambia a completada, establecer fecha de completada
      if (tarea.changed('estado') && tarea.estado === 'completada') {
        tarea.fechaCompletada = new Date();
      }
      // Si el estado cambia de completada a otro, limpiar fecha de completada
      if (tarea.changed('estado') && tarea.estado !== 'completada') {
        tarea.fechaCompletada = null;
      }
    }
  }
});

// Métodos de instancia
Tarea.prototype.marcarComoCompletada = function() {
  this.estado = 'completada';
  this.fechaCompletada = new Date();
  return this.save();
};

Tarea.prototype.cambiarEstado = function(nuevoEstado) {
  this.estado = nuevoEstado;
  if (nuevoEstado === 'completada') {
    this.fechaCompletada = new Date();
  } else {
    this.fechaCompletada = null;
  }
  return this.save();
};

// Métodos estáticos
Tarea.obtenerPorEstado = function(estado) {
  return this.findAll({
    where: { estado },
    order: [['fechaVencimiento', 'ASC'], ['prioridad', 'DESC']]
  });
};

Tarea.obtenerPorPrioridad = function(prioridad) {
  return this.findAll({
    where: { prioridad },
    order: [['fechaVencimiento', 'ASC']]
  });
};

Tarea.obtenerVencidas = function() {
  const hoy = new Date().toISOString().split('T')[0];
  return this.findAll({
    where: {
      fechaVencimiento: {
        [require('sequelize').Op.lt]: hoy
      },
      estado: {
        [require('sequelize').Op.ne]: 'completada'
      }
    },
    order: [['fechaVencimiento', 'ASC']]
  });
};

module.exports = Tarea;