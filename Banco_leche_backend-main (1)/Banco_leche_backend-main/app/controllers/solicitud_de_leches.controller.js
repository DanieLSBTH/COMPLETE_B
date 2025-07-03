const db = require('../models');
const SolicitudDeLeches = db.solicitud_de_leches;
const ControlDeLeche = db.control_de_leches;
const RegistroMedico = db.registro_medicos;
const TrabajoDePasteurizacion = db.trabajo_de_pasteurizaciones;
const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const sequelize = db.sequelize;
const Op = Sequelize.Op;

exports.create = async (req, res) => {
  // Extraer los datos del cuerpo
  const {
    id_registro_medico,
    fecha_nacimiento,
    edad_de_ingreso,
    tipo_paciente,
    peso_al_nacer,
    peso_actual,
    kcal_o,
    volumen_toma_cc,
    numero_tomas,
    total_vol_solicitado,
    id_control_leche,
    servicio,
    fecha_entrega,
    solicita
  } = req.body;

  try {
    // Validación simple
    if (!id_registro_medico || !fecha_nacimiento || !edad_de_ingreso || !tipo_paciente || 
        !peso_al_nacer || !peso_actual || !kcal_o || !volumen_toma_cc || !numero_tomas || 
        !total_vol_solicitado || !id_control_leche || !servicio || !fecha_entrega || !solicita) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Verificar que existe el registro médico
    const registroMedico = await RegistroMedico.findByPk(id_registro_medico);
    if (!registroMedico) {
      return res.status(404).json({ message: "No se encontró el registro médico asociado." });
    }

    // Obtener volumen_ml_onza desde control_de_leches usando id_control_leche
    // Y verificar que esté disponible (estado = true)
    const controlLeche = await ControlDeLeche.findByPk(id_control_leche, {
      attributes: ['volumen_ml_onza', 'estado']
    });

    if (!controlLeche) {
      return res.status(404).json({ message: "No se encontró el control de leche asociado." });
    }

    // Verificar que el control de leche esté disponible
    if (!controlLeche.estado) {
      return res.status(400).json({ message: "El control de leche seleccionado no está disponible." });
    }

    const { volumen_ml_onza } = controlLeche;
    if (!volumen_ml_onza) {
      return res.status(400).json({ message: "El control de leche no tiene un volumen definido." });
    }

    // Calcular onzas, litros y costos
    const onzas = parseFloat((controlLeche.volumen_ml_onza / 30).toFixed(2));
    // Calcular litros y costos
    const litros = onzas * 0.03;
    const costos = onzas * 3.49;

    // Crear la solicitud
    const nuevaSolicitud = await SolicitudDeLeches.create({
      id_registro_medico,
      fecha_nacimiento,
      edad_de_ingreso,
      tipo_paciente,
      peso_al_nacer,
      peso_actual,
      kcal_o,
      volumen_toma_cc,
      numero_tomas,
      total_vol_solicitado,
      id_control_leche,
      servicio,
      fecha_entrega,
      solicita,
      onzas,
      litros,
      costos
    });

    // ACTUALIZAR EL ESTADO DEL CONTROL DE LECHE A FALSE (NO DISPONIBLE)
    await ControlDeLeche.update(
      { estado: false },
      { where: { id_control_leche: id_control_leche } }
    );

    res.status(201).json({
      message: "Solicitud creada exitosamente. El control de leche ha sido marcado como no disponible.",
      solicitud: nuevaSolicitud
    });
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    res.status(500).json({ message: "Error al crear la solicitud." });
  }
};

// Recuperar todos los registros de solicitud_de_leches de la base de datos con paginación
exports.findAll = async (req, res) => {
  // Obtener los parámetros de paginación de los query params
  const { page = 1, pageSize = 10 } = req.query; // Valores predeterminados: página 1, 10 registros por página
  const id_control_leche = req.query.id_control_leche;
  const tipo_paciente = req.query.tipo_paciente;
  const id_registro_medico = req.query.id_registro_medico;

  // Calcular el desplazamiento y el límite
  const offset = (page - 1) * pageSize; // Desplazamiento
  const limit = parseInt(pageSize, 10); // Límite de registros por página

  // Inicializar la condición de búsqueda
  let condition = {};

  // Filtros condicionales
  if (id_control_leche) {
    condition.id_control_leche = { [Op.eq]: id_control_leche };
  }

  if (tipo_paciente) {
    condition.tipo_paciente = { [Op.like]: `%${tipo_paciente}%` };
  }

  if (id_registro_medico) {
    condition.id_registro_medico = { [Op.eq]: id_registro_medico };
  }

  try {
    // Usar findAndCountAll para obtener los datos paginados y el total de registros
    const result = await SolicitudDeLeches.findAndCountAll({
      where: condition,
      include: [
        {
          model: ControlDeLeche,
          as: 'control_de_leches',
          attributes: ['no_frascoregistro','fecha_almacenamiento', 'volumen_ml_onza'],
          include: [
            {
              model: db.trabajo_de_pasteurizaciones,
              as: 'trabajo_de_pasteurizaciones',
              attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez']
            }
          ]
        },
        {
          model: RegistroMedico,
          as: 'registro_medicos',
          attributes: ['registro_medico', 'recien_nacido'] // Incluye los campos que necesites
        }
      ],
      limit: limit,      // Límite por página
      offset: offset,    // Desplazamiento según la página actual
      order: [['id_solicitud', 'DESC']] // Ordenar por id_solicitud en orden descendente
    });

    // Responder con los datos paginados y el total de registros
    res.send({
      solicitudes: result.rows,       // Registros actuales
      totalRecords: result.count,     // Número total de registros
      currentPage: parseInt(page, 10), // Página actual
      totalPages: Math.ceil(result.count / limit) // Total de páginas
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Ocurrió un error al recuperar los registros de solicitud_de_leches.'
    });
  }
};

// Recuperar un registro de solicitud_de_leches por su ID
exports.findOne = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  try {
    const solicitud = await SolicitudDeLeches.findByPk(id_solicitud, {
      include: [
        {
          model: ControlDeLeche,
          as: 'control_de_leches',
          attributes: ['fecha_almacenamiento','volumen_ml_onza'],
          include: [
            {
              model: db.trabajo_de_pasteurizaciones,
              as: 'trabajo_de_pasteurizaciones',
              attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez']
            }
          ]
        },
        {
          model: RegistroMedico,
          as: 'registro_medicos',
          attributes: ['registro_medico', 'recien_nacido'] // Incluye los campos que necesites
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).send({
        message: `No se encontró el registro con id=${id_solicitud}.`
      });
    }

    res.send(solicitud);
  } catch (err) {
    res.status(500).send({
      message: `Error al recuperar el registro con id=${id_solicitud}.`
    });
  }
};

// Actualizar un registro de solicitud_de_leches por su ID
exports.update = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  try {
    // Buscar la solicitud existente
    const solicitud = await SolicitudDeLeches.findByPk(id_solicitud);

    if (!solicitud) {
      return res.status(404).send({
        message: `No se encontró el registro con id=${id_solicitud}.`
      });
    }

    // Si se envía un nuevo id_registro_medico, verificar que existe
    if (req.body.id_registro_medico && req.body.id_registro_medico !== solicitud.id_registro_medico) {
      const registroMedico = await RegistroMedico.findByPk(req.body.id_registro_medico);
      if (!registroMedico) {
        return res.status(404).json({ message: "No se encontró el registro médico asociado." });
      }
    }

    // Verificar si se cambió el id_control_leche
    const nuevo_id_control_leche = req.body.id_control_leche;
    const id_control_anterior = solicitud.id_control_leche;

    if (nuevo_id_control_leche && nuevo_id_control_leche !== id_control_anterior) {
      // Marcar el control de leche anterior como disponible nuevamente
      await ControlDeLeche.update(
        { estado: true },
        { where: { id_control_leche: id_control_anterior } }
      );

      // Verificar que el nuevo control exista y esté disponible
      const nuevoControl = await ControlDeLeche.findByPk(nuevo_id_control_leche, {
        attributes: ['volumen_ml_onza', 'estado']
      });

      if (!nuevoControl) {
        return res.status(404).json({ message: "No se encontró el nuevo control de leche." });
      }

      if (!nuevoControl.estado) {
        return res.status(400).json({ message: "El nuevo control de leche no está disponible." });
      }

      // Marcar el nuevo control como NO disponible
      await ControlDeLeche.update(
        { estado: false },
        { where: { id_control_leche: nuevo_id_control_leche } }
      );

      // Usar volumen del nuevo control
      req.body.onzas = parseFloat((nuevoControl.volumen_ml_onza / 30).toFixed(2));
    } else {
      // Si no cambió, usar el mismo volumen
      const controlActual = await ControlDeLeche.findByPk(id_control_anterior, {
        attributes: ['volumen_ml_onza']
      });

      if (!controlActual || !controlActual.volumen_ml_onza) {
        return res.status(400).json({ message: "El control de leche original no tiene volumen válido." });
      }

      req.body.onzas = parseFloat((controlActual.volumen_ml_onza / 30).toFixed(2));
    }

    // Calcular litros y costos
    req.body.litros = parseFloat((req.body.onzas * 0.03).toFixed(2));
    req.body.costos = parseFloat((req.body.onzas * 3.49).toFixed(2));

    // Actualizar la solicitud
    const [updated] = await SolicitudDeLeches.update(req.body, {
      where: { id_solicitud }
    });

    if (updated) {
      const updatedSolicitud = await SolicitudDeLeches.findByPk(id_solicitud);
      return res.send({
        message: 'Registro de solicitud_de_leches actualizado con éxito.',
        data: updatedSolicitud
      });
    }

    res.status(400).send({
      message: `No se pudo actualizar el registro con id=${id_solicitud}.`
    });

  } catch (err) {
    console.error("Error al actualizar:", err);
    res.status(500).send({
      message: `Error al actualizar el registro con id=${id_solicitud}.`
    });
  }
};


