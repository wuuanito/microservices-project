const { Sequelize } = require('sequelize');
const config = require('../config/db.config')[process.env.NODE_ENV || 'development'];
const UserModel = require('./user.model');
const TokenModel = require('./token.model');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize models
const User = UserModel(sequelize, Sequelize);
const Token = TokenModel(sequelize, Sequelize);

// Define relationships
User.hasMany(Token, { foreignKey: 'userId' });
Token.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Token
};