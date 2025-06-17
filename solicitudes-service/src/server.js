require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const sequelize = require('./config/db');
const Message = require('./models/Message');
const chatSocket = require('./sockets/chatSocket');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Iniciar sockets
chatSocket(io);

// DB connect
sequelize.authenticate()
  .then(() => {
    console.log('🟢 Conexión MySQL exitosa');
    return sequelize.sync();
  })
  .then(() => {
    console.log('📦 Tablas sincronizadas');
    server.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Error de base de datos:', err));
