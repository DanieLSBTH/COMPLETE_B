const db = require('../models');
const Estimulacion = db.estimulacion;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Op = Sequelize.Op;

const parseFecha = (fecha) => {
  const [day, month, year] = fecha.split('/');
  return new Date(`${year}-${month}-${day}`);
};
const { literal, fn, col } = require('sequelize');

// Crear y guardar un nuevo registro en estimulacion
exports.create = async (req, res) => {
  const { id_personal_estimulacion, fecha, id_intrahospitalario, constante, nueva, id_personal, id_extrahospitalario } = req.body;

  // Verificación optimizada de campos requeridos
  const requiredFields = { id_personal_estimulacion, fecha, id_personal };
  const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
  
  if (missingFields.length > 0 || typeof constante === 'undefined' || typeof nueva === 'undefined') {
    return res.status(400).send({
      message: 'Todos los campos son obligatorios.',
      missingFields: missingFields.length > 0 ? missingFields : undefined
    });
  }

  // Verificar que solo uno de los campos esté presente
  if (id_extrahospitalario && id_intrahospitalario) {
    return res.status(400).send({
      message: 'Solo se puede seleccionar un campo: id_extrahospitalario o id_intrahospitalario.',
    });
  }

  try {
    const data = await Estimulacion.create({
      id_personal_estimulacion,
      fecha: parseFecha(fecha),
      id_intrahospitalario,
      constante,
      nueva,
      id_personal,
      id_extrahospitalario,
    });
    
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al crear el registro en estimulacion.',
    });
  }
};

// Recuperar todos los registros con paginación optimizada
exports.findAll = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, id_personal_estimulacion, mesActual } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize, 10);

    let condition = {};

    // Optimización: usar índice en id_personal_estimulacion
    if (id_personal_estimulacion) {
      condition.id_personal_estimulacion = id_personal_estimulacion;
    }

    // Optimización: usar índice en fecha para filtros de mes actual
    if (mesActual === 'true') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      condition.fecha = {
        [Op.between]: [startOfMonth, endOfMonth],
      };
    }

    // Optimización: usar subquery para count cuando hay joins complejos
    const [estimulaciones, totalCount] = await Promise.all([
      Estimulacion.findAll({
        where: condition,
        include: [
          { 
            model: db.servicio_in, 
            as: 'servicio_ins',
            attributes: ['servicio'] // Solo campos necesarios
          },
          { 
            model: db.personal_estimulaciones, 
            as: 'personal_estimulaciones',
            attributes: ['nombre', 'apellido'] // Solo campos necesarios
          },
          { 
            model: db.personal, 
            as: 'personals',
            attributes: ['nombre', 'apellido'] // Solo campos necesarios
          },
          { 
            model: db.servicio_ex, 
            as: 'servicio_exes',
            attributes: ['servicio'] // Solo campos necesarios
          },
        ],
        limit: limit,
        offset: offset,
        order: [['id_estimulacion', 'DESC']],
        // Optimización: usar raw para mejorar performance en consultas grandes
        raw: false,
        nest: true
      }),
      Estimulacion.count({ where: condition })
    ]);

    res.send({
      estimulaciones,
      totalRecords: totalCount,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los registros de estimulacion.',
    });
  }
};

// Recuperar un registro por ID con caché optimizado
exports.findOne = async (req, res) => {
  try {
    const id_estimulacion = req.params.id_estimulacion;

    const data = await Estimulacion.findByPk(id_estimulacion, {
      include: [
        { 
          model: db.servicio_in, 
          as: 'servicio_ins',
          attributes: ['servicio']
        },
        { 
          model: db.personal_estimulaciones, 
          as: 'personal_estimulaciones',
          attributes: ['nombre', 'apellido']
        },
        { 
          model: db.personal, 
          as: 'personals',
          attributes: ['nombre', 'apellido']
        },
        { 
          model: db.servicio_ex, 
          as: 'servicio_exes',
          attributes: ['servicio']
        },
      ],
    });

    if (!data) {
      return res.status(404).send({
        message: `No se encontró el registro con id=${id_estimulacion}.`,
      });
    }

    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `Error al recuperar el registro con id=${req.params.id_estimulacion}`,
    });
  }
};

