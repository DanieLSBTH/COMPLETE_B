// app/controllers/usuario.controller.js

const db = require("../models");
const bcrypt = require("bcrypt");
const Usuario = db.usuarios;
const jwt = require("jsonwebtoken"); // Requerir la librería JWT

exports.registrar = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const usuario = await Usuario.create({ nombre, correo, contrasena: hashedPassword });
    res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo },
      process.env.JWT_SECRET || 'mi_clave_secreta', // Usar variable de entorno
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    return res.status(200).json({ 
      mensaje: "Inicio de sesión exitoso", 
      token 
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }
    res.status(200).json({ mensaje: 'Sesión cerrada exitosamente' });
  });
};

// Obtener todos los usuarios sin mostrar la contraseña
exports.obtenerUsuarios = async (req, res) => {
  try {
    // Excluir el campo "contrasena" al obtener los usuarios
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre', 'correo', 'contrasena']
    });
    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
};

// Actualizar usuario por ID
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena } = req.body;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const datosActualizados = {
      nombre: nombre || usuario.nombre,
      correo: correo || usuario.correo,
      
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (contrasena) {
      datosActualizados.contrasena = await bcrypt.hash(contrasena, 10);
    }

    await usuario.update(datosActualizados);
    res.status(200).json({ mensaje: "Usuario actualizado correctamente", usuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar usuario", error });
  }
};
