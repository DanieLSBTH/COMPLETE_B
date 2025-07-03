import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaFilter, FaPrint, FaChartLine, FaCalendarAlt, FaUsers, FaTint, FaGift, FaHeart, FaHospital, FaHome } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety, MdVolunteerActivism } from 'react-icons/md';
import Swal from 'sweetalert2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const TopDonadoras = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [topDonadoras, setTopDonadoras] = useState({
    extrahospitalario: [],
    intrahospitalario: []
  });
  const [loading, setLoading] = useState(false);
  const [totalesExtrahospitalario, setTotalesExtrahospitalario] = useState({
    totalDonaciones: 0,
    totalOnzas: 0,
    totalLitros: 0
  });
  const [totalesIntrahospitalario, setTotalesIntrahospitalario] = useState({
    totalDonaciones: 0,
    totalOnzas: 0,
    totalLitros: 0
  });

  // Refs para las gráficas
  const chartRefExtra = useRef(null);
  const chartRefIntra = useRef(null);

  // Hook para manejar el redimensionamiento
  useEffect(() => {
    const handleResize = () => {
      if (chartRefExtra.current && chartRefExtra.current.chartInstance) {
        chartRefExtra.current.chartInstance.resize();
      }
      if (chartRefIntra.current && chartRefIntra.current.chartInstance) {
        chartRefIntra.current.chartInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleFiltrar = async () => {
    // Validate date inputs
    if (!fechaInicio || !fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
        background: '#fff',
        customClass: {
          popup: 'border-0 shadow-lg'
        }
      });
      return;
    }

    // Validate that fechaInicio is not greater than fechaFin
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire({
        icon: 'error',
        title: 'Fechas Inválidas',
        text: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
        background: '#fff',
        customClass: {
          popup: 'border-0 shadow-lg'
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/donadora_detalle/top-donadoras?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
      );

      setTopDonadoras(response.data);

      // Calcular totales para extrahospitalario
      const totalesExtra = response.data.extrahospitalario.reduce((acc, donadora) => ({
        totalDonaciones: acc.totalDonaciones + parseInt(donadora.total_donaciones),
        totalOnzas: acc.totalOnzas + parseFloat(donadora.total_onzas),
        totalLitros: acc.totalLitros + parseFloat(donadora.total_litros)
      }), { totalDonaciones: 0, totalOnzas: 0, totalLitros: 0 });

      // Calcular totales para intrahospitalario
      const totalesIntra = response.data.intrahospitalario.reduce((acc, donadora) => ({
        totalDonaciones: acc.totalDonaciones + parseInt(donadora.total_donaciones),
        totalOnzas: acc.totalOnzas + parseFloat(donadora.total_onzas),
        totalLitros: acc.totalLitros + parseFloat(donadora.total_litros)
      }), { totalDonaciones: 0, totalOnzas: 0, totalLitros: 0 });

      setTotalesExtrahospitalario(totalesExtra);
      setTotalesIntrahospitalario(totalesIntra);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener las donadoras top. Por favor, intenta nuevamente.',
        background: '#fff',
        customClass: {
          popup: 'border-0 shadow-lg'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const prepareChartData = (data, type) => {
    const dataset = type === 'extrahospitalario' ? data.extrahospitalario : data.intrahospitalario;
    const colors = type === 'extrahospitalario' 
      ? ['rgba(102, 126, 234, 0.8)', 'rgba(240, 147, 251, 0.8)', 'rgba(75, 192, 192, 0.8)']
      : ['rgba(255, 159, 64, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 99, 132, 0.8)'];

    return {
      labels: dataset.map(d => `${d.donadora_nombre} ${d.donadora_apellido}`),
      datasets: [
        {
          label: 'Total Donaciones',
          data: dataset.map(d => parseInt(d.total_donaciones)),
          backgroundColor: colors[0],
          borderColor: colors[0].replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Total Onzas',
          data: dataset.map(d => parseFloat(d.total_onzas)),
          backgroundColor: colors[1],
          borderColor: colors[1].replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Total Litros',
          data: dataset.map(d => parseFloat(d.total_litros)),
          backgroundColor: colors[2],
          borderColor: colors[2].replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  };

  // Datos para gráfico de dona
  const prepareDoughnutData = (data, type) => {
    const dataset = type === 'extrahospitalario' ? data.extrahospitalario : data.intrahospitalario;
    return {
      labels: dataset.map(d => `${d.donadora_nombre} ${d.donadora_apellido}`),
      datasets: [{
        data: dataset.map(d => parseFloat(d.total_litros)),
        backgroundColor: [
          '#667eea', '#f5576c', '#4ecdc4', '#45b7d1', '#96ceb4', 
          '#ffeaa7', '#dda0dd', '#98d8c8', '#ff7675', '#74b9ff'
        ],
        borderColor: [
          '#5a6fd8', '#e04754', '#26d0ce', '#2980b9', '#74b9ff',
          '#fdcb6e', '#e17055', '#55a3ff', '#d63031', '#0984e3'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }]
    };
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
            size: 10
          },
          maxRotation: 45
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
            size: 10,
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
            return `${context.label}: ${context.parsed.toFixed(2)} L (${percentage}%)`;
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
            <MdVolunteerActivism className="text-white me-3" size={32} />
            <h2 className="mb-0 text-white fw-bold">Top Donadoras de Leche Humana</h2>
          </div>
          <p className="text-muted fs-5">Madres con mayor contribución solidaria</p>
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
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Sección Extrahospitalario */}
        {topDonadoras.extrahospitalario.length > 0 && (
          <>
            {/* Tarjetas de totales extrahospitalario */}
            <Row className="mb-4">
              <Col md={12}>
                <h4 className="mb-4 d-flex align-items-center text-dark fw-bold">
                  <FaHome className="me-3 text-success" size={28} />
                  Donadoras Extrahospitalarias
                </h4>
              </Col>
              <Col lg={4} md={6} className="mb-4">
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
                    <h3 className="fw-bold text-primary mb-1">{totalesExtrahospitalario.totalDonaciones}</h3>
                    <p className="text-muted mb-0">Total Donaciones</p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
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
                    <h3 className="fw-bold text-warning mb-1">{totalesExtrahospitalario.totalOnzas.toFixed(2)}</h3>
                    <p className="text-muted mb-0">Total Onzas</p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
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
                    <h3 className="fw-bold text-info mb-1">{totalesExtrahospitalario.totalLitros.toFixed(2)}</h3>
                    <p className="text-muted mb-0">Total Litros</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Tabla Extrahospitalario */}
            <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-0">
                <div className="p-4 pb-0">
                  <h5 className="d-flex align-items-center text-success fw-bold mb-4">
                    <FaHome className="me-3" size={20} />
                    Ranking Donadoras Extrahospitalarias
                    <Badge color="success" className="ms-3 rounded-pill">{topDonadoras.extrahospitalario.length}</Badge>
                  </h5>
                </div>
                <div className="table-responsive">
                  <Table className="mb-0 modern-table">
                    <thead style={{ background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)' }}>
                      <tr>
                        <th className="text-black fw-semibold border-0 py-3">Ranking</th>
                        <th className="text-black fw-semibold border-0 py-3">Nombre Completo</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Donaciones</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Onzas</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Litros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDonadoras.extrahospitalario.map((donadora, index) => (
                        <tr key={donadora.id_donadora} className="hover-row">
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <div className={`ranking-badge ${index < 3 ? 'top-three' : ''}`}>
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 fw-semibold">
                            {donadora.donadora_nombre} {donadora.donadora_apellido}
                          </td>
                          <td className="text-center py-3">
                            <Badge color="info" className="rounded-pill">{donadora.total_donaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{parseFloat(donadora.total_onzas).toFixed(2)}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{parseFloat(donadora.total_litros).toFixed(2)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            {/* Gráficos Extrahospitalario */}
            <Row className="mb-5">
              <Col lg={8}>
                <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h5 className="fw-bold mb-4 text-center text-success">
                      <FaChartLine className="me-2" />
                      Análisis Comparativo - Extrahospitalario
                    </h5>
                    <div style={{ height: '400px' }}>
                      <Bar 
                        ref={chartRefExtra}
                        data={prepareChartData(topDonadoras, 'extrahospitalario')}
                        options={chartOptions}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h5 className="fw-bold mb-4 text-center text-success">
                      Distribución de Litros
                    </h5>
                    <div style={{ height: '300px' }}>
                      <Doughnut 
                        data={prepareDoughnutData(topDonadoras, 'extrahospitalario')}
                        options={doughnutOptions}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        Total: {totalesExtrahospitalario.totalLitros.toFixed(2)} Litros
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Sección Intrahospitalario */}
        {topDonadoras.intrahospitalario.length > 0 && (
          <>
            {/* Tarjetas de totales intrahospitalario */}
            <Row className="mb-4">
              <Col md={12}>
                <h4 className="mb-4 d-flex align-items-center text-dark fw-bold">
                  <FaHospital className="me-3 text-info" size={28} />
                  Donadoras Intrahospitalarias
                </h4>
              </Col>
              <Col lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                  <CardBody className="text-center p-4">
                    <div className="stat-icon mb-3" style={{
                      background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
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
                    <h3 className="fw-bold text-danger mb-1">{totalesIntrahospitalario.totalDonaciones}</h3>
                    <p className="text-muted mb-0">Total Donaciones</p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                  <CardBody className="text-center p-4">
                    <div className="stat-icon mb-3" style={{
                      background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
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
                    <h3 className="fw-bold text-info mb-1">{totalesIntrahospitalario.totalOnzas.toFixed(2)}</h3>
                    <p className="text-muted mb-0">Total Onzas</p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4} md={6} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-card" style={{ borderRadius: '15px' }}>
                  <CardBody className="text-center p-4">
                    <div className="stat-icon mb-3" style={{
                      background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
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
                    <h3 className="fw-bold text-primary mb-1">{totalesIntrahospitalario.totalLitros.toFixed(2)}</h3>
                    <p className="text-muted mb-0">Total Litros</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Tabla Intrahospitalario */}
            <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <CardBody className="p-0">
                <div className="p-4 pb-0">
                  <h5 className="d-flex align-items-center text-info fw-bold mb-4">
                    <FaHospital className="me-3" size={20} />
                    Ranking Donadoras Intrahospitalarias
                    <Badge color="info" className="ms-3 rounded-pill">{topDonadoras.intrahospitalario.length}</Badge>
                  </h5>
                </div>
                <div className="table-responsive">
                  <Table className="mb-0 modern-table">
                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <tr>
                        <th className="text-black fw-semibold border-0 py-3">Ranking</th>
                        <th className="text-black fw-semibold border-0 py-3">Nombre Completo</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Donaciones</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Onzas</th>
                        <th className="text-black fw-semibold border-0 py-3 text-center">Total Litros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDonadoras.intrahospitalario.map((donadora, index) => (
                        <tr key={donadora.id_donadora} className="hover-row">
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <div className={`ranking-badge ${index < 3 ? 'top-three' : ''}`}>
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 fw-semibold">
                            {donadora.donadora_nombre} {donadora.donadora_apellido}
                          </td>
                          <td className="text-center py-3">
                            <Badge color="info" className="rounded-pill">{donadora.total_donaciones}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="warning" className="rounded-pill">{parseFloat(donadora.total_onzas).toFixed(2)}</Badge>
                          </td>
                          <td className="text-center py-3">
                            <Badge color="success" className="rounded-pill">{parseFloat(donadora.total_litros).toFixed(2)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardBody>
            </Card>

            {/* Gráficos Intrahospitalario */}
            <Row className="mb-5">
              <Col lg={8}>
                <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h5 className="fw-bold mb-4 text-center text-info">
                      <FaChartLine className="me-2" />
                      Análisis Comparativo - Intrahospitalario
                    </h5>
                    <div style={{ height: '400px' }}>
                      <Bar 
                        ref={chartRefIntra}
                        data={prepareChartData(topDonadoras, 'intrahospitalario')}
                        options={chartOptions}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h5 className="fw-bold mb-4 text-center text-info">
                      Distribución de Litros
                    </h5>
                    <div style={{ height: '300px' }}>
                      <Doughnut 
                        data={prepareDoughnutData(topDonadoras, 'intrahospitalario')}
                        options={doughnutOptions}
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <small className="text-muted">
                        Total: {totalesIntrahospitalario.totalLitros.toFixed(2)} Litros
                      </small>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Mensaje cuando no hay datos */}
        {topDonadoras.extrahospitalario.length === 0 && topDonadoras.intrahospitalario.length === 0 && !loading && (
          <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="text-center p-5">
              <div className="mb-4">
                <MdInsights size={80} className="text-muted" />
              </div>
              <h4 className="text-muted mb-3">No hay datos disponibles</h4>
              <p className="text-muted">
                Selecciona un rango de fechas y presiona "Filtrar" para ver las top donadoras.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Footer con información adicional */}
        <Card className="mt-5 border-0" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px'
        }}>
          <CardBody className="text-center text-white p-4">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <FaHeart className="me-2" size={24} />
              <h5 className="mb-0 fw-bold">Banco de Leche Humana</h5>
            </div>
            <p className="mb-0 opacity-75">
              Reconocimiento a las madres generosas que contribuyen al bienestar de los bebés más vulnerables
            </p>
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
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
        }
        
        .modern-table tbody tr {
          transition: all 0.2s ease;
        }
        .hover-row:hover {
          background-color: rgba(102, 126, 234, 0.05);
          transform: scale(1.01);
        }
        
        .ranking-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1976d2;
          font-weight: bold;
          font-size: 14px;
        }
        
        .ranking-badge.top-three {
          background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
          color: #fff;
          box-shadow: 0 3px 10px rgba(255, 193, 7, 0.3);
        }
        
        .custom-calendar .p-inputtext {
          border-radius: 10px;
          border: 2px solid #e3f2fd;
          padding: 12px 15px;
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

        .filter-group {
          min-width: 200px;
        }

        @media (max-width: 768px) {
          .filter-group {
            min-width: 100%;
            margin-bottom: 1rem;
          }
          
          .d-flex.gap-2 {
            width: 100%;
            justify-content: center;
          }
          
          .ranking-badge {
            width: 30px;
            height: 30px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default TopDonadoras;