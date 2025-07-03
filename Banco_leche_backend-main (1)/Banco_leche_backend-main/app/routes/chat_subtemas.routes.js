module.exports = app =>{

const chat_subtemas = require('../controllers/chat_subtemas.controller.js');
var router = require("express").Router();
// Crear un nuevo subtema de chat
router.post('/', chat_subtemas.create);

// Recuperar todos los subtemas de chat
router.get('/', chat_subtemas.findAll);

// Recuperar un subtema de chat específico por su ID
router.get('/:id_subtema', chat_subtemas.findOne);

router.get('/tema/:id_tema', chat_subtemas.findByTemaId);

// Actualizar un subtema de chat por su ID
router.put('/:id_subtema', chat_subtemas.update);

// Eliminar un subtema de chat por su ID
router.delete('/:id_subtema', chat_subtemas.delete);

// Eliminar todos los subtemas de chat
router.delete('/', chat_subtemas.deleteAll);

// Recuperar todos los subtemas de un tema específico
router.get('/tema/:id_tema', chat_subtemas.findByTema);

app.use("/api/chat_subtemas",router);
};
