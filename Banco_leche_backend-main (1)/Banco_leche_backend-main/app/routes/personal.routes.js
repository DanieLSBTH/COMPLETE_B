const verificarToken = require('../middleware/verificarToken.js'); // Importa el middleware

module.exports = (app) => {
    const personal = require('../controllers/personal.controller.js');
    var router = require('express').Router();
    // Crear un nuevo personal
    router.post('/', personal.create);
    // Recuperar todos los personales
    router.get('/', personal.findAll);
    // Recuperar un personal por su ID
    router.get('/:id_personal', personal.findOne);
    // Actualizar un personal por su ID
    router.put('/:id_personal', personal.update);
    // Eliminar un personal por su ID
    router.delete('/:id_personal', personal.delete);
    // Eliminar todos los personal
  
    app.use('/api/personal', router);
  };