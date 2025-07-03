const db = require('../models');
const TrabajoDePasteurizaciones = db.trabajo_de_pasteurizaciones;
const ControlDeLeche = db.control_de_leches; // Importar el modelo ControlDeLeche

const Sequelize = require('sequelize');
const { Op } = Sequelize;

// Función para calcular los valores derivados
const calcularValoresDerivados = (data) => {
  const {
    crematorio_1_1,
    crematorio_1_2,
    crematorio_2_1,
    crematorio_2_2,
    crematorio_3_1,
    crematorio_3_2
  } = data;

  // Cálculos de los valores derivados
  const total_crematorio_1 = crematorio_1_1 && crematorio_1_2 ? (crematorio_1_1 / crematorio_1_2) * 100 : 0;
  const total_crematorio_2 = crematorio_2_1 && crematorio_2_2 ? (crematorio_2_1 / crematorio_2_2) * 100 : 0;
  const total_crematorio_3 = crematorio_3_1 && crematorio_3_2 ? (crematorio_3_1 / crematorio_3_2) * 100 : 0;

  const porcentaje_crema = (total_crematorio_1 + total_crematorio_2 + total_crematorio_3) / 3;
  const kcal_l = (porcentaje_crema * 66.8) + 290;
  const kcal_onz = (kcal_l * 30) / 1000;
  const porcentaje_grasa = (porcentaje_crema - 0.59) / 1.46;

  return {
    total_crematorio_1,
    total_crematorio_2,
    total_crematorio_3,
    porcentaje_crema,
    kcal_l,
    kcal_onz,
    porcentaje_grasa
  };
};

// Crear y guardar un nuevo registro en trabajo_de_pasteurizaciones
exports.create = async (req, res) => {
  try {
    const {
      fecha,
      no_frasco,
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez
    } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!fecha || !no_frasco || typeof crematorio_1_1 === 'undefined' || typeof crematorio_1_2 === 'undefined' ||
        typeof crematorio_2_1 === 'undefined' || typeof crematorio_2_2 === 'undefined' ||
        typeof crematorio_3_1 === 'undefined' || typeof crematorio_3_2 === 'undefined' || typeof acidez === 'undefined') {
      return res.status(400).send({
        message: 'Todos los campos son obligatorios.',
      });
    }

    // Calcular los valores derivados
    const valoresCalculados = calcularValoresDerivados({
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez
    });

    // Formatear la fecha a solo la parte de la fecha (sin la hora)
    const [year, month, day] = fecha.split('-');
    const fechaSolo = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    fechaSolo.setHours(12, 0, 0, 0); // Configurar al mediodía para evitar problemas de zona horaria

    // Buscar el último registro del día para obtener el número secuencial
    // MODIFICADO: Solo buscar entre registros con estado = true
    const lastRecord = await TrabajoDePasteurizaciones.findOne({
      where: {
        fecha: {
          [Op.eq]: fechaSolo // Busca solo registros de la fecha específica
        },
        estado: true // Solo contar registros disponibles
      },
      order: [['numero', 'DESC']],
    });

    // Calcular el nuevo número secuencial
    let numero = 1;
    if (lastRecord) {
      numero = lastRecord.numero + 1; // Incrementa el número del último registro
    }

    // Crear un registro en trabajo_de_pasteurizaciones
    const newRecord = await TrabajoDePasteurizaciones.create({
      fecha: fechaSolo, // Guardar la fecha formateada
      numero, // Asignar el número calculado
      no_frasco,
      crematorio_1_1,
      crematorio_1_2,
      crematorio_2_1,
      crematorio_2_2,
      crematorio_3_1,
      crematorio_3_2,
      acidez,
      estado: true, // Por defecto true (disponible)
      ...valoresCalculados // Se agregan los valores calculados
    });

    res.send(newRecord);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al crear el registro en trabajo_de_pasteurizaciones.',
    });
  }
};

