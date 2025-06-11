const { Sequelize } = require('sequelize');
const config = require('../config/db.config');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Ticket = require('./ticket.model')(sequelize);
db.Conversation = require('./conversation.model')(sequelize);

// Define relationships
db.Ticket.hasMany(db.Conversation, { foreignKey: 'ticketId', as: 'conversacion' });
db.Conversation.belongsTo(db.Ticket, { foreignKey: 'ticketId' });

module.exports = db;