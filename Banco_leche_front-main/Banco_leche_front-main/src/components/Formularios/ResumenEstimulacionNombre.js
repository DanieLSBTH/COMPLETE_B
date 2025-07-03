import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Spinner, Badge } from 'reactstrap';
import { FaSearch, FaChevronDown, FaUser, FaCalendarAlt, FaHospital, FaUsers, FaChartBar, FaEye, FaStethoscope } from 'react-icons/fa';
import { MdHealthAndSafety, MdInsights, MdTrendingUp, MdVisibility } from 'react-icons/md';
import Swal from 'sweetalert2';

const ResumenEstimulacionNombre = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);
  
  // Estados para paginación avanzada
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Debounce personalizado
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Función mejorada para buscar sugerencias con la nueva API
  const fetchSuggestions = useCallback(async (value, page = 1) => {
    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setSearchMetadata(null);
      setTotalRecords(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPrevPage(false);
      return;
    }

    try {
      setIsSearching(true);
      
      const response = await axios.get('http://localhost:8080/api/personal_estimulacion/search/advanced', {
        params: {
          q: value.trim(),
          page: page,
          limit: 10 // Limitamos a 10 sugerencias para mejor UX
        },
        timeout: 5000 // Timeout de 5 segundos
      });

      const data = response.data;
      
      // Si es la primera página, reemplazamos las sugerencias
      if (page === 1) {
        setSuggestions(data.personal_estimulaciones || []);
      } else {
        setSuggestions(prev => [...prev, ...(data.personal_estimulaciones || [])]);
      }
      
      // Actualizamos metadatos de paginación
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setTotalRecords(data.totalRecords || 0);
      setHasNextPage(data.hasNextPage || false);
      setHasPrevPage(data.hasPrevPage || false);
      
      setSearchMetadata({
        searchTerm: data.searchTerm,
        totalRecords: data.totalRecords,
        currentPage: data.currentPage,
        totalPages: data.totalPages
      });
      
      console.log('Búsqueda avanzada ejecutada:', {
        término: data.searchTerm,
        resultados: data.personal_estimulaciones?.length || 0,
        total: data.totalRecords
      });

    } catch (error) {
      console.error('Error fetching suggestions:', error);
      
      // Manejo de errores específicos
      if (error.code === 'ECONNABORTED') {
        console.warn('Timeout en búsqueda, manteniendo resultados anteriores');
      } else if (error.response?.status === 400) {
        console.warn('Parámetros de búsqueda inválidos:', error.response.data.message);
        setSuggestions([]);
      } else {
        // Para otros errores, limpiamos las sugerencias
        setSuggestions([]);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Efecto para manejar el debounce de la búsqueda
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchSuggestions(debouncedSearchTerm, 1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchMetadata(null);
    }
  }, [debouncedSearchTerm, fetchSuggestions]);

  // Función para cargar más resultados
  const loadMoreSuggestions = useCallback(() => {
    if (hasNextPage && !isSearching && debouncedSearchTerm) {
      fetchSuggestions(debouncedSearchTerm, currentPage + 1);
    }
  }, [hasNextPage, isSearching, debouncedSearchTerm, currentPage, fetchSuggestions]);

  const handleSearch = async (id_personal_estimulacion) => {
    if (id_personal_estimulacion) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/estimulacion/buscar/id_personal_estimulacion?id_personal_estimulacion=${id_personal_estimulacion}`,
          { timeout: 10000 } // Timeout de 10 segundos para esta consulta más pesada
        );
        setResumen(response.data);
        setShowSuggestions(false);
      } catch (error) {
        console.error('Error al obtener resumen:', error);
        
        let errorMessage = 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'La consulta tardó demasiado tiempo. Por favor, intenta nuevamente.';
        } else if (error.response?.status === 404) {
          errorMessage = 'No se encontraron datos para este personal.';
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
        setIsLoading(false);
      }
    }
  };

  const handlePersonSelect = (person) => {
    const nombreCompleto = person.nombre_completo || `${person.nombre} ${person.apellido}`;
    setSearchTerm(nombreCompleto);
    setShowSuggestions(false);
    handleSearch(person.id_personal_estimulacion);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setCurrentPage(1); // Reset pagination cuando cambia el término de búsqueda
    
    // Limpiar resumen si el campo se vacía
    if (!value.trim()) {
      setResumen(null);
      setSearchMetadata(null);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir click en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(251, 253, 255) 100%)',
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
                     background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                     borderRadius: '50px',
                     padding: '15px 30px',
                     boxShadow: '0 10px 30px rgba(33, 150, 243, 0.3)'
                   }}>
                <MdHealthAndSafety className="text-white me-3" size={32} />
                <h2 className="mb-0 text-white fw-bold">Resumen de Estimulación por Personal</h2>
              </div>
              <p className="text-muted fs-5">Consulta detallada del historial de visitas y estimulación</p>
            </div>
            
            {/* Barra de búsqueda mejorada */}
            <Row className="justify-content-center mb-5">
              <Col xs={12} sm={8} md={6}>
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <div className="position-relative">
                      <div className="input-group" style={{ borderRadius: '15px' }}>
                        <input
                          type="text"
                          placeholder="Ingrese el nombre del personal (mín. 2 caracteres)"
                          value={searchTerm}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          className="form-control search-input"
                          disabled={isLoading}
                          style={{
                            borderRadius: '15px 0 0 15px',
                            border: '2px solid #e9ecef',
                            padding: '12px 20px',
                            fontSize: '16px',
                            transition: 'all 0.3s ease'
                          }}
                        />
                        <div className="input-group-append">
                          <span className="input-group-text search-icon" 
                                style={{
                                  borderRadius: '0 15px 15px 0',
                                  border: '2px solid #e9ecef',
                                  borderLeft: 'none',
                                  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                  color: 'white',
                                  padding: '12px 20px'
                                }}>
                            {isSearching ? (
                              <Spinner size="sm" color="light" />
                            ) : (
                              <FaSearch />
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* Lista de sugerencias mejorada */}
                      {showSuggestions && (
                        <div className="position-absolute w-100 mt-2 shadow-lg bg-white rounded-lg border-0"
                             style={{ 
                               maxHeight: '300px',
                               overflowY: 'auto',
                               zIndex: 1000,
                               top: '100%',
                               borderRadius: '15px',
                               boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                             }}>
                          
                          {/* Header con información de resultados */}
                          {totalRecords > 0 && (
                            <div className="px-3 py-2 border-bottom small text-muted"
                                 style={{ 
                                   background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                   borderRadius: '15px 15px 0 0'
                                 }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold">
                                  {totalRecords} resultado{totalRecords !== 1 ? 's' : ''} encontrado{totalRecords !== 1 ? 's' : ''}
                                </span>
                                {totalPages > 1 && (
                                  <Badge 
                                    style={{
                                      background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                      borderRadius: '20px'
                                    }}
                                  >
                                    Página {currentPage} de {totalPages}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Lista de sugerencias */}
                          {suggestions.map((person) => (
                            <div
                              key={person.id_personal_estimulacion}
                              className="px-3 py-3 border-bottom suggestion-item d-flex justify-content-between align-items-center"
                              onClick={() => handlePersonSelect(person)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="me-3"
                                     style={{
                                       background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                       borderRadius: '50%',
                                       width: '40px',
                                       height: '40px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center'
                                     }}>
                                  <FaStethoscope className="text-white" size={16} />
                                </div>
                                <div>
                                  <div className="fw-bold">
                                    {person.nombre_completo || `${person.nombre} ${person.apellido}`}
                                  </div>
                                  <small className="text-muted">ID: {person.id_personal_estimulacion}</small>
                                </div>
                              </div>
                              <FaSearch className="text-muted" size={12} />
                            </div>
                          ))}

                          {/* Botón para cargar más resultados */}
                          {hasNextPage && suggestions.length > 0 && (
                            <div className="text-center p-3 border-top">
                              <Button 
                                size="sm" 
                                onClick={loadMoreSuggestions}
                                disabled={isSearching}
                                style={{
                                  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                  border: 'none',
                                  borderRadius: '20px',
                                  padding: '8px 20px'
                                }}
                              >
                                {isSearching ? (
                                  <><Spinner size="sm" /> Cargando...</>
                                ) : (
                                  <>Ver más resultados <FaChevronDown /></>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Mensaje cuando no hay resultados */}
                          {!isSearching && suggestions.length === 0 && searchTerm.trim().length >= 2 && (
                            <div className="px-3 py-4 text-center text-muted">
                              <FaStethoscope size={48} className="mb-3 opacity-50" />
                              <div className="fw-semibold">No se encontró personal</div>
                              <small>Intenta con otro término de búsqueda</small>
                            </div>
                          )}

                          {/* Mensaje para términos muy cortos */}
                          {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
                            <div className="px-3 py-3 text-center text-muted small">
                              <FaSearch className="mb-2 opacity-50" size={24} />
                              <div>Ingresa al menos 2 caracteres para buscar</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Indicador de carga principal */}
            {isLoading && (
              <Row className="justify-content-center mb-5">
                <Col xs={12} className="text-center">
                  <div className="loading-container p-5">
                    <div style={{
                      background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
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
                    <h5 className="text-primary fw-bold">Cargando resumen de estimulación...</h5>
                    <p className="text-muted">Por favor espera un momento</p>
                  </div>
                </Col>
              </Row>
            )}

            {/* Contenido del resumen mejorado */}
            {resumen && !isLoading && (
              <div className="mb-4">
                {/* Estadísticas Generales */}
                <Card className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                  <CardBody className="p-4">
                    <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                      <MdInsights className="me-3" size={28} />
                      Estadísticas Generales
                    </h4>
                    
                    <Row className="mb-4">
                      <Col lg={4} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' }}>
                          <FaUsers className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{resumen.estadisticas_generales.total_personas_encontradas}</h3>
                          <p className="text-white mb-0 opacity-75">Total Personas</p>
                        </div>
                      </Col>
                      <Col lg={4} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)' }}>
                          <MdVisibility className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{resumen.estadisticas_generales.promedio_visitas_por_persona}</h3>
                          <p className="text-white mb-0 opacity-75">Promedio Visitas</p>
                        </div>
                      </Col>
                      <Col lg={4} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)' }}>
                          <FaChartBar className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{Object.keys(resumen.estadisticas_generales.servicios_mas_frecuentes).length}</h3>
                          <p className="text-white mb-0 opacity-75">Servicios Activos</p>
                        </div>
                      </Col>
                    </Row>

                    {/* Servicios más frecuentes */}
                    <div className="mt-4">
                      <h6 className="fw-bold text-dark mb-3">Servicios Más Frecuentes</h6>
                      <div className="row">
                        {Object.entries(resumen.estadisticas_generales.servicios_mas_frecuentes)
                          .map(([servicio, frecuencia], index) => (
                            <div key={index} className="col-md-6 mb-2">
                              <div className="d-flex justify-content-between align-items-center p-2 rounded border">
                                <span className="fw-semibold">{servicio}</span>
                                <Badge 
                                  style={{
                                    background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                                    borderRadius: '15px'
                                  }}
                                >
                                  {frecuencia}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Detalles de personas */}
                {resumen.resultados.map((persona, index) => (
                  <Card key={index} className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                    <CardBody className="p-4">
                      <div className="d-flex align-items-center mb-4">
                        <div className="me-3"
                             style={{
                               background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                               borderRadius: '50%',
                               width: '60px',
                               height: '60px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center'
                             }}>
                          <FaStethoscope className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="fw-bold text-primary mb-1">Información Personal</h4>
                          <p className="text-muted mb-0">Detalles del personal de estimulación</p>
                        </div>
                      </div>

                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                            <CardBody className="p-3">
                              <h6 className="fw-bold text-dark mb-3">Datos Personales</h6>
                              <div className="info-item mb-2">
                                <strong>ID:</strong> <span className="text-muted">{persona.informacion_personal.id}</span>
                              </div>
                              <div className="info-item mb-2">
                                <strong>Nombre:</strong> <span className="text-muted">{persona.informacion_personal.nombre}</span>
                              </div>
                              <div className="info-item">
                                <strong>Apellido:</strong> <span className="text-muted">{persona.informacion_personal.apellido}</span>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                            <CardBody className="p-3">
                              <h6 className="fw-bold text-dark mb-3">Resumen de Visitas</h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Total Visitas:</span>
                                <Badge color="primary" className="rounded-pill">{persona.resumen.total_visitas}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Visitas Nuevas:</span>
                                <Badge color="success" className="rounded-pill">{persona.resumen.total_nuevas}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span>Visitas Constantes:</span>
                                <Badge color="warning" className="rounded-pill">{persona.resumen.total_constantes}</Badge>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      {/* Fechas importantes */}
                      <Row className="mb-4">
                        <Col xs={12}>
                          <Card className="border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                            <CardBody className="p-3">
                              <h6 className="fw-bold text-dark mb-3">Información Temporal</h6>
                              <Row>
                                <Col md={6} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <strong>Primera Visita:</strong>
                                    <span className="text-muted">{persona.resumen.primera_visita}</span>
                                  </div>
                                </Col>
                                <Col md={6} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <strong>Última Visita:</strong>
                                    <span className="text-muted">{persona.resumen.ultima_visita}</span>
                                  </div>
                                </Col>
                                <Col md={6} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <strong>Días desde última:</strong>
                                    <Badge color="info" className="rounded-pill">{persona.resumen.dias_desde_ultima_visita}</Badge>
                                  </div>
                                </Col>
                                <Col md={6} className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <strong>Servicios visitados:</strong>
                                    <span className="text-muted small">{persona.resumen.servicios_visitados.join(', ')}</span>
                                  </div>
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-primary" />
                        Historial de Visitas
                      </h5>
                      <div className="table-responsive">
                        <Table className="modern-table mb-0">
                          <thead style={{ background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' }}>
                            <tr>
                              <th className="text-white fw-semibold border-0 py-3">Fecha</th>
                              <th className="text-white fw-semibold border-0 py-3">Servicio</th>
                              <th className="text-white fw-semibold border-0 py-3">Tipo</th>
                              <th className="text-white fw-semibold border-0 py-3">ID Estimulación</th>
                            </tr>
                          </thead>
                          <tbody>
                            {persona.visitas.map((visita, vIndex) => (
                              <tr key={vIndex} className="hover-row">
                                <td className="py-3">{visita.fecha}</td>
                                <td className="py-3">{visita.servicio}</td>
                                <td className="py-3">
                                  <Badge 
                                    color={visita.tipo.nueva ? "success" : "warning"} 
                                    className="rounded-pill"
                                  >
                                    {visita.tipo.nueva ? 'Nueva' : 'Constante'}
                                  </Badge>
                                </td>
                                <td className="py-3">
                                  <Badge color="secondary" className="rounded-pill">{visita.id_estimulacion}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .search-input:focus {
          border-color: #2196f3 !important;
          box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25) !important;
        }

        .suggestion-item:hover {
          background-color: rgba(33, 150, 243, 0.05) !important;
          transform: translateX(5px);
        }

        .hover-row {
          transition: all 0.2s ease;
        }
        
        .hover-row:hover {
          background-color: rgba(33, 150, 243, 0.05);
          transform: scale(1.01);
        }
        
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

        .info-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .loading-container {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .rounded-lg {
          border-radius: 15px !important;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
        }

        .card {
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
        }

        .badge {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .input-group-text.search-icon {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .input-group-text.search-icon:hover {
          transform: scale(1.05);
        }

        .suggestion-item {
          border-left: 3px solid transparent;
        }

        .suggestion-item:hover {
          border-left-color: #2196f3;
        }

        .table-responsive {
          border-radius: 15px;
          overflow: hidden;
        }

        /* Scrollbar personalizado para las sugerencias */
        .position-absolute::-webkit-scrollbar {
          width: 6px;
        }

        .position-absolute::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .position-absolute::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
          border-radius: 10px;
        }

        .position-absolute::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #1976d2 0%, #1e88e5 100%);
        }

        /* Animaciones adicionales */
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .position-absolute {
          animation: slideIn 0.3s ease;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .card-body {
            padding: 1.5rem !important;
          }
          
          .input-group input {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumenEstimulacionNombre;