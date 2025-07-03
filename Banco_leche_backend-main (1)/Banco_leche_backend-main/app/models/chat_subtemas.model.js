module.exports = (sequelize, Sequelize) => {
    const Chat_subtemas = sequelize.define('chat_subtemas', {
         id_subtema: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
       },
       nombre: {
          type: Sequelize.STRING(150),
        },
        id_tema: {
          type: Sequelize.INTEGER,
        },
    });

    Chat_subtemas.belongsTo(sequelize.models.chat_temas,{
        foreignKey: 'id_tema',
        as: 'chat_temas',
    });
    
    return Chat_subtemas;
  };
  