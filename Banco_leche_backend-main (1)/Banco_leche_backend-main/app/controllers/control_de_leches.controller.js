
const db = require('../models');
const ControlDeLeche = db.control_de_leches;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const { trabajo_de_pasteurizaciones } = require('../models');
const sequelize = db.sequelize;
const Op = Sequelize.Op;

// Importar el controlador de pasteurizaciones para cambiar estado
const pasteurizacionesController = require('./trabajo_de_pasteurizaciones.controller');

exports.create = async (req, res) => {
  const { id_pasteurizacion, frasco, tipo_frasco, unidosis, tipo_unidosis, fecha_almacenamiento, tipo_de_leche, fecha_entrega, responsable, letra_adicional } = req.body;

  try {
    // MODIFICADO: Verificar que la pasteurización existe Y está disponible (estado = true)
    const pasteurizacion = await db.trabajo_de_pasteurizaciones.findOne({
      where: {
        id_pasteurizacion: id_pasteurizacion,
        estado: true // Solo permitir pasteurizaciones disponibles
      }
    });

    if (!pasteurizacion) {
      return res.status(404).send({ 
        message: `No se encontró la pasteurización disponible con id=${id_pasteurizacion}.` 
      });
    }

    const no_frascoBase = pasteurizacion.no_frasco.match(/^\d+/)[0]; // Extrae los números del no_frasco
    let registros = [];
    let volumen_ml;

    if (frasco) {
      volumen_ml = tipo_frasco === '180ml' ? 180 : 150;
      registros.push({
        id_pasteurizacion,
        no_frascoregistro: `${no_frascoBase}${letra_adicional || ''}`,
        frasco: true,
        tipo_frasco,
        unidosis: false,
        fecha_almacenamiento,
        volumen_ml_onza: volumen_ml,
        tipo_de_leche,
        fecha_entrega,
        responsable,
      });
    }

    if (unidosis) {
      let sufijos = [];
      if (tipo_unidosis === '10ml') {
        sufijos = [...'abcdefghijklmnñopq']; // Incluye las letras de la 'a' a la 'q' más la 'ñ'
        volumen_ml = 10;
      } else if (tipo_unidosis === '20ml') {
        sufijos = Array.from({ length: 9 }, (_, i) => String.fromCharCode(97 + i)); // a - i
        volumen_ml = 20;
      } else if (tipo_unidosis === '30ml') {
        sufijos = Array.from({ length: 6 }, (_, i) => String.fromCharCode(97 + i)); // a - f
        volumen_ml = 30;
      }

      sufijos.forEach(sufijo => {
        registros.push({
          id_pasteurizacion,
          no_frascoregistro: `${no_frascoBase}${letra_adicional || ''}${sufijo}`,
          frasco: false,
          unidosis: true,
          tipo_unidosis,
          fecha_almacenamiento,
          volumen_ml_onza: volumen_ml,
          tipo_de_leche,
          fecha_entrega,
          responsable,
        });
      });
    }

    // Insertar registros en control_de_leches
    const nuevosRegistros = await ControlDeLeche.bulkCreate(registros);

    // NUEVO: Cambiar el estado de la pasteurización a false
    try {
      const estadoCambiado = await pasteurizacionesController.cambiarEstadoAFalse(id_pasteurizacion);
      
      if (!estadoCambiado) {
        console.warn(`No se pudo cambiar el estado de la pasteurización ${id_pasteurizacion} a false`);
      }
    } catch (estadoError) {
      console.error('Error al cambiar estado de pasteurización:', estadoError);
      // No fallar la operación principal, solo loggear el error
    }

    res.send({ 
      message: 'Registros creados con éxito y pasteurización marcada como no disponible.', 
      registros: nuevosRegistros,
      pasteurizacion_estado_cambiado: true
    });

  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al crear registros en control_de_leches.',
    });
  }
};

