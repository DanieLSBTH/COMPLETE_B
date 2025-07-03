import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaExclamationTriangle, FaUser, FaPlus, FaChartBar, FaAddressCard ,FaBuilding, FaClinicMedical, FaBaby, FaSistrix,FaCalendarDay,FaGlassWhiskey, FaTint, FaFlask ,FaClipboardCheck, FaSpinner } from 'react-icons/fa';
import { FcSurvey } from "react-icons/fc";
import { Button } from 'reactstrap';
import InsertarDonadoraModal from './InsertarDonadoraModal';

// URLs de las APIs
const urlDonadoraDetalle = "http://localhost:8080/api/donadora_detalle/";
const urlPersonal = "http://localhost:8080/api/personal/";
const urlServicioEx = "http://localhost:8080/api/servicio_ex/";
const urlServicioIn = "http://localhost:8080/api/servicio_in/";
const urlDonadora = "http://localhost:8080/api/donadora/";
const urlDonadoraSearch = "http://localhost:8080/api/donadora/search/advanced"; // Nueva URL para búsqueda avanzada

class ShowDonadoraDetalle extends Component {
  state = {
    donadoraDetalles: [],
    personales: [],
    serviciosEx: [],
    donadoras: [],
    serviciosIn: [],
    modalInsertar: false,
    modalEliminar: false,
    modalInsertarDonadora: false,
    modalAgregarVarios: false,
    mesActual: false,
    mostrarTodos: false,
    form: {
      id_donadora_detalle: '',
      no_frasco: '', 
      id_donadora: '',
      fecha: '',
      onzas: '',
      id_extrahospitalario: '',
      id_intrahospitalario: '',
      constante: false,
      nueva: false,
      id_personal: '',
      litros: '',
      tipoModal: ''
    },
    errors: {},
    // Estados para la paginación
    totalRecords: 0,
    page: 1,
    rows: 10,
    
    // Estados mejorados para la búsqueda de donadoras
    searchValue: '',
    filteredDonadoras: [],
    showSuggestions: false,
    isSearching: false,
    searchTotalRecords: 0,
    searchCurrentPage: 1,
    searchLimit: 10,
    selectedDonadoraInfo: null, // Para mostrar información de la donadora seleccionada
    
    nuevaDonadora: {
      nombre: '',
      apellido: ''
    }
  }

  // Debounce timer para evitar demasiadas peticiones
  searchTimeout = null;

  componentDidMount() {
    this.peticionGet();
    this.cargarListasRelacionadas();
  }

  cargarDonadoras = async () => {
    try {
      const response = await axios.get(urlDonadora);
      this.setState({ donadoras: response.data.donadoras });
    } catch (error) {
      console.error("Error al cargar donadoras: ", error);
    }
  };

