const db = require("../models");
const Carrito = db.carrito;
const Cliente = db.clientes;

// Crear y guardar un nuevo carrito
exports.create = (req, res) => {
  // Validar la solicitud
  if (!req.body.id_cliente) {
    res.status(400).send({
      message: "El campo id_cliente es obligatorio."
    });
    return;
  }

  // Crear un carrito
  const carrito = {
    id_cliente: req.body.id_cliente,
    fecha_creacion: req.body.fecha_creacion || null,
    estado: req.body.estado || 'abierto',
    departamento: req.body.departamento ,
    direccion: req.body.direccion,
    metodo_de_pago: req.body.metodo_de_pago,

  };

  // Guardar el carrito en la base de datos
  Carrito.create(carrito)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al crear el carrito."
      });
    });
};

// Recuperar todos los carritos de la base de datos.
exports.findAll = (req, res) => {
  Carrito.findAll({
    include: [{
      model: Cliente,
      as: 'clientes',
      attributes: ['id_cliente', 'nombre']
    }]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Ocurrió un error al recuperar los carritos."
      });
    });
};

// Recuperar un carrito por su ID
exports.findOne = (req, res) => {
  const id_carrito = req.params.id_carrito;

  Carrito.findByPk(id_carrito, {
    include: [{
      model: Cliente,
      as: 'clientes',
      attributes: ['id_cliente', 'nombre']
    }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `No se encontró el carrito con id_carrito=${id_carrito}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar el carrito con id_carrito=" + id_carrito
      });
    });
};

// Actualizar un carrito por su ID
exports.update = (req, res) => {
  const id_carrito = req.params.id_carrito;

  Carrito.update(req.body, {
    where: { id_carrito: id_carrito }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El carrito se actualizó correctamente."
        });
      } else {
        res.send({
          message: `No se puede actualizar el carrito con id_carrito=${id_carrito}. ¡Quizás el carrito no se encontró o el cuerpo de la solicitud está vacío!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar el carrito con id_carrito=" + id_carrito
      });
    });
};

// Eliminar un carrito por su ID
exports.delete = (req, res) => {
  const id_carrito = req.params.id_carrito;

  Carrito.destroy({
    where: { id_carrito: id_carrito }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "El carrito se eliminó correctamente."
        });
      } else {
        res.send({
          message: `No se puede eliminar el carrito con id_carrito=${id_carrito}. ¡Quizás el carrito no se encontró!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "No se pudo eliminar el carrito con id_carrito=" + id_carrito
      });
    });
};