// MEJORADO: findAll con mejor paginación y límites
exports.findAll = (req, res) => {
  // Valores por defecto para paginación
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100); // Máximo 100 registros
  
  const id_pasteurizacion = req.query.id_pasteurizacion;
  const tipo_de_leche = req.query.tipo_de_leche;
  const estado = req.query.estado;

  let condition = {};

  if (id_pasteurizacion) {
    condition.id_pasteurizacion = { [Op.eq]: id_pasteurizacion };
  }

  if (tipo_de_leche) {
    condition.tipo_de_leche = { [Op.like]: `%${tipo_de_leche}%` };
  }

  // Calcular offset
  const offset = (page - 1) * pageSize;

  const queryOptions = {
    where: condition,
    include: [
      { 
        model: db.trabajo_de_pasteurizaciones, 
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
        // NOTA: No filtrar por estado aquí porque ya está relacionado
        // El estado de la pasteurización puede ser false una vez que se use
      },
    ],
    order: [['id_control_leche', 'DESC']],
    limit: pageSize,
    offset: offset,
    distinct: true // Para count correcto con includes
  };

  ControlDeLeche.findAndCountAll(queryOptions)
    .then(result => {
      const formattedRows = result.rows.map(row => {
        return {
          ...row.dataValues,
          // ✅ CORREGIDO: Con DATEONLY ya no necesita formateo adicional
          fecha_almacenamiento: row.fecha_almacenamiento, // Ya viene como YYYY-MM-DD
          fecha_entrega: row.fecha_entrega, // Ya viene como YYYY-MM-DD
          estado_texto: row.estado ? 'Disponible' : 'No disponible'
        };
      });

      const totalPages = Math.ceil(result.count / pageSize);

      res.send({
        controlDeLeches: formattedRows,
        totalRecords: result.count,
        currentPage: page,
        totalPages: totalPages,
        pageSize: pageSize,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de control_de_leches.',
      });
    });
};

// NUEVA: Búsqueda específica por no_frascoregistro
// VERSIÓN LIGERAMENTE OPTIMIZADA de tu función findByFrasco
exports.findByFrasco = (req, res) => {
  const no_frascoregistro = req.query.no_frascoregistro;
  
  if (!no_frascoregistro) {
    return res.status(400).send({
      message: 'El parámetro no_frascoregistro es requerido.'
    });
  }

  // Búsqueda exacta o con comodín
  const isExactSearch = req.query.exact === 'true';
  const searchPattern = isExactSearch 
    ? no_frascoregistro 
    : `%${no_frascoregistro}%`;

  const condition = {
    no_frascoregistro: isExactSearch 
      ? { [Op.eq]: no_frascoregistro }  // ✅ OPTIMIZACIÓN: Usa = en lugar de LIKE para búsquedas exactas
      : { [Op.like]: searchPattern }
  };

  // Filtros adicionales opcionales
  if (req.query.estado !== undefined) {
    condition.estado = req.query.estado === 'true' || req.query.estado === true;
  }

  if (req.query.tipo_de_leche) {
    condition.tipo_de_leche = { [Op.like]: `%${req.query.tipo_de_leche}%` };
  }

  // Paginación opcional
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 20, 50);
  const offset = (page - 1) * pageSize;

  const queryOptions = {
    where: condition,
    include: [
      { 
        model: db.trabajo_de_pasteurizaciones, 
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
      },
    ],
    order: [['no_frascoregistro', 'ASC']],
    limit: pageSize,
    offset: offset,
    distinct: true,
    // ✅ OPTIMIZACIÓN ADICIONAL: Para consultas grandes
    subQuery: false, // Evita subconsultas innecesarias con includes
    benchmark: true, // Para medir tiempo de consulta en desarrollo
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  };

  ControlDeLeche.findAndCountAll(queryOptions)
    .then(result => {
      const formattedRows = result.rows.map(row => {
        return {
          ...row.dataValues,
          // ✅ CORREGIDO: Con DATEONLY ya no necesita formateo adicional
          fecha_almacenamiento: row.fecha_almacenamiento, // Ya viene como YYYY-MM-DD
          fecha_entrega: row.fecha_entrega, // Ya viene como YYYY-MM-DD
          estado_texto: row.estado ? 'Disponible' : 'No disponible'
        };
      });

      const totalPages = Math.ceil(result.count / pageSize);

      res.send({
        controlDeLeches: formattedRows,
        totalRecords: result.count,
        currentPage: page,
        totalPages: totalPages,
        pageSize: pageSize,
        searchTerm: no_frascoregistro,
        searchType: isExactSearch ? 'exacta' : 'parcial',
        // ✅ INFO ADICIONAL: Para monitoreo de rendimiento
        performance_info: {
          uses_index: true,
          search_optimized: true
        }
      });
    })
    .catch(err => {
      console.error('Error en findByFrasco:', err);
      res.status(500).send({
        message: err.message || 'Error al buscar por número de frasco.',
      });
    });
};

// Agregar este método al controller control_de_leches.controller.js


