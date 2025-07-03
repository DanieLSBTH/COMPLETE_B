import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import InsertarRegistroModal from './InsertarRegistroModal';

const urlSolicitudLeche = "http://localhost:8080/api/solicitud_de_leches/";
const urlControlLeche = "http://localhost:8080/api/control_de_leches/";
const urlControlLecheBusqueda = "http://localhost:8080/api/control_de_leches/search/frasco";
const urlRegistroMedico = "http://localhost:8080/api/registro_medico/";

class CreateSolicitudLeche extends Component {
  state = {
    controlLeches: [],
    registrosMedicos: [],
    searchTerm: '',
    isSearching: false,
    isSearchingControl: false, // NUEVO: Estado para búsqueda de control
    modalInsertar: false,
    modalInsertarRegistro: false,
    // Estructura del encabezado
    encabezado: {
      id_registro_medico: '',
      fecha_nacimiento: '',
      edad_de_ingreso: '',
      tipo_paciente: '',
      peso_al_nacer: '',
      peso_actual: '',
      kcal_o: '',
      volumen_toma_cc: '',
      numero_tomas: '',
      total_vol_solicitado: '',
      servicio: '',
      fecha_entrega: '',
      solicita: ''
    },
    // Array de detalles con búsqueda individual
    detalles: [{ 
      id_control_leche: '', 
      searchTerm: '', 
      options: [], 
      isLoading: false 
    }],
    errors: {}
  };

  componentDidMount() {
    this.fetchControlLeches();
    this.fetchRegistrosMedicos();
  }

  // Mantener la carga inicial básica para casos sin búsqueda específica
  fetchControlLeches = () => {
    axios.get(`${urlControlLeche}?pageSize=50`)
      .then(response => {
        const controles = Array.isArray(response.data) 
          ? response.data 
          : response.data.controles || response.data.controlDeLeches || response.data.data || [];
        
        this.setState({ controlLeches: controles });
      })
      .catch(error => {
        console.log('Error al obtener control de leches:', error.message);
        this.setState({ controlLeches: [] });
      });
  };

  // NUEVA: Búsqueda específica de control de leches por número de frasco
  searchControlLeches = async (searchTerm, detalleIndex = null) => {
    if (!searchTerm || searchTerm.length < 1) {
      // Si es para un detalle específico, limpiar sus opciones
      if (detalleIndex !== null) {
        this.updateDetalleField(detalleIndex, 'options', []);
        this.updateDetalleField(detalleIndex, 'isLoading', false);
      }
      return [];
    }

    try {
      // Actualizar estado de carga si es para un detalle específico
      if (detalleIndex !== null) {
        this.updateDetalleField(detalleIndex, 'isLoading', true);
      } else {
        this.setState({ isSearchingControl: true });
      }

      const response = await axios.get(urlControlLecheBusqueda, {
        params: {
          no_frascoregistro: searchTerm,
          estado: true,
          pageSize: 50
        }
      });

      const controles = response.data.controlDeLeches || [];

      // Actualizar opciones si es para un detalle específico
      if (detalleIndex !== null) {
        this.updateDetalleField(detalleIndex, 'options', controles);
        this.updateDetalleField(detalleIndex, 'isLoading', false);
      } else {
        this.setState({ 
          controlLeches: controles,
          isSearchingControl: false 
        });
      }

      return controles;

    } catch (error) {
      console.error('Error en búsqueda de control de leches:', error);
      
      if (detalleIndex !== null) {
        this.updateDetalleField(detalleIndex, 'options', []);
        this.updateDetalleField(detalleIndex, 'isLoading', false);
      } else {
        this.setState({ 
          controlLeches: [],
          isSearchingControl: false 
        });
      }
      
      return [];
    }
  };

