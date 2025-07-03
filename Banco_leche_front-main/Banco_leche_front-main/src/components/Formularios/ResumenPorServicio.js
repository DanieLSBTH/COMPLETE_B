import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { FaFilter, FaPrint, FaHospital, FaHome, FaChartBar, FaCalendarAlt, FaUsers, FaTint, FaGift } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety } from 'react-icons/md';
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

const ResumenPorServicio = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumenExtra, setResumenExtra] = useState([]);
  const [resumenIntra, setResumenIntra] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);

  // Función para convertir strings a números
  const parseNumber = (value) => {
    return parseFloat(value) || 0;
  };

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/donadora_detalle/stats/?fecha_inicio=${fechaInicio.toISOString().split('T')[0]}&fecha_fin=${fechaFin.toISOString().split('T')[0]}`
        );
        
        const { data } = response;
        
        setResumenExtra(data.litros_por_servicio.extrahospitalario);
        setResumenIntra(data.litros_por_servicio.intrahospitalario);
        setEstadisticas(data.estadisticas_generales);
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
    const doc = new jsPDF();

    // Añadir logo
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
    doc.text('Dr. Miguel Angel Soto Galindo',75,20);
    doc.text('Coordinador Banco de Leche Humana',69,25);
    doc.text('Jefe Departamento de Pediatría ',75,30);

    doc.setFontSize(14);
    doc.text(`Resumen de donadoras de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    // Estadísticas Generales
    doc.setFontSize(12);
    doc.text('Estadísticas Generales:', 10, 55);
    doc.text(`Total Donadoras: ${estadisticas?.total_donadoras}`, 10, 70);
    doc.text(`Donadoras Nuevas: ${estadisticas?.total_nuevas}`, 100, 70);
    doc.text(`Donadoras Constantes: ${estadisticas?.total_constantes}`, 100, 75);
    doc.text(`Total Donaciones: ${estadisticas?.total_donaciones}`, 10, 75);
    doc.text(`Total Litros: ${estadisticas?.total_litros}`, 10, 80);

    // Servicios Extrahospitalarios
    if (resumenExtra.length > 0) {
      doc.text('Servicios Extrahospitalarios:', 10, 90);
      doc.autoTable({
        head: [['Servicio', 'Total Donaciones', 'Total Donadoras', 'Litros', 'Nuevas','Constantes']],
        body: resumenExtra.map(item => [
          item.servicio,
          item.total_donaciones,
          item.total_donadoras,
          item.litros,
          item.nuevas,
          item.constantes
        ]),
        startY: 100
      });
    }

    // Servicios Intrahospitalarios
    if (resumenIntra.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 110;
      doc.text('Servicios Intrahospitalarios:', 10, startY);
      doc.autoTable({
        head: [['Servicio', 'Total Donaciones', 'Total Donadoras', 'Litros', 'Nuevas', 'Constantes']],
        body: resumenIntra.map(item => [
          item.servicio,
          item.total_donaciones,
          item.total_donadoras,
          item.litros,
          item.nuevas,
          item.constantes
        ]),
        startY: startY + 10
      });
    }

    doc.save('ResumenPorServicio.pdf');
  };

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

  
 // Calcular totales para el gráfico de dona
  const totalLitrosExtra = resumenExtra.reduce((sum, item) => sum + parseNumber(item.litros), 0);
  const totalLitrosIntra = resumenIntra.reduce((sum, item) => sum + parseNumber(item.litros), 0);

  // Datos para gráfico de dona - CORREGIDO
  const doughnutData = {
    labels: ['Extrahospitalario', 'Intrahospitalario'],
    datasets: [{
      data: [totalLitrosExtra, totalLitrosIntra],
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
// Datos para gráfico de barras comparativo - CORREGIDO
  const totalDonacionesExtra = resumenExtra.reduce((sum, item) => sum + parseNumber(item.total_donaciones), 0);
  const totalDonacionesIntra = resumenIntra.reduce((sum, item) => sum + parseNumber(item.total_donaciones), 0);
  const totalDonadorasExtra = resumenExtra.reduce((sum, item) => sum + parseNumber(item.total_donadoras), 0);
  const totalDonadorasIntra = resumenIntra.reduce((sum, item) => sum + parseNumber(item.total_donadoras), 0);

  const barComparativeData = {
    labels: ['Extrahospitalario', 'Intrahospitalario'],
    datasets: [
      {
        label: 'Donaciones',
        data: [totalDonacionesExtra, totalDonacionesIntra],
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Donadoras',
        data: [totalDonadorasExtra, totalDonadorasIntra],
        backgroundColor: 'rgba(240, 147, 251, 0.8)',
        borderColor: 'rgba(240, 147, 251, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Litros',
        data: [totalLitrosExtra, totalLitrosIntra],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
            <MdHealthAndSafety className="text-white me-3" size={32} />
            <h2 className="mb-0 text-white fw-bold">Resumen por Servicio</h2>
          </div>
          <p className="text-muted fs-5">Análisis integral de donaciones por servicios hospitalarios</p>
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
        {estadisticas && (
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
                    <FaUsers className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-primary mb-1">{estadisticas.total_donadoras}</h3>
                  <p className="text-muted mb-0">Total Donadoras</p>
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
                    <FaGift className="text-white" size={24} />
                  </div>
                  <h3 className="fw-bold text-danger mb-1">{estadisticas.total_donaciones}</h3>
                  <p className="text-muted mb-0">Total Donaciones</p>
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
                  <h3 className="fw-bold text-info mb-1">{estadisticas.total_litros}</h3>
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
                  <div className="d-flex justify-content-around">
                    <div>
                      <h5 className="fw-bold text-success mb-0">{estadisticas.total_nuevas}</h5>
                      <small className="text-muted">Nuevas</small>
                    </div>
                    <div>
                      <h5 className="fw-bold text-warning mb-0">{estadisticas.total_constantes}</h5>
                      <small className="text-muted">Constantes</small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Gráfico de dona para distribución */}
        
{(resumenExtra.length > 0 || resumenIntra.length > 0) && (
          <Row className="mb-5">
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">
                    Distribución de Litros por Tipo de Servicio
                  </h5>
                  <div className="text-center mb-3">
                    <small className="text-muted">
                      Total: {(totalLitrosExtra + totalLitrosIntra).toFixed(2)} Litros
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
                      <span className="fw-bold">{totalLitrosExtra.toFixed(2)} L</span>
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
                      <span className="fw-bold">{totalLitrosIntra.toFixed(2)} L</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="fw-bold mb-4 text-center text-primary">Resumen Comparativo por Servicio</h5>
                  <div style={{ height: '300px' }}>
                    <Bar data={barComparativeData} options={barChartOptions} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="row">
                      <div className="col-4">
                        <small className="text-muted d-block">Donaciones</small>
                        <strong>{totalDonacionesExtra + totalDonacionesIntra}</strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Donadoras</small>
                        <strong>{estadisticas.total_donadoras}</strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Litros</small>
                        <strong>{(totalLitrosExtra + totalLitrosIntra).toFixed(2)} L</strong>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}

        {/* Servicios Extrahospitalarios */}
        <div className="mb-5">
          <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="p-0">
              <div className="p-4 pb-0">
                <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                  <FaHome className="me-3" size={24} />
                  Servicios Extrahospitalarios
                  <Badge color="primary" className="ms-3 rounded-pill">{resumenExtra.length}</Badge>
                </h4>
              </div>
              <div className="table-responsive">
                <Table className="mb-0 modern-table">
                  <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <tr>
                      <th className="text-black fw-semibold border-0 py-3">Servicio</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Donaciones</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Donadoras</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Litros</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Constantes</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Nuevas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenExtra.length > 0 ? (
                      resumenExtra.map((servicio, index) => (
                        <tr key={index} className="hover-row">
                          <td className="py-3 fw-semibold">{servicio.servicio}</td>
                          <td className="text-center py-3">
                            <Badge color="info" className="rounded-pill">{servicio.total_donaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="primary" className="rounded-pill">{servicio.total_donadoras}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{servicio.litros}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{servicio.constantes}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="danger" className="rounded-pill">{servicio.nuevas}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <FaChartBar size={48} className="mb-3 opacity-50" />
                          <p>No se encontraron resultados para servicios extrahospitalarios.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Servicios Intrahospitalarios */}
        <div className="mb-5">
          <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="p-0">
              <div className="p-4 pb-0">
                <h4 className="d-flex align-items-center text-danger fw-bold mb-4">
                  <FaHospital className="me-3" size={24} />
                  Servicios Intrahospitalarios
                  <Badge color="danger" className="ms-3 rounded-pill">{resumenIntra.length}</Badge>
                </h4>
              </div>
              <div className="table-responsive">
                <Table className="mb-0 modern-table">
                  <thead style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                    <tr>
                      <th className="text-black fw-semibold border-0 py-3">Servicio</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Donaciones</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Donadoras</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Litros</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Constantes</th>
                      <th className="text-black fw-semibold border-0 py-3 text-center">Nuevas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenIntra.length > 0 ? (
                      resumenIntra.map((servicio, index) => (
                        <tr key={index} className="hover-row">
                          <td className="py-3 fw-semibold">{servicio.servicio}</td>
                          <td className="text-center py-3">
                            <Badge color="info" className="rounded-pill">{servicio.total_donaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="primary" className="rounded-pill">{servicio.total_donadoras}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{servicio.litros}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{servicio.constantes}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="danger" className="rounded-pill">{servicio.nuevas}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          <FaChartBar size={48} className="mb-3 opacity-50" />
                          <p>No se encontraron resultados para servicios intrahospitalarios.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Gráficos detallados */}
        {resumenExtra.length > 0 && (
          <div className="mb-5">
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-4">
                <h4 className="text-primary fw-bold mb-4 text-center">
                  <FaHome className="me-3" />
                  Análisis Detallado - Servicios Extrahospitalarios
                </h4>
                <div style={{ height: '400px' }}>
                  <Bar 
                    data={{
                      labels: resumenExtra.map(servicio => servicio.servicio),
                      datasets: [
                        {
                          label: 'Total Donaciones',
                          data: resumenExtra.map(servicio => servicio.total_donaciones),
                          backgroundColor: 'rgba(102, 126, 234, 0.8)',
                          borderRadius: 8,
                        },
                        {
                          label: 'Total Donadoras',
                          data: resumenExtra.map(servicio => servicio.total_donadoras),
                          backgroundColor: 'rgba(153, 102, 255, 0.8)',
                          borderRadius: 8,
                        },
                        {
                          label: 'Litros',
                          data: resumenExtra.map(servicio => servicio.litros),
                          backgroundColor: 'rgba(255, 159, 64, 0.8)',
                          borderRadius: 8,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Gráfico para servicios intrahospitalarios */}
        {resumenIntra.length > 0 && (
          <div className="mb-5">
            <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-4">
                <h4 className="text-danger fw-bold mb-4 text-center">
                  <FaHospital className="me-3" />
                  Análisis Detallado - Servicios Intrahospitalarios
                </h4>
                <div style={{ height: '400px' }}>
                  <Bar 
                    data={{
                      labels: resumenIntra.map(servicio => servicio.servicio),
                      datasets: [
                        {
                          label: 'Total Donaciones',
                          data: resumenIntra.map(servicio => servicio.total_donaciones),
                          backgroundColor: 'rgba(240, 147, 251, 0.8)',
                          borderRadius: 8,
                        },
                        {
                          label: 'Total Donadoras',
                          data: resumenIntra.map(servicio => servicio.total_donadoras),
                          backgroundColor: 'rgba(245, 87, 108, 0.8)',
                          borderRadius: 8,
                        },
                        {
                          label: 'Litros',
                          data: resumenIntra.map(servicio => servicio.litros),
                          backgroundColor: 'rgba(255, 99, 132, 0.8)',
                          borderRadius: 8,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        )}
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

export default ResumenPorServicio;