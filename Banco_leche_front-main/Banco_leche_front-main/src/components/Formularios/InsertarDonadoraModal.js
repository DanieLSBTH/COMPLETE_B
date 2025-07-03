import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaTrash,FaClipboardList,FaChartBar, FaAddressCard ,FaBuilding, FaClinicMedical, FaBaby, FaSistrix,FaCalendarDay,FaGlassWhiskey, FaTint, FaFlask ,FaClipboardCheck, FaSpinner  } from 'react-icons/fa';
import { FcAbout,FcAddRow, FcList, FcAcceptDatabase, FcSurvey, FcAddDatabase } from "react-icons/fc";

// URLs de las APIs
const urlDonadoraDetalle = "http://localhost:8080/api/donadora_detalle/";
const urlPersonal = "http://localhost:8080/api/personal/";
const urlServicioEx = "http://localhost:8080/api/servicio_ex/";
const urlServicioIn = "http://localhost:8080/api/servicio_in/";
const urlDonadora = "http://localhost:8080/api/donadora/";
const urlDonadoraSearch = "http://localhost:8080/api/donadora/search/advanced";

class InsertarDonadoraModal extends Component {
  state = {
    // Inicializar arrays vacíos
    donadoras: [],
    personales: [],
    serviciosEx: [],
    serviciosIn: [],
    donadoraDetalles: [],
    modalInsertar: false,
    modalInsertarDonadora: false,
    
    // Estados para búsqueda optimizada
    searchValue: '',
    filteredDonadoras: [],
    showSuggestions: false,
    searchLoading: false,
    searchTimer: null,
    selectedDonadora: null,
    
    // Estados para el nuevo sistema de encabezado-detalle
    encabezado: {
      id_donadora: '',
      tipo_servicio: '',
      id_servicio: '',
      fecha: '',
      id_personal:'',
    },
    detalles: [],
    detalleTemp: {
      no_frasco: '',
      onzas: '',
      litros: '',
      constante: false,
      nueva: false
    },
    
    // Otros estados existentes
    totalRecords: 0,
    page: 1,
    rows: 10,
    nuevaDonadora: {
      nombre: '',
      apellido: ''
    }
  }

  async componentDidMount() {
    try {
      // Cargar todos los datos necesarios (excepto donadoras que se cargarán por búsqueda)
      const [personalRes, servicioExRes, servicioInRes] = await Promise.all([
        axios.get(urlPersonal),
        axios.get(urlServicioEx),
        axios.get(urlServicioIn)
      ]);

      this.setState({
        personales: personalRes.data.personal || [],
        serviciosEx: servicioExRes.data || [],
        serviciosIn: servicioInRes.data || []
      });
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos iniciales', 'error');
    }
  }

