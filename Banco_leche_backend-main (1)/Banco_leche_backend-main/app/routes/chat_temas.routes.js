module.exports = (app) => {
  const chat_temas = require('../controllers/chat_temas.controller.js');
  var router = require('express').Router();

  // Crear un nuevo tema de chat
  router.post('/', chat_temas.create);

  // Recuperar todos los temas de chat
  router.get('/', chat_temas.findAll);

  router.get('/ids-temas', chat_temas.findAllIdsAndThemes);

  // Recuperar un tema de chat por su ID
  router.get('/:id_tema', chat_temas.findOne);

  // Actualizar un tema de chat por su ID
  router.put('/:id_tema', chat_temas.update);

  // Eliminar un tema de chat por su ID
  router.delete('/:id_tema', chat_temas.delete);

  // Eliminar todos los temas de chat
  router.delete('/', chat_temas.deleteAll);


  app.use('/api/chat_temas', router);
};
