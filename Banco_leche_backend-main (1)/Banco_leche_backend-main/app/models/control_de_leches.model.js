module.exports = (sequelize, Sequelize) => {
  const ControlDeLeche = sequelize.define("control_de_leches", {
    id_control_leche: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_pasteurizacion: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    no_frascoregistro: {
      type: Sequelize.STRING, // Número de frasco
      allowNull: false
    },
    frasco: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    tipo_frasco: {
      type: Sequelize.STRING, // tipo frasco
      allowNull: true
    },
    unidosis: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    tipo_unidosis: {
      type: Sequelize.STRING, // tipo unidosis 
      allowNull: true
    },
    fecha_almacenamiento: {
  type: Sequelize.DATEONLY,
  allowNull: false,
},
    volumen_ml_onza: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    tipo_de_leche: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    fecha_entrega: {
      type: Sequelize.DATE,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('fecha_entrega');
        return rawValue ? rawValue.toISOString().split('T')[0] : null; // Devuelve null si el valor es null
      }
    },
    responsable: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
     estado: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'TRUE = Disponible, FALSE = No disponible'
    }
  });

  ControlDeLeche.belongsTo(sequelize.models.trabajo_de_pasteurizaciones, {
    foreignKey: 'id_pasteurizacion',
    as: 'trabajo_de_pasteurizaciones', // Alias más descriptivo
  });
  
  return ControlDeLeche;
};
