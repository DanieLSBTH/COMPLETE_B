module.exports = (sequelize, Sequelize) => {
    const Personal_estimulacion = sequelize.define("personal_estimulaciones", {
      id_personal_estimulacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(50) // Limitar a 50 caracteres
      },
      apellido: {
        type: Sequelize.STRING(50) // Limitar a 50 caracteres
      }
    });
    return Personal_estimulacion;
  };
  