const db = require('../models');
const Personal_estimulacion = db.personal_estimulaciones;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

// Crear y guardar un nuevo registro en Personal_estimulacion
exports.create = (req, res) => {
  const { nombre, apellido } = req.body;

  // Verificar que todos los campos requeridos estén presentes
  if (!nombre || !apellido) {
    res.status(400).send({
      message: 'Los campos nombre y apellido son obligatorios.',
    });
    return;
  }

  // Crear un registro en Personal_estimulacion
  Personal_estimulacion.create({
    nombre,
    apellido,
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || 'Error al crear el registro en estimulacion.',
      });
    });
};

// Recuperar todos los registros de Personal_estimulacion de la base de datos con o sin paginación
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const page = req.query.page ? parseInt(req.query.page) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  // Calcular el offset solo si la paginación está activa
  const offset = page && limit ? (page - 1) * limit : null;
  
  let condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

  // Contar el total de registros
  Personal_estimulacion.count({ where: condition })
    .then(totalRecords => {
      // Si no hay paginación, obtener todos los registros
      const queryOptions = {
        where: condition,
        order: [['createdAt', 'DESC']], // o ['id_personal', 'DESC']
        ...(limit ? { limit } : {}),  // Solo se aplica el límite si está presente
        ...(offset ? { offset } : {}) // Solo se aplica el offset si está presente
      };

      return Personal_estimulacion.findAll(queryOptions).then(data => {
        const totalPages = limit ? Math.ceil(totalRecords / limit) : 1;
        res.send({
          personal_estimulaciones: data,
          totalRecords: totalRecords,
          currentPage: page || 1,
          totalPages: totalPages
        });
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de estimulacion.'
      });
    });
};

// Búsqueda avanzada con múltiples registros
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
    
    // Consulta SQL optimizada para personal_estimulaciones
    const searchQuery = `
      SELECT 
        id_personal_estimulacion,
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
      FROM personal_estimulaciones 
      WHERE 
        LOWER(nombre) LIKE $2 OR 
        LOWER(apellido) LIKE $2 OR 
        LOWER(nombre || ' ' || apellido) LIKE $2
      ORDER BY relevance_score ASC, nombre ASC, apellido ASC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM personal_estimulaciones 
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

    // Formatear resultados manteniendo la estructura del frontend
    const formattedResults = results.map(row => ({
      id_personal_estimulacion: row.id_personal_estimulacion,
      nombre: row.nombre,
      apellido: row.apellido,
      nombre_completo: `${row.nombre} ${row.apellido}`
    }));

    console.log('Resultados encontrados:', formattedResults.length);

    res.send({
      personal_estimulaciones: formattedResults,
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
      message: err.message || 'Error al realizar la búsqueda de personal de estimulación.'
    });
  }
};

// Recuperar un registro de Personal_estimulacion por su ID
exports.findOne = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.findByPk(id_personal_estimulacion)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_personal_estimulacion}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_personal_estimulacion}`,
      });
    });
};

// Actualizar un registro de Personal_estimulacion por su ID
exports.update = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.update(req.body, {
    where: { id_personal_estimulacion: id_personal_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de estimulacion actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de estimulacion con id=${id_personal_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de estimulacion con id=${id_personal_estimulacion}`,
      });
    });
};

// Eliminar un registro de Personal_estimulacion por su ID
exports.delete = (req, res) => {
  const id_personal_estimulacion = req.params.id_personal_estimulacion;

  Personal_estimulacion.destroy({
    where: { id_personal_estimulacion: id_personal_estimulacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de Personal de Estimulación eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de estimulacion con id=${id_personal_estimulacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de estimulacion con id=${id_personal_estimulacion}`,
      });
    });
};

// Eliminar todos los registros de Personal_estimulacion de la base de datos
exports.deleteAll = (req, res) => {
  Personal_estimulacion.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de estimulacion eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de estimulacion.',
      });
    });
};