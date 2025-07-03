import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody, Spinner, Badge } from 'reactstrap';
import { FaSearch, FaChevronDown, FaUser, FaCalculator, FaCalendarAlt, FaHospital, FaGift, FaUsers, FaTint, FaChartBar } from 'react-icons/fa';
import { MdHealthAndSafety, MdInsights, MdTrendingUp } from 'react-icons/md';
import Swal from 'sweetalert2';

const ResumenDonadoraNombre = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
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
      setTotalRecords(0);
      setTotalPages(0);
      setHasNextPage(false);
      setHasPrevPage(false);
      return;
    }

    try {
      setIsSearching(true);
      
      const response = await axios.get('http://localhost:8080/api/donadora/search/advanced', {
        params: {
          q: value.trim(),
          page: page,
          limit: 10 // Limitamos a 10 sugerencias para mejor UX
        },
        timeout: 5000 // Timeout de 5 segundos
      });

      const data = response.data;
      
      // Si es la primera página, reemplazamos las sugerencias
      // Si es página siguiente, las agregamos (para scroll infinito si lo deseas)
      if (page === 1) {
        setSuggestions(data.donadoras || []);
      } else {
        setSuggestions(prev => [...prev, ...(data.donadoras || [])]);
      }
      
      // Actualizamos metadatos de paginación
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 0);
      setTotalRecords(data.totalRecords || 0);
      setHasNextPage(data.hasNextPage || false);
      setHasPrevPage(data.hasPrevPage || false);
      
      console.log('Búsqueda exitosa:', {
        searchTerm: data.searchTerm,
        totalRecords: data.totalRecords,
        currentPage: data.currentPage,
        totalPages: data.totalPages
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
    }
  }, [debouncedSearchTerm, fetchSuggestions]);

  // Función para cargar más resultados (si quieres implementar scroll infinito)
  const loadMoreSuggestions = useCallback(() => {
    if (hasNextPage && !isSearching && debouncedSearchTerm) {
      fetchSuggestions(debouncedSearchTerm, currentPage + 1);
    }
  }, [hasNextPage, isSearching, debouncedSearchTerm, currentPage, fetchSuggestions]);

  const handleSearch = async (id_donadora) => {
    if (id_donadora) {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/donadora_detalle/buscar/id_donadora?id_donadora=${id_donadora}`,
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
          errorMessage = 'No se encontraron datos para esta donadora.';
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

  const handleDonadoraSelect = (donadora) => {
    const nombreCompleto = donadora.nombre_completo || `${donadora.nombre} ${donadora.apellido}`;
    setSearchTerm(nombreCompleto);
    setShowSuggestions(false);
    handleSearch(donadora.id_donadora);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setCurrentPage(1); // Reset pagination cuando cambia el término de búsqueda
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
                <FaUser className="text-white me-3" size={32} />
                <h2 className="mb-0 text-white fw-bold">Resumen de Donaciones por Donadora</h2>
              </div>
              <p className="text-muted fs-5">Consulta detallada del historial de donaciones</p>
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
                          placeholder="Ingrese el nombre de la donadora (mín. 2 caracteres)"
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
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                          {suggestions.map((donadora) => (
                            <div
                              key={donadora.id_donadora}
                              className="px-3 py-3 border-bottom suggestion-item d-flex justify-content-between align-items-center"
                              onClick={() => handleDonadoraSelect(donadora)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div className="me-3"
                                     style={{
                                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                       borderRadius: '50%',
                                       width: '40px',
                                       height: '40px',
                                       display: 'flex',
                                       alignItems: 'center',
                                       justifyContent: 'center'
                                     }}>
                                  <FaUser className="text-white" size={16} />
                                </div>
                                <div>
                                  <div className="fw-bold">
                                    {donadora.nombre_completo || `${donadora.nombre} ${donadora.apellido}`}
                                  </div>
                                  <small className="text-muted">ID: {donadora.id_donadora}</small>
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
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                              <FaUser size={48} className="mb-3 opacity-50" />
                              <div className="fw-semibold">No se encontraron donadoras</div>
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
                    <h5 className="text-primary fw-bold">Cargando resumen de donaciones...</h5>
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
                             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          <FaUsers className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{resumen.estadisticas_generales.total_donadoras_encontradas}</h3>
                          <p className="text-white mb-0 opacity-75">Total Donadoras</p>
                        </div>
                      </Col>
                      <Col lg={4} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                          <FaGift className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{resumen.estadisticas_generales.total_donaciones}</h3>
                          <p className="text-white mb-0 opacity-75">Total Donaciones</p>
                        </div>
                      </Col>
                      <Col lg={4} md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg" 
                             style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                          <FaChartBar className="text-white mb-2" size={32} />
                          <h3 className="fw-bold text-white mb-1">{resumen.estadisticas_generales.promedio_donaciones_por_donadora}</h3>
                          <p className="text-white mb-0 opacity-75">Promedio por Donadora</p>
                        </div>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: '#f8f9fa' }}>
                          <FaCalculator className="text-info mb-2" size={24} />
                          <h5 className="fw-bold text-dark mb-1">{resumen.estadisticas_generales.total_onzas_recolectadas} oz</h5>
                          <p className="text-muted mb-0">Total Onzas</p>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: '#f8f9fa' }}>
                          <FaTint className="text-primary mb-2" size={24} />
                          <h5 className="fw-bold text-dark mb-1">{resumen.estadisticas_generales.total_litros_recolectados} L</h5>
                          <p className="text-muted mb-0">Total Litros</p>
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
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

                {/* Detalles de donadoras */}
                {resumen.resultados.map((donadora, index) => (
                  <Card key={index} className="mb-5 border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                    <CardBody className="p-4">
                      <div className="d-flex align-items-center mb-4">
                        <div className="me-3"
                             style={{
                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                               borderRadius: '50%',
                               width: '60px',
                               height: '60px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center'
                             }}>
                          <FaUser className="text-white" size={24} />
                        </div>
                        <div>
                          <h4 className="fw-bold text-primary mb-1">Información Personal</h4>
                          <p className="text-muted mb-0">Detalles de la donadora</p>
                        </div>
                      </div>

                      <Row className="mb-4">
                        <Col md={6}>
                          <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                            <CardBody className="p-3">
                              <h6 className="fw-bold text-dark mb-3">Datos Personales</h6>
                              <div className="info-item mb-2">
                                <strong>ID:</strong> <span className="text-muted">{donadora.informacion_personal.id}</span>
                              </div>
                              <div className="info-item mb-2">
                                <strong>Nombre:</strong> <span className="text-muted">{donadora.informacion_personal.nombre}</span>
                              </div>
                              <div className="info-item">
                                <strong>Apellido:</strong> <span className="text-muted">{donadora.informacion_personal.apellido}</span>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                            <CardBody className="p-3">
                              <h6 className="fw-bold text-dark mb-3">Resumen de Donaciones</h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Total Donaciones:</span>
                                <Badge color="primary" className="rounded-pill">{donadora.resumen.total_donaciones}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span>Donaciones Nuevas:</span>
                                <Badge color="success" className="rounded-pill">{donadora.resumen.total_nuevas}</Badge>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span>Donaciones Constantes:</span>
                                <Badge color="warning" className="rounded-pill">{donadora.resumen.total_constantes}</Badge>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                        <FaCalendarAlt className="me-2 text-primary" />
                        Historial de Donaciones
                      </h5>
                      <div className="table-responsive">
                        <Table className="modern-table mb-0">
                          <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <tr>
                              <th className="text-white fw-semibold border-0 py-3">Fecha</th>
                              <th className="text-white fw-semibold border-0 py-3">No. Frasco</th>
                              <th className="text-white fw-semibold border-0 py-3">Onzas</th>
                              <th className="text-white fw-semibold border-0 py-3">Servicio</th>
                              <th className="text-white fw-semibold border-0 py-3">Personal</th>
                              <th className="text-white fw-semibold border-0 py-3">Tipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donadora.donaciones.map((donacion, dIndex) => (
                              <tr key={dIndex} className="hover-row">
                                <td className="py-3">{donacion.fecha}</td>
                                <td className="py-3">{donacion.no_frasco}</td>
                                <td className="py-3">
                                  <Badge color="info" className="rounded-pill">{donacion.onzas}</Badge>
                                </td>
                                <td className="py-3">{donacion.servicio}</td>
                                <td className="py-3">{donacion.personal_atendio}</td>
                                <td className="py-3">
                                  <Badge 
                                    color={donacion.tipo.nueva ? "success" : "warning"} 
                                    className="rounded-pill"
                                  >
                                    {donacion.tipo.nueva ? 'Nueva' : 'Constante'}
                                  </Badge>
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
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }

        .suggestion-item:hover {
          background-color: rgba(102, 126, 234, 0.05) !important;
          transform: translateX(5px);
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
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .rounded-lg {
          border-radius: 15px !important;
        }

        @media (max-width: 768px) {
          .search-input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumenDonadoraNombre;