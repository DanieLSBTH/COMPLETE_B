import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Badge, Spinner } from 'reactstrap';
import { FaSearch, FaFlask, FaCalendarAlt, FaWeight, FaThermometer, FaUserMd, FaChartPie,  FaInfoCircle } from 'react-icons/fa';
import { MdTrendingUp, MdInsights, MdHealthAndSafety,  MdAssignment, MdLocalDrink, MdScience } from 'react-icons/md';
import Swal from 'sweetalert2';

const ShowFrascoDetalladoSolicitud = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [frascoData, setFrascoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Agrega estas variables de estado al componente
const [controlLecheDetallado, setControlLecheDetallado] = useState(null);
const [showDetallado, setShowDetallado] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Función para buscar sugerencias de frascos
  const fetchSuggestions = async (value) => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/control_de_leches/search/frasco`, {
        params: {
          no_frascoregistro: value,
          pageSize: 10, // Limitamos las sugerencias
          page: 1
        }
      });
      setSuggestions(response.data.controlDeLeches || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar búsqueda completa
  const fetchFrascoData = async (searchValue, page = 1) => {
    if (!searchValue.trim()) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/control_de_leches/search/frasco`, {
        params: {
          no_frascoregistro: searchValue,
          page: page,
          pageSize: 20
        }
      });
      
      setFrascoData(response.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalRecords(response.data.totalRecords);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error fetching frasco data:', error);
      if (error.response && error.response.status === 404) {
        Swal.fire({
          icon: 'info',
          title: 'Sin resultados',
          text: 'No se encontraron frascos con ese número de registro.',
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
      setFrascoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para manejar el debounce de la búsqueda de sugerencias
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, showSuggestions]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchFrascoData(searchTerm, 1);
    }
  };

  // Modifica la función handleSuggestionSelect para incluir el botón de detalle
const handleSuggestionSelect = (frasco) => {
  setSearchTerm(frasco.no_frascoregistro);
  setShowSuggestions(false);
  fetchFrascoData(frasco.no_frascoregistro, 1);
  
  // Opcional: Obtener automáticamente el detalle si tienes el ID
  if (frasco.id_control_leche) {
    fetchControlLecheDetallado(frasco.id_control_leche);
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

// Función para volver a la vista de búsqueda
const handleVolverBusqueda = () => {
  setShowDetallado(false);
  setControlLecheDetallado(null);
};
// Agrega esta función para manejar el click en "Ver Detalle"
const handleVerDetalle = (idControlLeche) => {
  fetchControlLecheDetallado(idControlLeche);
};
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchFrascoData(searchTerm, newPage);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };
// Función para obtener el detalle del control de leche
const fetchControlLecheDetallado = async (idControlLeche) => {
  try {
    setIsLoading(true);
    const response = await axios.get(`http://localhost:8080/api/solicitud_de_leches/detalle/control-leche/${idControlLeche}`);
    setControlLecheDetallado(response.data);
    setShowDetallado(true);
  } catch (error) {
    console.error('Error fetching control leche detallado:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo obtener el detalle del control de leche.',
      background: '#fff',
      customClass: {
        popup: 'border-0 shadow-lg'
      }
    });
  } finally {
    setIsLoading(false);
  }
};
  const getEstadoBadgeColor = (estado) => {
    return estado ? 'success' : 'danger';
  };

  const getTipoLecheBadgeColor = (tipo) => {
    const colores = {
      'Madura': 'primary',
      'Transición': 'info',
      'Calostro': 'warning'
    };
    return colores[tipo] || 'secondary';
  };

  const getTipoFrascoBadgeColor = (tipoFrasco, unidosis) => {
    if (unidosis) return 'warning';
    return tipoFrasco ? 'info' : 'secondary';
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
                <FaFlask className="text-white me-3" size={32} />
                <h2 className="mb-0 text-white fw-bold">Búsqueda de Frascos</h2>
              </div>
              <p className="text-muted fs-5">Control detallado de leches almacenadas</p>
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
                          placeholder="Buscar por número de frasco..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onKeyPress={handleKeyPress}
                          className="form-control form-control-lg border-start-0 border-end-0"
                          style={{
                            border: '2px solid #e9ecef',
                            borderLeft: 'none',
                            borderRight: 'none',
                            fontSize: '16px',
                            padding: '12px 20px'
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          disabled={isLoading}
                        />
                        <Button
                          color="primary"
                          onClick={handleSearch}
                          disabled={isLoading || !searchTerm.trim()}
                          style={{ 
                            borderRadius: '0 15px 15px 0',
                            border: '2px solid #667eea',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          {isLoading ? <Spinner size="sm" /> : 'Buscar'}
                        </Button>
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
                          {suggestions.map((frasco) => (
                            <div
                              key={frasco.id_control_leche}
                              className="p-3 d-flex justify-content-between align-items-center suggestion-item"
                              onClick={() => handleSuggestionSelect(frasco)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderBottom: '1px solid #f8f9fa'
                              }}
                            >
                              <div>
                                <div className="fw-bold text-primary">{frasco.no_frascoregistro}</div>
                                <div className="text-muted small d-flex align-items-center">
                                  <FaInfoCircle className="me-1" />
                                  {frasco.tipo_de_leche} - {frasco.volumen_ml_onza}ml
                                  <Badge 
                                    color={getEstadoBadgeColor(frasco.estado)} 
                                    className="ms-2 rounded-pill"
                                    style={{ fontSize: '0.7rem' }}
                                  >
                                    {frasco.estado_texto}
                                  </Badge>
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
                          No se encontraron frascos
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Contenido de los resultados */}
            {frascoData && frascoData.controlDeLeches && frascoData.controlDeLeches.length > 0 && (
              <div className="mb-4">
                {/* Información de la búsqueda */}
                <Card className="mb-4 border-0 shadow-lg hover-card" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <Row className="align-items-center">
                      <Col xs={12} md={8}>
                        <div className="d-flex align-items-center mb-3">
                          <div className="stat-icon me-3" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <MdInsights className="text-white" size={20} />
                          </div>
                          <div>
                            <h5 className="mb-0 text-primary fw-bold">Resultados de Búsqueda</h5>
                            <p className="mb-0 text-muted">
                              Término: "{frascoData.searchTerm}" - Búsqueda {frascoData.searchType}
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={4} className="text-end">
                        <div className="d-flex justify-content-end align-items-center">
                          <Badge color="info" className="me-2 rounded-pill fs-6">
                            {totalRecords} registros
                          </Badge>
                          <Badge color="primary" className="rounded-pill fs-6">
                            Página {currentPage} de {totalPages}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Tabla de resultados */}
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-0">
                    <div className="p-4 pb-0">
                      <h5 className="card-title d-flex align-items-center text-primary fw-bold mb-4">
                        <MdLocalDrink className="me-3" size={24} />
                        Control de Leches
                        <Badge color="primary" className="ms-3 rounded-pill">{frascoData.controlDeLeches.length}</Badge>
                      </h5>
                    </div>
                    <div className="table-responsive">
                      <Table className="mb-0 modern-table">
                        <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <tr>
                            <th className="text-white fw-semibold border-0 py-3">Frasco</th>
                            <th className="text-white fw-semibold border-0 py-3">Tipo</th>
                            <th className="text-white fw-semibold border-0 py-3">Volumen</th>
                            <th className="text-white fw-semibold border-0 py-3">Tipo Leche</th>
                            <th className="text-white fw-semibold border-0 py-3">Almacenamiento</th>
                            <th className="text-white fw-semibold border-0 py-3">Entrega</th>
                            <th className="text-white fw-semibold border-0 py-3">Responsable</th>
                            <th className="text-white fw-semibold border-0 py-3">Estado</th>
                            <th className="text-white fw-semibold border-0 py-3">Pasteurización</th>
                            <th className="text-white fw-semibold border-0 py-3">Acciones</th>

                          </tr>
                        </thead>
                        <tbody>
                          {frascoData.controlDeLeches.map((frasco, index) => (
                            <tr key={index} className="hover-row">
                              <td className="py-3">
                                <div className="fw-bold text-primary">{frasco.no_frascoregistro}</div>
                                <div className="text-muted small">ID: {frasco.id_control_leche}</div>
                              </td>
                              <td className="py-3">
                                <div className="d-flex flex-column">
                                  {frasco.frasco && (
                                    <Badge color="info" className="mb-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                      Frasco: {frasco.tipo_frasco || 'N/A'}
                                    </Badge>
                                  )}
                                  {frasco.unidosis && (
                                    <Badge color="warning" className="rounded-pill" style={{ fontSize: '0.7rem' }}>
                                      Unidosis: {frasco.tipo_unidosis}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <FaWeight className="text-primary me-2" />
                                  <span className="fw-bold">{frasco.volumen_ml_onza}ml</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge 
                                  color={getTipoLecheBadgeColor(frasco.tipo_de_leche)} 
                                  className="rounded-pill"
                                >
                                  {frasco.tipo_de_leche}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <FaCalendarAlt className="text-info me-2" />
                                  <span>{(frasco.fecha_almacenamiento)}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <FaCalendarAlt className="text-success me-2" />
                                  <span>{(frasco.fecha_entrega)}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <FaUserMd className="text-secondary me-2" />
                                  <span>{frasco.responsable}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge 
                                  color={getEstadoBadgeColor(frasco.estado)} 
                                  className="rounded-pill"
                                >
                                  {frasco.estado_texto}
                                </Badge>
                              </td>
                              <td className="py-3">
  {frasco.trabajo_de_pasteurizaciones && (
    <div className="bg-light rounded-3 p-2">
      <div className="small">
        <div><FaFlask className="me-2 text-primary" /><strong>Frasco:</strong> {frasco.trabajo_de_pasteurizaciones.no_frasco}</div>
        <div><MdTrendingUp className="me-2 text-success" /><strong>Kcal/L:</strong> {frasco.trabajo_de_pasteurizaciones.kcal_l}</div>
        <div><FaChartPie className="me-2 text-warning" /><strong>Grasa:</strong> {frasco.trabajo_de_pasteurizaciones.porcentaje_grasa}%</div>
        <div><MdScience className="me-2 text-danger" /><strong>Acidez:</strong> {frasco.trabajo_de_pasteurizaciones.acidez}</div>
      </div>
    </div>
  )}
</td>

<td className="py-3">
  <Button
    color="primary"
    size="sm"
    onClick={() => handleVerDetalle(frasco.id_control_leche)}
    className="me-2"
    style={{ borderRadius: '20px' }}
  >
    <FaInfoCircle className="me-1" />
    Ver Detalle
  </Button>
</td>

                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="p-4 border-top">
                        <Row className="align-items-center">
                          <Col xs={12} md={6}>
                            <div className="d-flex align-items-center">
                              <span className="text-muted me-3">
                                Mostrando {((currentPage - 1) * frascoData.pageSize) + 1} - {Math.min(currentPage * frascoData.pageSize, totalRecords)} de {totalRecords} registros
                              </span>
                            </div>
                          </Col>
                          <Col xs={12} md={6} className="text-end">
                            <div className="d-flex justify-content-end align-items-center">
                              <Button
                                outline
                                color="primary"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="me-2"
                              >
                                Anterior
                              </Button>
                              <span className="mx-3 text-muted">
                                Página {currentPage} de {totalPages}
                              </span>
                              <Button
                                outline
                                color="primary"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                              >
                                Siguiente
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {!frascoData && !isLoading && (
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
                    <FaFlask size={40} className="text-white" />
                  </div>
                  <h5 className="text-primary fw-bold mb-3">Busca un frasco para ver su información detallada</h5>
                  <p className="text-muted">Ingresa al menos 2 caracteres en el campo de búsqueda para comenzar</p>
                </CardBody>
              </Card>
            )}

            {/* Mensaje cuando se busca pero no hay resultados */}
            {frascoData && frascoData.controlDeLeches && frascoData.controlDeLeches.length === 0 && (
              <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="text-center py-5">
                  <div className="mb-4" style={{
                    background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto'
                  }}>
                    <FaInfoCircle size={40} className="text-white" />
                  </div>
                  <h5 className="text-warning fw-bold mb-3">No se encontraron frascos</h5>
                  <p className="text-muted">No hay frascos registrados que coincidan con tu búsqueda: "{frascoData.searchTerm}"</p>
                </CardBody>
              </Card>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                <CardBody className="text-center py-5">
                  <Spinner color="primary" size="lg" className="mb-3" />
                  <h5 className="text-primary">Buscando frascos...</h5>
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
            width: 40px !important;
            height: 40px !important;
          }
          
          .modern-table {
            font-size: 0.875rem;
          }
          
          .modern-table td {
            padding: 0.75rem 0.5rem !important;
          }
        }
      `}</style>

{showDetallado && controlLecheDetallado && (
  <div className="mb-4">
    {/* Header del detalle */}
    <Card className="mb-4 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <div className="stat-icon me-3" style={{
              background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MdAssignment className="text-white" size={20} />
            </div>
            <div>
              <h4 className="mb-0 text-primary fw-bold">Control de Leche Detallado</h4>
              <p className="mb-0 text-muted">Frasco: {controlLecheDetallado.control_leche.no_frascoregistro}</p>
            </div>
          </div>
          <Button
            color="secondary"
            outline
            onClick={handleVolverBusqueda}
            style={{ borderRadius: '20px' }}
          >
            <FaSearch className="me-2" />
            Volver a Búsqueda
          </Button>
        </div>

        {/* Información del control de leche */}
        <Row>
          <Col md={6}>
            <div className="bg-light rounded-3 p-3 mb-3">
              <h6 className="text-primary fw-bold mb-3">
                <FaFlask className="me-2" />
                Información del Frasco
              </h6>
              <div className="small">
                <div className="mb-2"><strong>ID Control:</strong> {controlLecheDetallado.control_leche.id_control_leche}</div>
                <div className="mb-2"><strong>No. Frasco:</strong> {controlLecheDetallado.control_leche.no_frascoregistro}</div>
                <div className="mb-2"><strong>Volumen:</strong> {controlLecheDetallado.control_leche.volumen_ml_onza} ml</div>
                <div><strong>Fecha Almacenamiento:</strong> {(controlLecheDetallado.control_leche.fecha_almacenamiento)}</div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <div className="bg-light rounded-3 p-3 mb-3">
              <h6 className="text-info fw-bold mb-3">
                <MdScience className="me-2" />
                Información de Pasteurización
              </h6>
              <div className="small">
                <div className="mb-2"><strong>No. Frasco:</strong> {controlLecheDetallado.control_leche.pasteurizacion_info.no_frasco}</div>
                <div className="mb-2"><strong>Kcal/L:</strong> {controlLecheDetallado.control_leche.pasteurizacion_info.kcal_l}</div>
                <div className="mb-2"><strong>% Grasa:</strong> {controlLecheDetallado.control_leche.pasteurizacion_info.porcentaje_grasa}%</div>
                <div><strong>Acidez:</strong> {controlLecheDetallado.control_leche.pasteurizacion_info.acidez}</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Estadísticas */}
        <Row>
          <Col md={3}>
            <div className="text-center p-3 bg-primary text-white rounded-3">
              <h3 className="mb-0">{controlLecheDetallado.estadisticas.total_solicitudes}</h3>
              <small>Solicitudes</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-3 bg-success text-white rounded-3">
              <h3 className="mb-0">{controlLecheDetallado.estadisticas.total_onzas}</h3>
              <small>Onzas Entregadas</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-3 bg-info text-white rounded-3">
              <h3 className="mb-0">{controlLecheDetallado.estadisticas.total_litros}</h3>
              <small>Litros</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="text-center p-3 bg-warning text-white rounded-3">
              <h3 className="mb-0">{(controlLecheDetallado.estadisticas.total_costos)}</h3>
              <small>Costo Total</small>
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>

    {/* Tabla de solicitudes */}
    <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
      <CardBody className="p-0">
        <div className="p-4 pb-0">
          <h5 className="card-title d-flex align-items-center text-primary fw-bold mb-4">
            <MdHealthAndSafety className="me-3" size={24} />
            Solicitudes de Leche
            <Badge color="primary" className="ms-3 rounded-pill">
              {controlLecheDetallado.solicitudes.length}
            </Badge>
          </h5>
        </div>
        
        <div className="table-responsive">
          <Table className="mb-0 modern-table">
            <thead style={{ background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)' }}>
              <tr>
                <th className="text-white fw-semibold border-0 py-3">Solicitud</th>
                <th className="text-white fw-semibold border-0 py-3">Paciente</th>
                <th className="text-white fw-semibold border-0 py-3">Registro Médico</th>
                <th className="text-white fw-semibold border-0 py-3">Servicio</th>
                <th className="text-white fw-semibold border-0 py-3">Volumen</th>
                <th className="text-white fw-semibold border-0 py-3">Fecha Entrega</th>
                <th className="text-white fw-semibold border-0 py-3">Costo</th>
              </tr>
            </thead>
            <tbody>
              {controlLecheDetallado.solicitudes.map((solicitud) => (
                <tr key={solicitud.id_solicitud} className="hover-row">
                  <td className="py-3">
                    <div className="fw-bold text-primary">#{solicitud.id_solicitud}</div>
                    <div className="text-muted small">
                      <Badge color="info" className="rounded-pill" style={{ fontSize: '0.7rem' }}>
                        {solicitud.tipo_paciente}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="small">
                      <div><strong>Nacimiento:</strong> {formatFecha(solicitud.fecha_nacimiento)}</div>
                      <div><strong>Peso actual:</strong> {solicitud.peso_actual} kg</div>
                      <div><strong>Peso al nacer:</strong> {solicitud.peso_al_nacer} kg</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold">{solicitud.registro_medico_info.registro_medico}</div>
                    <div className="text-muted small">{solicitud.registro_medico_info.recien_nacido}</div>
                  </td>
                  <td className="py-3">
                    <Badge color="secondary" className="rounded-pill">
                      {solicitud.servicio}
                    </Badge>
                    <div className="text-muted small mt-1">
                      Solicita: {solicitud.solicita}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="small">
                      <div><strong>Onzas:</strong> {solicitud.onzas}</div>
                      <div><strong>Litros:</strong> {solicitud.litros}</div>
                      <div><strong>Vol. CC:</strong> {solicitud.volumen_toma_cc}</div>
                      <div><strong>Tomas:</strong> {solicitud.numero_tomas}</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="text-success me-2" />
                      <span>{(solicitud.fecha_entrega)}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold text-success">
                      {(solicitud.costos)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Resumen */}
        <div className="p-4 border-top bg-light">
          <Row>
            <Col md={8}>
              <h6 className="text-primary fw-bold mb-2">
                <MdTrendingUp className="me-2" />
                Resumen del Control
              </h6>
              <div className="mb-0">
                El control de frasco: {(controlLecheDetallado.control_leche.no_frascoregistro)} tiene{controlLecheDetallado.resumen.registros_medicos_atendidos} registros médicos
              </div>
              <div className="small text-muted">
                Período: {(controlLecheDetallado.estadisticas.rango_fechas.primera_entrega)} - {(controlLecheDetallado.estadisticas.rango_fechas.ultima_entrega)}
              </div>
            </Col>
           
          </Row>
        </div>
      </CardBody>
    </Card>
  </div>
)}
    </div>
  );
};

export default ShowFrascoDetalladoSolicitud;