  // NUEVA: Función auxiliar para actualizar campos de detalle
  updateDetalleField = (index, field, value) => {
    this.setState(prevState => ({
      detalles: prevState.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [field]: value } : detalle
      )
    }));
  };

  // NUEVA: Manejo de búsqueda con debounce para cada detalle
  handleControlSearch = (inputValue, detalleIndex) => {
    // Actualizar el término de búsqueda del detalle
    this.updateDetalleField(detalleIndex, 'searchTerm', inputValue);

    // Limpiar timeout previo si existe
    if (this.searchTimeouts) {
      if (this.searchTimeouts[detalleIndex]) {
        clearTimeout(this.searchTimeouts[detalleIndex]);
      }
    } else {
      this.searchTimeouts = {};
    }

    // Configurar nuevo timeout
    this.searchTimeouts[detalleIndex] = setTimeout(() => {
      this.searchControlLeches(inputValue, detalleIndex);
    }, 500);
  };

  fetchRegistrosMedicos = (searchTerm = '') => {
    this.setState({ isSearching: true });
    
    let url;
    if (searchTerm.trim()) {
      url = `${urlRegistroMedico}/search/${encodeURIComponent(searchTerm.trim())}?limit=50`;
    } else {
      url = `${urlRegistroMedico}?limit=50`;
    }

    axios.get(url)
      .then(response => {
        const registros = response.data.registros || [];
        this.setState({ 
          registrosMedicos: registros,
          isSearching: false 
        });
      })
      .catch(error => {
        console.log('Error al obtener registros médicos:', error.message);
        this.setState({ 
          registrosMedicos: [],
          isSearching: false 
        });
      });
  };

  handleSearchChange = (inputValue) => {
    this.setState({ searchTerm: inputValue });
    
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.fetchRegistrosMedicos(inputValue);
    }, 500);
  };

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    // Limpiar todos los timeouts de búsqueda de control
    if (this.searchTimeouts) {
      Object.values(this.searchTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    }
  }

  toggleModalInsertarRegistro = () => {
    this.setState(prevState => ({
      modalInsertarRegistro: !prevState.modalInsertarRegistro
    }));
  };

  onRegistroInsertado = (nuevoRegistro) => {
    this.setState(prevState => ({
      registrosMedicos: [nuevoRegistro, ...prevState.registrosMedicos],
      encabezado: {
        ...prevState.encabezado,
        id_registro_medico: nuevoRegistro.id_registro_medico
      },
      errors: {
        ...prevState.errors,
        id_registro_medico: undefined
      }
    }));
  };

  validateEncabezado = () => {
    const { encabezado } = this.state;
    let errors = {};
    let formIsValid = true;

    const requiredFields = [
      { key: 'id_registro_medico', message: 'Debe seleccionar un registro médico.' },
      { key: 'fecha_nacimiento', message: 'La fecha de nacimiento es requerida.' },
      { key: 'tipo_paciente', message: 'El tipo de paciente es requerido.' },
      { key: 'peso_al_nacer', message: 'El peso al nacer es requerido.', condition: (value) => value <= 0 },
      { key: 'peso_actual', message: 'El peso actual es requerido.', condition: (value) => value <= 0 },
      { key: 'kcal_o', message: 'El valor kcal_o es requerido.' },
      { key: 'volumen_toma_cc', message: 'El volumen de toma es requerido.' },
      { key: 'numero_tomas', message: 'El número de tomas es requerido.' },
      { key: 'servicio', message: 'El servicio es requerido.' },
      { key: 'fecha_entrega', message: 'La fecha de entrega es requerida.' },
      { key: 'solicita', message: 'El campo solicita es requerido.' }
    ];

    requiredFields.forEach(({ key, message, condition }) => {
      if (!encabezado[key] || (condition && condition(encabezado[key]))) {
        errors[key] = message;
        formIsValid = false;
      }
    });

    return { isValid: formIsValid, errors };
  };

  validateDetalles = () => {
    const { detalles } = this.state;
    let errors = {};
    let formIsValid = true;

    if (detalles.length === 0) {
      errors.detalles = 'Debe agregar al menos un control de leche.';
      formIsValid = false;
    }

    detalles.forEach((detalle, index) => {
      if (!detalle.id_control_leche) {
        errors[`detalle_${index}`] = 'Debe seleccionar un control de leche.';
        formIsValid = false;
      }
    });

    return { isValid: formIsValid, errors };
  };

  validateForm = () => {
    const encabezadoValidation = this.validateEncabezado();
    const detallesValidation = this.validateDetalles();

    const allErrors = { ...encabezadoValidation.errors, ...detallesValidation.errors };
    const isValid = encabezadoValidation.isValid && detallesValidation.isValid;

    this.setState({ errors: allErrors });
    return isValid;
  };

  // MEJORADO: Agregar nuevo detalle con estructura completa
  agregarDetalle = () => {
    this.setState(prevState => ({
      detalles: [...prevState.detalles, { 
        id_control_leche: '', 
        searchTerm: '', 
        options: [], 
        isLoading: false 
      }]
    }));
  };

  eliminarDetalle = (index) => {
    if (this.state.detalles.length > 1) {
      // Limpiar timeout si existe
      if (this.searchTimeouts && this.searchTimeouts[index]) {
        clearTimeout(this.searchTimeouts[index]);
        delete this.searchTimeouts[index];
      }

      this.setState(prevState => ({
        detalles: prevState.detalles.filter((_, i) => i !== index)
      }));
    }
  };

  handleEncabezadoChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      encabezado: { ...prevState.encabezado, [name]: value },
      errors: { ...prevState.errors, [name]: undefined }
    }));
  };

  // MEJORADO: Manejar cambios en los detalles
  handleDetalleChange = (index, selectedOption) => {
    const newDetalles = [...this.state.detalles];
    newDetalles[index].id_control_leche = selectedOption ? selectedOption.value : '';
    
    this.setState(prevState => ({
      detalles: newDetalles,
      errors: { ...prevState.errors, [`detalle_${index}`]: undefined }
    }));
  };

  handleRegistroMedicoChange = (selectedOption) => {
    if (selectedOption) {
      this.setState(prevState => ({
        encabezado: {
          ...prevState.encabezado,
          id_registro_medico: selectedOption.value
        },
        errors: { ...prevState.errors, id_registro_medico: undefined }
      }));
    }
  };

 // En CreateSolicitudLeche.js - Modifica solo la función peticionPost

