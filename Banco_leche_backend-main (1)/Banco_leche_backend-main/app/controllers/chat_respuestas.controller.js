const db = require('../models');
const Chat_respuestas = db.chat_respuestas;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar una nueva respuesta en el chat
exports.create = (req, res) => {
  const { id_subtema, pregunta, respuesta, enlace } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!id_subtema || !pregunta || !respuesta) {
    res.status(400).send({
      message: 'Todos los campos obligatorios deben ser completados.',
    });
    return;
  }

  // Crear un registro en chat_respuestas
  Chat_respuestas.create({
    id_subtema,
    pregunta,
    respuesta,
    enlace,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear la respuesta en el chat.',
      });
    });
};

// Recuperar todas las respuestas del chat de la base de datos
exports.findAll = (req, res) => {
  const pregunta = req.query.pregunta;
  const condition = pregunta ? { pregunta: { [Op.iLike]: `%${pregunta}%` } } : null;

  Chat_respuestas.findAll({
    where: condition,
    include: [
      { model: db.chat_subtemas, as: 'chat_subtemas' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar las respuestas del chat.',
      });
    });
};

// Recuperar una respuesta del chat por su ID
exports.findOne = (req, res) => {
  const id_chat = req.params.id_chat;

  Chat_respuestas.findByPk(id_chat, {
    include: [
      { model: db.chat_subtemas, as: 'chat_subtemas' },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró la respuesta con id=${id_chat}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar la respuesta con id=${id_chat}.`,
      });
    });
};

// Actualizar una respuesta del chat por su ID
exports.update = (req, res) => {
  const id_chat = req.params.id_chat;

  Chat_respuestas.update(req.body, {
    where: { id_chat: id_chat },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Respuesta actualizada con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar la respuesta con id=${id_chat}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar la respuesta con id=${id_chat}.`,
      });
    });
};

// Consultar respuestas por id_subtema
exports.findBySubtemaId = (req, res) => {
  const id_subtema = req.params.id_subtema;

  Chat_respuestas.findAll({
    where: { id_subtema: id_subtema },
    attributes: ['id_chat', 'pregunta']  // Selecciona solo id_chat, pregunta y respuesta
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(404).send({
          message: `No se encontraron respuestas con id_subtema=${id_subtema}.`
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar las respuestas con id_subtema=${id_subtema}.`
      });
    });
};

// Consultar respuestas por id_subtema
exports.findBySubtemaIdchat= (req, res) => {
  const id_chat = req.params.id_chat;

  Chat_respuestas.findAll({
    where: { id_chat: id_chat },
    attributes: ['id_chat', 'respuesta','enlace']  // Selecciona solo id_chat y respuesta
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(404).send({
          message: `No se encontraron respuestas con id_subtema=${id_chat}.`
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar las respuestas con id_subtema=${id_chat}.`
      });
    });
};


// Eliminar una respuesta del chat por su ID
exports.delete = (req, res) => {
  const id_chat = req.params.id_chat;

  Chat_respuestas.destroy({
    where: { id_chat: id_chat },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Respuesta eliminada con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar la respuesta con id=${id_chat}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar la respuesta con id=${id_chat}.`,
      });
    });
};

// Eliminar todas las respuestas del chat de la base de datos
exports.deleteAll = (req, res) => {
  Chat_respuestas.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} respuestas eliminadas con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar las respuestas del chat.',
      });
    });
};

