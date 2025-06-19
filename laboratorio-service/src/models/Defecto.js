const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Defecto extends Model {
  // Método para obtener resumen del defecto
  getResumen() {
    return {
      id: this.id,
      codigoDefecto: this.codigoDefecto,
      tipoArticulo: this.tipoArticulo,
      descripcionArticulo: this.descripcionArticulo,
      tipoDesviacion: this.tipoDesviacion,
      decision: this.decision,
      fechaCreacion: this.createdAt
    };
  }

  // Getter virtual para obtener la URL completa de la imagen
  get imagenUrl() {
    if (this.imagenFilename) {
      return `${process.env.BASE_URL || 'http://localhost:3004'}/uploads/defectos/${this.imagenFilename}`;
    }
    return null;
  }

  // Método estático para buscar por código
  static async findByCodigoDefecto(codigo) {
    return await this.findOne({ 
      where: { codigoDefecto: codigo.toUpperCase() } 
    });
  }

  // Método estático para obtener estadísticas
  static async getEstadisticas() {
    try {
      const [totalResult] = await sequelize.query(
        'SELECT COUNT(*) as total FROM Defectos WHERE estado = "activo"'
      );
      
      const [tipoDesviacionResult] = await sequelize.query(
        'SELECT tipoDesviacion, COUNT(*) as count FROM Defectos WHERE estado = "activo" GROUP BY tipoDesviacion'
      );
      
      const [decisionResult] = await sequelize.query(
        'SELECT decision, COUNT(*) as count FROM Defectos WHERE estado = "activo" GROUP BY decision'
      );
      
      return {
        total: totalResult[0]?.total || 0,
        porTipoDesviacion: tipoDesviacionResult || [],
        porDecision: decisionResult || []
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, porTipoDesviacion: [], porDecision: [] };
    }
  }
}

// Definir el modelo
Defecto.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigoDefecto: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: 'El código de defecto es obligatorio'
      }
    },
    set(value) {
      this.setDataValue('codigoDefecto', value ? value.toString().trim().toUpperCase() : value);
    }
  },
  tipoArticulo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de artículo es obligatorio'
      },
      len: {
        args: [1, 100],
        msg: 'El tipo de artículo debe tener entre 1 y 100 caracteres'
      }
    },
    set(value) {
      this.setDataValue('tipoArticulo', value ? value.toString().trim() : value);
    }
  },
  descripcionArticulo: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La descripción del artículo es obligatoria'
      },
      len: {
        args: [1, 500],
        msg: 'La descripción del artículo no puede exceder 500 caracteres'
      }
    },
    set(value) {
      this.setDataValue('descripcionArticulo', value ? value.toString().trim() : value);
    }
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El código es obligatorio'
      }
    },
    set(value) {
      this.setDataValue('codigo', value ? value.toString().trim().toUpperCase() : value);
    }
  },
  versionDefecto: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La versión del defecto es obligatoria'
      }
    },
    set(value) {
      this.setDataValue('versionDefecto', value ? value.toString().trim() : value);
    }
  },
  descripcionDefecto: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'La descripción del defecto no puede exceder 2000 caracteres'
      }
    },
    set(value) {
      this.setDataValue('descripcionDefecto', value ? value.toString().trim() : null);
    }
  },
  tipoDesviacion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El tipo de desviación es obligatorio'
      },
      len: {
        args: [1, 100],
        msg: 'El tipo de desviación debe tener entre 1 y 100 caracteres'
      }
    },
    set(value) {
      this.setDataValue('tipoDesviacion', value ? value.toString().trim() : value);
    }
  },
  decision: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'La decisión es obligatoria'
      },
      len: {
        args: [1, 100],
        msg: 'La decisión debe tener entre 1 y 100 caracteres'
      }
    },
    set(value) {
      this.setDataValue('decision', value ? value.toString().trim() : value);
    }
  },
  // Campos de imagen separados para mejor manejo en MySQL
  imagenFilename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  imagenOriginalName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  imagenMimetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null
  },
  imagenSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  observacionesAdicionales: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Las observaciones adicionales no pueden exceder 1000 caracteres'
      }
    },
    set(value) {
      this.setDataValue('observacionesAdicionales', value ? value.toString().trim() : null);
    }
  },
  creadoPor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'El usuario creador es obligatorio'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'archivado'),
    allowNull: false,
    defaultValue: 'activo'
  }
}, {
  sequelize,
  modelName: 'Defecto',
  tableName: 'Defectos',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['codigoDefecto']
    },
    {
      fields: ['tipoArticulo']
    },
    {
      fields: ['tipoDesviacion']
    },
    {
      fields: ['decision']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['creadoPor']
    }
  ],
  hooks: {
    beforeUpdate: (defecto) => {
      defecto.updatedAt = new Date();
    }
  }
});

module.exports = Defecto;