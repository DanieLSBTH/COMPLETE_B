const db = require("../models");
const Personal = db.personal;  // el personal de models
const Op = db.Sequelize.Op;

// Crea y guarda un nuevo Personal
exports.create = (req, res) => {
  // Validate request
  if (!req.body.nombre || !req.body.apellido || !req.body.puesto) {
    res.status(400).send({
      message: "All fields are required!"
    });
    return;
  }

  // Crea un personal
  const personal = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    puesto: req.body.puesto
  };

  // Guarda el personal en la database
  Personal.create(personal)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Personal."
      });
    });
};

// Recupera todo el personal de la lista.
// Recupera todo el personal con paginación.
exports.findAll = (req, res) => {
  const { page = 1, pageSize = 10 } = req.query; // Obtiene la página actual y el tamaño de la página desde los query params
  const nombre = req.query.nombre;
  const offset = (page - 1) * pageSize; // Calcula el desplazamiento
  const limit = parseInt(pageSize, 10); // Limita la cantidad de registros por página

  var condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Usar findAndCountAll para obtener los datos paginados y el total de registros
  Personal.findAndCountAll({
    where: condition,
    limit: limit,  // Límite por página
    offset: offset // Desplazamiento según la página actual
  })
    .then(result => {
      res.send({
        personal: result.rows,        // Registros actuales
        totalRecords: result.count,   // Número total de registros
        currentPage: parseInt(page, 10),  // Página actual
        totalPages: Math.ceil(result.count / limit) // Total de páginas
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving personal."
      });
    });
};

// 
exports.findOne = (req, res) => {
  const id_personal = req.params.id_personal;

  Personal.findByPk(id_personal)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Personal with id_personal=" + id_personal
      });
    });
};

// Update a Personal by the id_personal in the request
exports.update = (req, res) => {
  const id_personal = req.params.id_personal;

  Personal.update(req.body, {
    where: { id_personal: id_personal }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Personal was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Personal with id_personal=${id_personal}. Maybe Personal was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Personal with id_personal=" + id_personal
      });
    });
};

// Delete a Personal with the specified id_personal in the request
exports.delete = (req, res) => {
  const id_personal = req.params.id_personal;

  Personal.destroy({
    where: { id_personal: id_personal }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Personal was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Personal with id_personal=${id_personal}. Maybe Personal was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Personal with id_personal=" + id_personal
      });
    });
};

// Delete all Personal from the database.
exports.deleteAll = (req, res) => {
  Personal.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Personal were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all personal."
      });
    });
};
