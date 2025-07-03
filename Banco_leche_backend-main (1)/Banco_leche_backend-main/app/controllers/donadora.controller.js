const db = require('../models');
const Donadora = db.donadoras;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en Donadora
exports.create = (req, res) => {
  const { nombre, apellido } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!nombre || !apellido) {
    res.status(400).send({
      message: 'Los campos nombre y apellido son obligatorios.',
    });
    return;
  }

  // Crear un registro en Donadora
  Donadora.create({
    nombre,
    apellido,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en Donadora.',
      });
    });
};

// Recuperar todos los registros de Donadora de la base de datos con paginación
// Recuperar todos los registros de Donadora de la base de datos con o sin paginación
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : 50; // Límite por defecto para evitar sobrecarga

  // Calcular el offset solo si la paginación está activa
  const offset = page && limit ? (page - 1) * limit : null;
  
  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Crear opciones de consulta optimizadas
  const queryOptions = {
    where: condition,
    attributes: ['id_donadora', 'nombre', 'apellido', 'createdAt', 'updatedAt'], // Especificar campos
    order: [['id_donadora', 'ASC']], // Ordenamiento por índice primario
    ...(limit ? { limit } : {}),
    ...(offset ? { offset } : {})
  };

  // Para consultas con paginación, obtener el conteo
  if (page && limit) {
    Donadora.count({ where: condition })
      .then(totalRecords => {
        return Donadora.findAll(queryOptions).then(data => {
          const totalPages = Math.ceil(totalRecords / limit);
          res.send({
            donadoras: data,
            totalRecords: totalRecords,
            currentPage: page,
            totalPages: totalPages
          });
        });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || 'Ocurrió un error al recuperar los registros de Donadora.'
        });
      });
  } else {
    // Para consultas sin paginación, solo obtener los datos
    Donadora.findAll(queryOptions)
      .then(data => {
        res.send({
          donadoras: data,
          totalRecords: data.length,
          currentPage: 1,
          totalPages: 1
        });
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || 'Ocurrió un error al recuperar los registros de Donadora.'
        });
      });
  }
};

// NUEVA FUNCIÓN: Búsqueda optimizada para grandes volúmenes (500,000+ registros)
exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    // Validar parámetros
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Máximo 100 por página
    const offset = (pageNum - 1) * limitNum;

    if (!q || q.trim().length < 2) {
      return res.status(400).send({
        message: 'El parámetro de búsqueda "q" debe tener al menos 2 caracteres.'
      });
    }

    const searchTerm = q.trim();
    
    // Preparar patrones de búsqueda
    const exactMatch = searchTerm.toLowerCase();
    const partialMatch = `%${searchTerm.toLowerCase()}%`;
    
    // Consulta SQL simplificada y corregida
    const searchQuery = `
      SELECT 
        id_donadora,
        nombre,
        apellido,
        (nombre || ' ' || apellido) as nombre_completo,
        CASE
          WHEN LOWER(nombre) = $1 OR LOWER(apellido) = $1 THEN 1
          WHEN LOWER(nombre || ' ' || apellido) = $1 THEN 1
          WHEN LOWER(nombre) LIKE $2 OR LOWER(apellido) LIKE $2 THEN 2
          WHEN LOWER(nombre || ' ' || apellido) LIKE $2 THEN 3
          ELSE 4
        END as relevance_score
      FROM donadoras 
      WHERE 
        LOWER(nombre) LIKE $2 OR 
        LOWER(apellido) LIKE $2 OR 
        LOWER(nombre || ' ' || apellido) LIKE $2
      ORDER BY relevance_score ASC, nombre ASC, apellido ASC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM donadoras 
      WHERE 
        LOWER(nombre) LIKE $1 OR 
        LOWER(apellido) LIKE $1 OR 
        LOWER(nombre || ' ' || apellido) LIKE $1
    `;

    console.log('Búsqueda ejecutada:', {
      searchTerm,
      exactMatch,
      partialMatch,
      pageNum,
      limitNum,
      offset
    });

    // Ejecutar consultas en paralelo
    const [results, countResult] = await Promise.all([
      db.sequelize.query(searchQuery, {
        bind: [exactMatch, partialMatch, limitNum, offset],
        type: db.Sequelize.QueryTypes.SELECT
      }),
      db.sequelize.query(countQuery, {
        bind: [partialMatch],
        type: db.Sequelize.QueryTypes.SELECT
      })
    ]);

    const totalRecords = parseInt(countResult[0].total);
    const totalPages = Math.ceil(totalRecords / limitNum);

    // Formatear resultados
    const formattedResults = results.map(row => ({
      id_donadora: row.id_donadora,
      nombre: row.nombre,
      apellido: row.apellido,
      nombre_completo: `${row.nombre} ${row.apellido}`
    }));

    console.log('Resultados encontrados:', formattedResults.length);

    res.send({
      donadoras: formattedResults,
      searchTerm: searchTerm,
      totalRecords: totalRecords,
      currentPage: pageNum,
      totalPages: totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });

  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).send({
      message: err.message || 'Error al realizar la búsqueda de donadoras.'
    });
  }
};

// Recuperar un registro de Donadora por su ID
exports.findOne = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.findByPk(id_donadora)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_donadora}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_donadora}`,
      });
    });
};

// Actualizar un registro de Donadora por su ID
exports.update = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.update(req.body, {
    where: { id_donadora: id_donadora },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Donadora actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de Donadora con id=${id_donadora}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de Donadora con id=${id_donadora}`,
      });
    });
};

// Eliminar un registro de Donadora por su ID
exports.delete = (req, res) => {
  const id_donadora = req.params.id_donadora;

  Donadora.destroy({
    where: { id_donadora: id_donadora },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Donadora eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de Donadora con id=${id_donadora}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de Donadora con id=${id_donadora}`,
      });
    });
};

// Eliminar todos los registros de Donadora de la base de datos
exports.deleteAll = (req, res) => {
  Donadora.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de Donadora eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de Donadora.',
      });
    });
};

