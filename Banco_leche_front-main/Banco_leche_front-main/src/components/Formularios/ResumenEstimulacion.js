import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { FaFilter, FaPrint, FaHospital, FaHome, FaChartBar, FaCalendarAlt, FaUsers, FaHeartbeat, FaUserPlus } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety, MdGroup } from 'react-icons/md';
import Swal from 'sweetalert2';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import logo from '../Images/backgrounds/Logo_banco2.png';
import logo2 from '../Images/backgrounds/logo_msp.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ResumenEstimulacion = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para convertir strings a números
  const parseNumber = (value) => {
    return parseFloat(value) || 0;
  };

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegura 2 dígitos
  const day = String(date.getDate()).padStart(2, '0'); // Asegura 2 dígitos
  return `${year}-${month}-${day}`;
};
        
        const response = await axios.get(
          `http://localhost:8080/api/estimulacion/estimulacion-resumen?fechaInicio=${formatDate(fechaInicio)}&fechaFin=${formatDate(fechaFin)}`
        );
        setResumen(response.data);
      } catch (error) {
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
    if (!resumen) return;

    const doc = new jsPDF();

    // Añadir logos
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);

    const imgLogo2 = new Image();
    imgLogo2.src = logo2;
    doc.addImage(imgLogo2, 'PNG', 155, 15, 35, 15);

    // Agrega el título con fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(12);
    doc.text('Dr. Miguel Angel Soto Galindo', 75, 20);
    doc.text('Coordinador Banco de Leche Humana', 69, 25);
    doc.text('Jefe Departamento de Pediatría ', 75, 30);

    doc.setFontSize(14);
    doc.text(`Resumen de Estimulación de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    // Totales generales
    doc.autoTable({
      head: [['Total Estimulaciones', 'Total Nuevas', 'Total Constantes', 'Total Personas']],
      body: [[resumen.totalEstimulaciones, resumen.totalNuevas, resumen.totalConstantes, resumen.totalPersonas]],
      startY: 55,
    });

    // Servicios Intrahospitalarios
    if (resumen.serviciosIntrahospitalarios.length > 0) {
      doc.text('Servicios Intrahospitalarios:', 10, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        head: [['Servicio Intrahospitalario', 'Total Estimulaciones', 'Total Nuevas', 'Total Constantes']],
        body: resumen.serviciosIntrahospitalarios.map(servicio => [
          servicio.servicio,
          servicio.total_estimulaciones,
          servicio.total_nuevas,
          servicio.total_constantes
        ]),
        startY: doc.lastAutoTable.finalY + 20,
      });
    }

    // Servicios Extrahospitalarios
    if (resumen.serviciosExtrahospitalarios.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 100;
      doc.text('Servicios Extrahospitalarios:', 10, startY);
      doc.autoTable({
        head: [['Servicio Extrahospitalario', 'Total Estimulaciones', 'Total Nuevas', 'Total Constantes']],
        body: resumen.serviciosExtrahospitalarios.map(servicio => [
          servicio.servicio,
          servicio.total_estimulaciones,
          servicio.total_nuevas,
          servicio.total_constantes
        ]),
        startY: startY + 5,
      });
    }

    doc.save('ResumenEstimulacion.pdf');
  };

  const prepareChartData = () => {
    if (!resumen) return { labels: [], datasets: [] };

    // Combine intrahospitalarios and extrahospitalarios
    const allServicios = [
      ...resumen.serviciosIntrahospitalarios,
      ...resumen.serviciosExtrahospitalarios
    ];
  


    return {
      labels: allServicios.map(servicio => servicio.servicio),
      datasets: [
        {
          label: 'Total Estimulaciones',
          data: allServicios.map(servicio => parseNumber(servicio.total_estimulaciones)),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
        {
          label: 'Total Nuevas',
          data: allServicios.map(servicio => parseNumber(servicio.total_nuevas)),
          backgroundColor: 'rgba(240, 147, 251, 0.8)',
          borderColor: 'rgba(240, 147, 251, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
        {
          label: 'Total Constantes',
          data: allServicios.map(servicio => parseNumber(servicio.total_constantes)),
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };

    const prepareIntrahospitalarioChartData = () => {
  if (!resumen || !resumen.serviciosIntrahospitalarios.length) return { labels: [], datasets: [] };

  return {
    labels: resumen.serviciosIntrahospitalarios.map(servicio => servicio.servicio),
    datasets: [
      {
        label: 'Total Estimulaciones',
        data: resumen.serviciosIntrahospitalarios.map(servicio => parseNumber(servicio.total_estimulaciones)),
        backgroundColor: 'rgba(245, 87, 108, 0.8)',
        borderColor: 'rgba(245, 87, 108, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Total Nuevas',
        data: resumen.serviciosIntrahospitalarios.map(servicio => parseNumber(servicio.total_nuevas)),
        backgroundColor: 'rgba(46, 213, 115, 0.8)',
        borderColor: 'rgba(46, 213, 115, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Total Constantes',
        data: resumen.serviciosIntrahospitalarios.map(servicio => parseNumber(servicio.total_constantes)),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };
};

const prepareExtrahospitalarioChartData = () => {
  if (!resumen || !resumen.serviciosExtrahospitalarios.length) return { labels: [], datasets: [] };

  return {
    labels: resumen.serviciosExtrahospitalarios.map(servicio => servicio.servicio),
    datasets: [
      {
        label: 'Total Estimulaciones',
        data: resumen.serviciosExtrahospitalarios.map(servicio => parseNumber(servicio.total_estimulaciones)),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Total Nuevas',
        data: resumen.serviciosExtrahospitalarios.map(servicio => parseNumber(servicio.total_nuevas)),
        backgroundColor: 'rgba(46, 213, 115, 0.8)',
        borderColor: 'rgba(46, 213, 115, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Total Constantes',
        data: resumen.serviciosExtrahospitalarios.map(servicio => parseNumber(servicio.total_constantes)),
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };
};

  // Calcular totales para el gráfico de dona
  const totalIntraEstimulaciones = resumen?.serviciosIntrahospitalarios.reduce(
    (sum, item) => sum + parseNumber(item.total_estimulaciones), 0
  ) || 0;
  const totalExtraEstimulaciones = resumen?.serviciosExtrahospitalarios.reduce(
    (sum, item) => sum + parseNumber(item.total_estimulaciones), 0
  ) || 0;

  // Datos para gráfico de dona
  const doughnutData = {
    labels: ['Extrahospitalario', 'Intrahospitalario'],
    datasets: [{
      data: [totalExtraEstimulaciones, totalIntraEstimulaciones],
      backgroundColor: [
        '#667eea',
        '#f5576c'
      ],
      borderColor: [
        '#5a6fd8',
        '#e04754'
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
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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

  addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    today: 'Hoy',
    clear: 'Limpiar',
  });

  locale('es');

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgba(242, 150, 22, 0.17) 0%,rgba(135, 165, 236, 0.39) 100%)',
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
            <FaHeartbeat className="text-white me-3" size={32} />
            <h2 className="mb-0 text-white fw-bold">Resumen de Estimulación</h2>
          </div>
          <p className="text-muted fs-5">Análisis integral de programas de estimulación de lactancia</p>
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
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Estadísticas generales con cards modernas */}
        {resumen && (
          <Row className="mb-5">
            <Col md={12}>
              <h4 className="mb-4 d-flex align-items-center text-dark fw-bold">
                <MdInsights className="me-3 text-primary" size={28} />
                Estadísticas Generales
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
                    <FaHeartbeat className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-primary mb-1">{resumen.totalEstimulaciones}</h3>
                  <p className="text-muted mb-0">Total Estimulaciones</p>
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
                    <FaUserPlus className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-danger mb-1">{resumen.totalNuevas}</h3>
                  <p className="text-muted mb-0">Total Nuevas</p>
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
                    <MdTrendingUp className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-warning mb-1">{resumen.totalConstantes}</h3>
                  <p className="text-muted mb-0">Total Constantes</p>
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
                    <MdGroup className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-info mb-1">{resumen.totalPersonas}</h3>
                  <p className="text-muted mb-0">Total Personas</p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Gráficos de visualización */}
        {resumen && (totalIntraEstimulaciones > 0 || totalExtraEstimulaciones > 0) && (
          <Row className="mb-5">
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">
                    Distribución de Estimulaciones por Tipo de Servicio
                  </h5>
                  <div className="text-center mb-3">
                    <small className="text-muted">
                      Total: {totalIntraEstimulaciones + totalExtraEstimulaciones} Estimulaciones
                    </small>
                  </div>
                  <div style={{ height: '300px' }}>
                    <Doughnut data={doughnutData} options={chartOptions} />
                  </div>
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#667eea',
                          borderRadius: '50%',
                          marginRight: '8px'
                        }}></div>
                        <span className="small">Extrahospitalario</span>
                      </div>
                      <span className="fw-bold">{totalExtraEstimulaciones}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: '#f5576c',
                          borderRadius: '50%',
                          marginRight: '8px'
                        }}></div>
                        <span className="small">Intrahospitalario</span>
                      </div>
                      <span className="fw-bold">{totalIntraEstimulaciones}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">Análisis por Servicios</h5>
                  <div style={{ height: '300px' }} id="graficoEstimulacion">
                    <Bar data={prepareChartData()} options={barChartOptions} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Servicios Intrahospitalarios */}
        {resumen && resumen.serviciosIntrahospitalarios.length > 0 && (
          <div className="mb-5">
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-0">
                <div className="p-4 pb-0">
                  <h4 className="d-flex align-items-center text-danger fw-bold mb-4">
                    <FaHospital className="me-3" size={24} />
                    Servicios Intrahospitalarios
                    <Badge color="danger" className="ms-3 rounded-pill">{resumen.serviciosIntrahospitalarios.length}</Badge>
                  </h4>
                </div>
                <div className="table-responsive">
                  <Table className="mb-0 modern-table">
                    <thead style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <tr>
                        <th className="text-black fw-semibold border-0 py-3">Servicio</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Estimulaciones</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Nuevas</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Constantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.serviciosIntrahospitalarios.map((servicio, index) => (
                        <tr key={index} className="hover-row">
                          <td className="py-3 fw-semibold">{servicio.servicio}</td>
                          <td className="text-center py-3">
                            <Badge color="primary" className="rounded-pill">{servicio.total_estimulaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{servicio.total_nuevas}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{servicio.total_constantes}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Servicios Extrahospitalarios */}
        {resumen && resumen.serviciosExtrahospitalarios.length > 0 && (
          <div className="mb-5">
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-0">
                <div className="p-4 pb-0">
                  <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                    <FaHome className="me-3" size={24} />
                    Servicios Extrahospitalarios
                    <Badge color="primary" className="ms-3 rounded-pill">{resumen.serviciosExtrahospitalarios.length}</Badge>
                  </h4>
                </div>
                <div className="table-responsive">
                  <Table className="mb-0 modern-table">
                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <tr>
                        <th className="text-black fw-semibold border-0 py-3">Servicio</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Estimulaciones</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Nuevas</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Constantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.serviciosExtrahospitalarios.map((servicio, index) => (
                        <tr key={index} className="hover-row">
                          <td className="py-3 fw-semibold">{servicio.servicio}</td>
                          <td className="text-center py-3">
                            <Badge color="primary" className="rounded-pill">{servicio.total_estimulaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{servicio.total_nuevas}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{servicio.total_constantes}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
{/* Gráficas por tipo de servicio */}
{resumen && (resumen.serviciosIntrahospitalarios.length > 0 || resumen.serviciosExtrahospitalarios.length > 0) && (
  <Row className="mb-5">
    <Col md={12}>
      <h4 className="mb-4 d-flex align-items-center text-dark fw-bold">
        <FaChartBar className="me-3 text-primary" size={28} />
        Análisis Detallado por Tipo de Servicio
      </h4>
    </Col>
    
    {/* Gráfica Servicios Intrahospitalarios */}
    {resumen.serviciosIntrahospitalarios.length > 0 && (
      <Col lg={6} className="mb-4">
        <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <CardBody className="p-4">
            <h5 className="fw-bold mb-4 text-center text-danger d-flex align-items-center justify-content-center">
              <FaHospital className="me-2" />
              Servicios Intrahospitalarios
            </h5>
            <div style={{ height: '400px' }}>
              <Bar data={prepareIntrahospitalarioChartData()} options={barChartOptions} />
            </div>
            <div className="mt-3 text-center">
              <small className="text-muted">
                Total Servicios: {resumen.serviciosIntrahospitalarios.length}
              </small>
            </div>
          </CardBody>
        </Card>
      </Col>
    )}
    
    {/* Gráfica Servicios Extrahospitalarios */}
    {resumen.serviciosExtrahospitalarios.length > 0 && (
      <Col lg={6} className="mb-4">
        <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <CardBody className="p-4">
            <h5 className="fw-bold mb-4 text-center text-primary d-flex align-items-center justify-content-center">
              <FaHome className="me-2" />
              Servicios Extrahospitalarios
            </h5>
            <div style={{ height: '400px' }}>
              <Bar data={prepareExtrahospitalarioChartData()} options={barChartOptions} />
            </div>
            <div className="mt-3 text-center">
              <small className="text-muted">
                Total Servicios: {resumen.serviciosExtrahospitalarios.length}
              </small>
            </div>
          </CardBody>
        </Card>
      </Col>
    )}
  </Row>
)}
        {/* Mensaje cuando no hay datos */}
        {resumen && resumen.serviciosIntrahospitalarios.length === 0 && resumen.serviciosExtrahospitalarios.length === 0 && (
          <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="text-center py-5">
              <FaChartBar size={48} className="mb-3 opacity-50 text-muted" />
              <h5 className="text-muted">No se encontraron datos para el período seleccionado</h5>
              <p className="text-muted">Intenta seleccionar un rango de fechas diferente.</p>
            </CardBody>
          </Card>
        )}


        
      </Container>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .hover-card {
          transition: all 0.3s ease;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
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
        
        .modern-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        .modern-table td {
          border-top: 1px solid #e9ecef;
          vertical-align: middle;
        }
        
        .btn-gradient-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn-gradient-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
        }
        
        .filter-group {
          min-width: 200px;
        }
        
        .custom-calendar {
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .stat-icon:hover {
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          .filter-group {
            min-width: 100%;
            margin-bottom: 1rem;
          }
          
          .d-flex.gap-2 {
            flex-direction: column;
            width: 100%;
          }
          
          .d-flex.gap-2 .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
export default ResumenEstimulacion;