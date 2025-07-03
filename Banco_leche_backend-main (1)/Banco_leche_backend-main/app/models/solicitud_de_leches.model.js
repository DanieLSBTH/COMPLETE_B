module.exports = (sequelize, Sequelize) => {
    const SolicitudDeLeches = sequelize.define("solicitud_de_leches", {
      id_solicitud: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_registro_medico:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: false,
        get() {
          // Devolver solo la parte de la fecha
          return this.getDataValue('fecha_nacimiento').toISOString().split('T')[0];
        }
      },
      edad_de_ingreso: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tipo_paciente: {
        type: Sequelize.STRING(50), // Ajusta la longitud según sea necesario
        allowNull: false,
      },
      peso_al_nacer: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      peso_actual: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      kcal_o: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      volumen_toma_cc: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      numero_tomas: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_vol_solicitado: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      id_control_leche: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      servicio: {
        type: Sequelize.STRING(50), // Ajusta la longitud según sea necesario
        allowNull: false,
      },
      fecha_entrega: {
  type: Sequelize.DATEONLY,
  allowNull: false,
},

      solicita: {
        type: Sequelize.STRING(100), // Ajusta la longitud según sea necesario
        allowNull: false,
      },
      onzas: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      litros: {
        type: Sequelize.FLOAT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('litros');
          return parseFloat(rawValue).toFixed(2); // Redondear a 2 decimales
        }
      },
      
      costos: {
        type: Sequelize.FLOAT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('costos');
          return parseFloat(rawValue).toFixed(2); // Redondear a 2 decimales
        }
      },
    });
  
    SolicitudDeLeches.belongsTo(sequelize.models.control_de_leches, {
      foreignKey: 'id_control_leche',
      as: 'control_de_leches', // Alias más descriptivo
    });

     SolicitudDeLeches.belongsTo(sequelize.models.registro_medico, {
      foreignKey: 'id_registro_medico',
      as: 'registro_medicos', // Alias más descriptivo
    });

   
    return SolicitudDeLeches;
  };
  