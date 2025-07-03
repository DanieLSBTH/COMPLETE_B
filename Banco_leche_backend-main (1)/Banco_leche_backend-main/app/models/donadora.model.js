module.exports = (sequelize, Sequelize) => {
    const Donadora = sequelize.define("donadora", {
      id_donadora: {
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
  
    return Donadora;
  };
  