import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Card, CardBody, Button, Row, Col, Badge, Spinner } from 'reactstrap';
import { FaFilter, FaPrint, FaFlask, FaChartBar, FaCalendarAlt, FaDownload, FaTint, FaVial, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdTrendingUp, MdInventory, MdInsights, MdAccessTime } from 'react-icons/md';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../Images/backgrounds/Logo_banco2.png';

const ResumenFrascosEstados = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useCache, setUseCache] = useState(false);

  // Spanish localization
  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  locale('es');

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        
        const response = await axios.get(
          `http://localhost:8080/api/control_de_leches/stock-estadisticas?fecha_inicio=${fechaInicioStr}&fecha_fin=${fechaFinStr}&use_cache=${useCache}&cache_minutes=30`,
          { timeout: 10000 }
        );
        
        setEstadisticas(response.data.estadisticas);
        
        if (response.data.from_cache) {
          Swal.fire({
            icon: 'info',
            title: 'Datos desde Cache',
            text: 'Los datos fueron obtenidos desde el cache para mejor rendimiento.',
            timer: 2000,
            showConfirmButton: false,
            background: '#fff',
            customClass: {
              popup: 'border-0 shadow-lg'
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Datos Actualizados',
            text: 'Las estadísticas se han cargado correctamente.',
            timer: 2000,
            showConfirmButton: false,
            background: '#fff',
            customClass: {
              popup: 'border-0 shadow-lg'
            }
          });
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        
        let errorMessage = 'Hubo un problema al obtener las estadísticas. Por favor, intenta nuevamente.';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'La consulta tardó demasiado tiempo. Por favor, intenta nuevamente.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          background: '#fff',
          customClass: {
            popup: 'border-0 shadow-lg'
          }
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
        background: '#fff',
        customClass: {
          popup: 'border-0 shadow-lg'
        }
      });
    }
  };

  const handlePrint = () => {
    if (!estadisticas) return;

    const doc = new jsPDF();
    
    // Añadir logo
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);

    // Configuración del encabezado
    doc.setFontSize(16);
    doc.text('Estadísticas de Stock - Control de Leche', 60, 20);

    doc.setFontSize(12);
    doc.text(`Período: ${estadisticas.periodo_consultado.fecha_inicio} - ${estadisticas.periodo_consultado.fecha_fin}`, 60, 28);
    doc.text(`Total Frascos Disponibles: ${estadisticas.resumen_general.total_frascos_disponibles}`, 60, 35);
    doc.text(`Volumen Total: ${estadisticas.resumen_general.volumen_total_ml_disponible} ml`, 60, 42);

    let currentY = 55;

    // Tabla de resumen general
    doc.autoTable({
      head: [['Concepto', 'Cantidad']],
      body: [
        ['Total Frascos Disponibles', estadisticas.resumen_general.total_frascos_disponibles],
        ['Total Frascos No Disponibles', estadisticas.resumen_general.total_frascos_no_disponibles],
        ['Total Registros', estadisticas.resumen_general.total_registros],
        ['Volumen Total Disponible (ml)', estadisticas.resumen_general.volumen_total_ml_disponible]
      ],
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Tabla por volumen
    doc.setFontSize(14);
    doc.text('Disponibles por Volumen', 14, currentY);
    currentY += 5;

    doc.autoTable({
      head: [['Volumen', 'Cantidad']],
      body: [
        ['10ml', estadisticas.disponibles_por_volumen.frascos_10ml],
        ['20ml', estadisticas.disponibles_por_volumen.frascos_20ml],
        ['30ml', estadisticas.disponibles_por_volumen.frascos_30ml],
        ['150ml', estadisticas.disponibles_por_volumen.frascos_150ml],
        ['180ml', estadisticas.disponibles_por_volumen.frascos_180ml]
      ],
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [46, 204, 113] },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Tabla por tipo de leche
    doc.setFontSize(14);
    doc.text('Disponibles por Tipo de Leche', 14, currentY);
    currentY += 5;

    doc.autoTable({
      head: [['Tipo de Leche', 'Cantidad']],
      body: [
        ['Leche Madura', estadisticas.disponibles_por_tipo_leche.leche_madura],
        ['Leche Calostro', estadisticas.disponibles_por_tipo_leche.leche_calostro]
      ],
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [155, 89, 182] },
    });

    // Nueva página para detalle
    doc.addPage();
    currentY = 20;

    doc.setFontSize(16);
    doc.text('Detalle por Tipo y Volumen', 14, currentY);
    currentY += 10;

    // Detalle Leche Madura
    doc.setFontSize(14);
    doc.text('Leche Madura', 14, currentY);
    currentY += 5;

    doc.autoTable({
      head: [['Volumen', 'Cantidad']],
      body: [
        ['10ml', estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_10ml],
        ['20ml', estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_20ml],
        ['30ml', estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_30ml],
        ['150ml', estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_150ml],
        ['180ml', estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_180ml],
        ['Total', estadisticas.detalle_por_tipo_y_volumen.leche_madura.total]
      ],
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Detalle Leche Calostro
    doc.setFontSize(14);
    doc.text('Leche Calostro', 14, currentY);
    currentY += 5;

    doc.autoTable({
      head: [['Volumen', 'Cantidad']],
      body: [
        ['10ml', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_10ml],
        ['20ml', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_20ml],
        ['30ml', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_30ml],
        ['150ml', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_150ml],
        ['180ml', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_180ml],
        ['Total', estadisticas.detalle_por_tipo_y_volumen.leche_calostro.total]
      ],
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [231, 76, 60] },
    });

    doc.save('EstadisticasStock.pdf');

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El reporte se ha descargado correctamente.',
      timer: 2000,
      showConfirmButton: false,
      background: '#fff',
      customClass: {
        popup: 'border-0 shadow-lg'
      }
    });
  };

  const getVolumeColor = (volume) => {
    const colors = {
      10: 'danger',
      20: 'warning', 
      30: 'success',
      150: 'info',
      180: 'primary'
    };
    return colors[volume] || 'secondary';
  };

  const getVolumeGradient = (volume) => {
    const gradients = {
      10: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      20: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
      30: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
      150: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
      180: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
    };
    return gradients[volume] || 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)';
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container fluid className="px-3 px-md-4">
        {/* Header moderno */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" 
               style={{
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 borderRadius: '50px',
                 padding: '15px 30px',
                 boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
               }}>
            <MdInventory className="text-white me-3" size={32} />
            <h2 className="mb-0 text-white fw-bold">Estadísticas de Stock - Control de Leche</h2>
          </div>
          <p className="text-muted fs-5">Monitoreo avanzado del inventario de frascos de leche materna</p>
        </div>

        {/* Panel de filtros mejorado */}
        <Row className="justify-content-center mb-5">
          <Col xs={12} lg={10}>
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-4">
                <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                  <FaFilter className="me-3" size={20} />
                  Filtros de Consulta
                </h5>
                
                <Row className="align-items-end">
                  <Col md={4} className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      <FaCalendarAlt className="me-2 text-primary" />
                      Fecha de Inicio
                    </label>
                    <div className="position-relative">
                      <Calendar
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.value)}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="Seleccione fecha de inicio"
                        className="w-100"
                        inputStyle={{
                          borderRadius: '15px',
                          border: '2px solid #e9ecef',
                          padding: '12px 20px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <label className="form-label fw-semibold text-dark">
                      <FaCalendarAlt className="me-2 text-primary" />
                      Fecha de Fin
                    </label>
                    <div className="position-relative">
                      <Calendar
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.value)}
                        showIcon
                        dateFormat="yy-mm-dd"
                        placeholder="Seleccione fecha de fin"
                        className="w-100"
                        inputStyle={{
                          borderRadius: '15px',
                          border: '2px solid #e9ecef',
                          padding: '12px 20px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  </Col>

                  <Col md={4} className="mb-3">
                    <div className="d-flex flex-column">
                      <div className="form-check mb-3" style={{ paddingLeft: '2rem' }}>
                        <input
                          type="checkbox"
                          id="useCache"
                          checked={useCache}
                          onChange={(e) => setUseCache(e.target.checked)}
                          className="form-check-input"
                          style={{ 
                            width: '20px', 
                            height: '20px',
                            marginTop: '2px'
                          }}
                        />
                        <label htmlFor="useCache" className="form-check-label fw-semibold text-dark">
                          <MdAccessTime className="me-2 text-info" />
                          Usar Cache para mayor velocidad
                        </label>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <Button 
                          onClick={handleFiltrar} 
                          disabled={loading}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '12px 25px',
                            fontWeight: 'bold',
                            flex: 1
                          }}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" className="me-2" />
                              Cargando...
                            </>
                          ) : (
                            <>
                              <FaFilter className="me-2" />
                              Consultar
                            </>
                          )}
                        </Button>

                        <Button 
                          onClick={handlePrint} 
                          disabled={!estadisticas || loading}
                          style={{
                            background: estadisticas ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : '#6c757d',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '12px 20px',
                            fontWeight: 'bold'
                          }}
                        >
                          <FaDownload className="me-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Indicador de carga */}
        {loading && (
          <Row className="justify-content-center mb-5">
            <Col xs={12} className="text-center">
              <div className="loading-container p-5">
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  animation: 'pulse 2s infinite'
                }}>
                  <Spinner color="light" style={{ width: '40px', height: '40px' }} />
                </div>
                <h5 className="text-primary fw-bold">Consultando estadísticas...</h5>
                <p className="text-muted">Procesando datos del inventario</p>
              </div>
            </Col>
          </Row>
        )}

        {/* Contenido de estadísticas */}
        {estadisticas && !loading && (
          <>
            {/* Información del período */}
            {estadisticas.periodo_consultado && (
              <Row className="justify-content-center mb-4">
                <Col xs={12} lg={10}>
                  <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <CardBody className="p-3 text-center">
                      <h6 className="mb-0 text-dark fw-bold">
                        <FaCalendarAlt className="me-2 text-primary" />
                        Período Consultado: {estadisticas.periodo_consultado.fecha_inicio} - {estadisticas.periodo_consultado.fecha_fin}
                      </h6>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Resumen General con diseño mejorado */}
            <Row className="justify-content-center mb-5">
              <Col xs={12} lg={10}>
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                      <MdInsights className="me-3" size={28} />
                      Resumen General del Inventario
                    </h4>
                    
                    <Row>
                      <Col lg={3} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                          <FaCheckCircle className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{estadisticas.resumen_general.total_frascos_disponibles}</h3>
                          <p className="text-white mb-0 opacity-75">Frascos Disponibles</p>
                        </div>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
                          <FaTimesCircle className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{estadisticas.resumen_general.total_frascos_no_disponibles}</h3>
                          <p className="text-white mb-0 opacity-75">No Disponibles</p>
                        </div>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' }}>
                          <FaVial className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{estadisticas.resumen_general.total_registros}</h3>
                          <p className="text-white mb-0 opacity-75">Total Registros</p>
                        </div>
                      </Col>
                      <Col lg={3} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <FaTint className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{estadisticas.resumen_general.volumen_total_ml_disponible}</h3>
                          <p className="text-white mb-0 opacity-75">ml Disponibles</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row className="justify-content-center">
              <Col xs={12} lg={10}>
                <Row>
                  {/* Disponibles por Volumen - Mejorado */}
                  <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                      <CardBody className="p-4">
                        <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                          <FaFlask className="me-3" size={24} />
                          Inventario por Volumen
                        </h5>
                        <div className="table-responsive">
                          <Table className="modern-table mb-0">
                            <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                              <tr>
                                <th className="text-white fw-semibold border-0 py-3">Volumen</th>
                                <th className="text-white fw-semibold border-0 py-3 text-center">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { vol: 10, cantidad: estadisticas.disponibles_por_volumen.frascos_10ml },
                                { vol: 20, cantidad: estadisticas.disponibles_por_volumen.frascos_20ml },
                                { vol: 30, cantidad: estadisticas.disponibles_por_volumen.frascos_30ml },
                                { vol: 150, cantidad: estadisticas.disponibles_por_volumen.frascos_150ml },
                                { vol: 180, cantidad: estadisticas.disponibles_por_volumen.frascos_180ml }
                              ].map((item, index) => (
                                <tr key={index} className="hover-row">
                                  <td className="py-3 d-flex align-items-center">
                                    <div 
                                      className="me-3 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                      style={{
                                        background: getVolumeGradient(item.vol),
                                        width: '40px',
                                        height: '40px',
                                        fontSize: '12px'
                                      }}
                                    >
                                      {item.vol}
                                    </div>
                                    <span className="fw-semibold">{item.vol}ml</span>
                                  </td>
                                  <td className="py-3 text-center">
                                    <Badge 
                                      style={{
                                        background: getVolumeGradient(item.vol),
                                        borderRadius: '20px',
                                        padding: '8px 15px',
                                        fontSize: '14px'
                                      }}
                                    >
                                      {item.cantidad}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Disponibles por Tipo de Leche - Mejorado */}
                  <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                      <CardBody className="p-4">
                        <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                          <FaTint className="me-3" size={24} />
                          Inventario por Tipo de Leche
                        </h5>
                        <div className="table-responsive">
                          <Table className="modern-table mb-0">
                            <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                              <tr>
                                <th className="text-white fw-semibold border-0 py-3">Tipo de Leche</th>
                                <th className="text-white fw-semibold border-0 py-3 text-center">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="hover-row">
                                <td className="py-3 d-flex align-items-center">
                                  <div 
                                    className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                      width: '40px',
                                      height: '40px'
                                    }}
                                  >
                                    <FaTint className="text-white" size={16} />
                                  </div>
                                  <span className="fw-semibold">Leche Madura</span>
                                </td>
                                <td className="py-3 text-center">
                                  <Badge 
                                    style={{
                                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                      borderRadius: '20px',
                                      padding: '8px 15px',
                                      fontSize: '14px'
                                    }}
                                  >
                                    {estadisticas.disponibles_por_tipo_leche.leche_madura}
                                  </Badge>
                                </td>
                              </tr>
                              <tr className="hover-row">
                                <td className="py-3 d-flex align-items-center">
                                  <div 
                                    className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                                      width: '40px',
                                      height: '40px'
                                    }}
                                  >
                                    <FaTint className="text-white" size={16} />
                                    </div>
                                  <span className="fw-semibold">Leche Calostro</span>
                                </td>
                                <td className="py-3 text-center">
                                  <Badge 
                                    style={{
                                      background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                                      borderRadius: '20px',
                                      padding: '8px 15px',
                                      fontSize: '14px'
                                    }}
                                  >
                                    {estadisticas.disponibles_por_tipo_leche.leche_calostro}
                                  </Badge>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* Detalle por Tipo y Volumen */}
                <Row>
                  <Col xs={12}>
                    <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                      <CardBody className="p-4">
                        <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                          <MdTrendingUp className="me-3" size={28} />
                          Detalle por Tipo y Volumen
                        </h4>
                        
                        <Row>
                          {/* Leche Madura */}
                          <Col lg={6} className="mb-4">
                            <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)', border: '2px solid #28a745' }}>
                              <h5 className="text-success fw-bold mb-3 d-flex align-items-center">
                                <FaTint className="me-2" />
                                Leche Madura
                              </h5>
                              <div className="table-responsive">
                                <Table className="table-sm mb-0">
                                  <thead>
                                    <tr style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                                      <th className="border-0 py-2 text-success fw-semibold">Volumen</th>
                                      <th className="border-0 py-2 text-success fw-semibold text-center">Cantidad</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      { vol: '10ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_10ml },
                                      { vol: '20ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_20ml },
                                      { vol: '30ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_30ml },
                                      { vol: '150ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_150ml },
                                      { vol: '180ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_madura.frascos_180ml }
                                    ].map((item, index) => (
                                      <tr key={index}>
                                        <td className="border-0 py-2 fw-semibold">{item.vol}</td>
                                        <td className="border-0 py-2 text-center">
                                          <Badge color="success" style={{ borderRadius: '15px' }}>
                                            {item.cantidad}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                    <tr style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
                                      <td className="border-0 py-2 fw-bold text-success">Total</td>
                                      <td className="border-0 py-2 text-center">
                                        <Badge color="success" style={{ borderRadius: '15px', fontSize: '16px', padding: '8px 12px' }}>
                                          {estadisticas.detalle_por_tipo_y_volumen.leche_madura.total}
                                        </Badge>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </div>
                            </div>
                          </Col>

                          {/* Leche Calostro */}
                          <Col lg={6} className="mb-4">
                            <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #fff3cd 0%, #fef9e7 100%)', border: '2px solid #ffc107' }}>
                              <h5 className="text-warning fw-bold mb-3 d-flex align-items-center">
                                <FaTint className="me-2" />
                                Leche Calostro
                              </h5>
                              <div className="table-responsive">
                                <Table className="table-sm mb-0">
                                  <thead>
                                    <tr style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                                      <th className="border-0 py-2 text-warning fw-semibold">Volumen</th>
                                      <th className="border-0 py-2 text-warning fw-semibold text-center">Cantidad</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      { vol: '10ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_10ml },
                                      { vol: '20ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_20ml },
                                      { vol: '30ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_30ml },
                                      { vol: '150ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_150ml },
                                      { vol: '180ml', cantidad: estadisticas.detalle_por_tipo_y_volumen.leche_calostro.frascos_180ml }
                                    ].map((item, index) => (
                                      <tr key={index}>
                                        <td className="border-0 py-2 fw-semibold">{item.vol}</td>
                                        <td className="border-0 py-2 text-center">
                                          <Badge color="warning" style={{ borderRadius: '15px' }}>
                                            {item.cantidad}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                    <tr style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                                      <td className="border-0 py-2 fw-bold text-warning">Total</td>
                                      <td className="border-0 py-2 text-center">
                                        <Badge color="warning" style={{ borderRadius: '15px', fontSize: '16px', padding: '8px 12px' }}>
                                          {estadisticas.detalle_por_tipo_y_volumen.leche_calostro.total}
                                        </Badge>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        )}

        {/* Mensaje cuando no hay datos */}
        {!estadisticas && !loading && (
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card className="border-0 shadow-lg text-center" style={{ borderRadius: '20px' }}>
                <CardBody className="p-5">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: '50%',
                      width: '100px',
                      height: '100px'
                    }}
                  >
                    <FaChartBar className="text-muted" size={40} />
                  </div>
                  <h4 className="text-muted fw-bold mb-3">Sin Datos de Estadísticas</h4>
                  <p className="text-muted mb-0">
                    Selecciona un rango de fechas y presiona "Consultar" para ver las estadísticas del inventario.
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .modern-table {
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 15px;
          overflow: hidden;
        }

        .modern-table th:first-child {
          border-top-left-radius: 15px;
        }

        .modern-table th:last-child {
          border-top-right-radius: 15px;
        }

        .hover-row:hover {
          background-color: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }

        .loading-container {
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .rounded-lg {
          border-radius: 15px !important;
        }

        .table-responsive {
          border-radius: 15px;
          overflow: hidden;
        }

        .p-calendar .p-inputtext {
          border-radius: 15px !important;
          border: 2px solid #e9ecef !important;
          padding: 12px 20px !important;
          font-size: 16px !important;
        }

        .p-calendar .p-inputtext:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
      `}</style>
    </div>
  );
};

export default ResumenFrascosEstados;