module.exports = (sequelize, Sequelize) => {
    const Servicio_in = sequelize.define("servicio_in", {
      id_intrahospitalario: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      
      servicio: {
        type: Sequelize.STRING(100)
      }
    
    });
  
    return Servicio_in;
  };
  