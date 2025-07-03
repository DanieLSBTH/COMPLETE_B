// app/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const verificarToken = require('../middleware/verificarToken'); // Asegúrate de que la ruta sea correcta

// Rutas de usuario
router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
router.get('/me', verificarToken, (req, res) => {
    res.json({
      usuario: req.usuario // Asegúrate de que 'req.usuario' esté establecido en el middleware
    });
  });
  // Ruta para obtener todos los usuarios
router.get("/", usuarioController.obtenerUsuarios);

// Ruta para actualizar un usuario por ID
router.put("/:id", usuarioController.actualizarUsuario);


module.exports = router;
