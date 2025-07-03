module.exports = (sequelize, Sequelize) => {
    const Chat_temas = sequelize.define('chat_temas', {
      id_tema: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tema: {
        type: Sequelize.STRING(100),
      },
    });
  
    return Chat_temas;
  };
  