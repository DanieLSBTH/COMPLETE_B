module.exports = (app) => {
    const estimulacion = require('../controllers/personal_estimulaciones.controller.js');
    var router = require('express').Router();
  
    // Crear un nuevo registro de estimulacion
    router.post('/', estimulacion.create);
  // 🔄 Búsqueda avanzada (debe ir ANTES del :id para evitar conflictos)
    router.get('/search/advanced', estimulacion.search);
    // Recuperar todos los registros de estimulacion
    router.get('/', estimulacion.findAll);
  
     router.get('/:id_personal_estimulacion', estimulacion.findOne);
  
    // Actualizar un registro de estimulacion por su ID
    router.put('/:id_personal_estimulacion', estimulacion.update);
  
    // Eliminar un registro de estimulacion por su ID
    router.delete('/:id_personal_estimulacion', estimulacion.delete);
    // Agregar esta línea en estimulacion.routes.js

    // Montar el router en la aplicación
    app.use('/api/personal_estimulacion', router);
   
};