// MODIFICADO: Recuperar todos los registros con estado = true
exports.findAll = (req, res) => {
  // Establecer valores predeterminados para page y pageSize
  const { page = 1, pageSize } = req.query;
  const mesActual = req.query.mesActual === 'true';  

  let condition = {
    
  };
  
  // Filtrar por mes actual si se solicita
  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth],
    };
  }
  
  // Configurar las opciones de consulta con paginación opcional
  const limit = pageSize ? parseInt(pageSize, 10) : null;
  const offset = limit ? (page - 1) * limit : null;

  const queryOptions = {
    where: condition,
    order: [['id_pasteurizacion', 'DESC']],
    ...(limit ? { limit, offset } : {}), // Solo aplica límite y offset si están presentes
  };
  
  // Usar findAndCountAll para obtener los datos y el total de registros
  TrabajoDePasteurizaciones.findAndCountAll(queryOptions)
    .then(result => {
      const totalPages = limit ? Math.ceil(result.count / limit) : 1; // Total de páginas
      const currentPage = parseInt(page, 10); // Página actual
      
      res.send({
        pasteurizaciones: result.rows,  // Registros actuales
        totalRecords: result.count,     // Número total de registros
        currentPage: currentPage,       // Página actual
        totalPages: totalPages,         // Total de páginas
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros de trabajo_de_pasteurizaciones.',
      });
    });
};

// MODIFICADO: Recuperar un registro por ID solo si estado = true
exports.findOne = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;

  TrabajoDePasteurizaciones.findOne({
    where: {
      id_pasteurizacion: id_pasteurizacion,
      estado: true // Solo si está disponible
    }
  })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `No se encontró el registro disponible con id=${id_pasteurizacion}.`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al recuperar el registro con id=${id_pasteurizacion}.`,
      });
    });
};

// Actualizar un registro de trabajo_de_pasteurizaciones por su ID
exports.update = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;
  const requestData = {...req.body};
  
  // Fix the date issue if fecha is provided
  if (requestData.fecha) {
    const fechaSolo = new Date(requestData.fecha + 'T12:00:00');
    requestData.fecha = fechaSolo;
  }

  // Calcular los valores derivados
  const valoresCalculados = calcularValoresDerivados(requestData);

  TrabajoDePasteurizaciones.update(
    { ...requestData, ...valoresCalculados },
    { 
      where: { 
        id_pasteurizacion: id_pasteurizacion,
        estado: true // Solo actualizar si está disponible
      } 
    }
  )
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de trabajo_de_pasteurizaciones actualizado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede actualizar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion} o el registro no está disponible.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al actualizar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
      });
    });
};

// NUEVA FUNCIÓN: Para cambiar estado a false (uso interno)
exports.cambiarEstadoAFalse = async (id_pasteurizacion) => {
  try {
    const result = await TrabajoDePasteurizaciones.update(
      { estado: false },
      { 
        where: { 
          id_pasteurizacion: id_pasteurizacion,
          estado: true 
        } 
      }
    );
    return result[0] > 0; // Retorna true si se actualizó al menos un registro
  } catch (error) {
    console.error('Error al cambiar estado de pasteurización:', error);
    throw error;
  }
};
// Búsqueda optimizada por número de frasco para grandes volúmenes de datos
exports.findByFrasco = (req, res) => {
  const no_frasco = req.query.no_frasco;
  
  if (!no_frasco) {
    return res.status(400).send({
      message: 'El parámetro no_frasco es requerido.'
    });
  }

  // Búsqueda exacta o con comodín
  const searchPattern = req.query.exact === 'true' 
    ? no_frasco 
    : `%${no_frasco}%`;

  // Condición base - solo registros disponibles por defecto
  const condition = {
    no_frasco: { [Op.like]: searchPattern },
    estado: true // Solo registros disponibles por defecto
  };

  // Filtro opcional de estado
  if (req.query.estado !== undefined) {
    condition.estado = req.query.estado === 'true' || req.query.estado === true;
  }

  // Paginación optimizada para grandes volúmenes
  const page = parseInt(req.query.page) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 100); // Límite máximo de 100
  const offset = (page - 1) * pageSize;

  // Configuración de consulta optimizada
  const queryOptions = {
    attributes: ['id_pasteurizacion', 'no_frasco'], // Solo campos necesarios
    where: condition,
    order: [['id_pasteurizacion', 'DESC']], // Ordenar por ID para mejor rendimiento
    limit: pageSize,
    offset: offset,
    raw: true, // Para mejor rendimiento, devuelve objetos planos
    benchmark: true // Para medir tiempo de ejecución en desarrollo
  };

  // Ejecutar búsqueda con conteo optimizado
  Promise.all([
    // Búsqueda de registros
    TrabajoDePasteurizaciones.findAll(queryOptions),
    // Conteo total (solo si es necesario para paginación)
    req.query.includeCount === 'true' ? 
      TrabajoDePasteurizaciones.count({ where: condition }) : 
      Promise.resolve(null)
  ])
  .then(([rows, totalCount]) => {
    // Respuesta optimizada
    const response = {
      pasteurizaciones: rows,
      currentPage: page,
      pageSize: pageSize,
      searchTerm: no_frasco,
      searchType: req.query.exact === 'true' ? 'exacta' : 'parcial',
      hasMore: rows.length === pageSize // Indica si hay más registros
    };

    // Solo incluir información de conteo si se solicita
    if (totalCount !== null) {
      response.totalRecords = totalCount;
      response.totalPages = Math.ceil(totalCount / pageSize);
    }

    res.send(response);
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || 'Error al buscar por número de frasco.',
    });
  });
};
// Eliminar un registro de trabajo_de_pasteurizaciones por su ID
exports.delete = (req, res) => {
  const id_pasteurizacion = req.params.id_pasteurizacion;

  TrabajoDePasteurizaciones.destroy({
    where: { id_pasteurizacion: id_pasteurizacion },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: 'Registro de trabajo_de_pasteurizaciones eliminado con éxito.',
        });
      } else {
        res.send({
          message: `No se puede eliminar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error al eliminar el registro de trabajo_de_pasteurizaciones con id=${id_pasteurizacion}.`,
      });
    });
};

// Eliminar todos los registros de trabajo_de_pasteurizaciones de la base de datos
exports.deleteAll = (req, res) => {
  TrabajoDePasteurizaciones.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} registros de trabajo_de_pasteurizaciones eliminados con éxito.`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: 'Error al eliminar los registros de trabajo_de_pasteurizaciones.',
      });
    });
};

