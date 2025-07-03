module.exports = (sequelize, Sequelize) => {
    const DonadoraDetalle = sequelize.define('donadora_detalle', {
      id_donadora_detalle: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      no_frasco: { // Añadir el nuevo campo
        type: Sequelize.STRING, // O el tipo de dato que necesites (e.g., INTEGER, FLOAT, etc.)
        allowNull: false // Define si el campo puede o no ser nulo
      },
      id_donadora: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      onzas: {
        type: Sequelize.DECIMAL(10, 2), // Asumiendo que onzas es un número.
        allowNull: false,
      },
      id_extrahospitalario: {
        type: Sequelize.INTEGER,
      },
      id_intrahospitalario: {
        type: Sequelize.INTEGER,
      },
      constante: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      nueva: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      id_personal: {
        type: Sequelize.INTEGER,
      },
      litros: {
        type: Sequelize.DECIMAL(10, 2),
      },
    }, {
      hooks: {
        beforeSave: (donadoraDetalle) => {
          // Calcula el valor de litros basado en onzas
          if (donadoraDetalle.onzas) {
            donadoraDetalle.litros = donadoraDetalle.onzas * 0.03;
          }
        },
      },
    });
  
    // Definir la relación con la tabla de Donadora
    DonadoraDetalle.belongsTo(sequelize.models.donadora, {
      foreignKey: 'id_donadora',
      as: 'donadoras',
    });
  
    // Definir la relación con la tabla de Servicio Extrahospitalario
    DonadoraDetalle.belongsTo(sequelize.models.servicio_ex, {
      foreignKey: 'id_extrahospitalario',
      as: 'servicio_exes',
    });
   // Definir la relación con la tabla de Servicio Intrahospitalario
    DonadoraDetalle.belongsTo(sequelize.models.servicio_in, {
      foreignKey: 'id_intrahospitalario',
      as: 'servicio_ins',
    });

    // Definir la relación con la tabla de Personal
    DonadoraDetalle.belongsTo(sequelize.models.personal, {
      foreignKey: 'id_personal',
      as: 'personals',
    });
  
    return DonadoraDetalle;
  };
  