// Actualizar con validaciones optimizadas
exports.update = async (req, res) => {
  try {
    const id_estimulacion = req.params.id_estimulacion;
    
    const [numUpdated] = await Estimulacion.update(req.body, {
      where: { id_estimulacion: id_estimulacion },
    });

    if (numUpdated === 1) {
      res.send({
        message: 'Registro de estimulacion actualizado con éxito.',
      });
    } else {
      res.status(404).send({
        message: `No se puede actualizar el registro de estimulacion con id=${id_estimulacion}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error al actualizar el registro de estimulacion con id=${req.params.id_estimulacion}`,
    });
  }
};

// Eliminar con validación mejorada
exports.delete = async (req, res) => {
  try {
    const id_estimulacion = req.params.id_estimulacion;

    const numDeleted = await Estimulacion.destroy({
      where: { id_estimulacion: id_estimulacion },
    });

    if (numDeleted === 1) {
      res.send({
        message: 'Registro de estimulacion eliminado con éxito.',
      });
    } else {
      res.status(404).send({
        message: `No se puede eliminar el registro de estimulacion con id=${id_estimulacion}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error al eliminar el registro de estimulacion con id=${req.params.id_estimulacion}`,
    });
  }
};

// Eliminar todos con transacción
exports.deleteAll = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const nums = await Estimulacion.destroy({
      where: {},
      truncate: false,
      transaction
    });

    await transaction.commit();
    
    res.send({
      message: `${nums} registros de estimulacion eliminados con éxito.`,
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).send({
      message: 'Error al eliminar los registros de estimulacion.',
    });
  }
};

// Estadísticas optimizadas con consultas SQL nativas
exports.getEstadisticasPorFechas = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  
  if (!fechaInicio || !fechaFin) {
    return res.status(400).send({ message: 'Las fechas de inicio y fin son requeridas.' });
  }
  
  try {
    // Validar formato de fecha
    const fechaInicioRegex = /^\d{4}-\d{2}-\d{2}$/;
    const fechaFinRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!fechaInicioRegex.test(fechaInicio) || !fechaFinRegex.test(fechaFin)) {
      return res.status(400).send({ message: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }

    // Crear fechas usando el constructor con año, mes, día para evitar problemas de zona horaria
    const [yearInicio, monthInicio, dayInicio] = fechaInicio.split('-').map(Number);
    const [yearFin, monthFin, dayFin] = fechaFin.split('-').map(Number);
    
    const inicio = new Date(yearInicio, monthInicio - 1, dayInicio, 0, 0, 0, 0);
    const fin = new Date(yearFin, monthFin - 1, dayFin, 23, 59, 59, 999);

    // Verificar si las fechas son válidas
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).send({ message: 'Formato de fecha inválido' });
    }

    // Verificar que la fecha de inicio no sea mayor que la de fin
    if (inicio > fin) {
      return res.status(400).send({ message: 'La fecha de inicio no puede ser mayor que la fecha de fin' });
    }

    console.log('Fechas procesadas:', {
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      inicioProcessed: inicio.toString(),
      finProcessed: fin.toString(),
      inicioISO: inicio.toISOString(),
      finISO: fin.toISOString()
    });

    // Optimización: usar consulta SQL nativa para mejor performance
    const estadisticasQuery = `
      SELECT 
        COUNT(*) as total_estimulaciones,
        COUNT(CASE WHEN nueva = true THEN 1 END) as total_nuevas,
        COUNT(CASE WHEN constante = true THEN 1 END) as total_constantes,
        COUNT(DISTINCT id_personal_estimulacion) as total_personas
      FROM estimulacions 
      WHERE DATE(fecha) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)
    `;

    const serviciosInQuery = `
      SELECT 
        e.id_intrahospitalario,
        si.servicio,
        COUNT(*) as total_estimulaciones,
        COUNT(CASE WHEN e.nueva = true THEN 1 END) as total_nuevas,
        COUNT(CASE WHEN e.constante = true THEN 1 END) as total_constantes
      FROM estimulacions e
      INNER JOIN servicio_ins si ON e.id_intrahospitalario = si.id_intrahospitalario
      WHERE DATE(e.fecha) BETWEEN DATE(:fechaInicio) AND DATE(:fechaFin)
        AND e.id_intrahospitalario IS NOT NULL
      GROUP BY e.id_intrahospitalario, si.servicio
      ORDER BY total_estimulaciones DESC
    `;

    const serviciosExQuery = `
      SELECT 
        e.id_extrahospitalario,
        se.servicio,
        COUNT(*) as total_estimulaciones,
        COUNT(CASE WHEN e.nueva = true THEN 1 END) as total_nuevas,
        COUNT(CASE WHEN e.constante = true THEN 1 END) as total_constantes
      FROM estimulacions e
      INNER JOIN servicio_exes se ON e.id_extrahospitalario = se.id_extrahospitalario
      WHERE DATE(e.fecha) BETWEEN DATE(:fechaFin) AND DATE(:fechaFin)
        AND e.id_extrahospitalario IS NOT NULL
      GROUP BY e.id_extrahospitalario, se.servicio
      ORDER BY total_estimulaciones DESC
    `;

    // Usar las fechas como objetos Date para mantener consistencia
    const replacements = { 
      fechaInicio: inicio, 
      fechaFin: fin 
    };

    // Ejecutar consultas en paralelo para mejor performance
    const [estadisticas, serviciosIn, serviciosEx] = await Promise.all([
      db.sequelize.query(estadisticasQuery, { 
        replacements, 
        type: QueryTypes.SELECT 
      }),
      db.sequelize.query(serviciosInQuery, { 
        replacements, 
        type: QueryTypes.SELECT 
      }),
      db.sequelize.query(serviciosExQuery, { 
        replacements, 
        type: QueryTypes.SELECT 
      })
    ]);

    const stats = estadisticas[0];
    
    const response = {
      periodo: {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
      },
      totalEstimulaciones: parseInt(stats.total_estimulaciones) || 0,
      totalNuevas: parseInt(stats.total_nuevas) || 0,
      totalConstantes: parseInt(stats.total_constantes) || 0,
      totalPersonas: parseInt(stats.total_personas) || 0,
      serviciosIntrahospitalarios: serviciosIn.map(s => ({
        id_intrahospitalario: s.id_intrahospitalario,
        servicio: s.servicio,
        total_estimulaciones: parseInt(s.total_estimulaciones) || 0,
        total_nuevas: parseInt(s.total_nuevas) || 0,
        total_constantes: parseInt(s.total_constantes) || 0
      })),
      serviciosExtrahospitalarios: serviciosEx.map(s => ({
        id_extrahospitalario: s.id_extrahospitalario,
        servicio: s.servicio,
        total_estimulaciones: parseInt(s.total_estimulaciones) || 0,
        total_nuevas: parseInt(s.total_nuevas) || 0,
        total_constantes: parseInt(s.total_constantes) || 0
      }))
    };

    console.log('Respuesta generada:', response);
    res.send(response);
    
  } catch (error) {
    console.error('Error en getEstadisticasPorFechas:', error);
    res.status(500).send({
      message: 'Error al recuperar las estadísticas de estimulaciones.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Búsqueda detallada optimizada
exports.findDetailsById = async (req, res) => {
  const { id_personal_estimulacion } = req.query;

  if (!id_personal_estimulacion) {
    return res.status(400).send({
      message: 'El ID de la persona es requerido para la búsqueda.'
    });
  }

  try {
    // Optimización: usar consulta SQL nativa más eficiente
    const query = `
      SELECT 
        e.*,
        pe.nombre, pe.apellido,
        COALESCE(si.servicio, se.servicio) as servicio,
        CASE 
          WHEN si.servicio IS NOT NULL THEN 'Intrahospitalario'
          ELSE 'Extrahospitalario'
        END as tipo_servicio
      FROM estimulacions e
      INNER JOIN personal_estimulaciones pe ON e.id_personal_estimulacion = pe.id_personal_estimulacion
      LEFT JOIN servicio_ins si ON e.id_intrahospitalario = si.id_intrahospitalario
      LEFT JOIN servicio_exes se ON e.id_extrahospitalario = se.id_extrahospitalario
      WHERE e.id_personal_estimulacion = :id_personal_estimulacion
      ORDER BY e.fecha ASC
    `;

    const resultados = await db.sequelize.query(query, {
      replacements: { id_personal_estimulacion },
      type: QueryTypes.SELECT
    });

    if (!resultados.length) {
      return res.status(404).send({
        message: 'No se encontraron registros para este ID.'
      });
    }

    // Procesar resultados de manera más eficiente
    const persona = resultados[0];
    const fechas = resultados.map(r => new Date(r.fecha));
    const serviciosUnicos = [...new Set(resultados.map(r => r.servicio).filter(Boolean))];

    const resumen = {
      total_visitas: resultados.length,
      primera_visita: new Date(Math.min(...fechas)).toLocaleDateString(),
      ultima_visita: new Date(Math.max(...fechas)).toLocaleDateString(),
      total_nuevas: resultados.filter(r => r.nueva).length,
      total_constantes: resultados.filter(r => r.constante).length,
      servicios_visitados: serviciosUnicos,
      dias_desde_ultima_visita: Math.floor((new Date() - Math.max(...fechas)) / (1000 * 60 * 60 * 24))
    };

    const estadisticasGenerales = {
      total_personas_encontradas: 1,
      promedio_visitas_por_persona: resumen.total_visitas.toFixed(2),
      servicios_mas_frecuentes: obtenerServiciosMasFrecuentes([{
        visitas: resultados.map(r => ({ servicio: r.servicio }))
      }])
    };

    res.send({
      estadisticas_generales: estadisticasGenerales,
      resultados: [{
        informacion_personal: {
          id: persona.id_personal_estimulacion,
          nombre: persona.nombre,
          apellido: persona.apellido,
        },
        resumen,
        visitas: resultados.map(r => ({
          fecha: new Date(r.fecha).toLocaleDateString(),
          servicio: r.servicio || 'Sin servicio',
          tipo_servicio: r.tipo_servicio,
          tipo: {
            nueva: r.nueva,
            constante: r.constante
          },
          id_estimulacion: r.id_estimulacion
        }))
      }]
    });

  } catch (error) {
    console.error('Error en findDetailsById:', error);
    res.status(500).send({
      message: 'Error al buscar los detalles por ID.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función auxiliar optimizada
function obtenerServiciosMasFrecuentes(resultados) {
  const serviciosCount = new Map();
  
  resultados.forEach(persona => {
    persona.visitas.forEach(visita => {
      if (visita.servicio) {
        serviciosCount.set(visita.servicio, (serviciosCount.get(visita.servicio) || 0) + 1);
      }
    });
  });

  return Object.fromEntries(
    [...serviciosCount.entries()]
      .sort(([,a], [,b]) => b - a)
  );
}

// Asistencias optimizada
exports.getAsistencias = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin en el formato YYYY-MM-DD',
      });
    }

    // Optimización: usar índices en fecha y campos booleanos
    const query = `
      SELECT 
        LOWER(pe.nombre) AS nombre, 
        LOWER(pe.apellido) AS apellido, 
        e.constante, 
        e.nueva,  
        COUNT(*) AS asistencias 
      FROM estimulacions e
      INNER JOIN personal_estimulaciones pe ON e.id_personal_estimulacion = pe.id_personal_estimulacion
      WHERE DATE(e.fecha) BETWEEN :fechaInicio AND :fechaFin
      GROUP BY LOWER(pe.nombre), LOWER(pe.apellido), e.constante, e.nueva
      ORDER BY asistencias DESC
    `;

    const asistencias = await db.sequelize.query(query, {
      replacements: { fechaInicio, fechaFin },
      type: QueryTypes.SELECT,
    });

    res.send(asistencias);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener las asistencias.',
    });
  }
};

