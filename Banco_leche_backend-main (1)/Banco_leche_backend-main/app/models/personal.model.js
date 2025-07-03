module.exports = (sequelize, Sequelize) => {
    const Personal = sequelize.define("personal", {
      id_personal: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: Sequelize.STRING(50)
      },
      apellido: {
        type: Sequelize.STRING(50)
      },
      puesto: {
        type: Sequelize.STRING(50)
      }
    });
    return Personal;
  };
  