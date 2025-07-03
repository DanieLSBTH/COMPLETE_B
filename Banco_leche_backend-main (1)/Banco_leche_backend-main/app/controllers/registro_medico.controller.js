const db = require('../models');
const RegistroMedico = db.registro_medicos;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro médico
exports.create = (req, res) => {
  const { registro_medico, recien_nacido } = req.body;

  if (!registro_medico || !recien_nacido) {
    return res.status(400).send({
      message: 'Los campos registro_medico y recien_nacido son obligatorios.',
    });
  }

  RegistroMedico.create({ registro_medico, recien_nacido })
    .then(data => res.send(data))
    .catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({
          message: 'Ya existe un registro con el mismo registro_medico o recien_nacido.',
        });
      } else {
        res.status(500).send({
          message: err.message || 'Error al crear el registro médico.',
        });
      }
    });
};

// Búsqueda específica por registro médico
// CONTROLLER OPTIMIZADO
exports.searchByRegistro = (req, res) => {
  const registro = req.params.registro;
  
  if (!registro || registro.trim().length < 2) {
    return res.status(400).send({ 
      message: 'El parámetro registro debe tener al menos 2 caracteres.' 
    });
  }

  // Límites más restrictivos para búsquedas
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 50) : 20;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const offset = (page - 1) * limit;

  // Tipo de búsqueda optimizada
  const searchType = req.query.type || 'partial';
  
  let condition;
  if (searchType === 'exact') {
    condition = { registro_medico: registro.trim() };
  } else {
    // Optimización: buscar solo al inicio o términos completos
    const searchTerm = registro.trim();
    condition = {
      [Op.or]: [
        { registro_medico: { [Op.iLike]: `${searchTerm}%` } }, // Empieza con
        { recien_nacido: { [Op.iLike]: `${searchTerm}%` } }    // Empieza con
      ]
    };
  }

  const queryOptions = {
    where: condition,
    // IMPORTANTE: Solo seleccionar campos necesarios
    attributes: ['id_registro_medico', 'registro_medico', 'recien_nacido'],
    limit,
    offset,
    order: [['registro_medico', 'ASC']],
    raw: true,
    timeout: 10000 // Reducir timeout
  };

  // Solo contar si es necesario (primera página)
  const shouldCount = page === 1;

  if (shouldCount) {
    Promise.all([
      RegistroMedico.count({ 
        where: condition, 
        timeout: 10000 
      }),
      RegistroMedico.findAll(queryOptions)
    ])
    .then(([totalRecords, data]) => {
      const totalPages = Math.ceil(totalRecords / limit);
      res.send({
        searchTerm: registro,
        searchType: searchType,
        registros: data,
        pagination: {
          totalRecords,
          currentPage: page,
          totalPages,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: false,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: null
        }
      });
    })
    .catch(handleError);
  } else {
    // Para páginas siguientes, no contar (más rápido)
    RegistroMedico.findAll(queryOptions)
    .then(data => {
      res.send({
        searchTerm: registro,
        searchType: searchType,
        registros: data,
        pagination: {
          currentPage: page,
          limit,
          hasNextPage: data.length === limit,
          hasPrevPage: page > 1,
          nextPage: data.length === limit ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      });
    })
    .catch(handleError);
  }

  function handleError(err) {
    console.error('Error en searchByRegistro:', err);
    res.status(500).send({
      message: err.message || 'Error al buscar por registro médico.',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
};

// NUEVA FUNCIÓN: Búsqueda rápida solo para selects
exports.quickSearchForSelect = (req, res) => {
  const registro = req.params.registro;
  
  if (!registro || registro.trim().length < 2) {
    return res.send({ registros: [] });
  }

  const searchTerm = registro.trim();
  
  const queryOptions = {
    where: {
      [Op.or]: [
        { registro_medico: { [Op.iLike]: `${searchTerm}%` } },
        { recien_nacido: { [Op.iLike]: `${searchTerm}%` } }
      ]
    },
    // Solo los campos necesarios para el select
    attributes: ['id_registro_medico', 'registro_medico', 'recien_nacido'],
    limit: 20, // Límite bajo para select
    order: [['registro_medico', 'ASC']],
    raw: true,
    timeout: 5000
  };

  RegistroMedico.findAll(queryOptions)
    .then(data => {
      res.send({ registros: data });
    })
    .catch(err => {
      console.error('Error en quickSearchForSelect:', err);
      res.status(500).send({ 
        registros: [],
        message: 'Error en búsqueda rápida' 
      });
    });
};


// Obtener todos los registros (opcionalmente con búsqueda por nombre)
exports.findAll = (req, res) => {
  const busqueda = req.query.registro_medico;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  const offset = page && limit ? (page - 1) * limit : null;

  const condition = busqueda ? { registro_medico: { [Op.iLike]: `%${busqueda}%` } } : null;

  RegistroMedico.count({ where: condition })
    .then(totalRecords => {
      const queryOptions = {
        where: condition,
        order: [['id_registro_medico', 'DESC']], // Agregado para orden descendente
        ...(limit ? { limit } : {}),
        ...(offset ? { offset } : {})
      };

      RegistroMedico.findAll(queryOptions)
        .then(data => {
          const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;
          res.send({
            registros: data,
            totalRecords,
            currentPage: page || 1,
            totalPages
          });
        });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros médicos.'
      });
    });
};

// Obtener un solo registro por ID
exports.findOne = (req, res) => {
  const id = req.params.id_registro_medico;

  RegistroMedico.findByPk(id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: `No se encontró el registro con id=${id}.` });
    })
    .catch(err => {
      res.status(500).send({ message: `Error al recuperar el registro con id=${id}` });
    });
};

// Actualizar un registro por ID
exports.update = (req, res) => {
  const id = req.params.id_registro_medico;

  RegistroMedico.update(req.body, {
    where: { id_registro_medico: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({ message: 'Registro actualizado correctamente.' });
      } else {
        res.send({ message: `No se pudo actualizar el registro con id=${id}.` });
      }
    })
    .catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).send({
          message: 'Ya existe un registro con el mismo registro_medico o recien_nacido.',
        });
      } else {
        res.status(500).send({
          message: `Error al actualizar el registro con id=${id}`
        });
      }
    });
};

// Eliminar un registro por ID
exports.delete = (req, res) => {
  const id = req.params.id_registro_medico;

  RegistroMedico.destroy({
    where: { id_registro_medico: id}
  })
    .then(num => {
      if (num == 1) {
        res.send({ message: 'Registro eliminado correctamente.' });
      } else {
        res.send({ message: `No se pudo eliminar el registro con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Error al eliminar el registro con id=${id}`
      });
    });
};

// Eliminar todos los registros
exports.deleteAll = (req, res) => {
  RegistroMedico.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} registros eliminados correctamente.` });
    })
    .catch(err => {
      res.status(500).send({
        message: 'Error al eliminar todos los registros médicos.'
      });
    });
};
