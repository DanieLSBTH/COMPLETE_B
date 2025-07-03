module.exports = (app) => {
    const servicio_in = require('../controllers/servicio_intrahospitalario.controller.js');
    var router = require('express').Router();
  
    // Crear un nuevo personal
    router.post('/', servicio_in.create);
  
    // Recuperar todos los personales
    router.get('/', servicio_in.findAll);
  
    // Recuperar un personal por su ID
    router.get('/:id_intrahospitalario', servicio_in.findOne);
  
    // Actualizar un personal por su ID
    router.put('/:id_intrahospitalario', servicio_in.update);
  
    // Eliminar un personal por su ID
    router.delete('/:id_intrahospitalario', servicio_in.delete);
  
    // Eliminar todos los personal
  
    app.use('/api/servicio_in', router);
  };