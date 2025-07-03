import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Paginator } from 'primereact/paginator';
import { FcCollaboration } from "react-icons/fc";
import { FaChartBar,FaClinicMedical , FaAddressCard ,FaUserCheck,FaHospitalAlt,FaUserPlus,FaHospitalUser,FaSistrix,FaCalendarDay,FaClipboardCheck, FaSpinner,FaExclamationTriangle, FaTrash  } from 'react-icons/fa';
import { Button } from 'reactstrap';
import InsertarPersonaModal from './InsertarPersonaModal';
const url = "http://localhost:8080/api/estimulacion/";
const personalUrl = 'http://localhost:8080/api/personal_estimulacion/';
const servicioUrl = 'http://localhost:8080/api/servicio_in/';
const personalUrl1= 'http://localhost:8080/api/personal/';
const urlServicioEx = "http://localhost:8080/api/servicio_ex/";

class ShowStimulation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      estimulaciones: [],
      personal: [],
      personal1:[],
      servicios: [],
      serviciosex:[],
      // Estados para la búsqueda avanzada
      searchPersonal: '', 
      searchResults: [], // Resultados de búsqueda de la API
      isSearching: false, // Estado de carga para la búsqueda
      showSearchResults: false, // Mostrar/ocultar resultados
      searchTimeout: null, // Para debounce de búsqueda
      selectedPersonaCompleta: null, // Datos completos de la persona seleccionada
      modalInsertar: false,
      selectedPersona: '',
      modalInsertarPersona: false,
      modalEliminar: false,
      form: this.getInitialFormState(),
      tipoModal: '',
      totalRecords: 0,
      currentPage: 1,
      rowsPerPage: 10,
      isLoading: true,
    }
  }

  getInitialFormState = () => ({
    id_estimulacion: '',
    id_personal_estimulacion: '',
    fecha: '',
    id_intrahospitalario: '',
    constante: false,
    nueva: false,
    id_extrahospitalario: '',
  });

  componentDidMount() {
    this.cargarDatos(); 
    this.obtenerPersonal1();
  }

  // Función de búsqueda avanzada con debounce
  buscarPersonalAvanzado = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      this.setState({ 
        searchResults: [], 
        showSearchResults: false,
        isSearching: false 
      });
      return;
    }

    this.setState({ isSearching: true });

    try {
      const response = await axios.get(`${personalUrl}search/advanced`, {
        params: {
          q: searchTerm.trim(),
          limit: 10 // Limitar resultados para la búsqueda
        }
      });

      this.setState({
        searchResults: response.data.personal_estimulaciones || [],
        showSearchResults: true,
        isSearching: false
      });

    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      this.setState({ 
        searchResults: [], 
        showSearchResults: false,
        isSearching: false 
      });
    }
  };

  // Manejo del cambio en el campo de búsqueda con debounce
  handleSearchPersonalChange = (e) => {
    const searchTerm = e.target.value;
    
    this.setState({ searchPersonal: searchTerm });

    // Limpiar timeout anterior
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }

    // Establecer nuevo timeout para debounce
    const newTimeout = setTimeout(() => {
      this.buscarPersonalAvanzado(searchTerm);
    }, 300); // Esperar 300ms después de que el usuario deje de escribir

    this.setState({ searchTimeout: newTimeout });
  };

  // Seleccionar persona de los resultados de búsqueda
  seleccionarPersonaDeBusqueda = (persona) => {
    this.setState(prevState => ({
      selectedPersona: persona.id_personal_estimulacion,
      selectedPersonaCompleta: persona,
      searchPersonal: `${persona.nombre} ${persona.apellido}`, // Mostrar nombre completo
      showSearchResults: false, // Ocultar resultados
      searchResults: [], // Limpiar resultados
      form: {
        ...prevState.form,
        id_personal_estimulacion: persona.id_personal_estimulacion.toString()
      }
    }));
  };

  // Limpiar búsqueda
  limpiarBusqueda = () => {
    this.setState({
      searchPersonal: '',
      searchResults: [],
      showSearchResults: false,
      selectedPersonaCompleta: null,
      isSearching: false
    });
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  filteredEstimulaciones = () => {
    const { estimulaciones, searchTerm } = this.state;
    return estimulaciones.filter((estimulacion) =>
      (estimulacion.personal_estimulaciones?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  obtenerPersonal = async () => {
    const response = await axios.get('http://localhost:8080/api/personal_estimulacion/');
    this.setState({ personal: response.data.personal_estimulaciones || response.data || [] });
  };

  obtenerPersonal1 = async () => {
    try {
      const response = await axios.get(personalUrl1);
      this.setState({ personal1: response.data.personal }); 
    } catch (error) {
      console.error('Error al obtener los datos de personal:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos de personal', 'error');
    }
  };

  handlePersonaInsertada = (nuevaPersona) => {
    this.setState((prevState) => ({
      personal: [...prevState.personal, nuevaPersona],
      selectedPersona: nuevaPersona.id_personal_estimulacion,
      selectedPersonaCompleta: nuevaPersona,
      searchPersonal: `${nuevaPersona.nombre} ${nuevaPersona.apellido}`,
      form: {
        ...prevState.form,
        id_personal_estimulacion: nuevaPersona.id_personal_estimulacion
      }
    }));
  };

  formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
  };

  formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    return adjustedDate.toLocaleDateString();
  };

  handleNavigate = () => {
    this.props.navigate('/resumen-estimulacion');
  };

  handleNavigate2 = () => {
    this.props.navigate('/resumenestimulacionnombre');
  };

  cargarDatos = async () => {
    try {
      this.setState({ isLoading: true });
      await Promise.all([
        this.peticionGet(),
        this.cargarPersonalYServicios()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'Error al cargar los datos iniciales', 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  };

  peticionGet = async () => {
    try {
      const { currentPage, rowsPerPage } = this.state;
      const response = await axios.get(`${url}?page=${currentPage}&pageSize=${rowsPerPage}`);
      
      if (response.data && response.data.estimulaciones) {
        this.setState({
          estimulaciones: response.data.estimulaciones,
          totalRecords: response.data.totalRecords || 0
        });
      }
    } catch (error) {
      console.error('Error al obtener estimulaciones:', error);
      Swal.fire('Error', 'No se pudieron cargar las estimulaciones', 'error');
      this.setState({ estimulaciones: [] });
    }
  };

  validateForm = () => {
    const { id_personal_estimulacion, fecha, id_personal, id_intrahospitalario, id_extrahospitalario } = this.state.form;
    
    if (!id_personal_estimulacion || !fecha || !id_personal) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return false;
    }
  
    if (!id_intrahospitalario && !id_extrahospitalario) {
      Swal.fire('Error', 'Debe seleccionar un servicio', 'error');
      return false;
    }
  
    return true;
  };

  peticionPost = async () => {
    if (!this.validateForm()) return;
  
    try {
      const formData = {
        ...this.state.form,
        fecha: new Date(this.state.form.fecha).toISOString().split('T')[0],
        id_intrahospitalario: this.state.form.id_intrahospitalario || null,
        id_extrahospitalario: this.state.form.id_extrahospitalario || null,
        id_personal_estimulacion: parseInt(this.state.form.id_personal_estimulacion),
        id_personal: parseInt(this.state.form.id_personal),
        constante: Boolean(this.state.form.constante),
        nueva: Boolean(this.state.form.nueva)
      };

      console.log('Sending payload:', formData);
    
      await axios.post(url, formData);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación agregada exitosamente', 'success');
    } catch (error) {
      console.error('Full error response:', error.response);
      Swal.fire('Error', 'No se pudo agregar la estimulación: ' + (error.response?.data?.message || error.message), 'error');
    }
  };
  
  peticionPut = async () => {
    if (!this.validateForm()) return;
  
    try {
      const formData = {
        ...this.state.form,
        id_personal_estimulacion: parseInt(this.state.form.id_personal_estimulacion),
        id_intrahospitalario: parseInt(this.state.form.id_intrahospitalario),
        constante: Boolean(this.state.form.constante),
        nueva: Boolean(this.state.form.nueva),
        fecha: new Date(this.state.form.fecha).toISOString().split('T')[0],
        id_personal: parseInt(this.state.form.id_personal),
        id_extrahospitalario: parseInt(this.state.form.id_extrahospitalario)
      };

      await axios.put(`${url}${this.state.form.id_estimulacion}`, formData);
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error al actualizar estimulación:', error);
      Swal.fire('Error', 'No se pudo actualizar la estimulación', 'error');
    }
  };

  peticionDelete = async () => {
    try {
      await axios.delete(`${url}${this.state.form.id_estimulacion}`);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Estimulación eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar estimulación:', error);
      Swal.fire('Error', 'No se pudo eliminar la estimulación', 'error');
    }
  };

  cargarPersonalYServicios = async () => {
    try {
      const [personalResponse, servicioResponse, servicioeResponse] = await Promise.all([
        axios.get(personalUrl),
        axios.get(servicioUrl),
        axios.get(urlServicioEx)
      ]);

      this.setState({
        personal: personalResponse.data?.personal_estimulaciones || personalResponse.data || [],
        servicios: servicioResponse.data?.servicios || servicioResponse.data || [],
        serviciosex: servicioeResponse.data?.serviciosex || servicioeResponse.data || [],
      });
    } catch (error) {
      console.error('Error al cargar personal y servicios:', error);
      Swal.fire('Error', 'Error al cargar datos de personal y servicios', 'error');
      this.setState({ personal: [], servicios: [], serviciosex:[] });
    }
  };

  seleccionarEstimulacion = (estimulacion) => {
    const fechaFormateada = this.formatDateForInput(estimulacion.fecha);
    
    this.setState({
        modalInsertar: true,
        tipoModal: 'editar',
        form: {
            ...estimulacion,
            fecha: fechaFormateada,
            id_personal_estimulacion: estimulacion.id_personal_estimulacion ? estimulacion.id_personal_estimulacion.toString() : '',
            id_intrahospitalario: estimulacion.id_intrahospitalario ? estimulacion.id_intrahospitalario.toString() : '',
            id_extrahospitalario: estimulacion.id_extrahospitalario ? estimulacion.id_extrahospitalario.toString() : '',
            id_personal: estimulacion.id_personal ? estimulacion.id_personal.toString() : '',
            constante: Boolean(estimulacion.constante),
            nueva: Boolean(estimulacion.nueva)
        }
    });
  };

  modalInsertar = () => {
    this.setState(prevState => {
      const newModalState = !prevState.modalInsertar;
      
      // Si se está cerrando el modal, limpiar la búsqueda
      if (!newModalState) {
        this.limpiarBusqueda();
      }
      
      return {
        modalInsertar: newModalState,
        form: !prevState.modalInsertar ? 
            (this.state.tipoModal === 'insertar' ? this.getInitialFormState() : this.state.form) 
            : this.state.form
      };
    });
  };

  handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (
      name === 'id_personal_estimulacion' ||
      name === 'id_intrahospitalario' ||
      name === 'id_personal' ||
      name === 'id_extrahospitalario'
    ) {
      val = value === '' ? null : value.toString();
    }

    this.setState(prevState => {
      let newForm = { ...prevState.form, [name]: val };

      if (name === 'id_extrahospitalario' || name === 'id_intrahospitalario') {
        if (val) {
          newForm.id_extrahospitalario = name === 'id_extrahospitalario' ? val : null;
          newForm.id_intrahospitalario = name === 'id_intrahospitalario' ? val : null;
        }
      }

      if (type === 'checkbox') {
        if (name === 'constante' && checked) {
          newForm.nueva = false;
        } else if (name === 'nueva' && checked) {
          newForm.constante = false;
        }
      }

      return { form: newForm };
    });
  };

  onPageChange = (event) => {
    this.setState({
      currentPage: event.page + 1,
      rowsPerPage: event.rows
    }, this.peticionGet);
  };

  toggleInsertarPersonaModal = () => {
    this.setState({ modalInsertarPersona: !this.state.modalInsertarPersona });
  };

  // Cleanup del timeout al desmontar componente
  componentWillUnmount() {
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }
  }

  render() {
    const { 
      isLoading, 
      form, 
      personal, 
      servicios, 
      serviciosex, 
      estimulaciones, 
      totalRecords, 
      currentPage, 
      rowsPerPage, 
      searchTerm,
      searchPersonal,
      searchResults,
      isSearching,
      showSearchResults,
      selectedPersonaCompleta
    } = this.state;

    if (isLoading) {
      return <div className="text-center mt-5">Cargando datos...</div>;
    }

return (
  <div style={{ 
    background: 'linear-gradient(135deg,rgba(226, 226, 230, 0) 0%,rgba(255, 255, 255, 0) 100%)',
    minHeight: '100vh',
    paddingTop: '2rem',
    paddingBottom: '2rem'
  }}>
    <div className="w-100 px-2 px-md-3 px-lg-4">
      {/* Header Moderno */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center mb-3" 
             style={{
               background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
               borderRadius: '50px',
               padding: '15px 30px',
               boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
             }}>
          <FaClinicMedical className="text-white me-3" size={32} />
          <h2 className="mb-0 text-white fw-bold">Gestión de Estimulaciones</h2>
        </div>
        <p className="text-black fs-5 opacity-75">Sistema integral de registro y seguimiento</p>
      </div>

      {/* Barra de Acciones Mejorada */}
      <div className="row justify-content-center mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <button 
                  className="btn btn-lg d-flex align-items-center flex-grow-1 flex-md-grow-0"
                  onClick={() => {
                    this.setState({
                      form: this.getInitialFormState(),
                      tipoModal: 'insertar',
                      selectedPersona: '' 
                    }, this.modalInsertar);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FaClinicMedical className="me-2" size={20} />
                  Agregar Estimulación
                </button>

                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    onClick={this.handleNavigate} 
                    className="btn-lg d-flex align-items-center"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '12px 20px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaChartBar className="me-2" size={18} />
                    Resumen General
                  </Button>

                  <Button 
                    onClick={this.handleNavigate2} 
                    className="btn-lg d-flex align-items-center"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '12px 20px',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <FaChartBar className="me-2" size={18} />
                    Resumen por Nombre
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="row justify-content-center">
        <div className="col-12">
          {estimulaciones.length === 0 ? (
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body text-center p-5">
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FaClinicMedical className="text-white" size={32} />
                </div>
                <h4 className="text-primary fw-bold mb-2">No hay estimulaciones registradas</h4>
                <p className="text-muted">Comienza agregando tu primera estimulación</p>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-0">
                {/* Header de la tabla */}
                
<div className="p-3 p-md-4 border-bottom">
  <h4 className="fw-bold text-primary mb-1 d-flex align-items-center">
    <FaClinicMedical className="me-2 me-md-3 text-primary" size={20} />
    <span className="fs-5 fs-md-4">Registro de Estimulaciones</span>
  </h4>
  <p className="text-muted mb-0 small">Gestiona y consulta todas las estimulaciones registradas</p>
</div>

                {/* Tabla Moderna */}
                <div className="table-responsive">
                  <table className="table mb-0 modern-table">
                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <tr>
                        <th className="text-white fw-semibold border-0 py-2 py-md-3 px-2 px-md-4 small">ID</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 small">Persona Estimulada</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 small">Fecha</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 small">Servicio Intra</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 small">Servicio Extra</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 text-center small">Constante</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 text-center small">Nueva</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 small">Personal</th>
                  <th className="text-white fw-semibold border-0 py-2 py-md-3 px-1 px-md-2 text-center small">Acciones</th>
               
                        </tr>
                    </thead>
                    <tbody>
                      {estimulaciones.map(estimulacion => (
                        <tr key={estimulacion.id_estimulacion} className="hover-row">
                          <td className="py-2 py-md-3 px-2 px-md-4">
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
                                <span className="text-white fw-bold small">{estimulacion.id_estimulacion}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <FaUserCheck className="text-primary me-2" size={16} />
                              <span className="fw-semibold">
                                {estimulacion.personal_estimulaciones?.nombre + ' ' + estimulacion.personal_estimulaciones?.apellido}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <FaCalendarDay className="text-info me-2" size={14} />
                              <span>{this.formatDateForDisplay(estimulacion.fecha)}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="badge rounded-pill px-3 py-2" 
                                 style={{ 
                                   background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                   color: 'white'
                                 }}>
                              {estimulacion.servicio_ins?.servicio }
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="badge rounded-pill px-3 py-2" 
                                 style={{ 
                                   background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                   color: 'white'
                                 }}>
                              {estimulacion.servicio_exes?.servicio }
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="form-check d-inline-block">
                              <input 
                                type="checkbox" 
                                checked={estimulacion.constante} 
                                disabled 
                                className="form-check-input"
                                style={{ 
                                  accentColor: "#667eea",
                                  transform: "scale(1.2)"
                                }} 
                              />
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <div className="form-check d-inline-block">
                              <input 
                                type="checkbox" 
                                checked={estimulacion.nueva} 
                                disabled 
                                className="form-check-input"
                                style={{ 
                                  accentColor: "#f5576c",
                                  transform: "scale(1.2)"
                                }} 
                              />
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex align-items-center">
                              <FaAddressCard className="text-warning me-2" size={14} />
                              <span>{estimulacion.personals?.nombre || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm d-flex align-items-center"
                                onClick={() => this.seleccionarEstimulacion(estimulacion)}
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '6px 12px',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm d-flex align-items-center"
                                onClick={() => {
                                  this.setState({
                                    modalEliminar: true,
                                    form: { ...estimulacion }
                                  });
                                }}
                                style={{
                                  background: 'linear-gradient(135deg,rgb(186, 25, 78) 0%,rgb(253, 6, 39) 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '6px 12px',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  boxShadow: '0 4px 10px rgba(240, 147, 251, 0.3)'
                                }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginador */}
                <div className="p-4 border-top">
                  <Paginator
                    first={(currentPage - 1) * rowsPerPage}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={this.onPageChange}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    className="custom-paginator"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Insertar/Editar Mejorado */}
      <Modal isOpen={this.state.modalInsertar} size="xl" className="modern-modal">
        <ModalHeader className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <FcCollaboration size={24} />
            </div>
            <div>
              <h4 className="mb-1 fw-bold text-primary">
                {this.state.tipoModal === 'insertar' ? 'Nueva Estimulación' : 'Editar Estimulación'}
              </h4>
              <p className="text-muted mb-0">Complete los datos necesarios</p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-4">
          <div className="container-fluid">
            {/* Botón Nueva Persona */}
            <div className="card mb-4 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
              <div className="card-body p-3 text-center">
                <button 
                  className="btn d-flex align-items-center justify-content-center mx-auto"
                  type="button" 
                  onClick={this.toggleInsertarPersonaModal}
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '10px 20px',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 6px 15px rgba(17, 153, 142, 0.3)'
                  }}
                >
                  <FaUserPlus className="me-2" size={18} />
                  Registrar Nueva Persona
                </button>
              </div>
            </div>
            
            <div className="row g-4">
              {/* Columna Izquierda */}
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <div className="card-header border-0" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}>
                    <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
                      <FaUserCheck className="me-2" />
                      Información de la Persona
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    {/* Búsqueda avanzada */}
                    <div className="form-group mb-4">
                      <label htmlFor="searchPersonal" className="form-label fw-semibold">
                        <FaSistrix className="me-2 text-primary" />
                        Buscar Persona Estimulada
                      </label>
                      <div className="position-relative">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="searchPersonal"
                            placeholder="Escriba al menos 2 caracteres..."
                            value={searchPersonal}
                            onChange={this.handleSearchPersonalChange}
                            style={{
                              borderRadius: '10px 0 0 10px',
                              border: '2px solid #e9ecef',
                              padding: '12px',
                              fontSize: '14px'
                            }}
                          />
                          <div className="input-group-append">
                            <span className="input-group-text" 
                                  style={{
                                    borderRadius: '0 10px 10px 0',
                                    border: '2px solid #e9ecef',
                                    borderLeft: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                  }}>
                              {isSearching ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaSistrix />
                              )}
                            </span>
                          </div>
                          {searchPersonal && (
                            <button 
                              className="btn position-absolute"
                              type="button"
                              onClick={this.limpiarBusqueda}
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
                        </div>
                      </div>
                    </div>

                    {/* Resultados de búsqueda */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="card mb-3 border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                        <div className="card-body p-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {searchResults.map(persona => (
                            <div
                              key={persona.id_personal_estimulacion}
                              className="d-flex justify-content-between align-items-center p-3 border-bottom search-result-item"
                              onClick={() => this.seleccionarPersonaDeBusqueda(persona)}
                              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
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
                                  <FaUserCheck className="text-white" size={14} />
                                </div>
                                <div>
                                  <div className="fw-bold">{persona.nombre} {persona.apellido}</div>
                                  <small className="text-muted">ID: {persona.id_personal_estimulacion}</small>
                                </div>
                              </div>
                              <small className="text-primary fw-semibold">Seleccionar</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensaje sin resultados */}
                    {showSearchResults && searchResults.length === 0 && !isSearching && (
                      <div className="alert alert-info border-0" style={{ borderRadius: '10px' }}>
                        <div className="d-flex align-items-center">
                          <FaSistrix className="me-2" />
                          No se encontraron resultados para "{searchPersonal}"
                        </div>
                      </div>
                    )}

                    {/* Persona seleccionada */}
                    {selectedPersonaCompleta && (
                      <div className="alert border-0 mb-3" 
                           style={{ 
                             background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                             color: 'white',
                             borderRadius: '10px'
                           }}>
                        <div className="d-flex align-items-center">
                          <FaUserCheck className="me-2" size={18} />
                          <div>
                            <strong>Persona seleccionada:</strong>
                            <div>{selectedPersonaCompleta.nombre} {selectedPersonaCompleta.apellido}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Select de persona */}
                    
<div className="form-group mb-3">
  <label htmlFor="id_personal_estimulacion" className="form-label fw-semibold">
    <FaUserCheck className="me-2 text-primary" />
    Persona Estimulada
  </label>
  <select 
    className="form-select" 
    name="id_personal_estimulacion"
    value={this.state.selectedPersona || ''}
    onChange={(e) => {
      const selectedId = e.target.value;
      const selectedPersona = this.state.personal.find(p => p.id_personal_estimulacion.toString() === selectedId);
      this.setState(prevState => ({
        selectedPersona: selectedId,
        selectedPersonaCompleta: selectedPersona,
        searchPersonal: selectedPersona ? `${selectedPersona.nombre} ${selectedPersona.apellido}` : '',
        form: {
          ...prevState.form,
          id_personal_estimulacion: selectedId
        }
      }));
    }}
    style={{
      borderRadius: '10px',
      border: '2px solid #e9ecef',
      padding: '12px'
    }}
  > 
    <option value="">Seleccione una persona</option>
    {/* Mostrar solo los primeros 10 elementos */}
    {this.state.personal.slice(0, 10).map((personal) => (
      <option key={personal.id_personal_estimulacion} value={personal.id_personal_estimulacion}>
        {personal.nombre} {personal.apellido}
      </option>
    ))}
    {/* Mostrar mensaje si hay más de 10 elementos */}
    {this.state.personal.length > 10 && (
      <option value="" disabled style={{ fontStyle: 'italic', color: '#6c757d' }}>
        ... y {this.state.personal.length - 10} personas más (use la búsqueda)
      </option>
    )}
  </select>
  
  {/* Mensaje informativo debajo del select */}
  {this.state.personal.length > 10 && (
    <div className="form-text mt-2">
      <small className="text-muted d-flex align-items-center">
        <FaSistrix className="me-1" size={12} />
        Se muestran solo las primeras 10 personas. Use la búsqueda avanzada para encontrar más opciones.
      </small>
    </div>
  )}
</div>

                    {/* Fecha */}
                    <div className="form-group">
                      <label htmlFor="fecha" className="form-label fw-semibold">
                        <FaCalendarDay className="me-2 text-primary" />
                        Fecha de Estimulación
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        name="fecha"
                        value={form.fecha || ''}
                        onChange={this.handleChange}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Modal Insertar Persona */}
                <InsertarPersonaModal
                  isOpen={this.state.modalInsertarPersona}
                  toggle={this.toggleInsertarPersonaModal}
                  onPersonaInsertada={this.handlePersonaInsertada}
                />
              </div>
              
              {/* Columna Derecha */}
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <div className="card-header border-0" style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '15px 15px 0 0'
                  }}>
                    <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
                      <FaHospitalAlt className="me-2" />
                      Configuración de Servicios
                    </h6>
                  </div>
                  <div className="card-body p-4">
                    {/* Servicio Intrahospitalario */}
                    <div className="form-group mb-3">
                      <label htmlFor="id_intrahospitalario" className="form-label fw-semibold">
                        <FaHospitalAlt className="me-2 text-success" />
                        Servicio Intrahospitalario
                      </label>
                      <select
                        className="form-select"
                        name="id_intrahospitalario"
                        value={form.id_intrahospitalario || ''}
                        onChange={this.handleChange}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      >
                        <option value="">Seleccione un servicio</option>
                        {servicios.map(servicio => (
                          <option 
                            key={servicio.id_intrahospitalario} 
                            value={servicio.id_intrahospitalario.toString()}
                          >
                            {servicio.servicio}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Servicio Extrahospitalario */}
                    <div className="form-group mb-4">
                      <label htmlFor="id_extrahospitalario" className="form-label fw-semibold">
                        <FaHospitalUser className="me-2 text-warning" />
                        Servicio Extrahospitalario
                      </label>
                      <select
                        className="form-select"
                        name="id_extrahospitalario"
                        value={form.id_extrahospitalario || ''}
                        onChange={this.handleChange}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      >
                        <option value="">Seleccione un servicio</option>
                        {serviciosex.map(servicioe => (
                          <option 
                            key={servicioe.id_extrahospitalario} 
                            value={servicioe.id_extrahospitalario.toString()}
                          >
                            {servicioe.servicio}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Checkboxes modernos */}
                    <div className="row mb-4">
                      <div className="col-6">
                        <div className="card border-0 p-3 text-center" 
                             style={{ 
                               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                               borderRadius: '15px'
                             }}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="constante"
                              id="constante"
                              checked={form.constante}
                              onChange={this.handleChange}
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
                      <div className="col-6">
                        <div className="card border-0 p-3 text-center" 
                             style={{ 
                               background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                               borderRadius: '15px'
                             }}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="nueva"
                              id="nueva"
                              checked={form.nueva}
                              onChange={this.handleChange}
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
                   
                    {/* Personal */}
                    <div className="form-group">
                      <label htmlFor="id_personal" className="form-label fw-semibold">
                        <FaAddressCard className="me-2 text-info" />
                        Personal Responsable
                      </label>
                      <select 
                        className="form-select"name="id_personal"
                        value={form.id_personal}
                        onChange={this.handleChange}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      >
                        <option value="">Seleccione personal</option>
                        {this.state.personal1.map((person) => (
                          <option key={person.id_personal} value={person.id_personal}>
                            {person.nombre} {person.apellido} 
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
        
        <ModalFooter className="border-0 pt-0">
          <div className="d-flex gap-3 w-100 justify-content-end">
            {this.state.tipoModal === 'insertar' ? 
              <button 
                className="btn btn-lg d-flex align-items-center"
                onClick={this.peticionPost}
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)'
                }}
              >
                <FaClipboardCheck className="me-2" size={18} />
                Insertar Estimulación
              </button> : 
              <button 
                className="btn btn-lg d-flex align-items-center"
                onClick={this.peticionPut}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                <FaClipboardCheck className="me-2" size={18} />
                Actualizar Estimulación
              </button>
            }
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={this.modalInsertar}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
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

      {/* Modal de Eliminar Mejorado */}
      <Modal isOpen={this.state.modalEliminar} className="modern-modal">
        <ModalHeader className="border-0 pb-0">
          <div className="d-flex align-items-center">
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <FaExclamationTriangle className="text-white" size={20} />
            </div>
            <div>
              <h4 className="mb-1 fw-bold text-danger">Confirmar Eliminación</h4>
              <p className="text-muted mb-0">Esta acción no se puede deshacer</p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-4">
          <div className="text-center">
            <div className="alert border-0 mb-3" 
                 style={{ 
                   background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                   borderRadius: '15px'
                 }}>
              <div className="d-flex align-items-center justify-content-center">
                <FaClinicMedical className="me-3 text-danger" size={24} />
                <div>
                  <strong className="text-danger">¿Está seguro que desea eliminar esta estimulación?</strong>
                  <div className="mt-2">
                    <span className="badge bg-danger px-3 py-2 rounded-pill">
                      ID: {form && form.id_estimulacion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="border-0 pt-0">
          <div className="d-flex gap-3 w-100 justify-content-center">
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={() => this.peticionDelete()}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%,rgb(241, 15, 45) 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
              }}
            >
              <FaTrash className="me-2" size={16} />
              Sí, Eliminar
            </button>
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={() => this.setState({ modalEliminar: false })}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}
            >
              Cancelar
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </div>

    {/* Estilos CSS adicionales */}
    <style jsx>{`
      .modern-table .hover-row:hover {
        background-color: rgba(102, 126, 234, 0.05);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .search-result-item:hover {
        background-color: rgba(102, 126, 234, 0.05);
        transform: translateX(5px);
      }

      .modern-modal .modal-content {
        border: none;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .custom-paginator .p-paginator {
        background: transparent;
        border: none;
      }

      .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin: 0 5px;
        border: none;
      }

      .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      @media (max-width: 768px) {
        .d-flex.flex-wrap.gap-3 {
          flex-direction: column;
        }
        
        .table-responsive {
          font-size: 14px;
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
function ShowStimulationWrapper() {
  const navigate = useNavigate();
  return <ShowStimulation navigate={navigate} />;
}

export default ShowStimulationWrapper;