const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // ← importa la instancia correcta

const db = {};

db.sequelize = sequelize;
db.Sequelize = sequelize.Sequelize;

db.Solicitud = require('./Solicitud')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);

// Relaciones
db.Solicitud.hasMany(db.Message, {
  foreignKey: 'solicitudId',
  as: 'mensajes',
  onDelete: 'CASCADE',
});

db.Message.belongsTo(db.Solicitud, {
  foreignKey: 'solicitudId',
  as: 'solicitud',
});

module.exports = db;
