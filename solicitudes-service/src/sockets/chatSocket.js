module.exports = (io) => {
    io.on('connection', (socket) => {
      console.log('🟢 Cliente conectado:', socket.id);
  
      // Unirse a una sala específica de solicitud
      socket.on('unirse_solicitud', (solicitudId) => {
        socket.join(`solicitud_${solicitudId}`);
        console.log(`🏠 Cliente ${socket.id} se unió a solicitud_${solicitudId}`);
      });
  
      // Salir de una sala específica de solicitud
      socket.on('salir_solicitud', (solicitudId) => {
        socket.leave(`solicitud_${solicitudId}`);
        console.log(`🚪 Cliente ${socket.id} salió de solicitud_${solicitudId}`);
      });
  
      // Nuevo mensaje para una solicitud específica
      socket.on('nuevo_mensaje', (data) => {
        if (data.solicitudId) {
          // Enviar mensaje solo a los usuarios en la sala de esa solicitud
          socket.to(`solicitud_${data.solicitudId}`).emit('mensaje_recibido', data);
          console.log(`📨 Mensaje enviado a solicitud_${data.solicitudId}`);
        } else {
          // Mantener compatibilidad con mensajes globales
          socket.broadcast.emit('mensaje_recibido', data);
        }
      });
  
      socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.id);
      });
    });
  };
  