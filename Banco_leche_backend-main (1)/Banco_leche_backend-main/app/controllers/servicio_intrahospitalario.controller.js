const db = require("../models");
const Servicio_in = db.servicio_in;  // Modelo de servicio_intrahospitalario
const Op = db.Sequelize.Op;

// Crea y guarda un nuevo Servicio_intrahospitalario
exports.create = (req, res) => {
  // Validate request
  if (!req.body.servicio) {
    res.status(400).send({
      message: "El campo 'servicio' es obligatorio."
    });
    return;
  }

  // Crea un servicio intrahospitalario
  const servicio_in = {
    servicio: req.body.servicio
  };

  // Guarda el servicio intrahospitalario en la base de datos
  Servicio_in.create(servicio_in)
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

  Servicio_in.findAll({ 
    where: condition,
    order: [['id_intrahospitalario', 'ASC']] // Ordena por id_intrahospitalario de manera ascendente
  })
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
  const id_intrahospitalario = req.params.id_intrahospitalario;

  Servicio_in.findByPk(id_intrahospitalario)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró el servicio intrahospitalario con id=${id_intrahospitalario}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Ocurrió un error al recuperar el servicio intrahospitalario con id=" + id_intrahospitalario
      });
    });
};

// Actualiza un Servicio_intrahospitalario por id_intrahospitalario en la solicitud
exports.update = (req, res) => {
  const id_intrahospitalario = req.params.id_intrahospitalario;

  Servicio_in.update(req.body, {
    where: { id_intrahospitalario: id_intrahospitalario }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El servicio intrahospitalario fue actualizado exitosamente."
        });
      } else {
        res.send({
          message: `No se pudo actualizar el servicio intrahospitalario con id=${id_intrahospitalario}. Tal vez no fue encontrado o el cuerpo de la solicitud está vacío.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Ocurrió un error al actualizar el servicio intrahospitalario con id=" + id_intrahospitalario
      });
    });
};

// Elimina un Servicio_intrahospitalario con el id especificado en la solicitud
exports.delete = (req, res) => {
  const id_intrahospitalario = req.params.id_intrahospitalario;

  Servicio_in.destroy({
    where: { id_intrahospitalario: id_intrahospitalario }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El servicio intrahospitalario fue eliminado exitosamente."
        });
      } else {
        res.send({
          message: `No se pudo eliminar el servicio intrahospitalario con id=${id_intrahospitalario}. Tal vez no fue encontrado.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar el servicio intrahospitalario con id=" + id_intrahospitalario
      });
    });
};

// Elimina todos los servicios intrahospitalarios de la base de datos
exports.deleteAll = (req, res) => {
  Servicio_in.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} servicios intrahospitalarios fueron eliminados exitosamente!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Ocurrió un error al eliminar todos los servicios intrahospitalarios."
      });
    });
};
