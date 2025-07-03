import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container } from 'reactstrap';
import { FaFilter, FaPrint } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Row, Col, Card, CardBody, Spinner, Badge } from 'reactstrap';
import { MdScience, MdTrendingUp, MdAssessment } from 'react-icons/md';
import logo from '../Images/backgrounds/Logo_banco2.png';
import logo2 from '../Images/backgrounds/logo_msp.png';


// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResumenPasteurizacion = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [resumen, setResumen] = useState({});

  const handleFiltrar = async () => {
    if (fechaInicio && fechaFin) {
      try {
        // Formato manual de la fecha para evitar problemas con zona horaria
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
  
        const inicio = formatDate(fechaInicio);
        const fin = formatDate(fechaFin);
  
        const response = await axios.get(
          `http://localhost:8080/api/trabajo_de_pasteurizaciones/getStatsByDateRange?fechaInicio=${inicio}&fechaFin=${fin}`
        );
        setResumen(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el resumen. Por favor, intenta nuevamente.',
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
      });
    }
  };

  // Función para generar el PDF
  const handlePrint = async () => {
    const doc = new jsPDF();
     const imgLogo = new Image();
        imgLogo.src = logo;
        doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);
    
        const imgLogo2 = new Image();
        imgLogo2.src = logo2;
        doc.addImage(imgLogo2, 'PNG', 155, 15, 35, 15);
    
    // Agregar el título con las fechas
    const fechaInicioFormatted = fechaInicio ? fechaInicio.toLocaleDateString() : 'N/A';
    const fechaFinFormatted = fechaFin ? fechaFin.toLocaleDateString() : 'N/A';
    doc.setFontSize(14);
    doc.text('Dr. Miguel Angel Soto Galindo',75,20);
    doc.text('Coordinador Banco de Leche Humana',69,25);
    doc.text('Jefe Departamento de Pediatría ',75,30);
    doc.text(`Resumen de Pasteurización de ${fechaInicioFormatted} a ${fechaFinFormatted}`, 50, 43);

    // Añadir tabla con jsPDF autoTable
    doc.autoTable({
      head: [['Promedio Kcal/l', 'Total Acidez', 'Total Registros']],
      body: [[resumen.promedio_kcal_l, resumen.total_acidez, resumen.total_registros]],
      margin: { top: 30 },
      startY: 50
    });

    // Captura la gráfica como imagen y la inserta debajo de la tabla
    const chart = document.getElementById('graficoPasteurizacion');
    const canvasGrafica = await html2canvas(chart);
    const imgGrafica = canvasGrafica.toDataURL('image/png');
    const pageHeight = doc.internal.pageSize.height;
    const yPosition = doc.lastAutoTable.finalY + 10;

    if (yPosition + 100 <= pageHeight) {
      doc.addImage(imgGrafica, 'PNG', 10, yPosition, 190, 100);
    } else {
      doc.addPage();
      doc.addImage(imgGrafica, 'PNG', 10, 10, 190, 100);
    }

    doc.save('ResumenPasteurizacion.pdf');
  };

  // Configuración de los datos para la gráfica
  // 3. ACTUALIZAR LOS DATOS DEL GRÁFICO PARA MEJOR APARIENCIA:
