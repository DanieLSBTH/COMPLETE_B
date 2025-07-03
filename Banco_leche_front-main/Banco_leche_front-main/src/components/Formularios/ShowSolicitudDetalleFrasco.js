import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaPlus, FaTrash, FaSearch, FaFileMedical,FaTint,FaClipboardList } from 'react-icons/fa';
import InsertarRegistroModal from './InsertarRegistroModal';

const urlSolicitudLeche = "http://localhost:8080/api/solicitud_de_leches/";
const urlControlLeche = "http://localhost:8080/api/control_de_leches/";
const urlControlLecheBusqueda = "http://localhost:8080/api/control_de_leches/search/frasco";
const urlRegistroMedico = "http://localhost:8080/api/registro_medico/";


class ShowSolicitudDetalleFrasco extends Component {
  state = {
    controlLeches: [],
    registrosMedicos: [],
    searchTerm: '',
    isSearching: false,
    isSearchingControl: false,
    modalInsertar: false,
    modalInsertarRegistro: false,
    // Estructura del encabezado (ahora es Control de Leche)
    optionsCache: [], // Cache estable de opciones
    isUpdatingOptions: false, // Flag para controlar actualizaciones
  
    encabezado: {
      id_control_leche: '',
      searchTerm: '',
      options: [],
      isLoading: false
    },
    // Array de detalles (ahora son Registros Médicos)
    detalles: [{ 
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
    }],
    errors: {}
  };

  componentDidMount() {
    this.fetchControlLeches();
    this.fetchRegistrosMedicos();
    // *** AGREGAR PARA DEBUG ***
  console.log('ShowSolicitudDetalleFrasco montado, props:', this.props);
  if (!this.props.onSolicitudesCreadas) {
    console.warn('Prop onSolicitudesCreadas no recibida');
  }
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

  // Búsqueda específica de control de leches por número de frasco (para encabezado)
 // Búsqueda específica de control de leches por número de frasco (para encabezado)
searchControlLeches = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 1) { // Cambiado de < 2 a < 1
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        options: [],
        isLoading: false
      }
    }));
    return [];
  }

  try {
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        isLoading: true
      }
    }));

    const response = await axios.get(urlControlLecheBusqueda, {
      params: {
        no_frascoregistro: searchTerm,
        estado: true,
        pageSize: 50
      }
    });

    const controles = response.data.controlDeLeches || [];

    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        options: controles,
        isLoading: false
      }
    }));

    return controles;

  } catch (error) {
    console.error('Error en búsqueda de control de leches:', error);
    
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        options: [],
        isLoading: false
      }
    }));
    
    return [];
  }
};

  // Manejo de búsqueda con debounce para encabezado
  handleControlSearch = (inputValue) => {
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        searchTerm: inputValue
      }
    }));

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchControlLeches(inputValue);
    }, 500);
  };

  // 6. MÉTODO para inicializar cache al cargar registros
fetchRegistrosMedicos = (searchTerm = '') => {
  this.setState({ isSearching: true, isUpdatingOptions: true });
  
  let url;
  if (searchTerm.trim()) {
    url = `${urlRegistroMedico}/search/${encodeURIComponent(searchTerm.trim())}?limit=50`;
  } else {
    url = `${urlRegistroMedico}?limit=50`;
  }

  axios.get(url)
    .then(response => {
      const nuevosRegistros = response.data.registros || [];

const registrosExistentes = this.state.registrosMedicos || [];

// Fusionar registros sin duplicar por ID
const registrosMap = new Map();
[...nuevosRegistros, ...registrosExistentes].forEach(registro => {
  if (registro && registro.id_registro_medico) {
    registrosMap.set(String(registro.id_registro_medico), registro);
  }
});
const registrosFinales = Array.from(registrosMap.values());

// Crear opciones a partir de registrosFinales
const opcionesFinales = registrosFinales.map(registro => ({
  value: registro.id_registro_medico,
  label: `${registro.registro_medico || 'Sin código'} - ${registro.recien_nacido || 'Sin nombre'}`,
  registro: registro
}));

this.setState({ 
  registrosMedicos: registrosFinales,
  optionsCache: opcionesFinales,
  isSearching: false,
  isUpdatingOptions: false
});

    });
};
getSelectedRegistroOption = (detalleIndex) => {
  const detalle = this.state.detalles[detalleIndex];
  if (!detalle || !detalle.id_registro_medico) {
    return null;
  }

  const id = String(detalle.id_registro_medico);

  // Buscar en optionsCache
  let selectedOption = this.state.optionsCache.find(option => 
    String(option.value) === id
  );

  // Si no está en cache, intenta generarlo manualmente a partir del array original
  if (!selectedOption) {
    const registro = this.state.registrosMedicos.find(r => 
      String(r.id_registro_medico) === id
    );
    if (registro) {
      selectedOption = {
        value: registro.id_registro_medico,
        label: `${registro.registro_medico || 'Sin código'} - ${registro.recien_nacido || 'Sin nombre'}`,
        registro
      };
    }
  }

if (!selectedOption) {
  // Buscar en optionsCache completo (por si el label no estaba generado aún)
  const posible = this.state.optionsCache.find(o => String(o.value) === id);
  if (posible) {
    selectedOption = posible;
  } else {
    // Como última opción, mostrar genérico pero indicando que no se ha encontrado aún
    selectedOption = {
      value: id,
      label: `ID: ${id} (registro no encontrado)`
    };
  }
}


  return selectedOption;
};



  handleSearchChange = (inputValue) => {
    this.setState({ searchTerm: inputValue });
    
    clearTimeout(this.registroSearchTimeout);
    this.registroSearchTimeout = setTimeout(() => {
      this.fetchRegistrosMedicos(inputValue);
    }, 500);
  };

  componentWillUnmount() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.registroSearchTimeout) {
      clearTimeout(this.registroSearchTimeout);
    }
  }

  toggleModalInsertarRegistro = () => {
  this.setState(prevState => ({
    modalInsertarRegistro: !prevState.modalInsertarRegistro
  }));
  
  // Si se está cerrando el modal, refrescar la lista de registros
  if (this.state.modalInsertarRegistro) {
    this.fetchRegistrosMedicos();
  }
};

 onRegistroInsertado = (nuevoRegistro) => {
  if (!nuevoRegistro || !nuevoRegistro.id_registro_medico) {
    console.error('El nuevo registro no tiene ID válido');
    return;
  }
  
  console.log('Insertando nuevo registro:', nuevoRegistro);
  
  this.setState(prevState => {
    // Marcar que estamos actualizando opciones
    const isUpdatingOptions = true;
    
    // Actualizar la lista de registros médicos
    const nuevosRegistrosMedicos = [nuevoRegistro, ...prevState.registrosMedicos];
    
    // Crear nuevas opciones inmediatamente incluyendo el nuevo registro
    const nuevasOpciones = [...prevState.optionsCache];
    const nuevaOpcion = {
  value: nuevoRegistro.id_registro_medico,
  label: `${nuevoRegistro.registro_medico || 'Sin código'} - ${nuevoRegistro.recien_nacido || 'Sin nombre'}`,
  registro: nuevoRegistro
};

    
    // Verificar si ya existe en el cache
    if (!nuevasOpciones.find(opt => opt.value === nuevoRegistro.id_registro_medico)) {
      nuevasOpciones.unshift(nuevaOpcion);
    }
    
    // Preservar los detalles existentes exactamente como están
    const nuevosDetalles = [...prevState.detalles];
    
    // Solo buscar entre detalles que NO tienen registro seleccionado
    const indiceVacio = nuevosDetalles.findIndex(detalle => 
      !detalle.id_registro_medico || detalle.id_registro_medico === ''
    );
    
    if (indiceVacio !== -1) {
      // Solo modificar el detalle vacío, mantener los demás intactos
      nuevosDetalles[indiceVacio] = {
        ...nuevosDetalles[indiceVacio],
        id_registro_medico: nuevoRegistro.id_registro_medico
      };
      
      // Limpiar solo el error específico
      const nuevosErrores = { ...prevState.errors };
      delete nuevosErrores[`detalle_${indiceVacio}_id_registro_medico`];
      
      console.log(`Asignando registro ${nuevoRegistro.id_registro_medico} al detalle ${indiceVacio}`);
      
      return {
        registrosMedicos: nuevosRegistrosMedicos,
        optionsCache: nuevasOpciones, // Actualizar cache inmediatamente
        detalles: nuevosDetalles,
        errors: nuevosErrores,
        isUpdatingOptions: false // Resetear flag
      };
    }
    
    // Si no hay detalles vacíos, solo actualizar la lista y cache
    return {
      registrosMedicos: nuevosRegistrosMedicos,
      optionsCache: nuevasOpciones,
      isUpdatingOptions: false
    };
  }, () => {
    // Callback después del setState - forzar re-renderizado de los Select
    console.log('Estado actualizado, opciones cache:', this.state.optionsCache.length);
  });
  
};

  validateEncabezado = () => {
    const { encabezado } = this.state;
    let errors = {};
    let formIsValid = true;

    if (!encabezado.id_control_leche) {
      errors.id_control_leche = 'Debe seleccionar un control de leche.';
      formIsValid = false;
    }

    return { isValid: formIsValid, errors };
  };

  validateDetalles = () => {
    const { detalles } = this.state;
    let errors = {};
    let formIsValid = true;

    if (detalles.length === 0) {
      errors.detalles = 'Debe agregar al menos un registro médico.';
      formIsValid = false;
    }

    detalles.forEach((detalle, index) => {
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
        if (!detalle[key] || (condition && condition(detalle[key]))) {
          errors[`detalle_${index}_${key}`] = message;
          formIsValid = false;
        }
      });
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

  // Agregar nuevo detalle (registro médico)
 agregarDetalle = () => {
  this.setState(prevState => ({
    detalles: [...prevState.detalles, { 
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
    }]
    // NO tocar registrosMedicos ni otros campos del estado
  }));
};

  eliminarDetalle = (index) => {
    if (this.state.detalles.length > 1) {
      this.setState(prevState => ({
        detalles: prevState.detalles.filter((_, i) => i !== index)
      }));
    }
  };

  handleEncabezadoChange = (selectedOption) => {
    this.setState(prevState => ({
      encabezado: {
        ...prevState.encabezado,
        id_control_leche: selectedOption ? selectedOption.value : ''
      },
      errors: { ...prevState.errors, id_control_leche: undefined }
    }));
  };

  // Manejar cambios en los detalles (registros médicos)
  handleDetalleChange = (index, field, value) => {
  this.setState(prevState => {
    const newDetalles = [...prevState.detalles];
    
    // Solo modificar el campo específico del detalle específico
    newDetalles[index] = {
      ...newDetalles[index],
      [field]: value
    };
    
    // Limpiar solo el error específico
    const newErrors = { ...prevState.errors };
    delete newErrors[`detalle_${index}_${field}`];
    
    return {
      detalles: newDetalles,
      errors: newErrors
    };
  });
};

  handleRegistroMedicoChange = (index, selectedOption) => {
    this.handleDetalleChange(index, 'id_registro_medico', selectedOption ? selectedOption.value : '');
  };

  peticionPost = async () => {
  if (this.validateForm()) {
    try {
      const solicitudes = this.state.detalles.map(detalle => ({
        ...detalle,
        id_control_leche: this.state.encabezado.id_control_leche
      }));

      const promises = solicitudes.map(solicitud => 
        axios.post(urlSolicitudLeche, solicitud)
      );

      await Promise.all(promises);
      
      this.modalInsertar();
      this.limpiarFormulario();
      Swal.fire('Éxito', 'Solicitudes creadas exitosamente', 'success');
      
      // *** AGREGAR ESTA LÍNEA PARA NOTIFICAR AL PADRE ***
      if (this.props.onSolicitudesCreadas) {
        this.props.onSolicitudesCreadas();
      }
      
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

  // Limpiar formulario
  limpiarFormulario = () => {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    if (this.registroSearchTimeout) {
      clearTimeout(this.registroSearchTimeout);
    }

    this.setState({
      encabezado: {
        id_control_leche: '',
        searchTerm: '',
        options: [],
        isLoading: false
      },
      detalles: [{ 
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
      }],
      errors: {}
    });
  };

 formatRegistroMedicoOptions = () => {
  if (!Array.isArray(this.state.registrosMedicos)) {
    return this.state.optionsCache || [];
  }
  
  // Si no estamos actualizando, usar el cache
  if (!this.state.isUpdatingOptions && this.state.optionsCache.length > 0) {
    // Verificar si necesitamos actualizar el cache
    const registrosIds = this.state.registrosMedicos.map(r => r.id_registro_medico).sort();
    const cacheIds = this.state.optionsCache.map(o => o.value).sort();
    
    if (JSON.stringify(registrosIds) === JSON.stringify(cacheIds)) {
      return this.state.optionsCache;
    }
  }
  
  // Crear nuevas opciones
  const registrosUnicos = new Map();
  
  this.state.registrosMedicos.forEach(registro => {
    if (registro && registro.id_registro_medico) {
      registrosUnicos.set(registro.id_registro_medico, {
        value: registro.id_registro_medico,
        label: `${registro.registro_medico || 'Sin código'} - ${registro.recien_nacido || 'Sin nombre'}`,
        registro: registro
      });
    }
  });
  
  const newOptions = Array.from(registrosUnicos.values());
  
  // Actualizar cache de forma asíncrona para no afectar el render actual
  setTimeout(() => {
    this.setState({ 
      optionsCache: newOptions,
      isUpdatingOptions: false
    });
  }, 0);
  
  return newOptions;
};

  // Formatear opciones de control de leche
  formatControlLechesOptions = (controles = null) => {
    const controlesToFormat = controles || this.state.controlLeches;
    
    if (!Array.isArray(controlesToFormat)) {
      return [];
    }
    
    return controlesToFormat.map(control => ({
      value: control.id_control_leche,
      label: `${control.no_frascoregistro} - ${control.tipo_de_leche || 'N/A'} - ${control.volumen_ml_onza || 0}ml`,
      control: control
    }));
  };
toggleModalInsertarRegistro = () => {
  this.setState(prevState => ({
    modalInsertarRegistro: !prevState.modalInsertarRegistro
  }), () => {
    // Si se está abriendo el modal, refrescar la lista
    if (this.state.modalInsertarRegistro) {
      this.fetchRegistrosMedicos();
    }
  });
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
  <div className="container-fluid">
    <div className="d-flex justify-content-center align-items-center mb-4">

      <button 
      
        onClick={this.modalInsertar}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%,rgb(105, 222, 82) 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontWeight: '600',
          color: 'white',
          transition: 'all 0.3s ease'
        }}
      >
        <FaPlus className="fs-5" />
        Nueva Solicitud por Frasco
      </button>
    </div>

    {/* Modal para crear solicitud */}
    <Modal 
      size="xl" 
      isOpen={modalInsertar} 
      toggle={this.modalInsertar}
      backdrop="static"
      keyboard={false}
      style={{ maxWidth: '95%' }}
    >
      <ModalHeader 
        toggle={this.modalInsertar}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem 0.5rem 0 0'
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div 
            className="p-2 bg-white bg-opacity-20 rounded-circle"
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <FaClipboardList className="text-black" />
          </div>
          <div>
            <h4 className="mb-0 fw-bold">Nueva Solicitud de Leche por Frasco</h4>
            <small className="text-white-50">Complete la información requerida</small>
          </div>
        </div>
      </ModalHeader>
      
      <ModalBody style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
        <div className="container-fluid">
          {errors.general && (
            <div 
              className="alert alert-danger border-0 shadow-sm mb-4"
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: 'white'
              }}
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              {errors.general}
            </div>
          )}

          {/* ENCABEZADO - Control de Leche */}
          <div 
            className="card mb-4 border-0 shadow-sm"
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
              overflow: 'hidden'
            }}
          >
            <div className="card-header border-0" style={{ backgroundColor: 'transparent' }}>
              <div className="d-flex align-items-center text-white">
                <div 
                  className="p-3 me-3 bg-white bg-opacity-20 rounded-circle"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <FaTint className="text-black" />
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Control de Leche</h5>
                  <small className="text-white-75">Búsqueda avanzada por número de frasco</small>
                </div>
              </div>
            </div>
            <div className="card-body bg-white">
              <div className="row">
                <div className="col-12">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <FaSearch className="me-2 text-primary" />
                    Seleccionar Control de Leche
                  </label>
                  <div 
                    className="p-3 mb-3 border-0 rounded-3"
                    style={{ backgroundColor: '#e3f2fd' }}
                  >
                    <small className="text-muted d-flex align-items-center">
                      <i className="fas fa-info-circle me-2 text-info"></i>
                      Escriba el número de frasco para buscar (ej: 123, 123a, 124b)
                    </small>
                  </div>
                  <div className="position-relative">
                   <Select
  className={`react-select ${errors.id_control_leche ? 'is-invalid' : ''}`}
  classNamePrefix="react-select"
  options={this.formatControlLechesOptions(encabezado.options)}
  onChange={this.handleEncabezadoChange}
  onInputChange={this.handleControlSearch}
  value={this.formatControlLechesOptions(encabezado.options).find(option => 
    option.value === encabezado.id_control_leche
  )}
  isClearable
  isSearchable
  isLoading={encabezado.isLoading}
  placeholder="🔍 Escriba el número de frasco para buscar..."
  // *** AGREGAR ESTAS LÍNEAS ***
  menuPortalTarget={document.body}
  menuPosition="fixed"
  // *** FIN DE LÍNEAS A AGREGAR ***
  noOptionsMessage={(obj) => {
    if (obj.inputValue && obj.inputValue.length >= 1) {
      return `❌ No se encontraron frascos con "${obj.inputValue}"`;
    } else if (obj.inputValue && obj.inputValue.length < 1) {
      return "✏️ Escriba al menos 1 caracter para buscar";
    }
    return "💡 Escriba el número de frasco...";
  }}
  loadingMessage={() => "🔄 Buscando frascos..."}
  formatOptionLabel={(option) => (
    <div className="py-2">
      <div className="fw-bold text-dark">{option.label.split(' - ')[0]}</div>
      <small className="text-muted d-flex align-items-center gap-2">
        {option.control && (
          <>
            <span className="badge bg-light text-dark">
             🥛 Tipo: {option.control.tipo_de_leche || 'N/A'}
            </span>
            <span className="badge bg-light text-dark">
            📊  Volumen: {option.control.volumen_ml_onza || 0}ml
            </span>
            <span className="badge bg-success text-white">
             ✅ {option.control.estado_texto || 'Activo'}
            </span>
          </>
        )}
      </small>
    </div>
                      )}
                      styles={{
    // *** AGREGAR menuPortal con z-index alto ***
    menuPortal: (base) => ({ 
      ...base, 
      zIndex: 10000  // Z-index muy alto para que aparezca encima de todo
    }),
    control: (base, state) => ({
      ...base,
      borderRadius: '12px',
      border: '2px solid #e3f2fd',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(116, 185, 255, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#74b9ff'
      },
      minHeight: '50px'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid #e3f2fd',
      zIndex: 10000  // También aquí para mayor seguridad
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#74b9ff' : state.isFocused ? '#e3f2fd' : 'white',
      color: state.isSelected ? 'white' : '#333',
      borderRadius: '8px',
      margin: '4px 8px',
      width: 'calc(100% - 16px)'
    })
  }}
