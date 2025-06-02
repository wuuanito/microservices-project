require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Carga .env desde la raíz del servicio
const sequelize = require('./sequelize');

// Importar modelos aquí
const Event = require('../models/event.model');

const syncDatabase = async () => {
  try {
    console.log('Starting database synchronization...');
    // ¡CUIDADO! Esto borrará y recreará las tablas.
    await sequelize.sync({ force: true }); 
    // await sequelize.sync({ alter: true }); // Comenta o cambia esta línea
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

syncDatabase();