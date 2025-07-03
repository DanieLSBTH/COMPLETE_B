const verificarToken = require('../middleware/verificarToken.js'); // Importa el middleware

module.exports = (app) => {
  const registro_medico = require('../controllers/registro_medico.controller.js');
  var router = require('express').Router();

  // Crear un nuevo registro médico
  router.post('/', registro_medico.create);

  // Recuperar todos los registros médicos
  router.get('/', registro_medico.findAll);

  // Recuperar un registro médico por su ID
  router.get('/:id_registro_medico', registro_medico.findOne);
router.get('/search/:registro', registro_medico.searchByRegistro);
// Ruta optimizada para búsqueda rápida en selects
router.get('/quick-search/:registro', registro_medico.quickSearchForSelect);
  // Actualizar un registro médico por su ID
  router.put('/:id_registro_medico', registro_medico.update);

  // Eliminar un registro médico por su ID
  router.delete('/:id_registro_medico', registro_medico.delete);

  // Eliminar todos los registros médicos
  router.delete('/', registro_medico.deleteAll);

  app.use('/api/registro_medico', router);
};
