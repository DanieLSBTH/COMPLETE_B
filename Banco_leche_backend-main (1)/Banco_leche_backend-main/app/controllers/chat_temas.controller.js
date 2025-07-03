const db = require("../models");
const Chat_temas = db.chat_temas;
const Op = db.Sequelize.Op;

// Crear y Guardar un Nuevo Tema de Chat
exports.create = (req, res) => {
  if (!req.body.tema) {
    res.status(400).send({
      message: "El campo 'tema' es obligatorio!"
    });
    return;
  }

  const chatTema = {
    tema: req.body.tema
  };

  Chat_temas.create(chatTema)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear el tema de chat."
      });
    });
};

// Recuperar todos los Temas de Chat de la base de datos.
exports.findAll = (req, res) => {
  const tema = req.query.tema;
  var condition = tema ? { tema: { [Op.iLike]: `%${tema}%` } } : null;

  Chat_temas.findAll({
    where: condition,
    order: [['id_tema', 'ASC']] // Añadimos esta línea para ordenar por id_tema
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al recuperar los temas de chat."
      });
    });
};
// Recuperar un Tema de Chat por su ID
exports.findOne = (req, res) => {
  const id_tema = req.params.id_tema;

  Chat_temas.findByPk(id_tema)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró el tema de chat con id_tema=${id_tema}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar el tema de chat con id_tema=" + id_tema
      });
    });
};

// Actualizar un Tema de Chat por su ID
exports.update = (req, res) => {
  const id_tema = req.params.id_tema;

  Chat_temas.update(req.body, {
    where: { id_tema: id_tema }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El tema de chat fue actualizado con éxito."
        });
      } else {
        res.send({
          message: `No se puede actualizar el tema de chat con id_tema=${id_tema}. Tal vez no se encontró el tema o el cuerpo de la solicitud está vacío!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el tema de chat con id_tema=" + id_tema
      });
    });
};

// Eliminar un Tema de Chat por su ID
exports.delete = (req, res) => {
  const id_tema = req.params.id_tema;

  Chat_temas.destroy({
    where: { id_tema: id_tema }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El tema de chat fue eliminado con éxito!"
        });
      } else {
        res.send({
          message: `No se puede eliminar el tema de chat con id_tema=${id_tema}. Tal vez no se encontró el tema!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar el tema de chat con id_tema=" + id_tema
      });
    });
};

// Recuperar todos los ID y Temas de Chat de la base de datos.
exports.findAllIdsAndThemes = (req, res) => {
  const tema = req.query.tema;
  var condition = tema ? { tema: { [Op.iLike]: `%${tema}%` } } : null;

  Chat_temas.findAll({
    where: condition,
    attributes: ['id_tema', 'tema'],  // Selecciona solo las columnas id_tema y tema
    order: [['id_tema', 'ASC']] 
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al recuperar los temas de chat."
      });
    });
};


// Eliminar todos los Temas de Chat de la base de datos.
exports.deleteAll = (req, res) => {
  Chat_temas.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} temas de chat fueron eliminados con éxito!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al eliminar todos los temas de chat."
      });
    });
};
