import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { FaFilter, FaPrint, FaChartLine, FaCalendarAlt, FaUsers, FaTint, FaGift, FaDownload } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety, MdAssignment } from 'react-icons/md';
import Swal from 'sweetalert2';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import logo from '../Images/backgrounds/Logo_banco2.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ResumenPorFechaSolicitud = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState([]);
  const [totales, setTotales] = useState({
    totalSolicitudes: 0,
    totalRegistrosUnicos: 0,
    totalLitrosDistribuidos: 0,
    totalOnzas: 0
  });
  const [loading, setLoading] = useState(false);

  // Ref para la gráfica
  const chartRef = useRef(null);

  // Hook para manejar el redimensionamiento
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && chartRef.current.chartInstance && resumen.length > 0) {
      setTimeout(() => {
        chartRef.current.chartInstance.resize();
      }, 100);
    }
  }, [resumen]);

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/solicitud_de_leches/resumen/por-servicio-y-fechas?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
        );
        
        const data = response.data.asistencia;

        const servicios = Object.entries(data).map(([servicio, detalles]) => ({
          servicio_tipo: servicio,
          total_solicitudes: detalles.totalSolicitudes,
          total_registros_unicos: detalles.totalRegistrosUnicos,
          total_litros: detalles.totalLitrosDistribuidos,
          total_onzas: detalles.totalOnzas,
        }));

        setTotales(response.data.totalGeneral);
        setResumen(servicios);
        
      } catch (error) {
        console.error('Error al obtener resumen:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el resumen. Por favor, intenta nuevamente.',
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

  const handlePrint = async () => {
    const doc = new jsPDF();

    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 40, 35);

    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo', 75, 20);
    doc.text('Coordinador Banco de Leche Humana', 69, 25);
    doc.text('Jefe Departamento de Pediatría', 75, 30);

    doc.setFontSize(14);
    doc.text(`Resumen control de despacho de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    const tableData = resumen.map((servicio) => [
      servicio.servicio_tipo,
      servicio.total_solicitudes,
      servicio.total_registros_unicos,
      servicio.total_onzas.toFixed(2),
      servicio.total_litros.toFixed(2),
    ]);

    tableData.push([
      'Total General',
      totales.totalSolicitudes,
      totales.totalRegistrosUnicos,
      totales.totalOnzas?.toFixed(2) || '0.00',
      totales.totalLitrosDistribuidos?.toFixed(2) || '0.00',
    ]);

    doc.autoTable({
      head: [['Tipo de Servicio', 'Total Solicitudes', 'Beneficiados Únicos', 'Total Onzas', 'Total Litros']],
      body: tableData,
      startY: 55,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    try {
      const chart = document.getElementById('graficoResumen');
      if (chart) {
        const canvasGrafica = await html2canvas(chart);
        const imgGrafica = canvasGrafica.toDataURL('image/png');
        doc.addImage(imgGrafica, 'PNG', 10, doc.lastAutoTable.finalY + 10, 190, 100);
      }
    } catch (error) {
      console.error('Error al generar gráfico para PDF:', error);
    }

    doc.save('ResumenPorFechaSolicitud.pdf');
  };

  // Datos para el gráfico de barras
  const chartData = {
    labels: resumen.map((servicio) => servicio.servicio_tipo),
    datasets: [
      {
        label: 'Total Solicitudes',
        data: resumen.map((servicio) => servicio.total_solicitudes),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Beneficiados Únicos',
        data: resumen.map((servicio) => servicio.total_registros_unicos),
        backgroundColor: 'rgba(240, 147, 251, 0.8)',
        borderColor: 'rgba(240, 147, 251, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Total Litros',
        data: resumen.map((servicio) => servicio.total_litros),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Total Onzas',
        data: resumen.map((servicio) => servicio.total_onzas),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  // Datos para gráfico de dona
  const doughnutData = {
    labels: resumen.map((servicio) => servicio.servicio_tipo),
    datasets: [{
      data: resumen.map((servicio) => servicio.total_litros),
      backgroundColor: [
        '#667eea',
        '#f5576c',
        '#4ecdc4',
        '#45b7d1',
        '#96ceb4',
        '#ffeaa7',
        '#dda0dd',
        '#98d8c8'
      ],
      borderColor: [
        '#5a6fd8',
        '#e04754',
        '#26d0ce',
        '#2980b9',
        '#74b9ff',
        '#fdcb6e',
        '#e17055',
        '#55a3ff'
      ],
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} L (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // Configuración de idioma para el calendario
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

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgb(245, 247, 250) 0%,rgb(252, 252, 252) 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container>
        {/* Header moderno */}
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" 
               style={{
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 borderRadius: '50px',
                 padding: '15px 30px',
                 boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
               }}>
            <MdAssignment className="text-white me-3" size={32} />
            <h2 className="mb-0 text-white fw-bold">Control de Despacho</h2>
          </div>
          <p className="text-muted fs-5">Resumen integral por fecha y servicio</p>
        </div>
        
        {/* Panel de filtros mejorado */}
        <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <CardBody className="p-4">
            <div className="d-flex flex-wrap justify-content-center align-items-end gap-3">
              <div className="filter-group">
                <label className="form-label fw-semibold text-primary d-flex align-items-center mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha de Inicio
                </label>
                <Calendar
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.value)}
                  showIcon
                  dateFormat="yy-mm-dd"
                  placeholder="Seleccione fecha inicio"
                  className="custom-calendar"
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="filter-group">
                <label className="form-label fw-semibold text-primary d-flex align-items-center mb-2">
                  <FaCalendarAlt className="me-2" />
                  Fecha de Fin
                </label>
                <Calendar
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.value)}
                  showIcon
                  dateFormat="yy-mm-dd"
                  placeholder="Seleccione fecha fin"
                  className="custom-calendar"
                  style={{ borderRadius: '10px' }}
                />
              </div>

              <div className="d-flex gap-2">
                <Button 
                  color="primary" 
                  onClick={handleFiltrar} 
                  disabled={loading}
                  className="btn-gradient-primary px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {loading ? (
                    <Spinner size="sm" className="me-2" />
                  ) : (
                    <FaFilter className="me-2" />
                  )}
                  {loading ? 'Filtrando...' : 'Filtrar'}
                </Button>

                {resumen.length > 0 && (
                  <Button 
                    color="secondary" 
                    onClick={handlePrint}
                    className="btn-gradient-secondary px-4 py-2"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 5px 15px rgba(240, 147, 251, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaPrint className="me-2" />
                    Generar PDF
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tarjetas de totales */}
        {resumen.length > 0 && (
          <Row className="mb-5">
            <Col md={12}>
              <h4 className="mb-4 d-flex align-items-center text-dark fw-bold">
                <MdInsights className="me-3 text-primary" size={28} />
                Resumen General
              </h4>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                <CardBody className="text-center p-4">
                  <div className="stat-icon mb-3" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <FaGift className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-primary mb-1">{totales.totalSolicitudes}</h3>
                  <p className="text-muted mb-0">Total Solicitudes</p>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                <CardBody className="text-center p-4">
                  <div className="stat-icon mb-3" style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <FaUsers className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-danger mb-1">{totales.totalRegistrosUnicos}</h3>
                  <p className="text-muted mb-0">Beneficiados Únicos</p>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                <CardBody className="text-center p-4">
                  <div className="stat-icon mb-3" style={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <FaTint className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-info mb-1">{totales.totalLitrosDistribuidos?.toFixed(2) || '0.00'}</h3>
                  <p className="text-muted mb-0">Total Litros</p>
                </CardBody>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                <CardBody className="text-center p-4">
                  <div className="stat-icon mb-3" style={{
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <MdTrendingUp className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-warning mb-1">{totales.totalOnzas?.toFixed(2) || '0.00'}</h3>
                  <p className="text-muted mb-0">Total Onzas</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Gráficos */}
        {resumen.length > 0 && (
          <Row className="mb-5">
            <Col lg={8}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">
                    <FaChartLine className="me-2" />
                    Análisis Comparativo por Servicio
                  </h5>
                  <div id="graficoResumen" style={{ height: '400px' }}>
                    <Bar 
                      ref={chartRef}
                      data={chartData} 
                      options={chartOptions} 
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={4}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">
                    Distribución de Litros
                  </h5>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      Total: {totales.totalLitrosDistribuidos?.toFixed(2) || '0.00'} Litros
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Tabla de resultados */}
        <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <CardBody className="p-0">
            <div className="p-4 pb-0">
              <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                <FaDownload className="me-3" size={24} />
                Detalle del Control de Despacho
                <Badge color="primary" className="ms-3 rounded-pill">{resumen.length}</Badge>
              </h4>
            </div>
            <div className="table-responsive">
              <Table className="mb-0 modern-table" id="tablaResumen">
                <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <tr>
                    <th className="text-white fw-semibold border-0 py-3">Tipo de Servicio</th>
                    <th className="text-white fw-semibold border-0 py-3 text-center">Total Solicitudes</th>
                    <th className="text-white fw-semibold border-0 py-3 text-center">Beneficiados Únicos</th>
                    <th className="text-white fw-semibold border-0 py-3 text-center">Total Onzas</th>
                    <th className="text-white fw-semibold border-0 py-3 text-center">Total Litros</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.length > 0 ? (
                    resumen.map((servicio, index) => (
                      <tr key={index} className="hover-row">
                        <td className="py-3 fw-semibold">{servicio.servicio_tipo}</td>
                        <td className="text-center py-3">
                          <Badge color="info" className="rounded-pill">{servicio.total_solicitudes}</Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge color="primary" className="rounded-pill">{servicio.total_registros_unicos}</Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge color="warning" className="rounded-pill">{servicio.total_onzas?.toFixed(2) || '0.00'}</Badge>
                        </td>
                        <td className="text-center py-3">
                          <Badge color="success" className="rounded-pill">{servicio.total_litros?.toFixed(2) || '0.00'}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <FaChartLine size={48} className="mb-3 opacity-50" />
                        <p>No se encontraron resultados para el período seleccionado.</p>
                      </td>
                    </tr>
                  )}
                  {resumen.length > 0 && (
                    <tr style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)' }}>
                      <td className="py-3"><strong>Total General</strong></td>
                      <td className="text-center py-3"><strong>{totales.totalSolicitudes}</strong></td>
                      <td className="text-center py-3"><strong>{totales.totalRegistrosUnicos}</strong></td>
                      <td className="text-center py-3"><strong>{totales.totalOnzas?.toFixed(2) || '0.00'}</strong></td>
                      <td className="text-center py-3"><strong>{totales.totalLitrosDistribuidos?.toFixed(2) || '0.00'}</strong></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </Container>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }
        
        .hover-row {
          transition: all 0.2s ease;
        }
        
        .hover-row:hover {
          background-color: rgba(102, 126, 234, 0.05);
          transform: scale(1.01);
        }
        
        .modern-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .modern-table tbody tr:last-child td:first-child {
          border-bottom-left-radius: 20px;
        }
        
        .modern-table tbody tr:last-child td:last-child {
          border-bottom-right-radius: 20px;
        }
        
        .custom-calendar .p-inputtext {
          border-radius: 10px;
          border: 2px solid #e9ecef;
          padding: 10px 15px;
          transition: all 0.3s ease;
        }
        
        .custom-calendar .p-inputtext:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
        }
        
        .btn-gradient-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4) !important;
        }
        
        .filter-group {
          min-width: 200px;
        }
        
        @media (max-width: 768px) {
          .filter-group {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumenPorFechaSolicitud;