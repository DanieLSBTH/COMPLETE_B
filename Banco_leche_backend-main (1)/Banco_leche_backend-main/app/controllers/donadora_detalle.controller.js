const db = require('../models');
const DonadoraDetalle = db.donadora_detalle;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const sequelize = db.sequelize;
const Op = Sequelize.Op;

// Cache simple en memoria para consultas frecuentes
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Función helper para generar clave de cache
const generateCacheKey = (prefix, params) => {
  return `${prefix}_${JSON.stringify(params)}`;
};

// Función helper para obtener desde cache
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Función helper para guardar en cache
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  // Limpieza automática del cache
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

// Crear y guardar un nuevo registro en donadora_detalle
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {no_frasco, id_donadora, fecha, onzas, id_extrahospitalario, id_intrahospitalario, constante, nueva, id_personal } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!no_frasco || !id_donadora || !onzas || typeof constante === 'undefined' || typeof nueva === 'undefined' || !id_personal) {
      await transaction.rollback();
      return res.status(400).send({
        message: 'Todos los campos son obligatorios.',
      });
    }

    // Verificar que solo uno de los campos esté presente
    if (id_extrahospitalario && id_intrahospitalario) {
      await transaction.rollback();
      return res.status(400).send({
        message: 'Solo se puede seleccionar un campo: id_extrahospitalario o id_intrahospitalario.',
      });
    }

    // Crear un registro en donadora_detalle con transacción
    const data = await DonadoraDetalle.create({
      no_frasco,
      id_donadora,
      fecha,
      onzas,
      litros: onzas * 0.03, // Calcular litros automáticamente
      id_extrahospitalario,
      id_intrahospitalario,
      constante,
      nueva,
      id_personal,
    }, { transaction });

    await transaction.commit();
    
    // Limpiar cache relacionado
    cache.clear();
    
    res.send(data);
  } catch (err) {
    await transaction.rollback();
    res.status(500).send({
      message: err.message || 'Error al crear el registro en donadora_detalle.',
    });
  }
};

// OPTIMIZADO: findAll con paginación mejorada y cache
exports.findAll = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, id_donadora, mesActual } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = Math.min(parseInt(pageSize, 10), 100);

    const cacheKey = generateCacheKey('findAll', { page, pageSize, id_donadora, mesActual });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.send(cachedResult);
    }

    let condition = {};

    if (id_donadora) {
      condition.id_donadora = { [Op.eq]: id_donadora };
    }

    if (mesActual === 'true') {
      const now = new Date();
      // ✅ CAMBIO: Usar solo fechas sin tiempo
      const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      
      condition.fecha = {
        [Op.between]: [startOfMonth, endOfMonth]
      };
    }

    const result = await DonadoraDetalle.findAndCountAll({
      where: condition,
      include: [
        { 
          model: db.donadoras, 
          as: 'donadoras',
          attributes: ['id_donadora', 'nombre', 'apellido']
        },
        { 
          model: db.servicio_ex, 
          as: 'servicio_exes',
          attributes: ['id_extrahospitalario', 'servicio']
        },
        { 
          model: db.servicio_in, 
          as: 'servicio_ins',
          attributes: ['id_intrahospitalario', 'servicio']
        },
        { 
          model: db.personal, 
          as: 'personals',
          attributes: ['id_personal', 'nombre']
        },
      ],
      limit: limit,
      offset: offset,
      order: [['id_donadora_detalle', 'DESC']],
      raw: false,
      nest: true
    });

    const response = {
      donadoraDetalles: result.rows,
      totalRecords: result.count,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(result.count / limit)
    };

    setCache(cacheKey, response);
    res.send(response);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los registros de donadora_detalle.',
    });
  }
};