// Obtener estadísticas de pasteurización entre fechas
exports.getStatsByDateRange = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Validar que se proporcionaron ambas fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({
        message: 'Se requieren fechaInicio y fechaFin para la consulta',
      });
    }
    
    // Convertir las fechas manteniendo la fecha exacta y asegurando el rango de tiempo correcto
    const startDate = new Date(`${fechaInicio}T12:00:00`);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(`${fechaFin}T12:00:00`);
    endDate.setHours(23, 59, 59, 999);

    // Realizar la consulta con Sequelize
    const results = await TrabajoDePasteurizaciones.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('kcal_l')), 'promedio_kcal_l'],
        [Sequelize.fn('SUM', Sequelize.col('acidez')), 'total_acidez'],
        [Sequelize.fn('COUNT', Sequelize.col('id_pasteurizacion')), 'total_registros']
      ],
      where: {
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Si no hay resultados, devolver valores en cero
    if (!results) {
      return res.send({
        promedio_kcal_l: 0,
        total_acidez: 0,
        total_registros: 0
        
      });
    }

    // Formatear los resultados
    const stats = {
      promedio_kcal_l: Number(results.getDataValue('promedio_kcal_l') || 0).toFixed(2),
      total_acidez: Number(results.getDataValue('total_acidez') || 0).toFixed(2),
      total_registros: Number(results.getDataValue('total_registros') || 0),
     
    };

    res.send(stats);

  } catch (err) {
    res.status(500).send({
      message: err.message || 'Error al obtener las estadísticas de pasteurización.',
      error: err
    });
  }
};

