module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      usuario: DataTypes.STRING,
      mensaje: DataTypes.TEXT,
      solicitudId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Permitir null para mensajes existentes
        references: {
          model: 'Solicituds',
          key: 'id'
        }
      },
      archivos: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    });
  
    return Message;
  };
  