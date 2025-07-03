module.exports = (sequelize, Sequelize) => {
    const Registro_medico = sequelize.define("registro_medico", {
        id_registro_medico: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        registro_medico: {
            type: Sequelize.STRING(75),
            unique: true
        },
        recien_nacido: {
            type: Sequelize.STRING(50),
            unique: true
        }
    });

    return Registro_medico;
};