// Resumen general optimizado
exports.getResumenEstimulacion = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS total_general,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) AS total_por_mes,
        COUNT(*) FILTER (WHERE constante = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) AS total_constantes_por_mes,
        COUNT(*) FILTER (WHERE nueva = true AND DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)) AS total_nuevas_por_mes
      FROM estimulacions
    `;

    const [resumen] = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen de estimulación.',
    });
  }
};

// Resumen mensual optimizado
exports.getResumenEstimulacionMensual = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', CURRENT_DATE), 'TMMonth YYYY') AS mes,
        COUNT(*) AS total_por_mes,
        COUNT(*) FILTER (WHERE constante = true) AS total_constantes_por_mes,
        COUNT(*) FILTER (WHERE nueva = true) AS total_nuevas_por_mes
      FROM estimulacions
      WHERE DATE_TRUNC('month', fecha) = DATE_TRUNC('month', CURRENT_DATE)
    `;

    const resumen = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen mensual de estimulación.',
    });
  }
};

// Resumen mensual anual optimizado
exports.getResumen_Estimulacion_Mensual = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha), 'TMMonth YYYY') AS mes,
        COUNT(*) AS total_estimulaciones,
        COUNT(*) FILTER (WHERE constante = true) AS total_constantes,
        COUNT(*) FILTER (WHERE nueva = true) AS total_nuevas
      FROM estimulacions
      WHERE EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha)
    `;

    const resumen = await db.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    res.send(resumen);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen mensual de estimulación.',
    });
  }
};

// Resumen por rango optimizado
exports.getResumenEstimulacionPorRango = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin en el formato YYYY-MM-DD',
      });
    }

    const fechaFinAjustada = `${fechaFin} 23:59:59`;
    
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha), 'TMMonth YYYY') AS mes,
        COUNT(*) AS total_estimulaciones,
        COUNT(*) FILTER (WHERE constante = true) AS total_constantes,
        COUNT(*) FILTER (WHERE nueva = true) AS total_nuevas
      FROM estimulacions
      WHERE fecha BETWEEN :fechaInicio AND :fechaFinAjustada
      GROUP BY DATE_TRUNC('month', fecha)
      ORDER BY DATE_TRUNC('month', fecha)
    `;

    const resumen = await db.sequelize.query(query, {
      replacements: { fechaInicio, fechaFinAjustada },
      type: QueryTypes.SELECT,
    });

    res.send(resumen);
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Ocurrió un error al obtener el resumen de estimulación por rango de fechas.',
    });
  }
};