  // Método de búsqueda optimizada con debounce - CORREGIDO
  searchDonadoras = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        searchLoading: false
      });
      return;
    }

    try {
      this.setState({ searchLoading: true });
      
      console.log('Frontend: Realizando búsqueda con término:', searchTerm);
      
      const response = await axios.get(urlDonadoraSearch, {
        params: {
          q: searchTerm,
          limit: 10
        }
      });

      console.log('Frontend: Respuesta completa del servidor:', response);
      console.log('Frontend: Data de respuesta:', response.data);
      
      // Verificar que la respuesta tenga la estructura esperada
      const donadoras = response.data.donadoras || [];
      
      console.log('Frontend: Donadoras procesadas:', donadoras);

      // Actualizar estado y forzar re-render
      this.setState({
        filteredDonadoras: donadoras,
        showSuggestions: donadoras.length > 0, // Solo mostrar si hay resultados
        searchLoading: false
      }, () => {
        console.log('Frontend: Estado actualizado:', {
          filteredDonadoras: this.state.filteredDonadoras,
          showSuggestions: this.state.showSuggestions,
          searchLoading: this.state.searchLoading
        });
      });

    } catch (error) {
      console.error('Frontend: Error en búsqueda:', error);
      console.error('Frontend: Error response:', error.response);
      
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        searchLoading: false
      });
      
      // Solo mostrar error si no es un error de red común
      if (error.response && error.response.status !== 404) {
        Swal.fire('Error', `Error al buscar donadoras: ${error.response?.data?.message || error.message}`, 'error');
      }
    }
  }

  // Método para manejar cambios en el campo de búsqueda con debounce
  handleSearchChange = (e) => {
    const searchValue = e.target.value;
    
    console.log('Frontend: Valor de búsqueda cambiado:', searchValue);
    
    this.setState({
      searchValue,
      selectedDonadora: null,
      // Mantener sugerencias visibles mientras se escribe si ya hay resultados
      showSuggestions: searchValue.length >= 2 && this.state.filteredDonadoras.length > 0
    });

    // Limpiar timer anterior
    if (this.state.searchTimer) {
      clearTimeout(this.state.searchTimer);
    }

    // Si el campo está vacío, limpiar resultados inmediatamente
    if (!searchValue.trim()) {
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        searchLoading: false,
        searchTimer: null
      });
      return;
    }

    // Si es muy corto, no buscar aún
    if (searchValue.trim().length < 2) {
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        searchLoading: false,
        searchTimer: null
      });
      return;
    }

    // Configurar nuevo timer para búsqueda con delay
    const timer = setTimeout(() => {
      console.log('Frontend: Ejecutando búsqueda después del delay...');
      this.searchDonadoras(searchValue.trim());
    }, 300); // 300ms de delay

    this.setState({ searchTimer: timer });
  }

  // Método para seleccionar una donadora de los resultados
  handleDonadoraSelect = (donadora) => {
    console.log('Frontend: Donadora seleccionada:', donadora);
    
    this.setState({
      encabezado: {
        ...this.state.encabezado,
        id_donadora: donadora.id_donadora,
      },
      searchValue: donadora.nombre_completo,
      selectedDonadora: donadora,
      showSuggestions: false,
      filteredDonadoras: []
    });
  }

  // Método para manejar click fuera del dropdown
  handleSearchBlur = (e) => {
    // Delay para permitir que el click en una opción se procese
    setTimeout(() => {
      this.setState({
        showSuggestions: false
      });
    }, 150);
  }

  // Método para mostrar sugerencias cuando se hace focus
  handleSearchFocus = () => {
    if (this.state.searchValue.length >= 2 && this.state.filteredDonadoras.length > 0) {
      this.setState({
        showSuggestions: true
      });
    }
  }

  // Método para limpiar búsqueda
  clearSearch = () => {
    if (this.state.searchTimer) {
      clearTimeout(this.state.searchTimer);
    }
    
    this.setState({
      searchValue: '',
      filteredDonadoras: [],
      showSuggestions: false,
      searchLoading: false,
      searchTimer: null,
      selectedDonadora: null,
      encabezado: {
        ...this.state.encabezado,
        id_donadora: ''
      }
    });
  }

  // Método para agregar un detalle al "carrito"
  agregarDetalle = () => {
    const { detalleTemp } = this.state;
    
    // Validaciones
    if (!detalleTemp.no_frasco || !detalleTemp.onzas) {
      Swal.fire('Error', 'Todos los campos del detalle son requeridos', 'error');
      return;
    }
    if (!detalleTemp.constante && !detalleTemp.nueva) {
      Swal.fire('Error', 'Debe seleccionar "Constante" o "Nueva"', 'error');
      return;
    }

    // Calcular litros
    const litros = parseFloat(detalleTemp.onzas) * 0.0295735;

    const nuevoDetalle = {
      ...detalleTemp,
      litros: litros.toFixed(4),
      id: Date.now()
    };

    this.setState(prevState => ({
      detalles: [...prevState.detalles, nuevoDetalle],
      detalleTemp: {
        no_frasco: '',
        onzas: '',
        litros: '',
        constante: false,
        nueva: false
      }
    }));
  }

  // Método para eliminar un detalle del "carrito"
  eliminarDetalle = (id) => {
    this.setState(prevState => ({
      detalles: prevState.detalles.filter(detalle => detalle.id !== id)
    }));
  }

  // Método para guardar todo (encabezado y detalles)
  guardarRegistroCompleto = async () => {
    const { encabezado, detalles } = this.state;

    // Validar encabezado
    if (!encabezado.id_donadora || !encabezado.tipo_servicio || !encabezado.id_servicio ||!encabezado.fecha ||!encabezado.id_personal) {
      Swal.fire('Error', 'Debe completar los datos del encabezado', 'error');
      return;
    }

    // Validar que haya detalles
    if (detalles.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un detalle', 'error');
      return;
    }

    try {
      // Preparar los datos para enviar
      const registrosParaGuardar = detalles.map(detalle => ({
        id_donadora: encabezado.id_donadora,
        id_extrahospitalario: encabezado.tipo_servicio === 'extrahospitalario' ? encabezado.id_servicio : null,
        id_intrahospitalario: encabezado.tipo_servicio === 'intrahospitalario' ? encabezado.id_servicio : null,
        fecha: encabezado.fecha,
        id_personal: encabezado.id_personal,
        ...detalle
      }));

      // Guardar todos los registros
      await Promise.all(registrosParaGuardar.map(registro => 
        axios.post(urlDonadoraDetalle, registro)
      ));

      Swal.fire('Éxito', 'Registros guardados correctamente', 'success');
      this.limpiarFormulario();
      this.modalInsertar();
      
      // Llamar a la función de actualización del padre
      if (this.props.onRegistrosGuardados) {
        this.props.onRegistrosGuardados();
      }
      
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', 'No se pudieron guardar los registros', 'error');
    }
  }

  handleEncabezadoChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        [name]: value
      }
    }));
  }

  handleDetalleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
  
    this.setState((prevState) => ({
      detalleTemp: {
        ...prevState.detalleTemp,
        [name]: val,
        // Si el usuario marca constante, desmarca nueva
        ...(name === "constante" && checked && { nueva: false }),
        // Si el usuario marca nueva, desmarca constante
        ...(name === "nueva" && checked && { constante: false }),
      },
    }));
  };

  modalInsertar = () => {
    this.setState((prevState) => ({
      modalInsertar: !prevState.modalInsertar
    }), () => {
      // Callback para limpiar cuando se cierra
      if (!this.state.modalInsertar) {
        this.limpiarFormulario();
      }
    });
  };

  limpiarFormulario = () => {
    // Limpiar timer si existe
    if (this.state.searchTimer) {
      clearTimeout(this.state.searchTimer);
    }

    this.setState({
      encabezado: {
        id_donadora: '',
        tipo_servicio: '',
        id_servicio: '',
        fecha: '',
        id_personal: '',
      },
      detalles: [],
      detalleTemp: {
        no_frasco: '',
        onzas: '',
        litros: '',
        constante: false,
        nueva: false,
      },
      // Limpiar estados de búsqueda
      searchValue: '',
      filteredDonadoras: [],
      showSuggestions: false,
      searchLoading: false,
      searchTimer: null,
      selectedDonadora: null
    });
  }
 
  handleNewDonadoraChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      nuevaDonadora: {
        ...prevState.nuevaDonadora,
        [name]: value,
      },
    }));
  };
 
  modalInsertarDonadora = () => {
    this.setState((prevState) => ({
      modalInsertarDonadora: !prevState.modalInsertarDonadora,
      nuevaDonadora: {
        nombre: '',
        apellido: '',
      },
    }));
  };
  
  addNewDonadora = async () => {
    const { nuevaDonadora } = this.state;
    
    if (!nuevaDonadora.nombre.trim() || !nuevaDonadora.apellido.trim()) {
      Swal.fire('Error', 'Nombre y apellido son requeridos', 'error');
      return;
    }

    try {
      const response = await axios.post(urlDonadora, nuevaDonadora);
      const newDonadora = response.data;
  
      // Seleccionar automáticamente la nueva donadora
      this.setState({
        encabezado: {
          ...this.state.encabezado,
          id_donadora: newDonadora.id_donadora,
        },
        searchValue: `${newDonadora.nombre} ${newDonadora.apellido}`,
        selectedDonadora: {
          ...newDonadora,
          nombre_completo: `${newDonadora.nombre} ${newDonadora.apellido}`
        },
        modalInsertarDonadora: false,
      });
  
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    } catch (error) {
      console.error(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    }
  };

  // Limpiar timer cuando el componente se desmonta
  componentWillUnmount() {
    if (this.state.searchTimer) {
      clearTimeout(this.state.searchTimer);
    }
  }

  render() {
    const { 
      encabezado, 
      detalles, 
      detalleTemp, 
      searchValue, 
      filteredDonadoras, 
      showSuggestions,
      searchLoading,
      selectedDonadora,
      serviciosEx, 
      serviciosIn, 
      personales, 
      modalInsertarDonadora 
    } = this.state;

    console.log('Frontend: Render - Estados actuales:', {
      searchValue,
      filteredDonadoras: filteredDonadoras.length,
      showSuggestions,
      searchLoading
    });

    return (
  <div className="container-fluid">
    {/* Botón principal mejorado */}
    <button 
      className="btn btn-lg shadow-sm me-2"
      onClick={this.modalInsertar}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '15px',
        
        color: 'white',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0px)';
        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
      }}
    >
      <FcAddDatabase className="me-2" size={22} />
      Agregar Varios Frascos a una donadora
    </button>

    {/* Modal principal mejorado */}
    <Modal 
      isOpen={this.state.modalInsertar} 
      toggle={() => {this.modalInsertar(); this.limpiarFormulario();}} 
      size="lg"
      className="modern-modal"
    >
      <ModalHeader 
        toggle={() => {this.modalInsertar(); this.limpiarFormulario();}}
        className="border-0 pb-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px 15px 0 0'
        }}
      >
        <div className="d-flex align-items-center text-white">
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px'
          }}>
            <FcSurvey size={22} />
          </div>
          <div>
            <h4 className="mb-1 fw-bold">Registro de Donación</h4>
            <small className="opacity-75">Complete los datos generales y detalles</small>
          </div>
        </div>
      </ModalHeader>

      <ModalBody className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Sección de Encabezado mejorada */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-header border-0" style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            borderRadius: '15px 15px 0 0'
          }}>
            <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
              <FcAbout className="me-2" size={20} />
              Datos Generales
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              {/* Columna Izquierda */}
              <div className="col-md-6">
                <div className="form-group mb-4">
                  <label htmlFor="donadora-search" className="form-label fw-semibold">
                    <FaSistrix className="me-2 text-primary" />
                    Buscar Donadora
                  </label>
                  <div className="input-group position-relative">
                    <input
                      type="text"
                      id="donadora-search"
                      className="form-control"
                      placeholder="Escriba nombre o apellido (mín. 2 caracteres)"
                      value={searchValue}
                      onChange={this.handleSearchChange}
                      onFocus={this.handleSearchFocus}
                      onBlur={this.handleSearchBlur}
                      autoComplete="off"
                      style={{
                        borderRadius: '10px 0 0 10px',
                        border: '2px solid #e9ecef',
                        padding: '12px',
                        fontSize: '14px'
                      }}
                    />
                    {searchValue && (
                      <button
                        className="btn position-absolute"
                        type="button"
                        onClick={this.clearSearch}
                        title="Limpiar búsqueda"
                        style={{
                          right: '45px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 3,
                          background: 'none',
                          border: 'none',
                          color: '#6c757d'
                        }}
                      >
                        ✕
                      </button>
                    )}
                    <div className="input-group-append">
                      <span className="input-group-text" 
                            style={{
                              borderRadius: '0 10px 10px 0',
                              border: '2px solid #e9ecef',
                              borderLeft: 'none',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white'
                            }}>
                        {searchLoading ? (
                          <FaSpinner className="fa-spin" />
                        ) : (
                          <FaSistrix />
                        )}
                      </span>
                    </div>
                    
                    {/* Dropdown de sugerencias mejorado */}
                    {showSuggestions && (
                      <div 
                        className="position-absolute w-100 bg-white border-0 rounded-3 shadow-lg"
                        style={{
                          top: '100%',
                          left: 0,
                          right: 0,
                          maxHeight: '250px', 
                          overflowY: 'auto', 
                          zIndex: 1050,
                          marginTop: '5px'
                        }}
                      >
                        {filteredDonadoras.length > 0 ? (
                          filteredDonadoras.map((donadora) => (
                            <div
                              key={donadora.id_donadora}
                              className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom search-suggestion-item"
                              onClick={() => this.handleDonadoraSelect(donadora)}
                              style={{ 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <div style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: '50%',
                                  width: '35px',
                                  height: '35px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px'
                                }}>
                                  <FaBaby className="text-white" size={14} />
                                </div>
                                <div>
                                  <div className="fw-bold">{donadora.nombre_completo}</div>
                                  <small className="text-muted">ID: {donadora.id_donadora}</small>
                                </div>
                              </div>
                              <small className="text-primary fw-semibold">Seleccionar</small>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-muted text-center">
                            <FaSistrix className="me-2" />
                            {searchLoading ? 'Buscando...' : 'No se encontraron resultados'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Donadora seleccionada mejorada */}
                  {selectedDonadora && (
                    <div className="alert border-0 mt-3" 
                         style={{ 
                           background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                           color: 'white',
                           borderRadius: '10px'
                         }}>
                      <div className="d-flex align-items-center">
                        <FaBaby className="me-2" size={18} />
                        <div>
                          <strong>Donadora seleccionada:</strong>
                          <div>{selectedDonadora.nombre_completo}</div>
                          <small className="opacity-75">ID: {selectedDonadora.id_donadora}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group mb-4">
                  <label className="form-label fw-semibold">
                    <FaBaby className="me-2 text-success" />
                    Acciones Rápidas
                  </label>
                  <div className="d-grid">
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={this.modalInsertarDonadora}
                      style={{
                        borderRadius: '10px',
                        border: '2px dashed #667eea',
                        padding: '12px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      + Crear Nueva Donadora
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label fw-semibold">
                    <FaCalendarDay className="me-2 text-primary" />
                    Fecha de Donación
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="fecha"
                    value={encabezado.fecha}
                    onChange={this.handleEncabezadoChange}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  />
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="col-md-6">
                <div className="form-group mb-4">
                  <label className="form-label fw-semibold">
                    <FaClinicMedical className="me-2 text-warning" />
                    Tipo de Servicio
                  </label>
                  <select
                    className="form-control"
                    name="tipo_servicio"
                    value={encabezado.tipo_servicio}
                    onChange={this.handleEncabezadoChange}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  >
                    <option value="">Seleccione tipo de servicio</option>
                    <option value="extrahospitalario">Extrahospitalario</option>
                    <option value="intrahospitalario">Intrahospitalario</option>
                  </select>
                </div>

                {encabezado.tipo_servicio && (
                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold">
                      <FaBuilding className="me-2 text-info" />
                      Servicio Específico
                    </label>
                    <select
                      className="form-control"
                      name="id_servicio"
                      value={encabezado.id_servicio}
                      onChange={this.handleEncabezadoChange}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    >
                      <option value="">Seleccione un servicio</option>
                      {encabezado.tipo_servicio === 'extrahospitalario'
                        ? serviciosEx.map((servicio) => (
                            <option
                              key={servicio.id_extrahospitalario}
                              value={servicio.id_extrahospitalario}
                            >
                              {servicio.servicio}
                            </option>
                          ))
                        : serviciosIn.map((servicio) => (
                            <option
                              key={servicio.id_intrahospitalario}
                              value={servicio.id_intrahospitalario}
                            >
                              {servicio.servicio}
                            </option>
                          ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label fw-semibold">
                    <FaAddressCard className="me-2 text-success" />
                    Personal Responsable
                  </label>
                  <select
                    className="form-control"
                    name="id_personal"
                    value={encabezado.id_personal}
                    onChange={this.handleEncabezadoChange}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  >
                    <option value="">Seleccione personal</option>
                    {personales.map((personal) => (
                      <option
                        key={personal.id_personal}
                        value={personal.id_personal}
                      >
                        {personal.nombre} {personal.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Detalle mejorada */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-header border-0" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '15px 15px 0 0'
          }}>
            <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
              <FcList className="me-2" size={20} />
              Detalles de Donación
            </h6>
          </div>
          <div className="card-body p-4">
            <div className="row g-4">
              {/* No. Frasco */}
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">
                    <FaGlassWhiskey className="me-2 text-primary" />
                    No. Frasco
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="no_frasco"
                    value={detalleTemp.no_frasco}
                    onChange={this.handleDetalleChange}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  />
                </div>
              </div>

              {/* Onzas */}
              <div className="col-12 col-md-6">
                <div className="form-group">
                  <label className="form-label fw-semibold">
                    <FaTint className="me-2 text-info" />
                    Onzas
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="onzas"
                    value={detalleTemp.onzas}
                    onChange={this.handleDetalleChange}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes modernos */}
            <div className="row mt-4">
              <div className="col-12 col-md-6">
                <div className="card border-0 p-3 text-center" 
                     style={{ 
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                       borderRadius: '15px'
                     }}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="constante"
                      name="constante"
                      checked={detalleTemp.constante}
                      onChange={this.handleDetalleChange}
                      style={{ 
                        accentColor: "white",
                        transform: "scale(1.3)"
                      }}
                    />
                    <label className="form-check-label text-white fw-bold" htmlFor="constante">
                      Constante
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border-0 p-3 text-center" 
                     style={{ 
                       background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                       borderRadius: '15px'
                     }}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="nueva"
                      name="nueva"
                      checked={detalleTemp.nueva}
                      onChange={this.handleDetalleChange}
                      style={{ 
                        accentColor: "white",
                        transform: "scale(1.3)"
                      }}
                    />
                    <label className="form-check-label text-white fw-bold" htmlFor="nueva">
                      Nueva
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <button 
                className="btn btn-lg d-flex align-items-center mx-auto"
                onClick={this.agregarDetalle}
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 25px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaClipboardList className="me-2" size={18} />
                Agregar más frascos a la donadora
              </button>
            </div>
          </div>
        </div>

        {/* Lista de detalles agregados mejorada */}
        {detalles.length > 0 && (
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px' }}>
            <div className="card-header border-0" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px 15px 0 0'
            }}>
              <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
                <FaClipboardList className="me-2" />
                Detalles Agregados ({detalles.length})
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                      <th className="fw-bold">No. Frasco</th>
                      <th className="fw-bold">Fecha</th>
                      <th className="fw-bold">Onzas</th>
                      <th className="fw-bold">Litros</th>
                      <th className="fw-bold">Constante</th>
                      <th className="fw-bold">Nueva</th>
                      <th className="fw-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map(detalle => (
                      <tr key={detalle.id} className="hover-row">
                        <td className="fw-semibold">{detalle.no_frasco}</td>
                        <td>{encabezado.fecha}</td>
                        <td>
                          <span className="badge bg-info text-dark">{detalle.onzas} oz</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{detalle.litros} L</span>
                        </td>
                        <td>
                          {detalle.constante ? 
                            <span className="badge bg-primary">Sí</span> : 
                            <span className="badge bg-secondary">No</span>
                          }
                        </td>
                        <td>
                          {detalle.nueva ? 
                            <span className="badge bg-warning text-dark">Sí</span> : 
                            <span className="badge bg-secondary">No</span>
                          }
                        </td>
                        <td className="text-center">
                          <button 
                            className="btn btn-sm"
                            onClick={() => this.eliminarDetalle(detalle.id)}
                            style={{
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              padding: '6px 12px'
                            }}
                          >
                            <FaTrash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className="border-0 pt-0" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="d-flex gap-3 w-100 justify-content-end">
          <button 
            className="btn btn-lg d-flex align-items-center"
            onClick={this.guardarRegistroCompleto}
            disabled={detalles.length === 0 || !selectedDonadora}
            style={{
              background: detalles.length === 0 || !selectedDonadora ? 
                '#6c757d' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 25px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: detalles.length === 0 || !selectedDonadora ? 
                'none' : '0 8px 20px rgba(17, 153, 142, 0.3)'
            }}
          >
            <FcAcceptDatabase className="me-2" size={20} />
            Guardar Todo
          </button>
          <button 
            className="btn btn-lg d-flex align-items-center"
            onClick={() => {
              this.limpiarFormulario();
              this.modalInsertar();
            }}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 25px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
            }}
          >
            Cancelar
          </button>
        </div>
      </ModalFooter>
    </Modal>

    {/* Modal para agregar nueva donadora mejorado */}
    <Modal isOpen={modalInsertarDonadora} toggle={this.modalInsertarDonadora} className="modern-modal">
      <ModalHeader 
        toggle={this.modalInsertarDonadora}
        className="border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px 15px 0 0'
        }}
      >
        <div className="d-flex align-items-center text-white">
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <FaBaby size={18} />
          </div>
          <h5 className="mb-0 fw-bold">Agregar Nueva Donadora</h5>
        </div>
      </ModalHeader>
      <ModalBody className="p-4">
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label className="form-label fw-semibold">
                <FaBaby className="me-2 text-primary" />
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={this.state.nuevaDonadora.nombre}
                onChange={this.handleNewDonadoraChange}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  padding: '12px'
                }}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label className="form-label fw-semibold">
                <FaBaby className="me-2 text-primary" />
                Apellido
              </label>
              <input
                type="text"
                className="form-control"
                name="apellido"
                value={this.state.nuevaDonadora.apellido}
                onChange={this.handleNewDonadoraChange}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  padding: '12px'
                }}
              />
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="border-0">
        <div className="d-flex gap-3">
          <button 
            className="btn btn-lg d-flex align-items-center" 
            onClick={this.addNewDonadora}
            style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 25px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)'
            }}
          >
            <FaBaby className="me-2" size={16} />
            Guardar
          </button>
          <button 
            className="btn btn-lg" 
            onClick={this.modalInsertarDonadora}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 25px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
            }}
          >
            Cancelar
          </button>
        </div>
      </ModalFooter>
    </Modal>

    {/* Estilos CSS */}
    <style jsx>{`
      .modern-modal .modal-content {
        border: none;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .search-suggestion-item:hover {
        background-color: rgba(102, 126, 234, 0.05);
        transform: translateX(5px);
      }

      .hover-row:hover {
        background-color: rgba(102, 126, 234, 0.05);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .form-control:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }

      .btn:hover {
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }

      @media (max-width: 768px) {
        .row.g-4 > .col-md-6 {
          margin-bottom: 1rem;
        }
        
        .btn-lg {
          font-size: 14px;
          padding: 10px 16px;
        }
      }
    `}</style>
  </div>
);
  }
}

export default InsertarDonadoraModal;