// OPTIMIZADO: findOne sin cambios en la API
exports.findOne = async (req, res) => {
  try {
    const id_donadora_detalle = req.params.id_donadora_detalle;
    
    // Cache para registros individuales
    const cacheKey = generateCacheKey('findOne', { id_donadora_detalle });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.send(cachedResult);
    }

    const data = await DonadoraDetalle.findByPk(id_donadora_detalle, {
      include: [
        { model: db.donadoras, as: 'donadoras' },
        { model: db.servicio_ex, as: 'servicio_exes' },
        { model: db.servicio_in, as: 'servicio_ins' },
        { model: db.personal, as: 'personals' },
      ],
    });

    if (!data) {
      return res.status(404).send({
        message: `No se encontró el registro con id=${id_donadora_detalle}.`,
      });
    }

    setCache(cacheKey, data);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `Error al recuperar el registro con id=${req.params.id_donadora_detalle}`,
    });
  }
};

// OPTIMIZADO: update con transacciones
exports.update = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const id_donadora_detalle = req.params.id_donadora_detalle;
    const { onzas } = req.body;

    // Si el campo onzas está presente, recalcular los litros
    if (onzas) {
      req.body.litros = onzas * 0.03;
    }

    const [num] = await DonadoraDetalle.update(req.body, {
      where: { id_donadora_detalle: id_donadora_detalle },
      transaction
    });

    await transaction.commit();
    
    // Limpiar cache
    cache.clear();

    if (num == 1) {
      res.send({
        message: 'Registro de donadora_detalle actualizado con éxito.',
      });
    } else {
      res.send({
        message: `No se puede actualizar el registro de donadora_detalle con id=${id_donadora_detalle}.`,
      });
    }
  } catch (err) {
    await transaction.rollback();
    res.status(500).send({
      message: `Error al actualizar el registro de donadora_detalle con id=${req.params.id_donadora_detalle}`,
    });
  }
};

// OPTIMIZADO: delete con transacciones
exports.delete = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const id_donadora_detalle = req.params.id_donadora_detalle;

    const num = await DonadoraDetalle.destroy({
      where: { id_donadora_detalle: id_donadora_detalle },
      transaction
    });

    await transaction.commit();
    
    // Limpiar cache
    cache.clear();

    if (num == 1) {
      res.send({
        message: 'Registro de donadora_detalle eliminado con éxito.',
      });
    } else {
      res.send({
        message: `No se puede eliminar el registro de donadora_detalle con id=${id_donadora_detalle}.`,
      });
    }
  } catch (err) {
    await transaction.rollback();
    res.status(500).send({
      message: `Error al eliminar el registro de donadora_detalle con id=${req.params.id_donadora_detalle}`,
    });
  }
};

