module.exports = (sequelize, Sequelize) => {
    const TrabajoDePasteurizaciones = sequelize.define("trabajo_de_pasteurizaciones", {
      id_pasteurizacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: Sequelize.DATEONLY, // Para guardar solo la fecha sin hora
        allowNull: false
      },
      numero: {
        type: Sequelize.INTEGER, // Se calculará en el backend y se reinicia diariamente
        allowNull: false
      },
      no_frasco: {
        type: Sequelize.STRING, // Número de frasco
        allowNull: false
      },
      crematorio_1_1: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      crematorio_1_2: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      total_crematorio_1: {
        type: Sequelize.DECIMAL(10, 2), // Resultado de (crematorio_1_1 / crematorio_1_2) * 100
        allowNull: false
      },
      crematorio_2_1: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      crematorio_2_2: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      total_crematorio_2: {
        type: Sequelize.DECIMAL(10, 2), // Resultado de (crematorio_2_1 / crematorio_2_2) * 100
        allowNull: false
      },
      crematorio_3_1: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      crematorio_3_2: {
        type: Sequelize.DECIMAL(10, 2), // Tipo decimal con precisión 10 y 2 decimales
        allowNull: false
      },
      total_crematorio_3: {
        type: Sequelize.DECIMAL(10, 2), // Resultado de (crematorio_3_1 / crematorio_3_2) * 100
        allowNull: false
      },
      porcentaje_crema: {
        type: Sequelize.DECIMAL(10, 2), // (total_crematorio_1 + total_crematorio_2 + total_crematorio_3) / 3
        allowNull: false
      },
      kcal_l: {
        type: Sequelize.DECIMAL(10, 2), // (porcentaje_crema * 66.8) + 290
        allowNull: false
      },
      kcal_onz: {
        type: Sequelize.DECIMAL(10, 2), // (kcal_l * 30) / 1000
        allowNull: false
      },
      acidez: {
        type: Sequelize.INTEGER, // Tipo entero para la acidez
        allowNull: false
      },
      porcentaje_grasa: {
        type: Sequelize.DECIMAL(10, 2), // (porcentaje_crema - 0.59) / 1.46
        allowNull: false
      },
      estado: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'TRUE = Disponible, FALSE = No disponible'
    }
    }); 
    return TrabajoDePasteurizaciones;
  };
  