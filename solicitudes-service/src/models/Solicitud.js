module.exports = (sequelize, DataTypes) => {
    const Solicitud = sequelize.define('Solicitud', {
      solicitante: DataTypes.STRING,
      nombreMP: DataTypes.STRING,
      lote: DataTypes.STRING,
      proveedor: DataTypes.STRING,
      urgencia: DataTypes.STRING,
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
            estado: DataTypes.STRING,
      codigo: DataTypes.STRING,
      comentarios: DataTypes.TEXT,
      oficinatecnica: DataTypes.BOOLEAN,
      expediciones: DataTypes.BOOLEAN,
      laboratorio: DataTypes.BOOLEAN,
      almacen: DataTypes.BOOLEAN,
    });
  
    return Solicitud;
  };
  