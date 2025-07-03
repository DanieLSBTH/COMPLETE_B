const db = require('../models');
const Chat_subtemas = db.chat_subtemas;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo subtema de chat
exports.create = (req, res) => {
  const { nombre, id_tema } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!nombre || !id_tema) {
    res.status(400).send({
      message: 'El campo "nombre" y "id_tema" son obligatorios.',
    });
    return;
  }

  // Crear un registro en chat_subtemas
  Chat_subtemas.create({
    nombre,
    id_tema,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el subtema de chat.',
      });
    });
};

// Recuperar todos los subtemas de chat de la base de datos
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  Chat_subtemas.findAll({
    where: condition,
    include: [
      { model: db.chat_temas, as: 'chat_temas' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los subtemas de chat.',
      });
    });
};

// Recuperar un subtema de chat por su ID
exports.findOne = (req, res) => {
  const id_subtema = req.params.id_subtema;

  Chat_subtemas.findByPk(id_subtema, {
    include: [
      { model: db.chat_temas, as: 'chat_temas' },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el subtema de chat con id=${id_subtema}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el subtema de chat con id=${id_subtema}`,
      });
    });
};

// Actualizar un subtema de chat por su ID
exports.update = (req, res) => {
  const id_subtema = req.params.id_subtema;

  Chat_subtemas.update(req.body, {
    where: { id_subtema: id_subtema },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Subtema de chat actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el subtema de chat con id=${id_subtema}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el subtema de chat con id=${id_subtema}`,
      });
    });
};
// Consultar subtemas por id_tema
exports.findByTemaId = (req, res) => {
  const id_tema = req.params.id_tema;

  Chat_subtemas.findAll({
    where: { id_tema: id_tema },
    attributes: ['id_subtema', 'nombre']  // Selecciona solo id_subtema y nombre
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(404).send({
          message: `No se encontraron subtemas con id_tema=${id_tema}.`
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar los subtemas con id_tema=${id_tema}.`
      });
    });
};


// Eliminar un subtema de chat por su ID
exports.delete = (req, res) => {
  const id_subtema = req.params.id_subtema;

  Chat_subtemas.destroy({
    where: { id_subtema: id_subtema },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Subtema de chat eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el subtema de chat con id=${id_subtema}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el subtema de chat con id=${id_subtema}`,
      });
    });
};

// Eliminar todos los subtemas de chat de la base de datos
exports.deleteAll = (req, res) => {
  Chat_subtemas.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} subtemas de chat eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los subtemas de chat.',
      });
    });
};

// Consultar subtemas con un tema específico
exports.findByTema = (req, res) => {
  const id_tema = req.params.id_tema;

  Chat_subtemas.findAll({
    where: { id_tema: id_tema },
    include: [
      { model: db.chat_temas, as: 'chat_temas' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar los subtemas de chat con id_tema=${id_tema}`,
      });
    });
};
