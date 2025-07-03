module.exports = (sequelize, Sequelize) => {
    const Chat_respuestas = sequelize.define('chat_respuestas', {
      id_chat: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_subtema: {
        type: Sequelize.INTEGER,
      },
      pregunta: {
        type: Sequelize.STRING(255),
      },
      respuesta: {
        type: Sequelize.STRING(255),
      },
      enlace: {
        type: Sequelize.STRING(255), 
      },
    });

    Chat_respuestas.belongsTo(sequelize.models.chat_subtemas,{
      foreignKey: 'id_subtema',
      as: 'chat_subtemas',
  });
  
    return Chat_respuestas;
  };
  