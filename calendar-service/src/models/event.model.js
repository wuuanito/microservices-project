const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database/sequelize'); // Asegúrate que la ruta sea correcta al archivo de configuración de Sequelize

class Event extends Model {}

Event.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título no puede estar vacío.' },
      len: [3, 255] // El título debe tener entre 3 y 255 caracteres.
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // La descripción puede estar vacía.
  },
  responsible: {
    type: DataTypes.STRING, // Podría ser un ID de usuario si se integra con auth-service
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El responsable no puede estar vacío.' }
    }
  },
  participants: {
    type: DataTypes.JSON, // Almacenar como un array de strings (nombres o IDs de usuario)
    allowNull: true, // Puede ser un evento sin participantes adicionales al responsable
    defaultValue: [], // Por defecto, un array vacío.
  },
  roomReserved: {
    type: DataTypes.STRING,
    allowNull: true, // La sala puede no ser necesaria o no estar reservada
    field: 'room_reserved' // Nombre de la columna en la BD
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time',
    validate: {
      notNull: { msg: 'La hora de inicio es obligatoria.' },
      isDate: { msg: 'La hora de inicio debe ser una fecha válida.' }
    }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time',
    validate: {
      notNull: { msg: 'La hora de fin es obligatoria.' },
      isDate: { msg: 'La hora de fin debe ser una fecha válida.' },
      isAfterStartTime(value) {
        if (this.startTime && value <= this.startTime) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio.');
        }
      }
    }
  },
  eventType: { // <<<<<<<<<< NUEVO CAMPO >>>>>>>>>>
    type: DataTypes.STRING,
    allowNull: false, // Se asume que el tipo de evento es obligatorio
    field: 'event_type', // Nombre de la columna en la BD
    validate: {
      notEmpty: { msg: 'El tipo de evento no puede estar vacío.' },
      // Ejemplo de validación para valores específicos (descomentar y ajustar si es necesario):
      // isIn: {
      //   args: [['reunion', 'conferencia', 'taller', 'webinar', 'otro']],
      //   msg: "El tipo de evento debe ser uno de los valores permitidos (ej: 'reunion', 'conferencia')."
      // }
    }
  },
  // Campos para eventos rutinarios
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_recurring'
  },
  recurrencePattern: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'recurrence_pattern',
    validate: {
      isValidPattern(value) {
        if (this.isRecurring && !value) {
          throw new Error('El patrón de recurrencia es obligatorio para eventos rutinarios.');
        }
        if (value && !['daily', 'weekly', 'monthly', 'yearly'].includes(value)) {
          throw new Error('El patrón de recurrencia debe ser: daily, weekly, monthly o yearly.');
        }
      }
    }
  },
  recurrenceInterval: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
    field: 'recurrence_interval',
    validate: {
      min: 1,
      isValidInterval(value) {
        if (this.isRecurring && (!value || value < 1)) {
          throw new Error('El intervalo de recurrencia debe ser mayor a 0 para eventos rutinarios.');
        }
      }
    }
  },
  recurrenceEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'recurrence_end_date'
  },
  parentEventId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_event_id',
    references: {
      model: 'events',
      key: 'id'
    }
  }
  // Campos adicionales que podrían ser útiles:
  // createdBy: { type: DataTypes.INTEGER, field: 'created_by' }, // ID del usuario que creó el evento
  // updatedBy: { type: DataTypes.INTEGER, field: 'updated_by' }, // ID del usuario que actualizó el evento
}, {
  sequelize, // Instancia de Sequelize
  modelName: 'Event', // Nombre del modelo en singular
  tableName: 'events', // Nombre de la tabla en la base de datos en plural
  timestamps: true, // Habilita los campos createdAt y updatedAt automáticamente
  paranoid: true,   // Habilita soft deletes (campo deletedAt)
});

// Aquí se podrían definir relaciones si, por ejemplo, 'participants' fuera una tabla separada.
// O si 'responsible' o 'createdBy' fueran claves foráneas a una tabla 'Users'.
// Ejemplo:
// const User = require('./user.model'); // Suponiendo que tienes un modelo User
// Event.belongsTo(User, { foreignKey: 'responsible', as: 'eventResponsible' });
// Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
// Event.hasMany(Participant, { foreignKey: 'eventId', as: 'eventParticipants' });

module.exports = Event;