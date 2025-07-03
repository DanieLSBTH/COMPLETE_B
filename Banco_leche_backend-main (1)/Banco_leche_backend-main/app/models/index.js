const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.personal = require("./personal.model.js")(sequelize, Sequelize);
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.personal_estimulaciones=require("./personal_estimulaciones.model.js")(sequelize, Sequelize);
db.servicio_in = require("./servicio_intrahospitalario.model.js")(sequelize, Sequelize);
db.servicio_ex = require("./servicio_extrahospitalario.model.js")(sequelize, Sequelize);
db.estimulacion = require("./estimulacion.model.js")(sequelize, Sequelize);
db.chat_temas = require("./chat_temas.model.js")(sequelize, Sequelize);
db.chat_subtemas = require("./chat_subtemas.model.js")(sequelize, Sequelize);
db.chat_respuestas = require("./chat_respuestas.model.js")(sequelize, Sequelize);
db.donadoras=require("./donadora.model.js")(sequelize,Sequelize);
db.donadora_detalle = require("./donadora_detalle.model.js")(sequelize, Sequelize);
db.trabajo_de_pasteurizaciones=require("./trabajo_de_pasteurizaciones.model.js")(sequelize, Sequelize);
db.control_de_leches=require("./control_de_leches.model.js")(sequelize, Sequelize);
db.registro_medicos=require("./registro_medico.model.js")(sequelize, Sequelize);
db.solicitud_de_leches=require("./solicitud_de_leches.model.js")(sequelize, Sequelize);
module.exports = db;
