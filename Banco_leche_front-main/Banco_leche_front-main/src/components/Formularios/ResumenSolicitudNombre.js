import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { FaSearch, FaBaby, FaCalendarAlt, FaWeight, FaFlask, FaUserMd, FaChartPie, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety, MdAssignment, MdPersonSearch } from 'react-icons/md';
import Swal from 'sweetalert2';

const ResumenSolicitudNombre = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para buscar sugerencias de registros médicos
  const fetchSuggestions = async (value) => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/registro_medico/search/${value}`);
      setSuggestions(response.data.registros || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async (registro_medico) => {
    if (registro_medico) {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8080/api/solicitud_de_leches/detalle/${registro_medico}`);
        setResumen(response.data);
        setShowSuggestions(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          Swal.fire({
            icon: 'info',
            title: 'Sin solicitudes',
            text: 'No se encontraron solicitudes de leche para este registro médico.',
            background: '#fff',
            customClass: {
              popup: 'border-0 shadow-lg'
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.',
            background: '#fff',
            customClass: {
              popup: 'border-0 shadow-lg'
            }
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegistroSelect = (registro) => {
    setSearchTerm(`${registro.registro_medico} - ${registro.recien_nacido}`);
    setShowSuggestions(false);
    handleSearch(registro.registro_medico);
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container fluid className="px-3 px-md-4">
        <Row className="justify-content-center my-4">
          <Col xs={12} lg={11}>
            {/* Header moderno */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     borderRadius: '50px',
                     padding: '15px 30px',
                     boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                   }}>
                <MdPersonSearch className="text-white me-3" size={32} />
                <h2 className="mb-0 text-white fw-bold">Búsqueda de Solicitudes</h2>
              </div>
              <p className="text-muted fs-5">Consulta detallada por registro médico</p>
            </div>
            
            {/* Barra de búsqueda mejorada */}
            <Row className="justify-content-center mb-5">
              <Col xs={12} sm={10} md={8}>
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <div className="position-relative">
                      <div className="input-group" style={{ borderRadius: '15px' }}>
                        <span className="input-group-text bg-transparent border-end-0" 
                              style={{ 
                                borderRadius: '15px 0 0 15px',
                                border: '2px solid #e9ecef',
                                borderRight: 'none'
                              }}>
                          <FaSearch className="text-primary" />
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar por registro médico o nombre del recién nacido..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                          }}
                          className="form-control form-control-lg border-start-0"
                          style={{
                            borderRadius: '0 15px 15px 0',
                            border: '2px solid #e9ecef',
                            borderLeft: 'none',
                            fontSize: '16px',
                            padding: '12px 20px'
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          disabled={isLoading}
                        />
                        {isLoading && (
                          <span className="input-group-text bg-transparent border-start-0" 
                                style={{ 
                                  borderRadius: '0 15px 15px 0',
                                  border: '2px solid #e9ecef',
                                  borderLeft: 'none'
                                }}>
                            <Spinner size="sm" color="primary" />
                          </span>
                        )}
                      </div>
                      
                      {/* Lista de sugerencias mejorada */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="position-absolute w-100 mt-2 shadow-lg bg-white rounded-3 border-0"
                             style={{ 
                               maxHeight: '300px',
                               overflowY: 'auto',
                               zIndex: 1000,
                               top: '100%'
                             }}>
                          {suggestions.map((registro) => (
                            <div
                              key={registro.id_registro_medico}
                              className="p-3 d-flex justify-content-between align-items-center suggestion-item"
                              onClick={() => handleRegistroSelect(registro)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderBottom: '1px solid #f8f9fa'
                              }}
                            >
                              <div>
                                <div className="fw-bold text-primary">{registro.registro_medico}</div>
                                <div className="text-muted small">
                                  <FaBaby className="me-1" />
                                  {registro.recien_nacido}
                                </div>
                              </div>
                              <FaSearch className="text-primary" />
                            </div>
                          ))}
                        </div>
                      )}

                      {showSuggestions && searchTerm.trim().length >= 2 && suggestions.length === 0 && !isLoading && (
                        <div className="position-absolute w-100 mt-2 shadow-sm bg-white rounded-3 border p-3 text-center text-muted"
                             style={{ zIndex: 1000, top: '100%' }}>
                          <FaInfoCircle className="me-2" />
                          No se encontraron registros médicos
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Contenido del resumen */}
            {resumen && (
              <div className="mb-4">
                {/* Card de Información del Paciente */}
                <Card className="mb-5 border-0 shadow-lg hover-card" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <Row>
                      <Col xs={12} md={6} className="mb-4 mb-md-0">
                        <div className="d-flex align-items-center mb-4">
                          <div className="stat-icon me-3" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FaBaby className="text-white" size={20} />
                          </div>
                          <h5 className="mb-0 text-primary fw-bold">Información del Paciente</h5>
                        </div>
                        <div className="bg-light rounded-3 p-3">
                          <div className="mb-3">
                            <strong className="text-primary">Registro Médico:</strong>
                            <div className="fs-5 fw-bold text-dark">{resumen.registro_medico.registro_medico}</div>
                          </div>
                          <div>
                            <strong className="text-primary">Recién Nacido:</strong>
                            <div className="fs-6 text-dark">{resumen.registro_medico.recien_nacido}</div>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={12} md={6}>
                        <div className="d-flex align-items-center mb-4">
                          <div className="stat-icon me-3" style={{
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FaFlask className="text-white" size={20} />
                          </div>
                          <h5 className="mb-0 text-danger fw-bold">Resumen Estadístico</h5>
                        </div>
                        <div className="bg-light rounded-3 p-3">
                          <div className="mb-3">
                            <strong className="text-danger">Total Solicitudes:</strong>
                            <Badge color="info" className="ms-2 rounded-pill fs-6">
                              {resumen.estadisticas.total_solicitudes}
                            </Badge>
                          </div>
                          <div>
                            <strong className="text-danger">Frascos Utilizados:</strong>
                            <Badge color="warning" className="ms-2 rounded-pill fs-6">
                              {resumen.estadisticas.total_frascos}
                            </Badge>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Tarjetas de estadísticas */}
                <Row className="mb-5">
                  <Col md={12} className="mb-4">
                    <h4 className="d-flex align-items-center text-dark fw-bold">
                      <MdInsights className="me-3 text-primary" size={28} />
                      Estadísticas de Consumo
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
                          <FaWeight className="text-white" size={24} />
                        </div>
                        <h3 className="fw-bold text-primary mb-1">{resumen.estadisticas.total_onzas}</h3>
                        <p className="text-muted mb-0">Total Onzas</p>
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
                          <FaFlask className="text-white" size={24} />
                        </div>
                        <h3 className="fw-bold text-danger mb-1">{resumen.estadisticas.total_litros}</h3>
                        <p className="text-muted mb-0">Total Litros</p>
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
                          <FaMoneyBillWave className="text-white" size={24} />
                        </div>
                        <h3 className="fw-bold text-success mb-1">{resumen.estadisticas.total_costos}</h3>
                        <p className="text-muted mb-0">Costo Total</p>
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
                        <h3 className="fw-bold text-warning mb-1">{resumen.estadisticas.total_volumen_solicitado}</h3>
                        <p className="text-muted mb-0">Volumen (ml)</p>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                {/* Información adicional */}
                <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h5 className="card-title text-info mb-4 d-flex align-items-center">
                      <FaChartPie className="me-2" />
                      Información Detallada
                    </h5>
                    <Row>
                      <Col xs={12} md={6} className="mb-4">
                        <div className="mb-4">
                          <h6 className="text-primary fw-bold mb-3">Tipos de Paciente</h6>
                          <div>
                            {resumen.estadisticas.tipos_paciente.map((tipo, index) => (
                              <Badge key={index} color="secondary" className="me-2 mb-2 rounded-pill">
                                {tipo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-primary fw-bold mb-3">Servicios</h6>
                          <div>
                            {resumen.estadisticas.servicios.map((servicio, index) => (
                              <Badge key={index} color="primary" className="me-2 mb-2 rounded-pill">
                                {servicio}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={6} className="mb-4">
                        <div className="mb-4">
                          <h6 className="text-success fw-bold mb-3">Solicitantes</h6>
                          <div>
                            {resumen.estadisticas.solicitantes.map((solicitante, index) => (
                              <Badge key={index} color="success" className="me-2 mb-2 rounded-pill">
                                {solicitante}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-warning fw-bold mb-3 d-flex align-items-center">
                            <FaCalendarAlt className="me-2" />
                            Rango de Fechas
                          </h6>
                          <div className="bg-light rounded-3 p-3">
                            {resumen.estadisticas.rango_fechas.primera_entrega && 
                             resumen.estadisticas.rango_fechas.ultima_entrega ? (
                              <span className="fw-semibold">
                                {formatFecha(resumen.estadisticas.rango_fechas.primera_entrega)} - {' '}
                                {formatFecha(resumen.estadisticas.rango_fechas.ultima_entrega)}
                              </span>
                            ) : 'No disponible'}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Tabla detallada de solicitudes */}
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-0">
                    <div className="p-4 pb-0">
                      <h5 className="card-title d-flex align-items-center text-primary fw-bold mb-4">
                        <MdAssignment className="me-3" size={24} />
                        Detalles de Solicitudes
                        <Badge color="primary" className="ms-3 rounded-pill">{resumen.solicitudes.length}</Badge>
                      </h5>
                    </div>
                    <div className="table-responsive">
                      <Table className="mb-0 modern-table">
                        <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <tr>
                            <th className="text-white fw-semibold border-0 py-3">ID</th>
                            <th className="text-white fw-semibold border-0 py-3">Fecha Entrega</th>
                            <th className="text-white fw-semibold border-0 py-3">Tipo Paciente</th>
                            <th className="text-white fw-semibold border-0 py-3">Servicio</th>
                            <th className="text-white fw-semibold border-0 py-3">Solicita</th>
                            <th className="text-white fw-semibold border-0 py-3">Edad Ingreso</th>
                            <th className="text-white fw-semibold border-0 py-3">Peso Actual</th>
                            <th className="text-white fw-semibold border-0 py-3">Vol. Solicitado</th>
                            <th className="text-white fw-semibold border-0 py-3">Onzas</th>
                            <th className="text-white fw-semibold border-0 py-3">Costo</th>
                            <th className="text-white fw-semibold border-0 py-3">Frasco</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumen.solicitudes.map((solicitud, index) => (
                            <tr key={index} className="hover-row">
                              <td className="py-3">{solicitud.id_solicitud}</td>
                              <td className="py-3">{formatFecha(solicitud.fecha_entrega)}</td>
                              <td className="py-3">
                                <Badge color="secondary" className="rounded-pill">
                                  {solicitud.tipo_paciente}
                                </Badge>
                              </td>
                              <td className="py-3">{solicitud.servicio}</td>
                              <td className="py-3">{solicitud.solicita}</td>
                              <td className="py-3">{solicitud.edad_de_ingreso}</td>
                              <td className="py-3">{solicitud.peso_actual}g</td>
                              <td className="py-3">{solicitud.total_vol_solicitado}ml</td>
                              <td className="py-3">
                                <Badge color="warning" className="rounded-pill">{solicitud.onzas}oz</Badge>
                              </td>
                              <td className="py-3">
                                <Badge color="success" className="rounded-pill">{solicitud.costos}</Badge>
                              </td>
                              <td className="py-3">
                                <Badge color="info" className="rounded-pill">
                                  {solicitud.frasco_info.no_frascoregistro || 'N/A'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Resumen final */}
                    <div className="p-4">
                      <div className="rounded-3 p-4" style={{
                        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                      }}>
                        <Row className="align-items-center">
                          <Col xs={12} md={10}>
                            <h6 className="text-primary mb-0 fw-bold">{resumen.resumen.mensaje}</h6>
                          </Col>
                          <Col xs={12} md={2} className="text-end">
                            <MdHealthAndSafety size={32} className="text-primary" />
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {!resumen && !isLoading && (
              <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="text-center py-5">
                  <div className="mb-4" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <FaSearch size={40} className="text-white" />
                  </div>
                  <h5 className="text-primary fw-bold mb-3">Busca un registro médico para ver sus solicitudes de leche</h5>
                  <p className="text-muted">Ingresa al menos 2 caracteres en el campo de búsqueda para comenzar</p>
                </CardBody>
              </Card>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="text-center py-5">
                  <Spinner color="primary" size="lg" className="mb-3" />
                  <h5 className="text-primary">Buscando información...</h5>
                  <p className="text-muted">Por favor espera mientras procesamos tu consulta</p>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
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
        
        .suggestion-item:hover {
          background-color: rgba(102, 126, 234, 0.05) !important;
          transform: translateX(5px);
        }
        
        .suggestion-item:first-child {
          border-top-left-radius: 15px;
          border-top-right-radius: 15px;
        }
        
        .suggestion-item:last-child {
          border-bottom-left-radius: 15px;
          border-bottom-right-radius: 15px;
          border-bottom: none !important;
        }
        
        .input-group:focus-within .input-group-text {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .input-group:focus-within .form-control {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        @media (max-width: 768px) {
          .stat-icon {
            width: 50px !important;
            height: 50px !important;
          }
          
          .modern-table {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumenSolicitudNombre;