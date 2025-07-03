module.exports = app =>{

    const chat_respuestas = require('../controllers/chat_respuestas.controller.js');
    var router = require("express").Router();
    // Crear un nuevo subtema de chat
    router.post('/', chat_respuestas.create);
    
    // Recuperar todos los subtemas de chat
    router.get('/',chat_respuestas.findAll);
    
    // Recuperar un subtema de chat específico por su ID
    router.get('/:id_chat', chat_respuestas.findOne);

    // Recuperar respuestas por id_subtema
    router.get('/subtema/:id_subtema', chat_respuestas.findBySubtemaId);
    
    router.get('/chat/:id_chat', chat_respuestas.findBySubtemaIdchat);
    // Actualizar un subtema de chat por su ID
    router.put('/:id_chat', chat_respuestas.update);
    
    // Eliminar un subtema de chat por su ID
    router.delete('/:id_chat', chat_respuestas.delete);
    
    // Eliminar todos los subtemas de chat
    router.delete('/', chat_respuestas.deleteAll);
    
    app.use("/api/chat_respuestas",router);
    };
    