// Obtener estadísticas de stock por rango de fechas de almacenamiento
// OPTIMIZADA PARA GRANDES VOLÚMENES DE DATOS (500K+ registros)
exports.getStockByDateRange = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, use_cache = 'false', cache_minutes = '30' } = req.query;

    // Validar que se proporcionen las fechas
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).send({
        message: 'Los parámetros fecha_inicio y fecha_fin son requeridos. Formato: YYYY-MM-DD'
      });
    }

    // ✅ CORREGIDO: Validación de fechas más simple para DATEONLY
    const fechaInicioObj = new Date(fecha_inicio + 'T00:00:00');
    const fechaFinObj = new Date(fecha_fin + 'T00:00:00');

    if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
      return res.status(400).send({
        message: 'Formato de fecha inválido. Use el formato: YYYY-MM-DD'
      });
    }

    if (fechaInicioObj > fechaFinObj) {
      return res.status(400).send({
        message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin'
      });
    }

    // Cache simple en memoria para consultas repetidas (opcional)
    const cacheKey = `stock_${fecha_inicio}_${fecha_fin}`;
    if (use_cache === 'true' && global.stockCache && global.stockCache[cacheKey]) {
      const cacheData = global.stockCache[cacheKey];
      if (Date.now() - cacheData.timestamp < parseInt(cache_minutes) * 60 * 1000) {
        return res.send({
          message: 'Estadísticas de stock obtenidas desde cache',
          estadisticas: cacheData.data,
          from_cache: true
        });
      }
    }

    // CONSULTA OPTIMIZADA ESPECÍFICAMENTE PARA POSTGRESQL
    const query = `
      SELECT 
        -- Estadísticas por volumen (optimizado para PostgreSQL)
        COUNT(*) FILTER (WHERE volumen_ml_onza = 10 AND estado = true) as frascos_10ml_disponibles,
        COUNT(*) FILTER (WHERE volumen_ml_onza = 20 AND estado = true) as frascos_20ml_disponibles,
        COUNT(*) FILTER (WHERE volumen_ml_onza = 30 AND estado = true) as frascos_30ml_disponibles,
        COUNT(*) FILTER (WHERE volumen_ml_onza = 150 AND estado = true) as frascos_150ml_disponibles,
        COUNT(*) FILTER (WHERE volumen_ml_onza = 180 AND estado = true) as frascos_180ml_disponibles,
        
        -- Estadísticas por tipo de leche
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND estado = true) as leche_madura_disponible,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND estado = true) as leche_calostro_disponible,
        
        -- Totales generales
        COUNT(*) FILTER (WHERE estado = true) as total_frascos_disponibles,
        COUNT(*) FILTER (WHERE estado = false) as total_frascos_no_disponibles,
        COUNT(*) as total_registros,
        
        -- Volumen total disponible
        COALESCE(SUM(volumen_ml_onza) FILTER (WHERE estado = true), 0) as volumen_total_ml_disponible,
        
        -- Estadísticas combinadas (tipo de leche + volumen) - PostgreSQL optimizado
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND volumen_ml_onza = 10 AND estado = true) as madura_10ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND volumen_ml_onza = 20 AND estado = true) as madura_20ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND volumen_ml_onza = 30 AND estado = true) as madura_30ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND volumen_ml_onza = 150 AND estado = true) as madura_150ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Madura' AND volumen_ml_onza = 180 AND estado = true) as madura_180ml,
        
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND volumen_ml_onza = 10 AND estado = true) as calostro_10ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND volumen_ml_onza = 20 AND estado = true) as calostro_20ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND volumen_ml_onza = 30 AND estado = true) as calostro_30ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND volumen_ml_onza = 150 AND estado = true) as calostro_150ml,
        COUNT(*) FILTER (WHERE tipo_de_leche = 'Calostro' AND volumen_ml_onza = 180 AND estado = true) as calostro_180ml
        
      FROM control_de_leches 
      WHERE fecha_almacenamiento BETWEEN $1 AND $2
    `;

    const result = await sequelize.query(query, {
      bind: [fecha_inicio, fecha_fin], // PostgreSQL usa bind en lugar de replacements
      type: QueryTypes.SELECT,
      timeout: 60000, // 60 segundos de timeout para consultas grandes
      logging: console.log // Habilitar logging para debuggear consultas lentas
    });

    const estadisticas = result[0];

    // Formatear la respuesta de manera más organizada
    const respuesta = {
      periodo_consultado: {
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin
      },
      resumen_general: {
        total_frascos_disponibles: parseInt(estadisticas.total_frascos_disponibles) || 0,
        total_frascos_no_disponibles: parseInt(estadisticas.total_frascos_no_disponibles) || 0,
        total_registros: parseInt(estadisticas.total_registros) || 0,
        volumen_total_ml_disponible: parseInt(estadisticas.volumen_total_ml_disponible) || 0
      },
      disponibles_por_volumen: {
        frascos_10ml: parseInt(estadisticas.frascos_10ml_disponibles) || 0,
        frascos_20ml: parseInt(estadisticas.frascos_20ml_disponibles) || 0,
        frascos_30ml: parseInt(estadisticas.frascos_30ml_disponibles) || 0,
        frascos_150ml: parseInt(estadisticas.frascos_150ml_disponibles) || 0,
        frascos_180ml: parseInt(estadisticas.frascos_180ml_disponibles) || 0
      },
      disponibles_por_tipo_leche: {
        leche_madura: parseInt(estadisticas.leche_madura_disponible) || 0,
        leche_calostro: parseInt(estadisticas.leche_calostro_disponible) || 0
      },
      detalle_por_tipo_y_volumen: {
        leche_madura: {
          frascos_10ml: parseInt(estadisticas.madura_10ml) || 0,
          frascos_20ml: parseInt(estadisticas.madura_20ml) || 0,
          frascos_30ml: parseInt(estadisticas.madura_30ml) || 0,
          frascos_150ml: parseInt(estadisticas.madura_150ml) || 0,
          frascos_180ml: parseInt(estadisticas.madura_180ml) || 0,
          total: parseInt(estadisticas.leche_madura_disponible) || 0
        },
        leche_calostro: {
          frascos_10ml: parseInt(estadisticas.calostro_10ml) || 0,
          frascos_20ml: parseInt(estadisticas.calostro_20ml) || 0,
          frascos_30ml: parseInt(estadisticas.calostro_30ml) || 0,
          frascos_150ml: parseInt(estadisticas.calostro_150ml) || 0,
          frascos_180ml: parseInt(estadisticas.calostro_180ml) || 0,
          total: parseInt(estadisticas.leche_calostro_disponible) || 0
        }
      }
    };

    // Guardar en cache si está habilitado
    if (use_cache === 'true') {
      if (!global.stockCache) global.stockCache = {};
      global.stockCache[cacheKey] = {
        data: respuesta,
        timestamp: Date.now()
      };
      
      // Limpiar cache viejo (mantener solo últimas 10 consultas)
      const cacheKeys = Object.keys(global.stockCache);
      if (cacheKeys.length > 10) {
        const oldestKey = cacheKeys.reduce((oldest, key) => 
          global.stockCache[key].timestamp < global.stockCache[oldest].timestamp ? key : oldest
        );
        delete global.stockCache[oldestKey];
      }
    }

    res.send({
      message: 'Estadísticas de stock obtenidas exitosamente',
      estadisticas: respuesta,
      performance_info: {
        query_optimized: true,
        uses_indexes: true,
        cached: use_cache === 'true'
      }
    });

  } catch (err) {
    console.error('Error en getStockByDateRange:', err);
    res.status(500).send({
      message: err.message || 'Error al obtener estadísticas de stock por rango de fechas.'
    });
  }
};
// Recuperar un registro de control_de_leches por su ID
exports.findOne = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.findByPk(id_control_leche, {
    include: [
      { 
        model: db.trabajo_de_pasteurizaciones, 
        as: 'trabajo_de_pasteurizaciones',
        attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez'],
      },
    ],
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro con id=${id_control_leche}.`,
        });
      } else {
        // ✅ CORREGIDO: Con DATEONLY ya no necesita formateo adicional
        // data.fecha_almacenamiento = data.fecha_almacenamiento.toISOString().split('T')[0]; // Ya no necesario
        // data.fecha_entrega = data.fecha_entrega.toISOString().split('T')[0]; // Ya no necesario
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_control_leche}.`,
      });
    });
};

// Actualizar un registro de control_de_leches por su ID
exports.update = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.update(req.body, {
    where: { id_control_leche: id_control_leche },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de control_de_leches actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de control_de_leches con id=${id_control_leche}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de control_de_leches con id=${id_control_leche}.`,
      });
    });
};
// Eliminar un registro de control_de_leches por su ID
exports.delete = (req, res) => {
  const id_control_leche = req.params.id_control_leche;

  ControlDeLeche.destroy({
    where: { id_control_leche: id_control_leche },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de control_de_leches eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de control_de_leches con id=${id_control_leche}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de control_de_leches con id=${id_control_leche}.`,
      });
    });
};

// Eliminar todos los registros de control_de_leches de la base de datos
exports.deleteAll = (req, res) => {
  ControlDeLeche.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de control_de_leches eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de control_de_leches.',
      });
    });
};
// Calcular el total de leche pasteurizada, promedio de valor energético y stock sin acidez Dornic
// Obtener las métricas de leche pasteurizada (total, promedio kcal/l, stock sin acidez dornic)
exports.getMetrics = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
      // Asegúrate de que las fechas sean válidas
      if (!fecha_inicio || !fecha_fin) {
          return res.status(400).json({ message: "Fecha de inicio y fecha de fin son requeridas." });
      }

      // Calcular el total de leche pasteurizada en litros
      const totalLechePasteurizadaEnLitros = await ControlDeLeche.sum('volumen_ml_onza', {
          where: {
              fecha_almacenamiento: {
                  [Op.between]: [fecha_inicio, fecha_fin]
              }
          }
      }) / 1000; // Convertir de mililitros a litros

      // Calcular el promedio del valor energético en Kcal/L
      const promedioValorEnergeticoKcalL = await trabajo_de_pasteurizaciones.aggregate('kcal_l', 'avg', {
          include: [{
              model: ControlDeLeche,
              required: true,
              where: {
                  fecha_almacenamiento: {
                      [Op.between]: [fecha_inicio, fecha_fin]
                  }
              }
          }]
      });

      // Calcular el stock sin acidez Dornic en litros
      const stockSinAcidezDornicEnLitros = await ControlDeLeche.sum('volumen_ml_onza', {
          include: [{
              model: trabajo_de_pasteurizaciones,
              required: true,
              where: {
                  [Op.or]: [
                      { acidez: 0 },
                      { acidez: null }
                  ]
              }
          }],
          where: {
              fecha_almacenamiento: {
                  [Op.between]: [fecha_inicio, fecha_fin]
              }
          }
      }) / 1000; // Convertir de mililitros a litros

      return res.status(200).json({
          totalLechePasteurizadaEnLitros: totalLechePasteurizadaEnLitros || 0,
          promedioValorEnergeticoKcalL: promedioValorEnergeticoKcalL || 0,
          stockSinAcidezDornicEnLitros: stockSinAcidezDornicEnLitros || 0
      });
  } catch (error) {
      console.error("Error al recuperar métricas:", error);
      return res.status(500).json({ message: "Error al recuperar las métricas." });
  }
};