peticionPost = async () => {
  if (this.validateForm()) {
    try {
      const solicitudes = this.state.detalles.map(detalle => ({
        ...this.state.encabezado,
        id_control_leche: detalle.id_control_leche
      }));

      const promises = solicitudes.map(solicitud => 
        axios.post(urlSolicitudLeche, solicitud)
      );

      await Promise.all(promises);
      
      // Cerrar modal y limpiar formulario
      this.modalInsertar();
      this.limpiarFormulario();
      
      // AGREGAR: Notificar al componente padre que se creó una solicitud
      if (this.props.onSolicitudCreated) {
        this.props.onSolicitudCreated();
      }
      
      // También llamar al callback existente si existe
      if (this.props.onAddSuccess) {
        this.props.onAddSuccess();
      }
      
      Swal.fire('Éxito', 'Solicitudes creadas exitosamente', 'success');
      
    } catch (error) {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear las solicitudes', 'error');
    }
  } else {
    Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
  }
};

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
    if (!this.state.modalInsertar) {
      this.limpiarFormulario();
    }
  };

  // MEJORADO: Limpiar formulario con estructura completa
  limpiarFormulario = () => {
    // Limpiar todos los timeouts
    if (this.searchTimeouts) {
      Object.values(this.searchTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
      this.searchTimeouts = {};
    }

    this.setState({
      encabezado: {
        id_registro_medico: '',
        fecha_nacimiento: '',
        edad_de_ingreso: '',
        tipo_paciente: '',
        peso_al_nacer: '',
        peso_actual: '',
        kcal_o: '',
        volumen_toma_cc: '',
        numero_tomas: '',
        total_vol_solicitado: '',
        servicio: '',
        fecha_entrega: '',
        solicita: ''
      },
      detalles: [{ 
        id_control_leche: '', 
        searchTerm: '', 
        options: [], 
        isLoading: false 
      }],
      errors: {}
    });
  };

  formatRegistroMedicoOptions = () => {
    if (!Array.isArray(this.state.registrosMedicos)) {
      return [];
    }
    
    return this.state.registrosMedicos.map(registro => ({
      value: registro.id_registro_medico,
      label: `${registro.registro_medico} - ${registro.recien_nacido}`
    }));
  };

  // MEJORADO: Formatear opciones de control con información adicional
  formatControlLechesOptions = (controles = null) => {
    const controlesToFormat = controles || this.state.controlLeches;
    
    if (!Array.isArray(controlesToFormat)) {
      return [];
    }
    
    return controlesToFormat.map(control => ({
      value: control.id_control_leche,
      label: `${control.no_frascoregistro} - ${control.tipo_de_leche || 'N/A'} - ${control.volumen_ml_onza || 0}ml`,
      control: control // Incluir el objeto completo para información adicional
    }));
  };

  render() {
  const { 
    encabezado, 
    detalles, 
    modalInsertar, 
    modalInsertarRegistro,
    errors
  } = this.state;

  return (
    <div className="container-fluid py-4">
      {/* Header con botón mejorado */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        
        <button 
         
          onClick={this.modalInsertar}
          style={{
            background: 'linear-gradient(135deg,rgb(102, 234, 170) 0%,rgba(23, 16, 207, 0.76) 100%)',
            border: 'none',
            borderRadius: '12px',
          padding: '12px 24px',
          fontWeight: '600',
            color: 'white',
            
            transition: 'all 0.3s ease'
          }}
        >
          <FaPlus className="fs-5" />
          Nueva Solicitud
        </button>
      </div>

      {/* Modal para crear solicitud */}
      <Modal 
        size="xl" 
        isOpen={modalInsertar} 
        toggle={this.modalInsertar}
        className="modern-modal"
      >
        <ModalHeader 
          toggle={this.modalInsertar}
          className="border-0 pb-0"
        >
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
              <i className="fas fa-baby text-white" style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <h4 className="mb-1 fw-bold text-primary">Nueva Solicitud de Leche</h4>
              <p className="text-muted mb-0">Complete la información requerida</p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="p-4">
          <div className="container-fluid">
            {errors.general && (
              <div className="alert border-0 mb-4" 
                   style={{ 
                     background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                     borderRadius: '15px',
                     color: '#c53030'
                   }}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {errors.general}
              </div>
            )}

            {/* ENCABEZADO MEJORADO */}
            <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="card-header border-0" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px 20px 0 0'
              }}>
                <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                  <i className="fas fa-user-md me-3"></i>
                  Información del Encabezado
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  {/* Registro Médico con botón de agregar mejorado */}
                  <div className="form-group col-md-6 mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <label className="form-label fw-semibold text-primary">
                        <i className="fas fa-clipboard-list me-2"></i>
                        Registro Médico
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm d-flex align-items-center"
                        onClick={this.toggleModalInsertarRegistro}
                        style={{
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        <FaPlus className="me-1" size={12} />
                        Nuevo Registro
                      </button>
                    </div>
                    <Select
                      className={`react-select ${errors.id_registro_medico ? 'is-invalid' : ''}`}
                      options={this.formatRegistroMedicoOptions()}
                      onChange={this.handleRegistroMedicoChange}
                      onInputChange={this.handleSearchChange}
                      value={this.formatRegistroMedicoOptions().find(option => 
                        option.value === encabezado.id_registro_medico
                      )}
                      isClearable
                      isSearchable
                      isLoading={this.state.isSearching}
                      placeholder="🔍 Buscar registro médico..."
                      noOptionsMessage={(obj) => {
                        if (obj.inputValue && obj.inputValue.length > 0) {
                          return `No se encontraron registros para "${obj.inputValue}"`;
                        }
                        return "Escriba para buscar registros...";
                      }}
                      loadingMessage={() => "🔄 Buscando registros..."}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '8px',
                          fontSize: '14px',
                          boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(102, 126, 234, 0.25)' : 'none',
                          '&:hover': {
                            borderColor: '#667eea'
                          }
                        })
                      }}
                    />
                    {errors.id_registro_medico && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.id_registro_medico}
                      </div>
                    )}
                  </div>

                  {/* Campos del formulario con iconos y estilos mejorados */}
                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                      name="fecha_nacimiento"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.fecha_nacimiento}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.fecha_nacimiento && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.fecha_nacimiento}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-hourglass-half me-2"></i>
                      Edad de Ingreso
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="edad_de_ingreso"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.edad_de_ingreso}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-user-tag me-2"></i>
                      Tipo de Paciente
                    </label>
                    <select 
                      className={`form-select ${errors.tipo_paciente ? 'is-invalid' : ''}`}
                      name="tipo_paciente" 
                      onChange={this.handleEncabezadoChange} 
                      value={encabezado.tipo_paciente}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    >
                      <option value="">Selecciona el tipo de paciente</option>
                      <option value="Prematuro">👶 Prematuro</option>
                      <option value="Termino">🍼 Término</option>
                      <option value="Pre-termino">⚠️ Pre-Término</option>
                    </select>
                    {errors.tipo_paciente && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.tipo_paciente}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-weight me-2"></i>
                      Peso al Nacer (gr)
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.peso_al_nacer ? 'is-invalid' : ''}`}
                      name="peso_al_nacer"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.peso_al_nacer}
                      placeholder="Ingrese peso en gramos"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.peso_al_nacer && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.peso_al_nacer}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-balance-scale me-2"></i>
                      Peso Actual (gr)
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.peso_actual ? 'is-invalid' : ''}`}
                      name="peso_actual"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.peso_actual}
                      placeholder="Ingrese peso actual en gramos"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.peso_actual && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.peso_actual}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-fire me-2"></i>
                      Kcal (O)
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.kcal_o ? 'is-invalid' : ''}`}
                      name="kcal_o"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.kcal_o}
                      placeholder="Ingrese valor Kcal"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.kcal_o && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.kcal_o}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-tint me-2"></i>
                      Volumen Toma (cc)
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.volumen_toma_cc ? 'is-invalid' : ''}`}
                      name="volumen_toma_cc"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.volumen_toma_cc}
                      placeholder="Ingrese volumen en cc"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.volumen_toma_cc && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.volumen_toma_cc}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-list-ol me-2"></i>
                      Número de Tomas
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.numero_tomas ? 'is-invalid' : ''}`}
                      name="numero_tomas"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.numero_tomas}
                      placeholder="Ingrese número de tomas"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.numero_tomas && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.numero_tomas}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-calculator me-2"></i>
                      Total Volumen Solicitado (cc)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="total_vol_solicitado"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.total_vol_solicitado}
                      placeholder="Volumen total solicitado"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-hospital me-2"></i>
                      Servicio
                    </label>
                    <select 
                      className={`form-select ${errors.servicio ? 'is-invalid' : ''}`}
                      name="servicio" 
                      onChange={this.handleEncabezadoChange} 
                      value={encabezado.servicio}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    >
                      <option value="">Selecciona el servicio</option>
                      <option value="Alto riesgo">🔴 Alto riesgo</option>
                      <option value="Mediano riesgo">🟡 Mediano riesgo</option>
                      <option value="Recuperación materno neonatal">🟢 Recuperación materno neonatal</option>
                    </select>
                    {errors.servicio && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.servicio}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-truck me-2"></i>
                      Fecha de Entrega
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.fecha_entrega ? 'is-invalid' : ''}`}
                      name="fecha_entrega"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.fecha_entrega}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.fecha_entrega && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.fecha_entrega}
                      </div>
                    )}
                  </div>

                  <div className="form-group col-md-6 mb-4">
                    <label className="form-label fw-semibold text-primary">
                      <i className="fas fa-user-nurse me-2"></i>
                      Solicita
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.solicita ? 'is-invalid' : ''}`}
                      name="solicita"
                      onChange={this.handleEncabezadoChange}
                      value={encabezado.solicita}
                      placeholder="Nombre de quien solicita"
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px'
                      }}
                    />
                    {errors.solicita && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.solicita}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DETALLES MEJORADOS */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <div className="card-header border-0 d-flex justify-content-between align-items-center" style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '20px 20px 0 0'
              }}>
                <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                  <FaSearch className="me-3" />
                  Controles de Leche (Búsqueda Avanzada)
                </h5>
                <button 
                  type="button" 
                  className="btn btn-sm d-flex align-items-center"
                  onClick={this.agregarDetalle}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <FaPlus className="me-1" size={12} />
                  Agregar Control
                </button>
              </div>
              <div className="card-body p-4">
                {errors.detalles && (
                  <div className="alert border-0 mb-4" 
                       style={{ 
                         background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                         borderRadius: '15px',
                         color: '#c53030'
                       }}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.detalles}
                  </div>
                )}
                
                {detalles.map((detalle, index) => (
                  <div key={index} className="card mb-3 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <div className="card-body p-4">
                      <div className="row align-items-end">
                        <div className="col-md-10">
                          <div className="d-flex align-items-center mb-3">
                            <div style={{
                              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '12px'
                            }}>
                              <span className="text-white fw-bold">{index + 1}</span>
                            </div>
                            <div>
                              <label className="fw-bold text-primary mb-0">
                                <FaSearch className="me-2" />
                                Control de Leche {index + 1}
                              </label>
                              <small className="d-block text-muted">
                                📝 Escriba el número de frasco para buscar (ej: 123, 123a, 124b)
                              </small>
                            </div>
                          </div>
                          
                          <Select
                            className={`react-select ${errors[`detalle_${index}`] ? 'is-invalid' : ''}`}
                            options={this.formatControlLechesOptions(detalle.options)}
                            onChange={(selectedOption) => this.handleDetalleChange(index, selectedOption)}
                            onInputChange={(inputValue) => this.handleControlSearch(inputValue, index)}
                            value={this.formatControlLechesOptions(detalle.options).find(option => 
                              option.value === detalle.id_control_leche
                            )}
                            isClearable
                            isSearchable
                            isLoading={detalle.isLoading}
                            placeholder="🔍 Escriba el número de frasco para buscar..."
                            noOptionsMessage={(obj) => {
                              if (obj.inputValue && obj.inputValue.length >= 1) {
                                return `❌ No se encontraron frascos con "${obj.inputValue}"`;
                              } else if (obj.inputValue && obj.inputValue.length < 1) {
                                return "⌨️ Escriba al menos 1 caracter para buscar";
                              }
                              return "📝 Escriba el número de frasco...";
                            }}
                            loadingMessage={() => "🔄 Buscando frascos..."}
                            formatOptionLabel={(option) => (
                              <div className="p-2">
                                <div className="fw-bold text-primary d-flex align-items-center">
                                  <i className="fas fa-vial me-2"></i>
                                  {option.label.split(' - ')[0]}
                                </div>
                                <small className="text-muted">
                                  {option.control && (
                                    <div className="d-flex flex-wrap gap-3 mt-1">
                                      <span>🥛 Tipo: {option.control.tipo_de_leche || 'N/A'}</span>
                                      <span>📊 Volumen: {option.control.volumen_ml_onza || 0}ml</span>
                                      <span>✅ Estado: {option.control.estado_texto || 'N/A'}</span>
                                    </div>
                                  )}
                                </small>
                              </div>
                            )}
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                borderRadius: '10px',
                                border: '2px solid #e9ecef',
                                padding: '8px',
                                fontSize: '14px',
                                boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(240, 147, 251, 0.25)' : 'none',
                                '&:hover': {
                                  borderColor: '#f093fb'
                                }
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                borderRadius: '8px',
                                margin: '4px',
                                backgroundColor: state.isSelected 
                                  ? '#f093fb' 
                                  : state.isFocused 
                                    ? 'rgba(240, 147, 251, 0.1)' 
                                    : 'white'
                              })
                            }}
                          />
                          {errors[`detalle_${index}`] && (
                            <div className="invalid-feedback d-block mt-2">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              {errors[`detalle_${index}`]}
                            </div>
                          )}
                        </div>
                        <div className="col-md-2">
                          {detalles.length > 1 && (
                            <button 
                              type="button" 
                              className="btn btn-sm w-100 d-flex align-items-center justify-content-center"
                              onClick={() => this.eliminarDetalle(index)}
                              style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="border-0 pt-0">
          <div className="d-flex gap-3 w-100 justify-content-end">
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
              <i className="fas fa-paper-plane me-2"></i>
              Crear Solicitud
            </button>
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={this.modalInsertar}
              style={{
                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(108, 117, 125, 0.3)'
              }}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal para insertar nuevo registro médico */}
      <InsertarRegistroModal
        isOpen={modalInsertarRegistro}
        toggle={this.toggleModalInsertarRegistro}
        onPersonaInsertada={this.onRegistroInsertado}
      />

      {/* Estilos CSS adicionales */}
      <style jsx>{`
      
       .modern-modal .modal-content {
          border: none;
          border-radius: 25px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .react-select .react-select__control:hover {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .react-select .react-select__control--is-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .react-select .react-select__option--is-selected {
          background-color: #667eea;
        }

        .react-select .react-select__option--is-focused {
          background-color: rgba(102, 126, 234, 0.1);
        }

        .form-control:focus, .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
        }

        .card:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }

        .invalid-feedback {
          display: block;
          color: #dc3545;
          font-weight: 500;
        }

        .is-invalid {
          border-color: #dc3545 !important;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }

        /* Animaciones suaves */
        .card, .btn, .form-control, .form-select {
          transition: all 0.3s ease;
        }

        /* Efectos de glassmorphism */
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        /* Scrollbar personalizado */
        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        /* Efectos de hover para inputs */
        .form-control:hover, .form-select:hover {
          border-color: #667eea;
          transform: translateY(-1px);
        }

        /* Estilo para los placeholders */
        .form-control::placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        /* Mejoras para dispositivos móviles */
        @media (max-width: 768px) {
          .modal-dialog {
            margin: 10px;
          }
          
          .btn-lg {
            padding: 10px 20px;
            font-size: 14px;
          }
          
          .card-body {
            padding: 20px !important;
          }
        }
      `}</style>
      </div>
  );
  }
}

export default CreateSolicitudLeche;