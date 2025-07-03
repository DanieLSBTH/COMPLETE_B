const db = require('../models');
const CarritoDetalle = db.carrito_detalle;
const Producto = db.producto;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en carrito_detalle
exports.create = (req, res) => {
  const id_carrito = req.body.id_carrito;
  const id_producto = req.body.id_producto;
  const cantidad = req.body.cantidad;

  // Verificar si hay suficiente stock
  Producto.findByPk(id_producto)
    .then((producto) => {
      if (!producto) {
        res.status(400).send({
          message: 'Producto no encontrado.',
        });
      } else if (producto.stock < cantidad) {
        res.status(400).send({
          message: 'No hay suficiente stock para este producto.',
        });
      } else {
        // Crear un registro en carrito_detalle
        return CarritoDetalle.create({
          id_carrito: id_carrito,
          id_producto: id_producto,
          cantidad: cantidad,
          precio_unitario: producto.precio_venta,
        })
        
        .then((CarritoDetalle) => {
          // Actualizar el stock del producto
          return Producto.update(
            { stock: Sequelize.literal(`stock - ${cantidad}`) },
            { where: { id_producto: id_producto } }
          )
          .then(() => {
            res.send(CarritoDetalle);
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || 'Error al actualizar el stock del producto.',
            });
          });
        })
        .catch((err) => {
          res.status(500).send({
            message: err.message || 'Error al crear el registro en factura_detalle.',
          });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al verificar el stock del producto.',
      });
    });
};

// Recuperar todos los registros de carrito_detalle de la base de datos.
exports.findAll = (req, res) => {
  CarritoDetalle.findAll({
    include: [
      { model: db.carrito, as: 'carritos' },
      { model: db.producto, as: 'productos' },
    ],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de carrito_detalle.',
      });
    });
};

// Recuperar un registro de carrito_detalle por su ID
exports.findOne = (req, res) => {
  const id_carrito_detalle = req.params.id_carrito_detalle;

  CarritoDetalle.findByPk(id_carrito_detalle)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_carrito_detalle}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_carrito_detalle}`,
      });
    });
};

// Actualizar un registro de carrito_detalle por su ID
exports.update = (req, res) => {
  const id_carrito_detalle = req.params.id_carrito_detalle;

  CarritoDetalle.update(req.body, {
    where: { id_carrito_detalle: id_carrito_detalle },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de carrito_detalle actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de carrito_detalle con id=${id_carrito_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de carrito_detalle con id=${id_carrito_detalle}`,
      });
    });
};

// Eliminar un registro de carrito_detalle por su ID
exports.delete = (req, res) => {
  const id_carrito_detalle = req.params.id_carrito_detalle;

  CarritoDetalle.destroy({
    where: { id_carrito_detalle: id_carrito_detalle },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de carrito_detalle eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de carrito_detalle con id=${id_carrito_detalle}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de carrito_detalle con id=${id_carrito_detalle}`,
      });
    });
};

// Eliminar todos los registros de carrito_detalle de la base de datos.
exports.deleteAll = (req, res) => {
  CarritoDetalle.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de carrito_detalle eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de carrito_detalle.',
      });
    });
};