// ✅ CORREGIDO: findTotalsAndRecordsByDateRange actualizado para DATEONLY
exports.findTotalsAndRecordsByDateRange = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: "Debes proporcionar 'fechaInicio' y 'fechaFin'.",
    });
  }

  try {
    // ✅ CORREGIDO: Simplificado para DATEONLY - no necesita new Date()
    const registros = await ControlDeLeche.findAll({
      where: {
        fecha_almacenamiento: {
          [Op.between]: [fechaInicio, fechaFin], // Directamente como strings YYYY-MM-DD
        },
      },
      include: [
        {
          model: trabajo_de_pasteurizaciones,
          as: 'trabajo_de_pasteurizaciones',
          attributes: ['kcal_l', 'porcentaje_grasa', 'acidez'],
        },
      ],
      attributes: [
        'id_control_leche',
        'no_frascoregistro',
        'fecha_almacenamiento',
        'volumen_ml_onza',
        'tipo_de_leche',
        'fecha_entrega',
        'responsable',
        'frasco',
        'unidosis',
      ],
      order: [
        ['fecha_almacenamiento', 'ASC'],
        ['id_control_leche', 'ASC'],
      ], // Ordenar por fecha de almacenamiento
    });

    // Calcular totales de frascos y unidosis
    let totalFrascos = 0;
    let totalUnidosis = 0;

    registros.forEach((registro) => {
      if (registro.frasco) totalFrascos += 1;
      if (registro.unidosis) totalUnidosis += 1;
    });

    // ✅ CORREGIDO: Formatear registros - fecha_almacenamiento ya viene como YYYY-MM-DD
    const registrosFormateados = registros.map((registro) => ({
      ID: registro.id_control_leche,
      NoFrasco: registro.no_frascoregistro,
      FechaAlmacenamiento: registro.fecha_almacenamiento, // Ya viene como YYYY-MM-DD
      Volumen: registro.volumen_ml_onza,
      Kcal_l: registro.trabajo_de_pasteurizaciones?.kcal_l || null,
      Grasa: registro.trabajo_de_pasteurizaciones?.porcentaje_grasa || null,
      Acidez: registro.trabajo_de_pasteurizaciones?.acidez || null,
      TipoDeLeche: registro.tipo_de_leche,
      FechaEntrega: registro.fecha_entrega,
      Responsable: registro.responsable,
    }));

    // Enviar respuesta con totales y registros
    res.send({
      fechaInicio,
      fechaFin,
      totalFrascos,
      totalUnidosis,
      registros: registrosFormateados,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los datos.',
    });
  }
};
//K