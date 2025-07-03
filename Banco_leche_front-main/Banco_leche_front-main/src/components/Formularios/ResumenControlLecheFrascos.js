import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Card, CardBody, Button } from 'reactstrap';
import { FaFilter, FaPrint } from 'react-icons/fa';
import { Calendar } from 'primereact/calendar';
import { locale, addLocale } from 'primereact/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../Images/backgrounds/Logo_banco2.png';


const ResumenControlLecheFrascos = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [datosControl, setDatosControl] = useState(null);
  const [loading, setLoading] = useState(false);

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
        const response = await axios.get(
          `http://localhost:8080/api/control_de_leches/control-de-leche/totales?fechaInicio=${fechaInicio.toISOString().split('T')[0]}&fechaFin=${fechaFin.toISOString().split('T')[0]}`
        );
        
        setDatosControl(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Vacíos',
        text: 'Por favor, completa las fechas de inicio y fin.',
      });
    }
  };

  const handlePrint = () => {
    if (!datosControl) return;
  
    const doc = new jsPDF();
    
    // Añadir logo
    const imgLogo = new Image();
    imgLogo.src = logo;
    doc.addImage(imgLogo, 'PNG', 10, 10, 35, 33);
  
    // Configuración del encabezado
    doc.setFontSize(14);
    doc.text('Control de Leche Pasteurizada', 75, 20);
  
    doc.setFontSize(12);
    doc.text(`Período: ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`, 77, 25);
    doc.text(`Total Frascos: ${datosControl.totalFrascos}`, 70, 30);
    doc.text(`Total Unidosis: ${datosControl.totalUnidosis}`, 120, 30);
  
    // Definición de columnas para la tabla
    const tableColumn = [
      "ID",
      "No.Frasco",
      "Fecha Almacenamiento",
      "Volumen/ml",
      "kca/l",
      "Grasa %",
      "Acidez",
      "Tipo leche",
      "Fecha entrega",
      "responsable"
    ];
  
    // Transformación de datos para la tabla
    const tableRows = datosControl.registros.map(registro => [
      '',
      registro.NoFrasco,
      '',
      `${registro.Volumen} ml`,
      registro.Kcal_l,
      registro.Grasa,
      registro.Acidez,
      registro.TipoDeLeche,
    ]);
  
    // Configuración de colores por volumen
    const volumeColors = {
      10: [255, 0, 0],     // Rojo
      20: [255, 165, 0],   // Naranja
      30: [0, 255, 0]      // Verde
    };
  
    // Configuración de la tabla
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 10 },
      bodyStyles: { valign: "middle" },
      didParseCell: function(data) {
        // Verificar si es la columna de volumen (índice 3)
        if (data.column.index === 3) {
          // Extraer el valor numérico del volumen
          const volumeStr = data.cell.raw;
          const volume = parseInt(volumeStr);
          
          // Si el volumen tiene un color asociado, aplicarlo a toda la fila
          if (volume in volumeColors) {
            Object.values(data.row.cells).forEach((cell) => {
              cell.styles.textColor = volumeColors[volume];
            });
          }
        }
      }
    });
  
    doc.save('ControlLecheFrascos.pdf');
  };

  return (
  <Container fluid className="py-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
    {/* Header Principal */}
    <div className="text-center mb-5">
      <div className="d-inline-flex align-items-center justify-content-center mb-3" 
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             borderRadius: '50%',
             width: '80px',
             height: '80px',
             boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
           }}>
        <FaFilter className="text-white" size={35} />
      </div>
      <h2 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Control de Leche Pasteurizada</h2>
      <p className="text-muted fs-5">Sistema de gestión y control de calidad</p>
    </div>

    {/* Panel de Filtros */}
    <Card className="mb-4 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
      <CardBody className="p-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div className="row align-items-end">
          <div className="col-md-4">
            <label htmlFor="fechaInicio" className="form-label fw-semibold mb-2">
              <i className="fas fa-calendar-alt me-2 text-primary"></i>
              Fecha de Inicio
            </label>
            <div className="position-relative">
              <Calendar
                id="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.value)}
                showIcon
                dateFormat="yy-mm-dd"
                placeholder="Seleccione fecha inicial"
                className="w-100"
                style={{ borderRadius: '10px' }}
              />
            </div>
          </div>

          <div className="col-md-4">
            <label htmlFor="fechaFin" className="form-label fw-semibold mb-2">
              <i className="fas fa-calendar-check me-2 text-success"></i>
              Fecha de Fin
            </label>
            <div className="position-relative">
              <Calendar
                id="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.value)}
                showIcon
                dateFormat="yy-mm-dd"
                placeholder="Seleccione fecha final"
                className="w-100"
                style={{ borderRadius: '10px' }}
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="d-flex gap-2">
              <Button 
                onClick={handleFiltrar} 
                disabled={loading}
                className="btn-lg flex-fill d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 20px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Filtrando...
                  </>
                ) : (
                  <>
                    <FaFilter className="me-2" size={16} />
                    Filtrar
                  </>
                )}
              </Button>

              <Button 
                onClick={handlePrint} 
                disabled={!datosControl}
                className="btn-lg d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 20px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
                  opacity: !datosControl ? 0.6 : 1
                }}
              >
                <FaPrint className="me-2" size={16} />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>

    {/* Resumen General */}
    {datosControl && (
      <div className="row mb-4">
        <div className="col-md-6">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '18px' }}>
            <CardBody className="p-4 text-center" 
                     style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-flask text-white" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
              <h3 className="text-white fw-bold mb-1">{datosControl.totalFrascos}</h3>
              <p className="text-white-50 mb-0 fw-semibold">Total de Frascos</p>
            </CardBody>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '18px' }}>
            <CardBody className="p-4 text-center" 
                     style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="d-flex align-items-center justify-content-center mb-3">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-vial text-white" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
              <h3 className="text-white fw-bold mb-1">{datosControl.totalUnidosis}</h3>
              <p className="text-white-50 mb-0 fw-semibold">Total Unidosis</p>
            </CardBody>
          </Card>
        </div>
      </div>
    )}

    {/* Tabla de Detalles */}
    {datosControl && (
      <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
        <div className="card-header border-0 py-4" 
             style={{ 
               background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
               borderRadius: '20px 20px 0 0'
             }}>
          <h4 className="mb-0 text-white fw-bold d-flex align-items-center">
            <i className="fas fa-list-alt me-3"></i>
            Detalle de Frascos ({datosControl.registros.length} registros)
          </h4>
        </div>
        
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table className="mb-0" style={{ fontSize: '14px' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-hashtag me-2 text-primary"></i>ID
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-flask me-2 text-success"></i>No. Frasco
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-calendar me-2 text-info"></i>F. Almacenamiento
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-tint me-2 text-warning"></i>Volumen (ml)
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-fire me-2 text-danger"></i>Kcal/L
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-percentage me-2 text-purple"></i>Grasa (%)
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-vial me-2 text-indigo"></i>Acidez
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-tags me-2 text-pink"></i>Tipo de Leche
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-calendar-check me-2 text-green"></i>F. Entrega
                  </th>
                  <th className="fw-bold text-dark py-3 px-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <i className="fas fa-user me-2 text-blue"></i>Responsable
                  </th>
                </tr>
              </thead>
              <tbody>
                {datosControl.registros.map((registro, index) => (
                  <tr key={registro.ID} 
                      className="hover-row"
                      style={{ 
                        transition: 'all 0.3s ease',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                    <td className="py-3 px-4">
                      <span className="badge bg-primary rounded-pill px-3 py-2">
                        {registro.ID}
                      </span>
                    </td>
                    <td className="py-3 px-4 fw-semibold text-dark">{registro.NoFrasco}</td>
                    <td className="py-3 px-4 text-muted">{registro.FechaAlmacenamiento}</td>
                    <td className="py-3 px-4">
                      <span className={`badge rounded-pill px-3 py-2 ${
                        registro.Volumen <= 10 ? 'bg-danger' : 
                        registro.Volumen <= 20 ? 'bg-warning' : 'bg-success'
                      }`}>
                        {registro.Volumen} ml
                      </span>
                    </td>
                    <td className="py-3 px-4 text-dark fw-semibold">{registro.Kcal_l}</td>
                    <td className="py-3 px-4 text-dark fw-semibold">{registro.Grasa}%</td>
                    <td className="py-3 px-4 text-dark">{registro.Acidez}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-info text-dark rounded-pill px-3 py-2">
                        {registro.TipoDeLeche}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">{registro.FechaEntrega || 'Pendiente'}</td>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '8px'
                        }}>
                          <i className="fas fa-user text-white" style={{ fontSize: '12px' }}></i>
                        </div>
                        <span className="fw-semibold text-dark">{registro.Responsable}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    )}

    {/* Estado sin datos */}
    {!datosControl && !loading && (
      <Card className="border-0 shadow-sm text-center py-5" style={{ borderRadius: '20px' }}>
        <CardBody>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <i className="fas fa-search text-white" style={{ fontSize: '40px' }}></i>
          </div>
          <h4 className="text-muted mb-3">No hay datos para mostrar</h4>
          <p className="text-muted">Selecciona un rango de fechas y presiona "Filtrar" para ver los resultados</p>
        </CardBody>
      </Card>
    )}

    {/* Estilos CSS adicionales */}
    <style jsx>{`
      .hover-row:hover {
        background-color: rgba(102, 126, 234, 0.05) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
      }

      .card:hover {
        transform: translateY(-5px);
        transition: all 0.3s ease;
      }

      .table th {
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .badge {
        font-size: 12px;
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .btn-lg {
          font-size: 14px;
          padding: 10px 16px;
        }
        
        .table-responsive {
          font-size: 12px;
        }
        
        .card-body {
          padding: 1rem;
        }
      }
    `}</style>
  </Container>
);
};

export default ResumenControlLecheFrascos;