const chartData = {
  labels: ['Promedio Kcal/l', 'Total Acidez', 'Total Registros'],
  datasets: [
    {
      label: 'Resumen Pasteurización',
      data: [resumen.promedio_kcal_l, resumen.total_acidez, resumen.total_registros],
      backgroundColor: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      ],
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

  // Configuración del calendario en español
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
    <Container fluid className="px-3 px-md-4">
      <Row className="justify-content-center my-4">
        <Col xs={12} lg={10}>
          {/* Header moderno */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   borderRadius: '50px',
                   padding: '15px 30px',
                   boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                 }}>
              <MdScience className="text-white me-3" size={32} />
              <h2 className="mb-0 text-white fw-bold">Resumen de Pasteurización</h2>
            </div>
            <p className="text-muted fs-5">Análisis detallado del proceso de pasteurización</p>
          </div>

          {/* Sección de filtros mejorada */}
          <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="p-4">
              <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                <FaFilter className="me-3" size={24} />
                Filtros de Consulta
              </h5>
              
              <Row className="align-items-end">
                <Col md={4} className="mb-3">
                  <label htmlFor="fechaInicio" className="form-label fw-semibold">
                    Fecha de Inicio
                  </label>
                  <div className="calendar-wrapper">
                    <Calendar
                      id="fechaInicio"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.value)}
                      showIcon
                      dateFormat="yy-mm-dd"
                      placeholder="Seleccione la fecha de inicio"
                      className="w-100"
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                </Col>

                <Col md={4} className="mb-3">
                  <label htmlFor="fechaFin" className="form-label fw-semibold">
                    Fecha de Fin
                  </label>
                  <div className="calendar-wrapper">
                    <Calendar
                      id="fechaFin"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.value)}
                      showIcon
                      dateFormat="yy-mm-dd"
                      placeholder="Seleccione la fecha de fin"
                      className="w-100"
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                </Col>

                <Col md={4} className="mb-3">
                  <Button 
                    onClick={handleFiltrar}
                    size="lg"
                    className="w-100"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    <FaFilter className="me-2" /> Filtrar Datos
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Sección de estadísticas mejorada */}
          {Object.keys(resumen).length > 0 && (
            <>
              {/* Tarjetas de estadísticas */}
              <Row className="mb-5">
                <Col lg={4} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                    <CardBody className="text-center p-4">
                      <div className="mb-3"
                           style={{
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                             borderRadius: '50%',
                             width: '60px',
                             height: '60px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             margin: '0 auto'
                           }}>
                        <MdTrendingUp className="text-white" size={28} />
                      </div>
                      <h3 className="fw-bold text-primary mb-2">{resumen.promedio_kcal_l || 'N/A'}</h3>
                      <p className="text-muted mb-0 fw-semibold">Promedio Kcal/l</p>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg={4} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                    <CardBody className="text-center p-4">
                      <div className="mb-3"
                           style={{
                             background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                             borderRadius: '50%',
                             width: '60px',
                             height: '60px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             margin: '0 auto'
                           }}>
                        <MdScience className="text-white" size={28} />
                      </div>
                      <h3 className="fw-bold text-primary mb-2">{resumen.total_acidez || 'N/A'}</h3>
                      <p className="text-muted mb-0 fw-semibold">Total Acidez</p>
                    </CardBody>
                  </Card>
                </Col>

                <Col lg={4} md={6} className="mb-3">
                  <Card className="h-100 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                    <CardBody className="text-center p-4">
                      <div className="mb-3"
                           style={{
                             background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                             borderRadius: '50%',
                             width: '60px',
                             height: '60px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             margin: '0 auto'
                           }}>
                        <MdAssessment className="text-white" size={28} />
                      </div>
                      <h3 className="fw-bold text-primary mb-2">{resumen.total_registros || 'N/A'}</h3>
                      <p className="text-muted mb-0 fw-semibold">Total Registros</p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              {/* Botón de imprimir mejorado */}
              <div className="text-center mb-4">
                <Button 
                  onClick={handlePrint}
                  size="lg"
                  style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
                  }}
                >
                  <FaPrint className="me-2" /> Generar Reporte PDF
                </Button>
              </div>

              {/* Tabla mejorada */}
              <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                    <MdAssessment className="me-3" size={24} />
                    Datos Detallados
                  </h5>
                  
                  <div className="table-responsive">
                    <Table className="modern-table mb-0">
                      <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <tr>
                          <th className="text-black fw-semibold border-0 py-3">Promedio Kcal/l</th>
                          <th className="text-black fw-semibold border-0 py-3">Total Acidez</th>
                          <th className="text-black fw-semibold border-0 py-3">Total Registros</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover-row">
                          <td className="py-3">
                            <Badge color="info" className="rounded-pill fs-6 px-3 py-2">
                              {resumen.promedio_kcal_l || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge color="warning" className="rounded-pill fs-6 px-3 py-2">
                              {resumen.total_acidez || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge color="success" className="rounded-pill fs-6 px-3 py-2">
                              {resumen.total_registros || 'N/A'}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>

              {/* Gráfico mejorado */}
              <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="p-4">
                  <h5 className="d-flex align-items-center text-primary fw-bold mb-4">
                    <MdTrendingUp className="me-3" size={24} />
                    Visualización de Datos
                  </h5>
                  
                  <div id="graficoPasteurizacion" className="chart-container">
                    <Bar 
                      data={chartData} 
                      options={{ 
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: '#667eea',
                            borderWidth: 1
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.1)'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>

    {/* Estilos CSS adicionales */}
    <style jsx>{`
      .modern-table {
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 15px;
        overflow: hidden;
      }
      
      .modern-table tbody tr:last-child td:first-child {
        border-bottom-left-radius: 15px;
      }
      
      .modern-table tbody tr:last-child td:last-child {
        border-bottom-right-radius: 15px;
      }

      .hover-row {
        transition: all 0.2s ease;
      }
      
      .hover-row:hover {
        background-color: rgba(102, 126, 234, 0.05);
        transform: scale(1.01);
      }

      .calendar-wrapper .p-calendar {
        width: 100%;
      }

      .calendar-wrapper .p-inputtext {
        border-radius: 10px !important;
        border: 2px solid #e9ecef !important;
        padding: 12px 15px !important;
        transition: all 0.3s ease !important;
      }

      .calendar-wrapper .p-inputtext:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
      }

      .chart-container {
        background: rgba(255, 255, 255, 0.5);
        border-radius: 15px;
        padding: 20px;
      }

      @media (max-width: 768px) {
        .chart-container {
          padding: 10px;
        }
      }
    `}</style>
  </div>
);

};

export default ResumenPasteurizacion;
