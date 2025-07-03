const db = require("../models");
const Servicio_ex = db.servicio_ex;  // Modelo de servicio_extrahospitalario
const Op = db.Sequelize.Op;

// Crea y guarda un nuevo Servicio_extrahospitalario
exports.create = (req, res) => {
  // Validate request
  if (!req.body.servicio) {
    res.status(400).send({
      message: "El campo 'servicio' es obligatorio."
    });
    return;
  }

  // Crea un servicio intrahospitalario
  const servicio_ex = {
    servicio: req.body.servicio
  };

  // Guarda el servicio extrahospitalario en la base de datos
  Servicio_ex.create(servicio_ex)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Ocurrió un error al crear el servicio intrahospitalario."
      });
    });
};

// Recupera todos los servicios intrahospitalarios de la base de datos
exports.findAll = (req, res) => {
  const servicio = req.query.servicio;
  var condition = servicio ? { servicio: { [Op.iLike]: `%${servicio}%` } } : null;

  Servicio_ex.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Ocurrió un error al recuperar los servicios intrahospitalarios."
      });
    });
};

// Recupera un solo Servicio_intrahospitalario con id_intrahospitalario
exports.findOne = (req, res) => {
  const id_extrahospitalario = req.params.id_extrahospitalario;

  Servicio_ex.findByPk(id_extrahospitalario)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró el servicio extrahospitalario con id=${id_extrahospitalario}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Ocurrió un error al recuperar el servicio extrahospitalario con id=" + id_extrahospitalario
      });
    });
};

// Actualiza un Servicio_intrahospitalario por id_intrahospitalario en la solicitud
exports.update = (req, res) => {
  const id_extrahospitalario = req.params.id_extrahospitalario;

  Servicio_ex.update(req.body, {
    where: { id_extrahospitalario: id_extrahospitalario }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El servicio extrahospitalario fue actualizado exitosamente."
        });
      } else {
        res.send({
          message: `No se pudo actualizar el servicio extrahospitalario con id=${id_extrahospitalario}. Tal vez no fue encontrado o el cuerpo de la solicitud está vacío.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Ocurrió un error al actualizar el servicio extrahospitalario con id=" + id_extrahospitalario
      });
    });
};

// Elimina un Servicio_intrahospitalario con el id especificado en la solicitud
exports.delete = (req, res) => {
  const id_extrahospitalario = req.params.id_extrahospitalario;

  Servicio_ex.destroy({
    where: { id_extrahospitalario: id_extrahospitalario }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El servicio extrahospitalario fue eliminado exitosamente."
        });
      } else {
        res.send({
          message: `No se pudo eliminar el servicio extrahospitalario con id=${id_extrahospitalario}. Tal vez no fue encontrado.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar el servicio intrahospitalario con id=" + id_extrahospitalario
      });
    });
};

// Elimina todos los servicios intrahospitalarios de la base de datos
exports.deleteAll = (req, res) => {
  Servicio_ex.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} servicios extrahospitalarios fueron eliminados exitosamente!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Ocurrió un error al eliminar todos los servicios extrahospitalarios."
      });
    });
};