// Sin cambios - funciona bien para operaciones masivas
exports.deleteAll = (req, res) => {
  DonadoraDetalle.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      cache.clear();
      res.send({
        message: `${nums} registros de donadora_detalle eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de donadora_detalle.',
      });
    });
};

// OPTIMIZADO: Consulta de donaciones por servicio con cache y mejor rendimiento
exports.getDonacionesPorServicio = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
      });
    }

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
      return res.status(400).send({
        message: 'El formato de las fechas debe ser YYYY-MM-DD.',
      });
    }

    const cacheKey = generateCacheKey('donacionesPorServicio', { fechaInicio, fechaFin });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.send(cachedResult);
    }

    // ✅ CAMBIO: Ya no necesitas ajustar la fecha final
    const query = `
      WITH RECURSIVE donaciones_base AS (
        SELECT 
          dd.id_extrahospitalario,
          dd.id_intrahospitalario,
          dd.id_donadora,
          dd.litros,
          ext.servicio as servicio_ext,
          int_serv.servicio as servicio_int
        FROM donadora_detalles dd
        LEFT JOIN servicio_exes ext ON dd.id_extrahospitalario = ext.id_extrahospitalario
        LEFT JOIN servicio_ins int_serv ON dd.id_intrahospitalario = int_serv.id_intrahospitalario
        WHERE dd.fecha BETWEEN $1 AND $2
      ),
      resumen_extrahospitalario AS (
        SELECT 
          'Extrahospitalario' AS servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros
        FROM donaciones_base 
        WHERE id_extrahospitalario IS NOT NULL
        
        UNION ALL
        
        SELECT 
          servicio_ext AS servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros
        FROM donaciones_base 
        WHERE id_extrahospitalario IS NOT NULL
        GROUP BY servicio_ext
      ),
      resumen_intrahospitalario AS (
        SELECT 
          'Intrahospitalario' AS servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros
        FROM donaciones_base 
        WHERE id_intrahospitalario IS NOT NULL
        
        UNION ALL
        
        SELECT 
          servicio_int AS servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros
        FROM donaciones_base 
        WHERE id_intrahospitalario IS NOT NULL
        GROUP BY servicio_int
      )
      SELECT * FROM resumen_extrahospitalario
      UNION ALL
      SELECT * FROM resumen_intrahospitalario
      UNION ALL
      SELECT 
        'TOTAL GENERAL' AS servicio_tipo,
        SUM(total_donaciones) AS total_donaciones,
        SUM(total_donadoras) AS total_donadoras,
        SUM(total_litros) AS total_litros
      FROM (
        SELECT * FROM resumen_extrahospitalario WHERE servicio_tipo = 'Extrahospitalario'
        UNION ALL
        SELECT * FROM resumen_intrahospitalario WHERE servicio_tipo = 'Intrahospitalario'
      ) AS main_categories;
    `;

    const results = await sequelize.query(query, {
      bind: [fechaInicio, fechaFin], // ✅ CAMBIO: Sin ajuste de hora
      type: QueryTypes.SELECT,
    });

    setCache(cacheKey, results);
    res.send(results);
  } catch (err) {
    res.status(500).send({
      message: 'Error al obtener el resumen de donaciones por tipo de servicio.',
      error: err.message,
    });
  }
};

// OPTIMIZADO: Resumen de donaciones con cache y mejor rendimiento
exports.getResumenDonaciones = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
      });
    }

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
      return res.status(400).send({
        message: 'El formato de las fechas debe ser YYYY-MM-DD.',
      });
    }

    const cacheKey = generateCacheKey('resumenDonaciones', { fechaInicio, fechaFin });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.send(cachedResult);
    }

    // ✅ CAMBIO: Sin ajuste de fecha final
    const query = `
      WITH donaciones_optimized AS (
        SELECT 
          CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            ELSE 'Intrahospitalario'
          END AS servicio_tipo,
          dd.id_donadora,
          dd.litros,
          dd.nueva,
          dd.constante
        FROM donadora_detalles dd
        WHERE dd.fecha BETWEEN $1 AND $2
          AND (dd.id_extrahospitalario IS NOT NULL OR dd.id_intrahospitalario IS NOT NULL)
      ),
      estadisticas AS (
        SELECT 
          servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros,
          COUNT(DISTINCT CASE WHEN nueva = true THEN id_donadora END) AS total_nuevas,
          COUNT(DISTINCT CASE WHEN constante = true THEN id_donadora END) AS total_constantes
        FROM donaciones_optimized
        GROUP BY servicio_tipo
      ),
      totales AS (
        SELECT SUM(total_donaciones) AS total_general_donaciones
        FROM estadisticas
      )
      SELECT 
        e.servicio_tipo AS "Servicio Tipo",
        e.total_donaciones AS "Total Donaciones",
        e.total_donadoras AS "Total Donadoras",
        e.total_litros AS "Total Litros",
        ROUND((e.total_donaciones * 100.0 / NULLIF(t.total_general_donaciones, 0)), 2) AS "Porcentaje Donaciones",
        e.total_nuevas AS "Total Nuevas",
        e.total_constantes AS "Total Constantes"
      FROM estadisticas e
      CROSS JOIN totales t
      
      UNION ALL
      
      SELECT 
        'TOTAL GENERAL' AS "Servicio Tipo",
        SUM(total_donaciones) AS "Total Donaciones",
        SUM(total_donadoras) AS "Total Donadoras",
        SUM(total_litros) AS "Total Litros",
        100 AS "Porcentaje Donaciones",
        SUM(total_nuevas) AS "Total Nuevas",
        SUM(total_constantes) AS "Total Constantes"
      FROM estadisticas;
    `;

    const results = await sequelize.query(query, {
      bind: [fechaInicio, fechaFin], // ✅ CAMBIO: Sin ajuste de fecha
      type: QueryTypes.SELECT,
    });

    setCache(cacheKey, results);
    res.send(results);
  } catch (err) {
    res.status(500).send({
      message: 'Error al obtener el resumen de donaciones.',
      error: err.message,
    });
  }
};

// OPTIMIZADO: Resumen por mes con cache y paginación opcional
exports.getResumenPorMes = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const cacheKey = generateCacheKey('resumenPorMes', { year: currentYear });
    const cachedResult = getFromCache(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    // Consulta optimizada con índices de fecha
    const query = `
      WITH donaciones_mes AS (
        SELECT 
          TO_CHAR(dd.fecha, 'TMMonth YYYY') AS mes,
          DATE_TRUNC('month', dd.fecha) AS fecha_ordenamiento,
          CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            ELSE 'Intrahospitalario'
          END AS servicio_tipo,
          dd.id_donadora,
          dd.litros,
          dd.nueva::boolean
        FROM donadora_detalles dd
        WHERE EXTRACT(YEAR FROM dd.fecha) = $1
      ),
      estadisticas_mes AS (
        SELECT 
          mes,
          fecha_ordenamiento,
          servicio_tipo,
          COUNT(*) AS total_donaciones,
          COUNT(DISTINCT id_donadora) AS total_donadoras,
          SUM(litros) AS total_litros,
          SUM(CASE WHEN nueva THEN 1 ELSE 0 END) AS total_nuevas
        FROM donaciones_mes
        GROUP BY mes, fecha_ordenamiento, servicio_tipo
      ),
      totales_mes AS (
        SELECT 
          mes,
          fecha_ordenamiento,
          SUM(total_donaciones) AS total_general_donaciones
        FROM estadisticas_mes
        GROUP BY mes, fecha_ordenamiento
      ),
      resultados_finales AS (
        SELECT 
          e.mes,
          e.fecha_ordenamiento,
          e.servicio_tipo,
          e.total_donaciones,
          e.total_donadoras,
          e.total_litros,
          ROUND((e.total_donaciones * 100.0 / NULLIF(t.total_general_donaciones, 0)), 2) AS porcentaje_donaciones,
          e.total_nuevas,
          CASE 
            WHEN e.servicio_tipo = 'Extrahospitalario' THEN 0
            WHEN e.servicio_tipo = 'Intrahospitalario' THEN 1
            ELSE 2
          END AS orden_tipo
        FROM estadisticas_mes e
        JOIN totales_mes t ON e.mes = t.mes
        
        UNION ALL
        
        SELECT 
          e.mes,
          e.fecha_ordenamiento,
          'TOTAL GENERAL' AS servicio_tipo,
          SUM(e.total_donaciones) AS total_donaciones,
          SUM(e.total_donadoras) AS total_donadoras,
          SUM(e.total_litros) AS total_litros,
          100 AS porcentaje_donaciones,
          SUM(e.total_nuevas) AS total_nuevas,
          2 AS orden_tipo
        FROM estadisticas_mes e
        GROUP BY e.mes, e.fecha_ordenamiento
      )
      SELECT 
        mes,
        servicio_tipo,
        total_donaciones,
        total_donadoras,
        total_litros,
        porcentaje_donaciones,
        total_nuevas
      FROM resultados_finales
      ORDER BY fecha_ordenamiento, orden_tipo;
    `;

    const results = await sequelize.query(query, {
      bind: [currentYear],
      type: QueryTypes.SELECT,
      raw: true,
    });

    setCache(cacheKey, results);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener el resumen por mes:', error);
    res.status(500).json({
      message: 'Error al obtener el resumen por mes.',
      error: error.message,
    });
  }
};

// NUEVA FUNCIÓN: Limpiar cache manualmente (útil para debugging)
exports.clearCache = (req, res) => {
  cache.clear();
  res.send({ message: 'Cache limpiado exitosamente.' });
};

// NUEVA FUNCIÓN: Estadísticas de rendimiento
exports.getPerformanceStats = (req, res) => {
  res.json({
    cacheSize: cache.size,
    maxCacheSize: 100,
    cacheTTL: CACHE_TTL / 1000 + ' segundos'
  });
};

exports.findDetailsByName = async (req, res) => {
  const { id_donadora } = req.query;

  if (!id_donadora) {
    return res.status(400).send({
      message: 'El id_donadora es requerido para la búsqueda.'
    });
  }

  try {
    const query = `
      SELECT 
        dd.id_donadora_detalle,
        dd.fecha,
        dd.no_frasco,
        dd.onzas,
        dd.litros,
        dd.nueva,
        dd.constante,
        dd.id_donadora,
        dd.id_extrahospitalario,
        dd.id_intrahospitalario,
        d.nombre,
        d.apellido,
        se.servicio as servicio_ex,
        si.servicio as servicio_in,
        p.nombre as personal_nombre
      FROM donadora_detalles dd
      INNER JOIN donadoras d ON dd.id_donadora = d.id_donadora
      LEFT JOIN servicio_exes se ON dd.id_extrahospitalario = se.id_extrahospitalario
      LEFT JOIN servicio_ins si ON dd.id_intrahospitalario = si.id_intrahospitalario
      LEFT JOIN personals p ON dd.id_personal = p.id_personal
      WHERE dd.id_donadora = :id_donadora
      ORDER BY dd.fecha ASC
    `;

    const resultados = await sequelize.query(query, {
      replacements: { id_donadora },
      type: QueryTypes.SELECT
    });

    if (!resultados.length) {
      return res.status(404).send({
        message: 'No se encontraron registros para esta donadora.'
      });
    }

    const primerRegistro = resultados[0];
    const informacionPersonal = {
      id: primerRegistro.id_donadora,
      nombre: primerRegistro.nombre,
      apellido: primerRegistro.apellido
    };

    let totalNuevas = 0;
    let totalConstantes = 0;
    let totalOnzas = 0;
    let totalLitros = 0;
    const serviciosSet = new Set();
    const personalSet = new Set();

    const donaciones = resultados.map(donacion => {
      if (donacion.nueva) totalNuevas++;
      if (donacion.constante) totalConstantes++;
      totalOnzas += parseFloat(donacion.onzas || 0);
      totalLitros += parseFloat(donacion.litros || 0);

      const servicio = donacion.servicio_in || donacion.servicio_ex;
      if (servicio) serviciosSet.add(servicio);
      if (donacion.personal_nombre) personalSet.add(donacion.personal_nombre);

      return {
        id_donadora_detalle: donacion.id_donadora_detalle,
        // ✅ CAMBIO: Para DATE solo, usar toISOString().split('T')[0] o toLocaleDateString()
        fecha: donacion.fecha instanceof Date ? donacion.fecha.toLocaleDateString() : donacion.fecha,
        no_frasco: donacion.no_frasco,
        onzas: donacion.onzas,
        litros: donacion.litros,
        servicio: servicio,
        tipo_servicio: donacion.servicio_in ? 'Intrahospitalario' : 'Extrahospitalario',
        personal_atendio: donacion.personal_nombre,
        tipo: {
          nueva: donacion.nueva,
          constante: donacion.constante
        }
      };
    });

    // ✅ CAMBIO: Cálculo de fechas simplificado para DATE
    const fechas = resultados.map(r => new Date(r.fecha));
    const primeraFecha = new Date(Math.min(...fechas));
    const ultimaFecha = new Date(Math.max(...fechas));
    const diasDesdeUltima = Math.floor((new Date() - ultimaFecha) / (1000 * 60 * 60 * 24));

    const resultado = {
      informacion_personal: informacionPersonal,
      resumen: {
        total_donaciones: resultados.length,
        primera_donacion: primeraFecha.toLocaleDateString(),
        ultima_donacion: ultimaFecha.toLocaleDateString(),
        total_nuevas: totalNuevas,
        total_constantes: totalConstantes,
        total_onzas: parseFloat(totalOnzas.toFixed(2)),
        total_litros: parseFloat(totalLitros.toFixed(2)),
        servicios_visitados: Array.from(serviciosSet),
        personal_atendio: Array.from(personalSet),
        dias_desde_ultima_donacion: diasDesdeUltima,
        promedio_onzas_por_donacion: parseFloat((totalOnzas / resultados.length).toFixed(2))
      },
      donaciones: donaciones
    };

    const estadisticasGenerales = {
      total_donadoras_encontradas: 1,
      total_donaciones: resultados.length,
      promedio_donaciones_por_donadora: resultados.length,
      total_onzas_recolectadas: totalOnzas.toFixed(2),
      total_litros_recolectados: totalLitros.toFixed(2),
      servicios_mas_frecuentes: obtenerServiciosMasFrecuentesOptimizado(donaciones)
    };

    res.send({
      estadisticas_generales: estadisticasGenerales,
      resultados: [resultado]
    });

  } catch (error) {
    console.error('Error en findDetailsByName:', error);
    res.status(500).send({
      message: 'Error al buscar los detalles por nombre.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar optimizada para servicios más frecuentes
function obtenerServiciosMasFrecuentesOptimizado(donaciones) {
  const serviciosCount = {};
  
  donaciones.forEach(donacion => {
    if (donacion.servicio) {
      serviciosCount[donacion.servicio] = (serviciosCount[donacion.servicio] || 0) + 1;
    }
  });

  return Object.fromEntries(
    Object.entries(serviciosCount).sort(([,a], [,b]) => b - a)
  );
}

// FUNCIÓN OPTIMIZADA: Obtener estadísticas de donaciones
exports.getStats = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let whereClause = '';
    const replacements = {};

    if (fecha_inicio && fecha_fin) {
      whereClause = 'WHERE dd.fecha BETWEEN :fecha_inicio AND :fecha_fin';
      // ✅ CAMBIO: Sin agregar tiempo, solo fechas
      replacements.fecha_inicio = fecha_inicio;
      replacements.fecha_fin = fecha_fin;
    }

    const statsQuery = `
      WITH base_stats AS (
        SELECT 
          dd.id_donadora,
          dd.onzas,
          dd.litros,
          dd.nueva,
          dd.constante,
          dd.id_extrahospitalario,
          dd.id_intrahospitalario
        FROM donadora_detalles dd
        ${whereClause}
      ),
      general_stats AS (
        SELECT 
          COUNT(DISTINCT id_donadora) as total_donadoras,
          COUNT(*) as total_donaciones,
          ROUND(SUM(COALESCE(litros, onzas * 0.03)), 2) as total_litros,
          COUNT(DISTINCT CASE WHEN nueva = true THEN id_donadora END) as total_nuevas,
          COUNT(DISTINCT CASE WHEN constante = true THEN id_donadora END) as total_constantes
        FROM base_stats
      ),
      servicio_ex_stats AS (
        SELECT 
          se.servicio,
          'extrahospitalario' as tipo,
          COUNT(DISTINCT bs.id_donadora) as total_donadoras,
          COUNT(*) as total_donaciones,
          ROUND(SUM(COALESCE(bs.litros, bs.onzas * 0.03)), 2) as litros,
          COUNT(DISTINCT CASE WHEN bs.nueva = true THEN bs.id_donadora END) as nuevas,
          COUNT(DISTINCT CASE WHEN bs.constante = true THEN bs.id_donadora END) as constantes
        FROM base_stats bs
        INNER JOIN servicio_exes se ON bs.id_extrahospitalario = se.id_extrahospitalario
        WHERE bs.id_extrahospitalario IS NOT NULL
        GROUP BY se.servicio
      ),
      servicio_in_stats AS (
        SELECT 
          si.servicio,
          'intrahospitalario' as tipo,
          COUNT(DISTINCT bs.id_donadora) as total_donadoras,
          COUNT(*) as total_donaciones,
          ROUND(SUM(COALESCE(bs.litros, bs.onzas * 0.03)), 2) as litros,
          COUNT(DISTINCT CASE WHEN bs.nueva = true THEN bs.id_donadora END) as nuevas,
          COUNT(DISTINCT CASE WHEN bs.constante = true THEN bs.id_donadora END) as constantes
        FROM base_stats bs
        INNER JOIN servicio_ins si ON bs.id_intrahospitalario = si.id_intrahospitalario
        WHERE bs.id_intrahospitalario IS NOT NULL
        GROUP BY si.servicio
      )
      SELECT 'general' as tipo, 
             NULL as servicio,
             total_donadoras,
             total_donaciones,
             total_litros as litros,
             total_nuevas as nuevas,
             total_constantes as constantes
      FROM general_stats
      UNION ALL
      SELECT tipo, servicio, total_donadoras, total_donaciones, litros, nuevas, constantes
      FROM servicio_ex_stats
      UNION ALL
      SELECT tipo, servicio, total_donadoras, total_donaciones, litros, nuevas, constantes
      FROM servicio_in_stats
      ORDER BY tipo, litros DESC NULLS LAST
    `;

    const results = await sequelize.query(statsQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    const generalStats = results.find(r => r.tipo === 'general');
    const serviciosEx = results.filter(r => r.tipo === 'extrahospitalario');
    const serviciosIn = results.filter(r => r.tipo === 'intrahospitalario');

    const response = {
      estadisticas_generales: {
        total_donadoras: generalStats.total_donadoras,
        total_donaciones: generalStats.total_donaciones,
        total_litros: generalStats.litros,
        total_nuevas: generalStats.nuevas,
        total_constantes: generalStats.constantes
      },
      litros_por_servicio: {
        extrahospitalario: serviciosEx.map(s => ({
          servicio: s.servicio,
          total_donadoras: s.total_donadoras,
          total_donaciones: s.total_donaciones,
          litros: s.litros,
          nuevas: s.nuevas,
          constantes: s.constantes
        })),
        intrahospitalario: serviciosIn.map(s => ({
          servicio: s.servicio,
          total_donadoras: s.total_donadoras,
          total_donaciones: s.total_donaciones,
          litros: s.litros,
          nuevas: s.nuevas,
          constantes: s.constantes
        }))
      }
    };

    res.send(response);
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).send({
      message: error.message || 'Error al obtener las estadísticas.',
    });
  }
};


// FUNCIÓN OPTIMIZADA: Top de donadoras
exports.getTopDonadoras = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({
      message: 'Debe proporcionar una fecha de inicio y una fecha de fin.',
    });
  }

  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fechaInicio) || !regexFecha.test(fechaFin)) {
    return res.status(400).send({
      message: 'El formato de las fechas debe ser YYYY-MM-DD.',
    });
  }

  try {
    const query = `
      WITH donadora_stats AS (
        SELECT 
          dd.id_donadora,
          d.nombre AS donadora_nombre,
          d.apellido AS donadora_apellido,
          CASE 
            WHEN dd.id_extrahospitalario IS NOT NULL THEN 'Extrahospitalario'
            WHEN dd.id_intrahospitalario IS NOT NULL THEN 'Intrahospitalario'
          END AS servicio_tipo,
          COUNT(*) AS total_donaciones,
          SUM(dd.onzas) AS total_onzas,
          SUM(COALESCE(dd.litros, dd.onzas * 0.03)) AS total_litros
        FROM donadora_detalles dd
        INNER JOIN donadoras d ON dd.id_donadora = d.id_donadora
        WHERE dd.fecha BETWEEN :fechaInicio AND :fechaFin
          AND (dd.id_extrahospitalario IS NOT NULL OR dd.id_intrahospitalario IS NOT NULL)
        GROUP BY dd.id_donadora, d.nombre, d.apellido, servicio_tipo
      ),
      ranked_donadoras AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (PARTITION BY servicio_tipo ORDER BY total_donaciones DESC, total_onzas DESC) as rank
        FROM donadora_stats
      )
      SELECT 
        id_donadora,
        donadora_nombre,
        donadora_apellido,
        servicio_tipo,
        total_donaciones,
        total_onzas,
        total_litros
      FROM ranked_donadoras
      WHERE rank <= 5
      ORDER BY servicio_tipo, total_donaciones DESC, total_onzas DESC
    `;

    const results = await sequelize.query(query, {
      replacements: { 
        fechaInicio, 
        fechaFin // ✅ CAMBIO: Sin ajuste de fecha
      },
      type: QueryTypes.SELECT
    });

    const topDonadoras = results.reduce((acc, row) => {
      const key = row.servicio_tipo.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, { extrahospitalario: [], intrahospitalario: [] });

    res.send(topDonadoras);
  } catch (error) {
    console.error('Error en getTopDonadoras:', error);
    res.status(500).send({
      message: 'Error al obtener el top 5 de donadoras.',
      error: error.message,
    });
  }
};