  // Búsqueda avanzada de donadoras con debounce
  searchDonadoras = async (searchTerm, page = 1) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        isSearching: false,
        searchTotalRecords: 0
      });
      return;
    }

    this.setState({ isSearching: true });

    try {
      const response = await axios.get(urlDonadoraSearch, {
        params: {
          q: searchTerm.trim(),
          page: page,
          limit: this.state.searchLimit
        }
      });

      this.setState({
        filteredDonadoras: response.data.donadoras || [],
        showSuggestions: true,
        isSearching: false,
        searchTotalRecords: response.data.totalRecords || 0,
        searchCurrentPage: response.data.currentPage || 1
      });

    } catch (error) {
      console.error("Error en búsqueda de donadoras:", error);
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        isSearching: false,
        searchTotalRecords: 0
      });
      
      if (error.response?.status !== 400) { // No mostrar error para búsquedas muy cortas
        Swal.fire('Error', 'Error al buscar donadoras', 'error');
      }
    }
  };

  handleSearchChange = (e) => {
    const searchValue = e.target.value;
    
    this.setState({
      searchValue,
      selectedDonadoraInfo: null // Limpiar información de donadora seleccionada
    });

    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Si el campo está vacío, limpiar resultados inmediatamente
    if (!searchValue.trim()) {
      this.setState({
        filteredDonadoras: [],
        showSuggestions: false,
        isSearching: false,
        searchTotalRecords: 0
      });
      return;
    }

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    this.searchTimeout = setTimeout(() => {
      this.searchDonadoras(searchValue, 1);
    }, 300);
  };

  handleDonadoraSelect = (donadora) => {
    this.setState((prevState) => ({
      form: { ...prevState.form, id_donadora: donadora.id_donadora },
      searchValue: donadora.nombre_completo,
      selectedDonadoraInfo: donadora,
      filteredDonadoras: [],
      showSuggestions: false,
      isSearching: false
    }));
  };

  // Paginación para resultados de búsqueda
  handleSearchPageChange = (newPage) => {
    if (this.state.searchValue.trim().length >= 2) {
      this.searchDonadoras(this.state.searchValue, newPage);
    }
  };

  // Limpiar búsqueda
  clearSearch = () => {
    this.setState({
      searchValue: '',
      filteredDonadoras: [],
      showSuggestions: false,
      selectedDonadoraInfo: null,
      form: { ...this.state.form, id_donadora: '' }
    });
  };

  handleNavigate = () => {
    this.props.navigate('/resumen-por-servicio');
  };
  
  handleNavigate2 = () => {
    this.props.navigate('/resumendonadoranombre');
  };
  
  handleNavigate3 = () => {
    this.props.navigate('/topdonadoras');
  };

  cargarListasRelacionadas = async () => {
    try {
      const [personalRes, servicioExRes, servicioInRes, donadoraRes] = await Promise.all([
        axios.get(urlPersonal),
        axios.get(urlServicioEx),
        axios.get(urlServicioIn),
        axios.get(urlDonadora)
      ]);
      this.setState({
        personales: personalRes.data.personal,
        serviciosEx: servicioExRes.data,
        serviciosIn: servicioInRes.data,
        donadoras: donadoraRes.data.donadoras
      });
    } catch (error) {
      console.log("Error cargando listas relacionadas: ", error);
    }
  };

  peticionGet = () => {
    const { page, rows, mostrarTodos } = this.state;
    const params = mostrarTodos ? '' : '&mesActual=true';
    
    axios.get(`${urlDonadoraDetalle}?page=${page}&pageSize=${rows}${params}`)
      .then(response => {
        console.log("Datos recibidos:", response.data.donadoraDetalles);
        
        this.setState({
          donadoraDetalles: response.data.donadoraDetalles,
          totalRecords: response.data.totalRecords,
          searchValue: '',
          filteredDonadoras: [],
          showSuggestions: false,
          selectedDonadoraInfo: null
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de donadoraDetalles', 'error');
      });
  };

  onPageChange = (event) => {
    this.setState({ page: event.page + 1 }, () => {
      this.peticionGet();
    });
  }

  cleanFormData = (formData) => {
    const cleanedData = { ...formData };
    const integerFields = ['id_donadora', 'id_extrahospitalario', 'id_intrahospitalario', 'id_personal'];
    const floatFields = ['onzas', 'litros'];

    for (let field of integerFields) {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      } else if (cleanedData[field]) {
        cleanedData[field] = parseInt(cleanedData[field], 10);
      }
    }

    for (let field of floatFields) {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      } else if (cleanedData[field]) {
        cleanedData[field] = parseFloat(cleanedData[field]);
      }
    }

    return cleanedData;
  }

  validateForm = () => {
    const { form } = this.state;
    const requiredFields = ['no_frasco', 'id_donadora', 'onzas', 'id_personal'];
    const emptyFields = requiredFields.filter(field => !form[field] && form[field] !== 0);

    if (emptyFields.length > 0) {
      Swal.fire('Error', `Los siguientes campos son requeridos: ${emptyFields.join(', ')}`, 'error');
      return false;
    }

    if (!form.id_extrahospitalario && !form.id_intrahospitalario) {
      Swal.fire('Error', 'Debe seleccionar un servicio extrahospitalario o intrahospitalario', 'error');
      return false;
    }

    return true;
  }

  peticionPost = async () => {
    if (!this.validateForm()) return;

    try {
      const cleanedForm = this.cleanFormData(this.state.form);
      delete cleanedForm.id_donadora_detalle;
      console.log('Datos a enviar:', cleanedForm);
      const response = await axios.post(urlDonadoraDetalle, cleanedForm);
      console.log('Respuesta del servidor:', response.data);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        Swal.fire('Error', `Error del servidor: ${error.response.data.message || 'No se pudo crear el registro'}`, 'error');
      } else if (error.request) {
        Swal.fire('Error', 'No se recibió respuesta del servidor', 'error');
      } else {
        Swal.fire('Error', 'Error al crear el registro', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (!this.validateForm()) return;

    try {
      const cleanedForm = this.cleanFormData(this.state.form);
      console.log('Datos a actualizar:', cleanedForm);
      const response = await axios.put(urlDonadoraDetalle + cleanedForm.id_donadora_detalle, cleanedForm);
      console.log('Respuesta del servidor:', response.data);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        Swal.fire('Error', `Error del servidor: ${error.response.data.message || 'No se pudo actualizar el registro'}`, 'error');
      } else if (error.request) {
        Swal.fire('Error', 'No se recibió respuesta del servidor', 'error');
      } else {
        Swal.fire('Error', 'Error al actualizar el registro', 'error');
      }
    }
  }

  peticionDelete = () => {
    axios.delete(urlDonadoraDetalle + this.state.form.id_donadora_detalle).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar el registro', 'error');
      console.log(error.message);
    })
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  modalInsertarDonadora = () => {
    this.setState((prevState) => ({
      modalInsertarDonadora: !prevState.modalInsertarDonadora,
      nuevaDonadora: {
        nombre: '',
        apellido: '',
      },
    }));
  };

  seleccionarDonadoraDetalle = (donadoraDetalle) => {
    this.setState({
      tipoModal: 'actualizar',
      form: { ...donadoraDetalle }
    });
  }

  handleChange = async (e) => {
    const { name, type, checked, value } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    this.setState(prevState => {
      const newForm = { ...prevState.form, [name]: val };
      
      if (name === 'constante') {
        newForm.nueva = false;
      } else if (name === 'nueva') {
        newForm.constante = false;
      } else if (name === 'id_extrahospitalario' || name === 'id_intrahospitalario') {
        if (val === '') {
          // No hacemos nada, permitimos que el campo se vacíe
        } else {
          newForm.id_extrahospitalario = name === 'id_extrahospitalario' ? val : '';
          newForm.id_intrahospitalario = name === 'id_intrahospitalario' ? val : '';
        }
      }

      return { form: newForm };
    });
  }

  formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return isNaN(date) ? '' : date.toISOString().split('T')[0];
  }

  handleMostrarTodosChange = (e) => {
    this.setState({ mostrarTodos: e.target.checked }, this.peticionGet);
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

  addNewDonadora = async () => {
    const { nuevaDonadora } = this.state;
    try {
      const response = await axios.post(urlDonadora, nuevaDonadora);
      const newDonadora = response.data;
      this.setState(prevState => ({
        donadoras: [...prevState.donadoras, newDonadora],
        form: {
          ...prevState.form,
          id_donadora: newDonadora.id_donadora
        },
        modalInsertarDonadora: false
      }));
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    } catch (error) {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    }
  }

  handleGuardar = () => {
    this.peticionPost();
    this.setState({ 
      searchValue: '', 
      filteredDonadoras: [], 
      selectedDonadoraInfo: null 
    });
  };

  toggleModalAgregarVarios = () => {
    this.setState({ modalAgregarVarios: !this.state.modalAgregarVarios });
  };

  actualizarTabla = () => {
    this.peticionGet();
  }

  // Cleanup timeout al desmontar componente
  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  render() {
    const { 
      form, 
      searchValue, 
      filteredDonadoras, 
      showSuggestions, 
      isSearching,
      searchTotalRecords,
      searchCurrentPage,
      searchLimit,
      selectedDonadoraInfo,
      mostrarTodos, 
      donadoras, 
      modalInsertarDonadora,
      donadoraDetalles,
      totalRecords, 
      rows, 
      page  
    } = this.state;

   return (
  <div className="min-vh-100" style={{ background: 'linear-gradient(135deg,rgba(102, 126, 234, 0.08) 0%,rgba(118, 75, 162, 0.09) 100%)' }}>
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-lg border-0" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="mb-0 text-primary fw-bold">
                    <FaTint className="me-3" style={{ color: '#667eea' }} />
                    Control de Donación 
                  </h2>
                  <p className="text-muted mb-0">Gestión de Donaciones</p>
                </div>
                <div className="col-md-6 text-end">
                  <button
                    className="btn btn-lg shadow-sm me-2"
                    style={{ 
                      background: 'linear-gradient(45deg, #28a745, #20c997)',
                      border: 'none',
                      borderRadius: '15px',
                      color: 'white',
                      fontWeight: '600',
                      transform: 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    onClick={() => { 
                      this.setState({ form: null, tipoModal: 'insertar' }); 
                      this.modalInsertar(); 
                    }}
                  >
                    <FaFlask className="me-2" />
                    Nuevo Registro
                  </button>
                   <InsertarDonadoraModal
        isOpen={modalInsertarDonadora}
        toggle={this.modalInsertarDonadora}
        onRegistrosGuardados={this.actualizarTabla}
        onAddSuccess={() => {
          this.cargarDonadoras();
          this.peticionGet();
        }}
      />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow border-0" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.9)' }}>
            <div className="card-body p-3">
              <div className="row align-items-center">
                <div className="col-lg-3 mb-2 mb-lg-0">
                  <div className="form-check ">
                    <input
                      className="form-check-input me-3"
                      type="checkbox"
                      checked={mostrarTodos}
                      onChange={this.handleMostrarTodosChange}
                      id="mostrarTodosCheckbox"
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <label htmlFor="mostrarTodosCheckbox" className="form-check-label text-black fw-bold">
                      Mostrar todos los registros
                    </label>
                  </div>
                </div>
                
                <div className="col-lg-9">
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn-lg d-flex align-items-center"
                      style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '15px',
                      padding: '12px 20px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                      onClick={this.handleNavigate}
                    >
                      <FaChartBar className="me-2" />
                      Resumen por Servicio
                    </button>
                    
                    <button
                      className="btn btn-info shadow-sm d-flex align-items-center"
                      style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '15px',
                      padding: '12px 20px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                      onClick={this.handleNavigate2}
                    >
                      <FaAddressCard className="me-2" />
                      Resumen por Nombre
                    </button>
                    
                    <button
                      className="btn btn-warning shadow-sm d-flex align-items-center"
                      style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    color:'white',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                      onClick={this.handleNavigate3}
                    >
                      <FaBaby className="me-2" />
                      Top Donadoras
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
     

      {/* Table Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow border-0" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="card-header border-0 py-3" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0 text-white fw-bold">
                <FaFlask className="me-2" />
                Registro de Donaciones
              </h5>
            </div>
            <div className="card-body p-0">
  <div className="table-responsive" style={{ minHeight: '400px' }}>
    <table className="table table-hover mb-0" style={{ minWidth: '1200px' }}>
      <thead style={{ 
        background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <tr>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '60px' }}>ID</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '100px' }}>No. Frasco</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '200px' }}>Donadora</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '120px' }}>Fecha</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '80px' }}>Onzas</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '80px' }}>Litros</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '150px' }}>Extrahospitalario</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '150px' }}>Intrahospitalario</th>
          <th className="py-3 px-2 fw-bold text-primary text-center" style={{ minWidth: '90px' }}>Constante</th>
          <th className="py-3 px-2 fw-bold text-primary text-center" style={{ minWidth: '90px' }}>Nueva</th>
          <th className="py-3 px-2 fw-bold text-primary" style={{ minWidth: '120px' }}>Personal</th>
          <th className="py-3 px-2 fw-bold text-primary text-center" style={{ minWidth: '160px' }}>Acciones</th>
        </tr>
                  </thead>
                  <tbody>
                    {donadoraDetalles.map((detalle, index) => {
                      return (
                        <tr 
                          key={detalle.id_donadora_detalle}
                           style={{ 
        backgroundColor: index % 2 === 0 ? 'rgba(102, 126, 234, 0.02)' : 'white',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(102, 126, 234, 0.02)' : 'white';
      }}>
                          <td className="py-3 px-4">
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
                            <span className="text-white fw-bold small">{detalle.id_donadora_detalle}</span>
                          </div>
                          </div>
                          </td>
                          <td className="py-3 px-4 fw-semibold">{detalle.no_frasco}</td>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center">
                              
                              <span className="fw-semibold">
                                {detalle.donadoras ? detalle.donadoras.nombre + ' ' + detalle.donadoras.apellido : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 ">
                            <span className="d-flex align-items-center">{this.formatDate(detalle.fecha)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="fw-bold text-success">{detalle.onzas}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="fw-bold text-info">{detalle.litros}</span>
                          </td>
                          <td className="py-3 px-4">
                           <div className="badge rounded-pill px-3 py-2" 
                           style={{ 
                                   background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                   color: 'white'
                                 }}>
                              {detalle.servicio_exes ? detalle.servicio_exes.servicio : ''}
                          </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="badge rounded-pill px-3 py-2" 
                                 style={{ 
                                   background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                   color: 'white'
                                 }}>
                              {detalle.servicio_ins ? detalle.servicio_ins.servicio : ''}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="form-check d-inline-block">
                              <input 
                                type="checkbox" 
                                 checked={detalle.constante} 
                                disabled 
                                className="form-check-input"
                                style={{ 
                                  accentColor: "#f5576c",
                                  transform: "scale(1.2)"
                                }} 
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="form-check d-inline-block">
                              <input 
                                type="checkbox" 
                                 checked={detalle.nueva} 
                                disabled 
                                className="form-check-input"
                                style={{ 
                                  accentColor: "#f5576c",
                                  transform: "scale(1.2)"
                                }} 
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="badge bg-secondary">
                              {detalle.personals ? detalle.personals.nombre : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-primary shadow-sm" 
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                onClick={() => { this.seleccionarDonadoraDetalle(detalle); this.modalInsertar() }}
                              >
                                Editar
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger shadow-sm" 
                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                onClick={() => { this.seleccionarDonadoraDetalle(detalle); this.setState({ modalEliminar: true }) }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pagination Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow border-0" style={{ borderRadius: '15px', background: 'rgba(255, 255, 255, 0.9)' }}>
            <div className="card-body p-3">
              <Paginator
                first={(page - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                onPageChange={this.onPageChange}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords} registros"
                className="p-paginator-custom"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Modal Principal */}
    <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()} size="xl">
      <ModalHeader 
        toggle={() => this.modalInsertar()}
        style={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white',
          border: 'none'
        }}
      >
        <div className="d-flex align-items-center">
          <FcSurvey className="me-3" size={24} />
          <span className="fw-bold">
            {this.state.tipoModal === 'insertar' ? 'Nuevo Registro de Donación' : 'Editar Registro de Donación'}
          </span>
        </div>
      </ModalHeader>
      <ModalBody style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="container-fluid">
          <div className="row g-4">
            {/* Columna Izquierda */}
            <div className="col-md-6">
              <div className="card h-100 shadow border-0" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                  <h6 className="mb-0 fw-bold">
                    <FaFlask className="me-2" />
                    Información de la Donación
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="form-group mb-4">
                    <label htmlFor="no_frasco" className="form-label fw-bold text-primary">
                      <FaGlassWhiskey className="me-2" />
                      No. Frasco
                    </label>
                    <input 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      type="text" 
                      name="no_frasco" 
                      id="no_frasco" 
                      onChange={this.handleChange} 
                      value={form ? form.no_frasco : ''} 
                      placeholder="Ingrese el número de frasco"
                    />
                  </div>

                  {/* Campo de búsqueda mejorado */}
                  <div className="form-group mb-4">
                    <label htmlFor="donadora-search" className="form-label fw-bold text-primary">
                      <FaSistrix className="me-2" />
                      Buscar Donadora
                      {isSearching && <FaSpinner className="fa-spin ms-2 text-info" />}
                    </label>
                    <div className="input-group shadow-sm">
                      <input
                        type="text"
                        id="donadora-search"
                        className={`form-control form-control-lg ${selectedDonadoraInfo ? 'border-success' : ''}`}
                        style={{ borderRadius: '10px 0 0 10px', border: '2px solid #e9ecef' }}
                        placeholder="Escriba al menos 2 caracteres para buscar..."
                        value={searchValue}
                        onChange={this.handleSearchChange}
                        autoComplete="off"
                      />
                      {searchValue && (
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={this.clearSearch}
                          title="Limpiar búsqueda"
                          style={{ borderRadius: '0 10px 10px 0' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Información de donadora seleccionada */}
                    {selectedDonadoraInfo && (
                      <div className="alert alert-success mt-3 shadow-sm" style={{ borderRadius: '10px', border: 'none' }}>
                        <div className="d-flex align-items-center">
                          <FaBaby className="me-3 text-success" size={20} />
                          <div>
                            <strong>Seleccionada:</strong> {selectedDonadoraInfo.nombre_completo}
                            <br />
                            <small><strong>ID:</strong> {selectedDonadoraInfo.id_donadora}</small>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Lista de sugerencias mejorada */}
                    {showSuggestions && (
                      <div className="position-relative">
                        <div className="card position-absolute w-100 mt-2 shadow-lg border-0" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto', borderRadius: '15px' }}>
                          {filteredDonadoras.length > 0 ? (
                            <>
                              <div className="card-header py-3 bg-light" style={{ borderRadius: '15px 15px 0 0' }}>
                                <small className="text-muted fw-semibold">
                                  <FaSistrix className="me-2" />
                                  {searchTotalRecords} resultado(s) encontrado(s)
                                  {searchTotalRecords > searchLimit && ` (mostrando ${filteredDonadoras.length})`}
                                </small>
                              </div>
                              <div className="list-group list-group-flush">
                                {filteredDonadoras.map((donadora) => (
                                  <button
                                    key={donadora.id_donadora}
                                    type="button"
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 py-3"
                                    onClick={() => this.handleDonadoraSelect(donadora)}
                                    style={{ transition: 'all 0.3s ease' }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '35px', height: '35px' }}>
                                        {donadora.nombre_completo.charAt(0)}
                                      </div>
                                      <div>
                                        <strong>{donadora.nombre_completo}</strong>
                                        <br />
                                        <small className="text-muted">ID: {donadora.id_donadora}</small>
                                      </div>
                                    </div>
                                    <FaBaby className="text-primary" />
                                  </button>
                                ))}
                              </div>
                              
                              {/* Paginación simple para búsqueda si hay más resultados */}
                              {searchTotalRecords > searchLimit && (
                                <div className="card-footer py-3" style={{ borderRadius: '0 0 15px 15px' }}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      style={{ borderRadius: '8px' }}
                                      onClick={() => this.handleSearchPageChange(searchCurrentPage - 1)}
                                      disabled={searchCurrentPage <= 1}
                                    >
                                      Anterior
                                    </button>
                                    <small className="fw-semibold">
                                      Página {searchCurrentPage} de {Math.ceil(searchTotalRecords / searchLimit)}
                                    </small>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      style={{ borderRadius: '8px' }}
                                      onClick={() => this.handleSearchPageChange(searchCurrentPage + 1)}
                                      disabled={searchCurrentPage >= Math.ceil(searchTotalRecords / searchLimit)}
                                    >
                                      Siguiente
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="card-body text-center py-4">
                              <FaSistrix className="text-muted mb-2" size={24} />
                              <br />
                              <small className="text-muted">
                                {searchValue.length < 2 
                                  ? 'Escriba al menos 2 caracteres para buscar' 
                                  : 'No se encontraron donadoras'
                                }
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Select de donadora (mantener como respaldo) */}
                  <div className="form-group mb-4">
                    <label htmlFor="id_donadora" className="form-label fw-bold text-primary">
                      <FaBaby className="me-2" />
                      Donadora
                    </label>
                    <div className="input-group shadow-sm">
                      <select 
                        className="form-control form-control-lg" 
                        style={{ borderRadius: '10px 0 0 10px', border: '2px solid #e9ecef' }}
                        name="id_donadora" 
                        onChange={this.handleChange} 
                        value={form ? form.id_donadora : ''}
                      >
                        <option value="">Seleccione una donadora</option>
                        {donadoras.map(donadora => (
                          <option key={donadora.id_donadora} value={donadora.id_donadora}>
                            {donadora.nombre} {donadora.apellido}
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-outline-primary" 
                        type="button" 
                        onClick={this.modalInsertarDonadora}
                        style={{ borderRadius: '0 10px 10px 0', fontWeight: '500' }}
                      >
                        Nueva Donadora
                      </button>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="fecha" className="form-label fw-bold text-primary">
                      <FaCalendarDay className="me-2" />
                      Fecha
                    </label>
                    <input 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      type="date" 
                      name="fecha" 
                      id="fecha" 
                      onChange={this.handleChange} 
                      value={form ? form.fecha : ''} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="col-md-6">
              <div className="card h-100 shadow border-0" style={{ borderRadius: '15px' }}>
                <div className="card-header bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
                  <h6 className="mb-0 fw-bold">
                    <FaClinicMedical className="me-2" />
                    Detalles y Servicios
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="form-group mb-4">
                    <label htmlFor="onzas" className="form-label fw-bold text-success">
                      <FaTint className="me-2" />
                      Onzas
                    </label>
                    <input 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      type="number" 
                      name="onzas" 
                      id="onzas" 
                      onChange={this.handleChange} 
                      value={form ? form.onzas : ''} 
                      placeholder="Cantidad en onzas"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="litros" className="form-label fw-bold text-info">
                      <FaFlask className="me-2" />
                      Litros
                    </label>
                    <input 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef', backgroundColor: '#f8f9fa' }}
                      type="text" 
                      name="litros" 
                      id="litros" 
                      value={form ? form.litros : ''} 
                      readOnly 
                      placeholder="Calculado automáticamente"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="id_extrahospitalario" className="form-label fw-bold text-warning">
                      <FaBuilding className="me-2" />
                      Servicio Extrahospitalario
                    </label>
                    <select 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      name="id_extrahospitalario" 
                      onChange={this.handleChange} 
                      value={form ? form.id_extrahospitalario : ''}
                    >
                      <option value="">Seleccione un servicio</option>
                      {this.state.serviciosEx.map(servicio => (
                        <option key={servicio.id_extrahospitalario} value={servicio.id_extrahospitalario}>
                          {servicio.servicio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="id_intrahospitalario" className="form-label fw-bold text-primary">
                      <FaClinicMedical className="me-2" />
                      Servicio Intrahospitalario
                    </label>
                    <select 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      name="id_intrahospitalario" 
                      onChange={this.handleChange} 
                      value={form ? form.id_intrahospitalario : ''}
                    >
                      <option value="">Seleccione un servicio</option>
                      {this.state.serviciosIn.map(servicio => (
                        <option key={servicio.id_intrahospitalario} value={servicio.id_intrahospitalario}>
                          {servicio.servicio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card bg-light shadow-sm" style={{ borderRadius: '10px' }}>
                        <div className="card-body p-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="constante"
                              id="constante"
                              onChange={this.handleChange}
                              checked={form ? form.constante : false}
                              style={{ transform: 'scale(1.2)' }}
                            />
                            <label className="form-check-label fw-bold text-success" htmlFor="constante">
                              Donadora Constante
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light shadow-sm" style={{ borderRadius: '10px' }}>
                        <div className="card-body p-3">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="nueva"
                              id="nueva"
                              onChange={this.handleChange}
                              checked={form ? form.nueva : false}
                              style={{ transform: 'scale(1.2)' }}
                            />
                            <label className="form-check-label fw-bold text-info" htmlFor="nueva">
                              Donadora Nueva
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label htmlFor="id_personal" className="form-label fw-bold text-secondary">
                      <FaAddressCard className="me-2" />
                      Personal
                    </label>
                    <select 
                      className="form-control form-control-lg shadow-sm" 
                      style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                      name="id_personal" 
                      onChange={this.handleChange} 
                      value={form ? form.id_personal : ''}
                    >
                      <option value="">Seleccione personal</option>
                      {this.state.personales.map(personal => (
                        <option key={personal.id_personal} value={personal.id_personal}>
                          {personal.nombre} {personal.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter style={{ background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)', border: 'none' }}>
        <div className="d-flex gap-3">
          {this.state.tipoModal === 'insertar' ? (
            <button 
              className="btn btn-lg shadow-sm"
              style={{ 
                background: 'linear-gradient(45deg, #28a745, #20c997)',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={() => this.peticionPost()}
            >
              <FaClipboardCheck className="me-2" />
              Insertar Registro
            </button>
          ) : (
            <button 
              className="btn btn-lg shadow-sm"
              style={{ 
                background: 'linear-gradient(45deg, #007bff, #0056b3)',
                border: 'none',
                borderRadius: '15px',
                color: 'white',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={() => this.peticionPut()}
            >
              <FaClipboardCheck className="me-2" />
              Actualizar Registro
            </button>
          )}
          <button 
            className="btn btn-lg btn-outline-danger shadow-sm" 
            style={{ 
              borderRadius: '15px',
              fontWeight: '600',
              padding: '12px 30px'
            }}
            onClick={() => this.modalInsertar()}
          >
            Cancelar
          </button>
        </div>
      </ModalFooter>
    </Modal>

    {/* Modal de Eliminación */}
    <Modal isOpen={this.state.modalEliminar} className="modal-dialog-centered">
      <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
        <ModalHeader 
          style={{ 
            background: 'linear-gradient(45deg, #dc3545, #c82333)', 
            color: 'white',
            border: 'none',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <div className="d-flex align-items-center">
            <FaTrash className="me-3" size={20} />
            <span className="fw-bold">Confirmar Eliminación</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)' }}>
          <div className="text-center">
            <FaExclamationTriangle className="text-warning mb-3" size={48} />
            <h5 className="fw-bold text-dark mb-3">¿Está seguro de eliminar este registro?</h5>
            <p className="text-muted">
              Se eliminará permanentemente el registro con ID: 
              <span className="fw-bold text-danger ms-1">
                {form && form.id_donadora_detalle}
              </span>
            </p>
            <div className="alert alert-warning d-flex align-items-center mt-3" role="alert">
              <FaExclamationTriangle className="me-2" />
              <small>Esta acción no se puede deshacer</small>
            </div>
          </div>
        </ModalBody>
        <ModalFooter style={{ background: '#f8f9fa', border: 'none', borderRadius: '0 0 20px 20px' }}>
          <div className="d-flex gap-3 w-100 justify-content-center">
            <button 
              className="btn btn-danger btn-lg shadow-sm"
              style={{ 
                borderRadius: '15px',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={() => this.peticionDelete()}
            >
              <FaTrash className="me-2" />
              Sí, Eliminar
            </button>
            <button 
              className="btn btn-secondary btn-lg shadow-sm"
              style={{ 
                borderRadius: '15px',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={() => this.setState({ modalEliminar: false })}
            >
              Cancelar
            </button>
          </div>
        </ModalFooter>
      </div>
    </Modal>

    {/* Modal para agregar nueva donadora */}
    <Modal isOpen={this.state.modalInsertarDonadora} toggle={this.modalInsertarDonadora} className="modal-dialog-centered">
      <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
        <ModalHeader 
          toggle={this.modalInsertarDonadora}
          style={{ 
            background: 'linear-gradient(45deg, #17a2b8, #138496)', 
            color: 'white',
            border: 'none',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <div className="d-flex align-items-center">
            <FaBaby className="me-3" size={20} />
            <span className="fw-bold">Agregar Nueva Donadora</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4" style={{ background: 'linear-gradient(135deg, #f0fdff 0%, #cbf3f0 100%)' }}>
          <div className="row g-3">
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="nombre" className="form-label fw-bold text-primary">
                  <FaUser className="me-2" />
                  Nombre
                </label>
                <input
                  className="form-control form-control-lg shadow-sm"
                  style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                  type="text"
                  name="nombre"
                  id="nombre"
                  onChange={this.handleNewDonadoraChange}
                  value={this.state.nuevaDonadora.nombre}
                  placeholder="Ingrese el nombre"
                />
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label htmlFor="apellido" className="form-label fw-bold text-primary">
                  <FaUser className="me-2" />
                  Apellido
                </label>
                <input
                  className="form-control form-control-lg shadow-sm"
                  style={{ borderRadius: '10px', border: '2px solid #e9ecef' }}
                  type="text"
                  name="apellido"
                  id="apellido"
                  onChange={this.handleNewDonadoraChange}
                  value={this.state.nuevaDonadora.apellido}
                  placeholder="Ingrese el apellido"
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter style={{ background: '#f8f9fa', border: 'none', borderRadius: '0 0 20px 20px' }}>
          <div className="d-flex gap-3">
            <button 
              className="btn btn-success btn-lg shadow-sm"
              style={{ 
                borderRadius: '15px',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={this.addNewDonadora}
            >
              <FaPlus className="me-2" />
              Agregar
            </button>
            <button 
              className="btn btn-secondary btn-lg shadow-sm"
              style={{ 
                borderRadius: '15px',
                fontWeight: '600',
                padding: '12px 30px'
              }}
              onClick={this.modalInsertarDonadora}
            >
              Cancelar
            </button>
          </div>
        </ModalFooter>
      </div>
    </Modal>
  </div>
);
  }
}

// Componente funcional que envuelve el componente basado en clases
function ShowDonadoraDetalleWrapper() {
  const navigate = useNavigate();
  return <ShowDonadoraDetalle navigate={navigate} />;
}

export default ShowDonadoraDetalleWrapper;