exports.getStates = async (req, res) => {
  try {
    // Obtener fechas del año actual
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 de enero del año actual
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 de diciembre del año actual

    // Realizar la consulta agrupada por mes con Sequelize
    // Usando EXTRACT(MONTH FROM fecha) para PostgreSQL en lugar de MONTH()
    const results = await TrabajoDePasteurizaciones.findAll({
      attributes: [
        [Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM fecha')), 'mes_numero'],
        [Sequelize.fn('AVG', Sequelize.col('kcal_l')), 'promedio_kcal_l'],
        [Sequelize.fn('SUM', Sequelize.col('acidez')), 'total_acidez'],
        [Sequelize.fn('COUNT', Sequelize.col('id_pasteurizacion')), 'total_registros'],
      ],
      where: {
        fecha: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      group: [Sequelize.literal('EXTRACT(MONTH FROM fecha)')],
      order: [[Sequelize.literal('mes_numero'), 'ASC']],
    });

    // Crear un array para contener todos los meses (incluso los que no tienen datos)
    const mesesCompletos = [];
    const añoActual = now.getFullYear();
    
    // Llenar el array con todos los meses hasta el mes actual
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(añoActual, i, 1);
      const nombreMes = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
      }).format(fecha);
      
      // Buscar si hay resultados para este mes
      const datosMes = results.find(r => Math.round(parseFloat(r.getDataValue('mes_numero'))) === (i + 1));
      
      // Añadir los datos del mes, o valores en cero si no hay datos
      mesesCompletos.push({
        mes: nombreMes,
        mes_numero: i + 1,
        promedio_kcal_l: datosMes 
          ? Number(datosMes.getDataValue('promedio_kcal_l') || 0).toFixed(2) 
          : "0.00",
        total_acidez: datosMes 
          ? Number(datosMes.getDataValue('total_acidez') || 0).toFixed(2) 
          : "0.00",
        total_registros: datosMes 
          ? Number(datosMes.getDataValue('total_registros') || 0) 
          : 0
      });
    }

    // Solo incluir meses hasta el actual (para no mostrar meses futuros)
    const mesActual = now.getMonth(); // 0-indexed (enero es 0)
    const resultadosFinal = mesesCompletos.filter(mes => mes.mes_numero <= (mesActual + 1));
    
    res.send(resultadosFinal);
  } catch (err) {
    console.error('Error detallado:', err);
    res.status(500).send({
      message: err.message || 'Error al obtener las estadísticas de pasteurización.',
      error: err,
    });
  }
};
exports.findAvailable = (req, res) => {
  const { page = 1, pageSize } = req.query; // Valores predeterminados de paginación
  const mesActual = req.query.mesActual === 'true'; // Filtro por mes actual

  let condition = {}; // Condiciones básicas

  // Filtrar por mes actual si se solicita
  if (mesActual) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    condition.fecha = {
      [Op.between]: [startOfMonth, endOfMonth],
    };
  }

  // Configurar opciones de paginación
  const limit = pageSize ? parseInt(pageSize, 10) : null;
  const offset = limit ? (page - 1) * limit : null;

  // Subconsulta para identificar los frascos ya utilizados en ControlDeLeche
  const usedFrascosSubquery = {
    model: ControlDeLeche,
    attributes: ['id_pasteurizacion'], // Sólo necesitamos el ID de pasteurización
  };

  // Consulta principal
  TrabajoDePasteurizaciones.findAndCountAll({
    where: {
      ...condition,
      id_pasteurizacion: {
        [Op.notIn]: Sequelize.literal(
          `(SELECT id_pasteurizacion FROM control_de_leches)`
        ),
      },
    },
    order: [['id_pasteurizacion', 'DESC']],
    ...(limit ? { limit, offset } : {}), // Paginación opcional
  })
    .then(result => {
      const totalPages = limit ? Math.ceil(result.count / limit) : 1; // Total de páginas
      const currentPage = parseInt(page, 10); // Página actual
      
      res.send({
        pasteurizaciones: result.rows,  // Registros actuales
        totalRecords: result.count,     // Número total de registros
        currentPage: currentPage,       // Página actual
        totalPages: totalPages,         // Total de páginas
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || 'Ocurrió un error al recuperar los registros disponibles de trabajo_de_pasteurizaciones.',
      });
    });
};
