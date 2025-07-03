require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const app = express();
const session = require('express-session');
const verificarToken = require('./app/middleware/verificarToken'); 

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use(session({
  secret: 'secret_key', // Cambia esta clave a una más segura
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }, // 1 hora
}));

const db = require("./app/models");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "BANCO DE LECHE EN LINEA." });
});

// Rutas protegidas por JWT (todas las rutas)
const usuarioRoutes = require('./app/routes/usuario.routes');

// Proteger todas las rutas a continuación
app.use('/api/usuarios', usuarioRoutes);

// Otras rutas protegidas
require("./app/routes/personal.routes")(app);
app.use('/api/personal', verificarToken, require("./app/routes/personal.routes"));

require("./app/routes/servicio_intrahospitalario.routes")(app);
app.use('/api/servicio_intrahospitalario', verificarToken, require("./app/routes/servicio_intrahospitalario.routes"));

require("./app/routes/servicio_extrahospitalario.routes")(app);
app.use('/api/servicio_extrahospitalario', verificarToken, require("./app/routes/servicio_extrahospitalario.routes"));

require("./app/routes/estimulacion.routes")(app);
app.use('/api/estimulacion', verificarToken, require("./app/routes/estimulacion.routes"));

require("./app/routes/personal_estimulaciones.routes")(app);
app.use('/api/personal_estimulacion', verificarToken, require("./app/routes/personal_estimulaciones.routes"));

require("./app/routes/chat_temas.routes")(app);
app.use('/api/chat_temas', verificarToken, require("./app/routes/chat_temas.routes"));

require("./app/routes/chat_subtemas.routes")(app);
app.use('/api/chat_subtemas', verificarToken, require("./app/routes/chat_subtemas.routes"));

require("./app/routes/chat_respuestas.routes")(app);
app.use('/api/chat_respuestas', verificarToken, require("./app/routes/chat_respuestas.routes"));

require("./app/routes/donadora.routes")(app);
app.use('/api/donadora', verificarToken, require("./app/routes/donadora.routes"));

require("./app/routes/donadora_detalle.routes")(app);
app.use('/api/donadora_detalle', verificarToken, require("./app/routes/donadora_detalle.routes"));

require("./app/routes/trabajo_de_pasteurizaciones.routes")(app);
app.use('/api/trabajo_de_pasteurizaciones', verificarToken, require("./app/routes/trabajo_de_pasteurizaciones.routes"));

require("./app/routes/control_de_leches.routes")(app);
app.use('/api/control_de_leches', verificarToken, require("./app/routes/control_de_leches.routes"));

require("./app/routes/registro_medico.routes")(app);
app.use('/api/registro_medico', verificarToken,require("./app/routes/registro_medico.routes"));


require("./app/routes/solicitud_de_leches.routes")(app);
app.use('/api/solicitud_de_leches', verificarToken, require("./app/routes/solicitud_de_leches.routes"));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
