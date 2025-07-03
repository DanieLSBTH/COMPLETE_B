const donadoraModel = require('../models/donadora.model.js');

module.exports = (app) => {
    const donadora = require('../controllers/donadora.controller.js');
    var router = require('express').Router();

    // Crear un nuevo registro de donadora
    router.post('/', donadora.create);

    // Recuperar todos los registros de donadora
    router.get('/', donadora.findAll);

    // 🔄 Búsqueda avanzada (debe ir antes del :id)
    router.get('/search/advanced', donadora.search);

    // Recuperar un registro de donadora por su ID
    router.get('/:id_donadora', donadora.findOne);

    // Actualizar un registro de donadora por su ID
    router.put('/:id_donadora', donadora.update);

    // Eliminar un registro de donadora por su ID
    router.delete('/:id_donadora', donadora.delete);

    // Eliminar todos los registros de donadora
    router.delete('/', donadora.deleteAll);

    // Montar el router en la aplicación
    app.use('/api/donadora', router);
};
