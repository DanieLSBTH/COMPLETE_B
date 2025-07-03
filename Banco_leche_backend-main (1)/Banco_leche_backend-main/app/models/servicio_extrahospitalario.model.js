module.exports = (sequelize, Sequelize) => {
    const Servicio_ex = sequelize.define("servicio_ex", {
      id_extrahospitalario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      
      servicio: {
        type: Sequelize.STRING(100)
      }
    
    });
  
    return Servicio_ex;
  };
  