module.exports = (app) => {
  const servicio_ex = require('../controllers/servicio_extrahospitalario.controller.js');
  var router = require('express').Router();

  // Crear un nuevo servicio extrahospitalario
  router.post('/', servicio_ex.create);

  // Recuperar todos los servicios extrahospitalarios
  router.get('/', servicio_ex.findAll);

  // Recuperar un servicio extrahospitalario por su ID
  router.get('/:id_extrahospitalario', servicio_ex.findOne);

  // Actualizar un servicio extrahospitalario por su ID
  router.put('/:id_extrahospitalario', servicio_ex.update);

  // Eliminar un servicio extrahospitalario por su ID
  router.delete('/:id_extrahospitalario', servicio_ex.delete);

  // Eliminar todos los servicios extrahospitalarios
  router.delete('/', servicio_ex.deleteAll);

  app.use('/api/servicio_ex', router);
};