/>
                    {errors.id_control_leche && (
                      <div className="invalid-feedback d-block mt-2">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.id_control_leche}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DETALLES - Registros Médicos */}
          <div 
            className="card border-0 shadow-sm"
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              overflow: 'hidden'
            }}
          >
            <div className="card-header border-0" style={{ backgroundColor: 'transparent' }}>
              <div className="d-flex justify-content-between align-items-center text-white">
                <div className="d-flex align-items-center">
                  <div 
                    className="p-3 me-3 bg-white bg-opacity-20 rounded-circle"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    
                     <FaFileMedical className="text-black" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Registros Médicos</h5>
                    <small className="text-white-75">Gestión de pacientes y solicitudes</small>
                  </div>
                </div>
                
              </div>
            </div>
            
            <div className="card-body bg-white" style={{ backgroundColor: '#f8f9fa' }}>
              {errors.detalles && (
                <div 
                  className="alert alert-danger border-0 shadow-sm mb-4"
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                    color: 'white'
                  }}
                >
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errors.detalles}
                </div>
              )}
              
              {detalles.map((detalle, index) => (
                <div 
                  key={`detalle_${index}_${detalle.id_registro_medico || 'empty'}`} 
                  className="mb-4 border-0 shadow-sm"
                  style={{
                    borderRadius: '16px',
                    background: 'white',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                      <div 
                        className="p-2 me-3 rounded-circle"
                        style={{
                          background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                          color: 'white'
                        }}
                      >
                        <i className="fas fa-clipboard-list"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">Registro Médico {index + 1}</h6>
                        <small className="text-muted">Complete la información del paciente</small>
                      </div>
                    </div>
                    {detalles.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-outline-danger btn-sm shadow-sm"
                        onClick={() => this.eliminarDetalle(index)}
                        style={{
                          borderRadius: '10px',
                          padding: '8px 12px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  
                  <div className="row g-3">
                    {/* Registro Médico */}
                    <div className="col-md-12 mb-3">
                      <label className="form-label fw-semibold text-dark mb-2">
                        <i className="fas fa-search me-2 text-primary"></i>
                        Registro Médico
                      </label>
                      {this.getSelectedRegistroOption(index) && (
                        <div 
                          className="p-2 mb-2 border-0 rounded-3"
                          style={{ backgroundColor: '#d4edda' }}
                        >
                          <small className="text-success d-flex align-items-center">
                            <i className="fas fa-check-circle me-2"></i>
                            Seleccionado: {this.getSelectedRegistroOption(index).label}
                          </small>
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <div className="flex-grow-1">
                          <Select
                            key={`select_registro_${index}`}
                            className={`react-select ${errors[`detalle_${index}_id_registro_medico`] ? 'is-invalid' : ''}`}
                            classNamePrefix="react-select"
                            options={this.formatRegistroMedicoOptions()}
                            onChange={(selectedOption) => this.handleRegistroMedicoChange(index, selectedOption)}
                            onInputChange={this.handleSearchChange}
                            value={this.getSelectedRegistroOption(index)}
                            isClearable
                            isSearchable
                            isLoading={this.state.isSearching}
                            placeholder="🔍 Buscar registro médico..."
                            noOptionsMessage={(obj) => {
                              if (obj.inputValue && obj.inputValue.length > 0) {
                                return `❌ No se encontraron registros para "${obj.inputValue}"`;
                              }
                              return "✏️ Escriba para buscar registros...";
                            }}
                            loadingMessage={() => "🔄 Buscando registros..."}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            filterOption={(option, inputValue) => {
                              if (!inputValue) return true;
                              const searchValue = inputValue.toLowerCase();
                              return option.label.toLowerCase().includes(searchValue);
                            }}
                            isOptionSelected={(option) => {
                              const currentValue = this.getSelectedRegistroOption(index);
                              return currentValue && String(currentValue.value) === String(option.value);
                            }}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base, state) => {
                                const isSelected = this.getSelectedRegistroOption(index);
                                return {
                                  ...base,
                                  borderRadius: '12px',
                                  border: '2px solid #e3f2fd',
                                  borderColor: isSelected ? '#28a745' : state.isFocused ? '#74b9ff' : '#e3f2fd',
                                  backgroundColor: isSelected ? '#f8fff9' : 'white',
                                  boxShadow: state.isFocused ? '0 0 0 3px rgba(116, 185, 255, 0.1)' : 'none',
                                  minHeight: '50px'
                                };
                              },
                              menu: (base) => ({
                                ...base,
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                border: '1px solid #e3f2fd'
                              }),
                              option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected ? '#00b894' : state.isFocused ? '#e3f2fd' : 'white',
                                color: state.isSelected ? 'white' : '#333',
                                borderRadius: '8px',
                                margin: '4px 8px',
                                width: 'calc(100% - 16px)'
                              })
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-primary shadow-sm"
                          onClick={this.toggleModalInsertarRegistro}
                          style={{
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <FaPlus className="me-1" />
                          Nuevo
                        </button>
                      </div>
                      {errors[`detalle_${index}_id_registro_medico`] && (
                        <div className="invalid-feedback d-block mt-2">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_id_registro_medico`]}
                        </div>
                      )}
                    </div>

                    {/* Información del Paciente */}
                    <div className="col-12">
                      <div 
                        className="p-3 mb-3 border-0 rounded-3"
                        style={{ backgroundColor: '#fff3cd' }}
                      >
                        <h6 className="mb-2 text-warning-emphasis">
                          <i className="fas fa-baby me-2"></i>
                          Información del Paciente
                        </h6>
                      </div>
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-calendar-alt me-2 text-info"></i>
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors[`detalle_${index}_fecha_nacimiento`] ? 'is-invalid' : ''}`}
                        value={detalle.fecha_nacimiento}
                        onChange={(e) => this.handleDetalleChange(index, 'fecha_nacimiento', e.target.value)}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_fecha_nacimiento`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_fecha_nacimiento`]}
                        </div>
                      )}
                    </div>

                    {/* Edad de Ingreso */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-clock me-2 text-info"></i>
                        Edad de Ingreso
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={detalle.edad_de_ingreso}
                        onChange={(e) => this.handleDetalleChange(index, 'edad_de_ingreso', e.target.value)}
                        placeholder="Ej: 2 días, 1 semana"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {/* Tipo de Paciente */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-user-tag me-2 text-info"></i>
                        Tipo de Paciente
                      </label>
                      <select 
                        className={`form-control ${errors[`detalle_${index}_tipo_paciente`] ? 'is-invalid' : ''}`}
                        value={detalle.tipo_paciente}
                        onChange={(e) => this.handleDetalleChange(index, 'tipo_paciente', e.target.value)}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Selecciona el tipo de paciente</option>
                        <option value="Prematuro">👶 Prematuro</option>
                        <option value="Termino">🍼 Término</option>
                        <option value="Termino">⚠️ Pre-Término</option>
                      </select>
                      {errors[`detalle_${index}_tipo_paciente`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_tipo_paciente`]}
                        </div>
                      )}
                    </div>

                    {/* Servicio */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-hospital me-2 text-info"></i>
                        Servicio
                      </label>
                      <select 
                        className={`form-control ${errors[`detalle_${index}_servicio`] ? 'is-invalid' : ''}`}
                        value={detalle.servicio}
                        onChange={(e) => this.handleDetalleChange(index, 'servicio', e.target.value)}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Selecciona el servicio</option>
                        <option value="Alto riesgo">🔴 Alto riesgo</option>
                        <option value="Mediano riesgo">🟡 Mediano riesgo</option>
                        <option value="Recuperación materno neonatal">🟢 Recuperación materno neonatal</option>
                      </select>
                      {errors[`detalle_${index}_servicio`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_servicio`]}
                        </div>
                      )}
                    </div>

                    {/* Datos Médicos */}
                    <div className="col-12">
                      <div 
                        className="p-3 mb-3 border-0 rounded-3"
                        style={{ backgroundColor: '#e8f5e8' }}
                      >
                        <h6 className="mb-2 text-success-emphasis">
                          <i className="fas fa-weight me-2"></i>
                          Datos Médicos y Nutricionales
                        </h6>
                      </div>
                    </div>

                    {/* Peso al Nacer */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-weight-hanging me-2 text-success"></i>
                        Peso al Nacer (g)
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors[`detalle_${index}_peso_al_nacer`] ? 'is-invalid' : ''}`}
                        value={detalle.peso_al_nacer}
                        onChange={(e) => this.handleDetalleChange(index, 'peso_al_nacer', e.target.value)}
                        placeholder="Ej: 2500"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_peso_al_nacer`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_peso_al_nacer`]}
                        </div>
                      )}
                    </div>

                    {/* Peso Actual */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-weight me-2 text-success"></i>
                        Peso Actual (g)
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors[`detalle_${index}_peso_actual`] ? 'is-invalid' : ''}`}
                        value={detalle.peso_actual}
                        onChange={(e) => this.handleDetalleChange(index, 'peso_actual', e.target.value)}
                        placeholder="Ej: 2800"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_peso_actual`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_peso_actual`]}
                        </div>
                      )}
                    </div>

                    {/* Kcal (O) */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-fire me-2 text-success"></i>
                        Kcal (O)
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors[`detalle_${index}_kcal_o`] ? 'is-invalid' : ''}`}
                        value={detalle.kcal_o}
                        onChange={(e) => this.handleDetalleChange(index, 'kcal_o', e.target.value)}
                        placeholder="Ej: 150"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_kcal_o`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_kcal_o`]}
                        </div>
                      )}
                    </div>

                    {/* Volumen Toma (cc) */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-tint me-2 text-success"></i>
                        Volumen Toma (cc)
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors[`detalle_${index}_volumen_toma_cc`] ? 'is-invalid' : ''}`}
                        value={detalle.volumen_toma_cc}
                        onChange={(e) => this.handleDetalleChange(index, 'volumen_toma_cc', e.target.value)}
                        placeholder="Ej: 30"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_volumen_toma_cc`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_volumen_toma_cc`]}
                        </div>
                      )}
                    </div>

                    {/* Número de Tomas */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-list-ol me-2 text-success"></i>
                        Número de Tomas
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors[`detalle_${index}_numero_tomas`] ? 'is-invalid' : ''}`}
                        value={detalle.numero_tomas}
                        onChange={(e) => this.handleDetalleChange(index, 'numero_tomas', e.target.value)}
                        placeholder="Ej: 8"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_numero_tomas`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_numero_tomas`]}
                        </div>
                      )}
                    </div>

                    {/* Total Volumen Solicitado */}
                    {/* Total Volumen Solicitado */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-calculator me-2 text-success"></i>
                        Total Volumen Solicitado (cc)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={detalle.total_vol_solicitado}
                        onChange={(e) => this.handleDetalleChange(index, 'total_vol_solicitado', e.target.value)}
                        placeholder="123"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px',
                          backgroundColor: '#f8f9fa'
                        }}
                       
                      />
                    </div>

                    {/* Información de Entrega */}
                    <div className="col-12">
                      <div 
                        className="p-3 mb-3 border-0 rounded-3"
                        style={{ backgroundColor: '#fff0f5' }}
                      >
                        <h6 className="mb-2 text-danger-emphasis">
                          <i className="fas fa-truck me-2"></i>
                          Información de Entrega
                        </h6>
                      </div>
                    </div>

                    {/* Fecha de Entrega */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-calendar-check me-2 text-danger"></i>
                        Fecha de Entrega
                      </label>
                      <input
                        type="date"
                        className={`form-control ${errors[`detalle_${index}_fecha_entrega`] ? 'is-invalid' : ''}`}
                        value={detalle.fecha_entrega}
                        onChange={(e) => this.handleDetalleChange(index, 'fecha_entrega', e.target.value)}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_fecha_entrega`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_fecha_entrega`]}
                        </div>
                      )}
                    </div>

                    {/* Solicita */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="fas fa-user-nurse me-2 text-danger"></i>
                        Solicita
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors[`detalle_${index}_solicita`] ? 'is-invalid' : ''}`}
                        value={detalle.solicita}
                        onChange={(e) => this.handleDetalleChange(index, 'solicita', e.target.value)}
                        placeholder="Nombre de quien solicita"
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e3f2fd',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                      />
                      {errors[`detalle_${index}_solicita`] && (
                        <div className="invalid-feedback">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          {errors[`detalle_${index}_solicita`]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón para agregar más registros */}
                  <div className="d-flex justify-content-center mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-success shadow-sm"
                      onClick={this.agregarDetalle}
                      style={{
                        borderRadius: '12px',
                        padding: '12px 24px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)'
                      }}
                    >
                      <FaPlus className="me-2" />
                      Agregar más registros al mismo frasco
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter 
        style={{
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          padding: '20px 30px'
        }}
      >
        <div className="d-flex gap-3 w-100 justify-content-end">
          <button 
            type="button" 
            className="btn btn-secondary shadow-sm"
            onClick={this.modalInsertar}
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-times me-2"></i>
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn btn-success shadow-sm"
            onClick={this.peticionPost}
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-save me-2"></i>
            Guardar Solicitud
          </button>
        </div>
      </ModalFooter>
    </Modal>

    {/* Modal para insertar nuevo registro médico */}
    <Modal isOpen={modalInsertarRegistro} toggle={this.toggleModalInsertarRegistro}>
      <ModalBody>
        <InsertarRegistroModal
          isOpen={modalInsertarRegistro}
          toggle={this.toggleModalInsertarRegistro}
          onPersonaInsertada={this.onRegistroInsertado}
        />
      </ModalBody>
    </Modal>
  </div>
);
  }
}

export default ShowSolicitudDetalleFrasco;