// Eliminar un registro de solicitud_de_leches por su ID
exports.delete = async (req, res) => {
  const id_solicitud = req.params.id_solicitud;

  try {
    const deleted = await SolicitudDeLeches.destroy({
      where: { id_solicitud: id_solicitud }
    });

    if (deleted) {
      return res.send({
        message: 'Registro de solicitud_de_leches eliminado con éxito.'
      });
    }

    res.send({
      message: `No se puede eliminar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  } catch (err) {
    res.status(500).send({
      message: `Error al eliminar el registro de solicitud_de_leches con id=${id_solicitud}.`
    });
  }
};

// Eliminar todos los registros de solicitud_de_leches de la base de datos
exports.deleteAll = async (req, res) => {
  try {
    const numDeleted = await SolicitudDeLeches.destroy({
      where: {},
      truncate: false
    });

    res.send({
      message: `${numDeleted} registros de solicitud_de_leches eliminados con éxito.`
    });
  } catch (err) {
    res.status(500).send({
      message: 'Error al eliminar los registros de solicitud_de_leches.'
    });
  }
};
// Búsqueda avanzada optimizada para grandes volúmenes de datos
// Búsqueda avanzada optimizada para solicitudes de leche
// Obtener información detallada de un registro médico específico con todas sus solicitudes
exports.getRegistroDetallado = async (req, res) => {
  const registro = req.params.registro;

  // Validación del parámetro
  if (!registro || registro.trim().length === 0) {
    return res.status(400).send({
      message: 'El parámetro registro es obligatorio.'
    });
  }

  try {
    // Buscar el registro médico exacto
    const registroMedico = await RegistroMedico.findOne({
      where: { 
        registro_medico: registro.trim() 
      },
      attributes: ['id_registro_medico', 'registro_medico', 'recien_nacido'],
      raw: false
    });

    if (!registroMedico) {
      return res.status(404).send({
        message: `No se encontró el registro médico: ${registro}`
      });
    }

    // Buscar todas las solicitudes de leche para este registro médico
    const solicitudes = await SolicitudDeLeches.findAll({
      where: { 
        id_registro_medico: registroMedico.id_registro_medico 
      },
      include: [
        {
          model: ControlDeLeche,
          as: 'control_de_leches',
          attributes: ['no_frascoregistro', 'fecha_almacenamiento', 'volumen_ml_onza'],
          include: [
            {
              model: db.trabajo_de_pasteurizaciones,
              as: 'trabajo_de_pasteurizaciones',
              attributes: ['no_frasco', 'kcal_l', 'porcentaje_grasa', 'acidez']
            }
          ]
        }
      ],
      order: [['fecha_entrega', 'DESC']]
    });

    // Calcular totales y estadísticas con validación de valores nulos
    const estadisticas = {
      total_solicitudes: solicitudes.length,
      total_frascos: solicitudes.length, // Cada solicitud usa un frasco
      total_onzas: solicitudes.reduce((sum, sol) => sum + (parseFloat(sol.onzas) || 0), 0),
      total_litros: solicitudes.reduce((sum, sol) => sum + (parseFloat(sol.litros) || 0), 0),
      total_costos: solicitudes.reduce((sum, sol) => sum + (parseFloat(sol.costos) || 0), 0),
      total_volumen_solicitado: solicitudes.reduce((sum, sol) => sum + (parseFloat(sol.total_vol_solicitado) || 0), 0),
      tipos_paciente: [...new Set(solicitudes.map(sol => sol.tipo_paciente).filter(Boolean))],
      servicios: [...new Set(solicitudes.map(sol => sol.servicio).filter(Boolean))],
      solicitantes: [...new Set(solicitudes.map(sol => sol.solicita).filter(Boolean))],
      rango_fechas: {
        primera_entrega: solicitudes.length > 0 ? 
          Math.min(...solicitudes.map(sol => new Date(sol.fecha_entrega).getTime())) : null,
        ultima_entrega: solicitudes.length > 0 ? 
          Math.max(...solicitudes.map(sol => new Date(sol.fecha_entrega).getTime())) : null
      }
    };

    // Formatear las fechas
    if (estadisticas.rango_fechas.primera_entrega) {
      estadisticas.rango_fechas.primera_entrega = new Date(estadisticas.rango_fechas.primera_entrega).toISOString().split('T')[0];
    }
    if (estadisticas.rango_fechas.ultima_entrega) {
      estadisticas.rango_fechas.ultima_entrega = new Date(estadisticas.rango_fechas.ultima_entrega).toISOString().split('T')[0];
    }

    // Formatear solicitudes para mostrar información relevante
    const solicitudesDetalladas = solicitudes.map(solicitud => ({
      id_solicitud: solicitud.id_solicitud,
      fecha_nacimiento: solicitud.fecha_nacimiento,
      edad_de_ingreso: solicitud.edad_de_ingreso,
      tipo_paciente: solicitud.tipo_paciente,
      peso_al_nacer: solicitud.peso_al_nacer,
      peso_actual: solicitud.peso_actual,
      kcal_o: solicitud.kcal_o,
      volumen_toma_cc: solicitud.volumen_toma_cc,
      numero_tomas: solicitud.numero_tomas,
      total_vol_solicitado: solicitud.total_vol_solicitado,
      servicio: solicitud.servicio,
      fecha_entrega: solicitud.fecha_entrega,
      solicita: solicitud.solicita,
      onzas: solicitud.onzas,
      litros: solicitud.litros,
      costos: solicitud.costos,
      frasco_info: {
        no_frascoregistro: solicitud.control_de_leches?.no_frascoregistro,
        fecha_almacenamiento: solicitud.control_de_leches?.fecha_almacenamiento,
        volumen_ml_onza: solicitud.control_de_leches?.volumen_ml_onza,
        no_frasco_pasteurizacion: solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.no_frasco,
        kcal_l: solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.kcal_l,
        porcentaje_grasa: solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.porcentaje_grasa,
        acidez: solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.acidez
      }
    }));

    // Respuesta completa con validación de números
    res.send({
      registro_medico: {
        id_registro_medico: registroMedico.id_registro_medico,
        registro_medico: registroMedico.registro_medico,
        recien_nacido: registroMedico.recien_nacido
      },
      estadisticas: {
        ...estadisticas,
        total_onzas: parseFloat(estadisticas.total_onzas.toFixed(2)),
        total_litros: parseFloat(estadisticas.total_litros.toFixed(2)),
        total_costos: parseFloat(estadisticas.total_costos.toFixed(2)),
        total_volumen_solicitado: parseFloat(estadisticas.total_volumen_solicitado.toFixed(2))
      },
      solicitudes: solicitudesDetalladas,
      resumen: {
        mensaje: `El registro médico ${registro} tiene ${estadisticas.total_solicitudes} solicitud(es) de leche`,
        total_frascos_utilizados: estadisticas.total_frascos,
        total_onzas_entregadas: parseFloat(estadisticas.total_onzas.toFixed(2)),
        costo_total: parseFloat(estadisticas.total_costos.toFixed(2))
      }
    });

  } catch (err) {
    console.error('Error en getRegistroDetallado:', err);
    res.status(500).send({
      message: err.message || 'Error al obtener los detalles del registro médico.',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
};
exports.getResumenPorMes = async (req, res) => {
  try {
    // Obtén todas las solicitudes de leche agrupadas por mes
    const solicitudes = await SolicitudDeLeches.findAll({
      attributes: [
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'mes'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'año'],
        [Sequelize.fn('COUNT', Sequelize.col('id_solicitud')), 'totalSolicitudes'], // Total de solicitudes
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('id_registro_medico'))), 'totalBeneficiados'], // IDs únicos
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'totalLitrosDistribuidos']
      ],
      group: ['mes', 'año'],
      order: [[Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'ASC'], [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'ASC']]
    });

    // Obtener totales generales
    const totalesGenerales = await SolicitudDeLeches.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id_solicitud')), 'totalSolicitudesGeneral'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('id_registro_medico'))), 'totalBeneficiadosGeneral'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'totalLitrosGeneral']
      ]
    });

    const { totalSolicitudesGeneral, totalBeneficiadosGeneral, totalLitrosGeneral } = totalesGenerales[0].dataValues;

    // Inicializar variables para el resumen
    let totalBeneficiados = 0;
    let totalLitrosDistribuidos = 0;
    let totalSolicitudes = 0;
    
    // Crear el objeto final que va a contener el resumen
    const asistencia = [];
    
    // Recorrer las solicitudes agrupadas por mes
    solicitudes.forEach(solicitud => {
      const mes = solicitud.get('mes');
      const año = solicitud.get('año');
      const totalMesSolicitudes = solicitud.get('totalSolicitudes');
      const totalMesBeneficiados = solicitud.get('totalBeneficiados');
      const totalMesLitros = solicitud.get('totalLitrosDistribuidos');
      
      // Sumar al total acumulado
      totalSolicitudes += parseInt(totalMesSolicitudes);
      totalBeneficiados += parseInt(totalMesBeneficiados);
      totalLitrosDistribuidos += parseFloat(totalMesLitros);
      
      // Obtener el nombre del mes
      const nombreDelMes = nombreMes(mes) + ` ${año}`;
      
      // Añadir los datos al arreglo
      asistencia.push({
        tipo: "total solicitudes registradas",
        [nombreDelMes]: totalMesSolicitudes,
        total: totalSolicitudesGeneral,
        promedio: "100%"
      });
      
      asistencia.push({
        tipo: "recien nacidos beneficiados",
        [nombreDelMes]: totalMesBeneficiados,
        total: totalBeneficiadosGeneral,
        promedio: "100%"
      });
      
      asistencia.push({
        tipo: "leche distribuida litros",
        [nombreDelMes]: totalMesLitros,
        total: totalLitrosGeneral,
        promedio: "100%"
      });
    });
    
    // Enviar la respuesta en formato JSON con información adicional
    res.json({ 
      asistencia,
      resumen: {
        totalSolicitudesRegistradas: totalSolicitudesGeneral,
        totalBeneficiariosUnicos: totalBeneficiadosGeneral,
        totalLitrosDistribuidos: totalLitrosGeneral
      }
    });
  } catch (error) {
    console.error("Error al obtener el resumen por mes:", error);
    res.status(500).json({
      message: "Ocurrió un error al obtener el resumen por mes."
    });
  }
};

exports.getResumenPorServicioYFechas = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  try {
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        message: "Las fechas de inicio y fin son obligatorias." 
      });
    }

    // Consulta principal: obtener datos agrupados por servicio y mes
    const solicitudesPorServicioYMes = await SolicitudDeLeches.findAll({
      attributes: [
        'servicio',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_solicitudes'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('id_registro_medico'))), 'registros_unicos'],
        [Sequelize.fn('SUM', Sequelize.col('onzas')), 'total_onzas'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'total_litros'],
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'mes'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'año']
      ],
      where: {
        fecha_entrega: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin]
        }
      },
      group: ['servicio', 'mes', 'año'],
      order: [
        ['servicio', 'ASC'],
        [Sequelize.literal('EXTRACT(YEAR FROM "fecha_entrega")'), 'ASC'],
        [Sequelize.literal('EXTRACT(MONTH FROM "fecha_entrega")'), 'ASC']
      ],
      raw: true
    });

    // Consulta para totales por servicio (registros únicos por servicio)
    const totalesPorServicio = await SolicitudDeLeches.findAll({
      attributes: [
        'servicio',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_solicitudes'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('id_registro_medico'))), 'registros_unicos'],
        [Sequelize.fn('SUM', Sequelize.col('onzas')), 'total_onzas'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'total_litros']
      ],
      where: {
        fecha_entrega: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin]
        }
      },
      group: ['servicio'],
      order: [['servicio', 'ASC']],
      raw: true
    });

    // Consulta para total general (registros únicos globales)
    const totalGeneral = await SolicitudDeLeches.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'total_solicitudes'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('id_registro_medico'))), 'registros_unicos'],
        [Sequelize.fn('SUM', Sequelize.col('onzas')), 'total_onzas'],
        [Sequelize.fn('SUM', Sequelize.col('litros')), 'total_litros']
      ],
      where: {
        fecha_entrega: {
          [Sequelize.Op.between]: [fechaInicio, fechaFin]
        }
      },
      raw: true
    });

    // Procesar datos para construir la respuesta
    const asistencia = {};

    // Inicializar estructura con totales por servicio
    totalesPorServicio.forEach(servicio => {
      const nombre_servicio = servicio.servicio;
      asistencia[nombre_servicio] = {
        totalSolicitudes: parseInt(servicio.total_solicitudes) || 0,
        totalRegistrosUnicos: parseInt(servicio.registros_unicos) || 0,
        totalOnzas: parseFloat(servicio.total_onzas) || 0,
        totalLitrosDistribuidos: parseFloat(servicio.total_litros) || 0,
        meses: {}
      };
    });

    // Agregar datos mensuales
    solicitudesPorServicioYMes.forEach(registro => {
      const servicio = registro.servicio;
      const mes = parseInt(registro.mes);
      const año = parseInt(registro.año);
      const nombreDelMes = `${nombreMes(mes)} ${año}`;

      if (asistencia[servicio]) {
        asistencia[servicio].meses[nombreDelMes] = {
          totalSolicitudes: parseInt(registro.total_solicitudes) || 0,
          totalRegistrosUnicos: parseInt(registro.registros_unicos) || 0,
          totalOnzas: parseFloat(registro.total_onzas) || 0,
          totalLitrosDistribuidos: parseFloat(registro.total_litros) || 0
        };
      }
    });

    // Preparar respuesta con totales generales
    const resumenGeneral = {
      totalSolicitudes: parseInt(totalGeneral[0].total_solicitudes) || 0,
      totalRegistrosUnicos: parseInt(totalGeneral[0].registros_unicos) || 0,
      totalOnzas: parseFloat(totalGeneral[0].total_onzas) || 0,
      totalLitrosDistribuidos: parseFloat(totalGeneral[0].total_litros) || 0
    };

    res.json({
      fechaInicio,
      fechaFin,
      asistencia,
      totalGeneral: resumenGeneral
    });

  } catch (error) {
    console.error("Error al obtener el resumen por servicio y fechas:", error);
    res.status(500).json({
      message: "Ocurrió un error al obtener el resumen por servicio y fechas.",
      error: error.message
    });
  }
};

// Función para obtener el nombre del mes a partir de su número
function nombreMes(mes) {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return meses[mes - 1];  // Restar 1 porque los meses empiezan desde 0 en el arreglo
}