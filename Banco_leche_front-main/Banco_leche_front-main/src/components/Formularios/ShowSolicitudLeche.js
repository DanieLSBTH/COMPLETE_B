import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';
import '../Css/Solicitud.css'
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaAddressCard ,FaBuilding, FaClinicMedical, FaBaby, FaSistrix,FaCalendarDay,FaGlassWhiskey, FaTint, FaFlask ,FaClipboardCheck } from 'react-icons/fa';

import { Paginator } from 'primereact/paginator';
import CreateSolicitudLeche from './ShowSolicitudDetalle';
import ShowSolicitudDetalleFrasco from './ShowSolicitudDetalleFrasco';

const url = "http://localhost:8080/api/solicitud_de_leches/";
const urlRegistroMedico = "http://localhost:8080/api/registro_medico/";
const urlControlLeche = "http://localhost:8080/api/control_de_leches/";

class ShowSolicitud extends Component {
  state = {
    solicitudes: [],
    registrosMedicos: [],
    controlesLeche: [],
    controlesLecheCache: new Map(),
  controlesLecheOptions: [],
  isLoadingControlesLeche: false,
    searchTerm: '',
    isSearching: false,
    modalActualizar: false,
    modalEliminar: false,
    modalInsertar: false,
    isLoading: false,  // *** AGREGAR ESTA LÍNEA ***
    form: {
      id_solicitud: '',
      fecha_nacimiento: '',
      fecha_entrega: '',
      litros: '',
      costos: '',
      id_registro_medico: '',
      edad_de_ingreso: '',
      tipo_paciente: '',
      peso_al_nacer: '',
      peso_actual: '',
      kcal_o: '',
      volumen_toma_cc: '',
      numero_tomas: '',
      total_vol_solicitado: '',
      id_control_leche: '',
      servicio: '',
      solicita: '',
      onzas: '',
      tipoModal: ''
    },
    totalRecords: 0,
    currentPage: 1,
    rowsPerPage: 10,
    // NUEVO: Cache para registros médicos
    registrosMedicosCache: new Map(),
    lastSearchTerm: '',
    // NUEVO: Estado para el select
    selectOptions: [],
    isLoadingOptions: false
  }

  // Función optimizada para búsqueda rápida en selects
  fetchRegistrosMedicosForSelect = (searchTerm = '') => {
    // No buscar si el término es muy corto
    if (searchTerm.trim().length < 2) {
      this.setState({ 
        selectOptions: [],
        isLoadingOptions: false 
      });
      return;
    }

    // Verificar cache primero
    const cacheKey = searchTerm.toLowerCase().trim();
    if (this.state.registrosMedicosCache.has(cacheKey)) {
      const cachedData = this.state.registrosMedicosCache.get(cacheKey);
      this.setState({ 
        selectOptions: this.formatRegistroMedicoOptions(cachedData),
        isLoadingOptions: false 
      });
      return;
    }

    this.setState({ isLoadingOptions: true });

    // Usar la nueva ruta optimizada para selects
    const searchUrl = `${urlRegistroMedico}/quick-search/${encodeURIComponent(searchTerm.trim())}`;

    axios.get(searchUrl, { timeout: 5000 })
      .then(response => {
        const registros = response.data.registros || [];
        
        // Guardar en cache
        this.state.registrosMedicosCache.set(cacheKey, registros);
        
        // Limpiar cache si es muy grande (mantener solo los últimos 20)
        if (this.state.registrosMedicosCache.size > 20) {
          const firstKey = this.state.registrosMedicosCache.keys().next().value;
          this.state.registrosMedicosCache.delete(firstKey);
        }

        this.setState({ 
          selectOptions: this.formatRegistroMedicoOptions(registros),
          isLoadingOptions: false 
        });
      })
      .catch(error => {
        console.error('Error en búsqueda rápida:', error);
        this.setState({ 
          selectOptions: [],
          isLoadingOptions: false 
        });
      });
  };
 handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumensolicitudnombre');
  };
  handleNavigate1 = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumen-por-solicitud');
  };

  // Función optimizada para formatear opciones
  formatRegistroMedicoOptions = (registros = []) => {
    if (!Array.isArray(registros)) {
      return [];
    }
    
    return registros.map(registro => ({
      value: registro.id_registro_medico,
      label: `${registro.registro_medico} - ${registro.recien_nacido}`
    }));
  };

  // Manejo optimizado del cambio de búsqueda
  handleSearchChange = (inputValue) => {
    this.setState({ searchTerm: inputValue });
    
    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce más largo para evitar muchas peticiones
    this.searchTimeout = setTimeout(() => {
      this.fetchRegistrosMedicosForSelect(inputValue);
    }, 800);
  };

  // Manejo de cambio de registro médico
  handleRegistroMedicoChange = (selectedOption) => {
    this.setState({
      form: {
        ...this.state.form,
        id_registro_medico: selectedOption ? selectedOption.value : ''
      }
    });
  };

  // Cargar opciones iniciales (vacías)
  loadDefaultOptions = () => {
    return Promise.resolve([]);
  };

  fetchControlesLecheForSelect = (searchTerm = '') => {
  // No buscar si el término es muy corto
  if (searchTerm.trim().length < 2) {
    this.setState({ 
      controlesLecheOptions: [],
      isLoadingControlesLeche: false 
    });
    return;
  }

  // Verificar cache primero
  const cacheKey = searchTerm.toLowerCase().trim();
  if (this.state.controlesLecheCache.has(cacheKey)) {
    const cachedData = this.state.controlesLecheCache.get(cacheKey);
    this.setState({ 
      controlesLecheOptions: this.formatControlLecheOptions(cachedData),
      isLoadingControlesLeche: false 
    });
    return;
  }

  this.setState({ isLoadingControlesLeche: true });

  // Usar la nueva ruta optimizada para búsqueda por frasco
  const searchUrl = `${urlControlLeche}/search/frasco?no_frascoregistro=${encodeURIComponent(searchTerm.trim())}&estado=true&pageSize=20`;

  axios.get(searchUrl, { timeout: 5000 })
    .then(response => {
      const controles = response.data.controlDeLeches || [];
      
      // Guardar en cache
      this.state.controlesLecheCache.set(cacheKey, controles);
      
      // Limpiar cache si es muy grande (mantener solo los últimos 20)
      if (this.state.controlesLecheCache.size > 20) {
        const firstKey = this.state.controlesLecheCache.keys().next().value;
        this.state.controlesLecheCache.delete(firstKey);
      }

      this.setState({ 
        controlesLecheOptions: this.formatControlLecheOptions(controles),
        isLoadingControlesLeche: false 
      });
    })
    .catch(error => {
      console.error('Error en búsqueda de controles de leche:', error);
      this.setState({ 
        controlesLecheOptions: [],
        isLoadingControlesLeche: false 
      });
    });
};
formatControlLecheOptions = (controles = []) => {
  if (!Array.isArray(controles)) {
    return [];
  }
  
  return controles.map(control => ({
    value: control.id_control_leche,
    label: `Frasco: ${control.no_frascoregistro} - ${control.volumen_ml_onza}ml - ${control.tipo_de_leche}`
  }));
};

// NUEVA FUNCIÓN: Manejo de cambio de búsqueda para controles de leche
handleControlesLecheSearchChange = (inputValue) => {
  // Limpiar timeout anterior
  if (this.controlesLecheTimeout) {
    clearTimeout(this.controlesLecheTimeout);
  }

  // Debounce para evitar muchas peticiones
  this.controlesLecheTimeout = setTimeout(() => {
    this.fetchControlesLecheForSelect(inputValue);
  }, 800);
};

// NUEVA FUNCIÓN: Manejo de cambio de control de leche
handleControlLecheChange = (selectedOption) => {
  this.setState({
    form: {
      ...this.state.form,
      id_control_leche: selectedOption ? selectedOption.value : ''
    }
  });
};
  // Resto de funciones existentes...
  peticionGet = async () => {
  const { currentPage, rowsPerPage } = this.state;
  this.setState({ isLoading: true }); // *** AGREGAR ESTA LÍNEA ***
  
  try {
    console.log('Cargando solicitudes...', { currentPage, rowsPerPage });
    const response = await axios.get(`${url}?page=${currentPage}&pageSize=${rowsPerPage}`);
    this.setState({ 
      solicitudes: response.data.solicitudes,
      totalRecords: response.data.totalRecords,
      isLoading: false  // *** AGREGAR ESTA LÍNEA ***
    });
    console.log('Solicitudes cargadas:', response.data.solicitudes?.length || 0);
  } catch (error) {
    console.log('Error al cargar solicitudes:', error.message);
    this.setState({ isLoading: false }); // *** AGREGAR ESTA LÍNEA ***
    Swal.fire('Error', 'Error al obtener las solicitudes', 'error');
  }
}

  peticionGetControlesLeche = async () => {
    try {
      const response = await axios.get(`${urlControlLeche}?page=1&pageSize=1000`);
      this.setState({ 
        controlesLeche: response.data.controlDeLeches || []
      });
    } catch (error) {
      console.log(error.message);
      Swal.fire('Error', 'Error al obtener los controles de leche', 'error');
    }
  }

  peticionPut = () => {
    if (!this.validarFormulario()) return;

    axios.put(url + this.state.form.id_solicitud, this.state.form).then(response => {
      this.modalActualizar();
      this.peticionGet();
      Swal.fire('Éxito', 'Solicitud actualizada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar la solicitud', 'error');
      console.log(error.message);
    })
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_solicitud).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Solicitud eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la solicitud', 'error');
      console.log(error.message);
    })
  }

  modalActualizar = () => {
    this.setState({ modalActualizar: !this.state.modalActualizar });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarSolicitud = (solicitud) => {
  // Pre-cargar el registro médico específico para el select
  if (solicitud.id_registro_medico) {
    const registroActual = {
      id_registro_medico: solicitud.id_registro_medico,
      registro_medico: solicitud.registro_medicos?.registro_medico || '',
      recien_nacido: solicitud.registro_medicos?.recien_nacido || ''
    };
    
    this.setState({
      selectOptions: this.formatRegistroMedicoOptions([registroActual])
    });
  }

  // NUEVO: Pre-cargar el control de leche específico para el select
  if (solicitud.id_control_leche && solicitud.control_de_leches) {
    const controlActual = {
      id_control_leche: solicitud.id_control_leche,
      no_frascoregistro: solicitud.control_de_leches.no_frascoregistro || '',
      volumen_ml_onza: solicitud.control_de_leches.volumen_ml_onza || '',
      tipo_de_leche: solicitud.control_de_leches.tipo_de_leche || ''
    };
    
    this.setState({
      controlesLecheOptions: this.formatControlLecheOptions([controlActual])
    });
  }

  this.setState({
    tipoModal: 'actualizar',
    form: {
      id_solicitud: solicitud.id_solicitud,
      fecha_nacimiento: solicitud.fecha_nacimiento.split('T')[0],
      fecha_entrega: solicitud.fecha_entrega.split('T')[0],
      litros: solicitud.litros,
      costos: solicitud.costos,
      id_registro_medico: solicitud.id_registro_medico,
      edad_de_ingreso: solicitud.edad_de_ingreso,
      tipo_paciente: solicitud.tipo_paciente,
      peso_al_nacer: solicitud.peso_al_nacer,
      peso_actual: solicitud.peso_actual,
      kcal_o: solicitud.kcal_o,
      volumen_toma_cc: solicitud.volumen_toma_cc,
      numero_tomas: solicitud.numero_tomas,
      total_vol_solicitado: solicitud.total_vol_solicitado,
      id_control_leche: solicitud.id_control_leche,
      servicio: solicitud.servicio,
      solicita: solicitud.solicita,
      onzas: solicitud.onzas
    }
  });
}

  handleChange = async (e) => {
    e.persist();
    await this.setState({
      form: {
        ...this.state.form,
        [e.target.name]: e.target.value
      }
    });
  }

  validarFormulario = () => {
    const { form } = this.state;

    if (!form) {
      Swal.fire('Error', 'El formulario está vacío.', 'error');
      return false;
    }

    const camposObligatorios = [
      'fecha_nacimiento', 'fecha_entrega', 'id_registro_medico', 
      'edad_de_ingreso', 'tipo_paciente', 'peso_al_nacer', 'peso_actual', 
      'id_control_leche', 'servicio', 'solicita'
    ];

    for (let campo of camposObligatorios) {
      if (!form[campo] || form[campo] === '') {
        Swal.fire('Error', `El campo ${campo.replace('_', ' ')} es obligatorio.`, 'error');
        return false;
      }
    }

    return true;
  }

  onPageChange = (event) => {
    this.setState(
      { currentPage: event.page + 1 },
      () => {
        this.peticionGet();
      }
    );
  }

  componentDidMount() {
    this.peticionGet(); 
  }
  actualizarTabla = () => {
  this.peticionGet();
  console.log('Actualizando tabla de solicitudes...');
};

 componentWillUnmount() {
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }
  // NUEVO: Limpiar timeout de controles de leche
  if (this.controlesLecheTimeout) {
    clearTimeout(this.controlesLecheTimeout);
  }
}

  render() {
    const { form, totalRecords, rowsPerPage, currentPage, solicitudes, modalInsertar, selectOptions, isLoadingOptions } = this.state;
    
    return (
      <div className="App"> 
         <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px' }}>
        <div className="card-header border-0 py-4" style={{ 
          background: 'linear-gradient(135deg,rgba(102, 175, 234, 0.74) 0%,rgb(204, 196, 212) 100%)',
          borderRadius: '20px 20px 0 0'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1 text-white fw-bold">Control de despacho</h3>
              <p className="mb-0 text-white opacity-75">Administra y gestión de solicitudes</p>
            </div>
        
        </div>
        </div>
   <div className="row mb-4">
  <div className="col-12">
    <div
      className="card shadow border-0"
      style={{
        borderRadius: '15px',
        background: 'rgba(255, 255, 255, 0.9)'
      }}
    >
      <div className="card-body p-3">
        <div className="row align-items-center">
          <div className="col-12">
            {/* Contenedor de botones en horizontal */}
            <div className="navigation-buttons d-flex flex-wrap gap-3 justify-content-center align-items-baseline"
                 style={{ 
                   minHeight: '60px'
                 }}>
              
              <style jsx>{`
                .navigation-buttons >  {
                  display: flex !important;
                  align-items: center !important;
                  margin: 0 !important;
                }
                .navigation-buttons > * > * {
                  margin-bottom: 0 !important;
                }
                .navigation-buttons button,
                .navigation-buttons > * button {
                  vertical-align: middle !important;
                }
              `}</style>
              
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
                onClick={this.handleNavigate}
              >
                <FaChartBar className="me-2" />
                Búsqueda por nombre
              </button>

              <button
                className="btn btn-warning shadow-sm d-flex align-items-center"
                style={{
                  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  padding: '12px 24px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onClick={this.handleNavigate1}
              >
                <FaChartBar className="me-2" />
                Resumen de datos
              </button>

              {/* Contenedores con anulación completa de estilos */}
              <div style={{ margin: 0, padding: 0, display: 'flex', alignItems: 'center', height: '50px' }}>
                <div style={{ marginBottom: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
                   <CreateSolicitudLeche
            isOpen={modalInsertar}
            toggle={this.modalInsertar}
            onAddSuccess={() => {
              this.peticionGet(); // Actualizar la tabla
              console.log('Solicitud agregada exitosamente, actualizando tabla...');
            }}
            // Agregar esta nueva prop para pasar la función de actualización
            onSolicitudCreated={() => {
              this.actualizarTabla();
            }}
          />
                </div>
              </div>
              
              <div style={{ margin: 0, padding: 0, display: 'flex', alignItems: 'center', height: '50px' }}>
                <div style={{ marginBottom: 0, height: '100%', display: 'flex', alignItems: 'center' }}>
                  <ShowSolicitudDetalleFrasco
  onSolicitudesCreadas={async () => {
    console.log('Callback onSolicitudesCreadas ejecutado');
    await this.peticionGet(); // Usar await para asegurar que termine
    console.log('Tabla actualizada exitosamente');
  }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      

         <div className="table-scroll-wrapper">
            <table className="table table-striped modern-table">
              <thead>
                <tr>
                  <th><FaAddressCard className="me-1" />No.</th>
                  <th><FaClinicMedical className="me-1" />Registro Médico</th>
                  <th><FaBaby className="me-1" />Recién Nacido</th>
                  <th><FaCalendarDay className="me-1" />Fecha Nacimiento</th>
                  <th><FaCalendarDay className="me-1" />Edad Ingreso</th>
                  <th><FaBuilding className="me-1" />Tipo Paciente</th>
                  <th>Peso Nacer (g)</th>
                  <th>Peso Actual (g)</th>
                  <th>Kcal/Onza</th>
                  <th><FaGlassWhiskey className="me-1" />Vol. Toma (cc)</th>
                  <th>No. Tomas</th>
                  <th><FaTint className="me-1" />Total Vol. Sol.</th>
                  <th><FaFlask className="me-1" />No. Frasco</th>
                  <th><FaCalendarDay className="me-1" />F. Almacén</th>
                  <th>Volumen CC</th>
                  <th>Kcal/L</th>
                  <th>Acidez</th>
                  <th><FaBuilding className="me-1" />Servicio</th>
                  <th><FaCalendarDay className="me-1" />F. Entrega</th>
                  <th><FaSistrix className="me-1" />Solicita</th>
                  <th>Onzas</th>
                  <th>Litros</th>
                  <th>Costos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud, index) => (
                  <tr key={solicitud.id_solicitud}>
                    <td><strong>{solicitud.id_solicitud}</strong></td>
                    <td>{solicitud.registro_medicos?.registro_medico}</td>
                    <td>{solicitud.registro_medicos?.recien_nacido}</td>
                    <td>{solicitud.fecha_nacimiento}</td>
                    <td>{solicitud.edad_de_ingreso}</td>
                    <td>
                      
                        {solicitud.tipo_paciente}
                      
                    </td>
                    <td>{solicitud.peso_al_nacer}</td>
                    <td>{solicitud.peso_actual}</td>
                    <td>{solicitud.kcal_o}</td>
                    <td>{solicitud.volumen_toma_cc}</td>
                    <td>{solicitud.numero_tomas}</td>
                    <td>{solicitud.total_vol_solicitado}</td>
                    <td>
                      <code>{solicitud.control_de_leches?.no_frascoregistro}</code>
                    </td>
                    <td>{solicitud.control_de_leches?.fecha_almacenamiento}</td>
                    <td>{solicitud.control_de_leches?.volumen_ml_onza}</td>
                    <td>{solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.kcal_l}</td>
                    <td>{solicitud.control_de_leches?.trabajo_de_pasteurizaciones?.acidez}</td>
                    <td>
                      
                        {solicitud.servicio}
                      
                    </td>
                    <td>{solicitud.fecha_entrega}</td>
                    <td>{solicitud.solicita}</td>
                    <td>{solicitud.onzas}</td>
                    <td>{solicitud.litros}</td>
                    <td>
                      <strong>{parseFloat(solicitud.costos || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-modern btn-edit" 
                          onClick={() => { 
                            this.seleccionarSolicitud(solicitud); 
                            this.modalActualizar() 
                          }}
                          title="Editar solicitud"
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-modern btn-delete"style={{
                                      background: 'linear-gradient(135deg,rgb(236, 50, 13) 0%, #f5576c 100%)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: 'white',
                                      padding: '8px 12px'
                                    }} 
                          onClick={() => { 
                            this.seleccionarSolicitud(solicitud); 
                            this.setState({ modalEliminar: true }) 
                          }}
                          title="Eliminar solicitud"
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

        <div className="d-flex justify-content-center mt-4">
          <Paginator
            first={(currentPage - 1) * rowsPerPage}
            rows={rowsPerPage}
            totalRecords={totalRecords}
            onPageChange={this.onPageChange}
            className="modern-paginator"
          />
        </div>

        {/* Modal para Actualizar */}
        <Modal isOpen={this.state.modalActualizar} toggle={() => this.modalActualizar()} size="lg">
          <ModalHeader toggle={() => this.modalActualizar()}>Editar Solicitud</ModalHeader>
          <ModalBody>
            <div className="form-group">
              <label htmlFor="id_solicitud">ID Solicitud</label>
              <input 
                className="form-control" 
                type="text" 
                name="id_solicitud" 
                id="id_solicitud" 
                readOnly 
                onChange={this.handleChange} 
                value={form ? form.id_solicitud : ''} 
              />
              <br />
              
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                  <input 
                    className="form-control" 
                    type="date" 
                    name="fecha_nacimiento" 
                    id="fecha_nacimiento" 
                    onChange={this.handleChange} 
                    value={form ? form.fecha_nacimiento : ''} 
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="fecha_entrega">Fecha de Entrega</label>
                  <input 
                    className="form-control" 
                    type="date" 
                    name="fecha_entrega" 
                    id="fecha_entrega" 
                    onChange={this.handleChange} 
                    value={form ? form.fecha_entrega : ''} 
                  />
                </div>
              </div>
              <br />

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="litros">Litros (Calculado)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01"
                    name="litros" 
                    id="litros" 
                    readOnly
                    value={form ? form.litros : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="onzas">Onzas (Calculado)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    name="onzas" 
                    id="onzas" 
                    readOnly
                    value={form ? form.onzas : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="costos">Costos (Calculado)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01"
                    name="costos" 
                    id="costos" 
                    readOnly
                    value={form ? form.costos : ''} 
                  />
                </div>
              </div>
              <br />

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Registro Médico</label>
                    <Select
                      options={selectOptions}
                      onChange={this.handleRegistroMedicoChange}
                      onInputChange={this.handleSearchChange}
                      value={selectOptions.find(option => 
                        option.value === form.id_registro_medico
                      )}
                      isClearable
                      isSearchable
                      isLoading={isLoadingOptions}
                      placeholder="Escriba para buscar registro médico..."
                      noOptionsMessage={(obj) => {
                        if (obj.inputValue && obj.inputValue.length > 0) {
                          if (obj.inputValue.length < 2) {
                            return "Escriba al menos 2 caracteres...";
                          }
                          return `No se encontraron registros para "${obj.inputValue}"`;
                        }
                        return "Escriba para buscar registros...";
                      }}
                      loadingMessage={() => "Buscando registros..."}
                      // Estilos para mejor UX
                      styles={{
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : null,
                          color: state.isSelected ? 'white' : 'black',
                        }),
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: state.isFocused ? '#80bdff' : '#ced4da',
                          boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : null,
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
  <div className="form-group">
    <label>Control de Leche</label>
    <Select
      options={this.state.controlesLecheOptions}
      onChange={this.handleControlLecheChange}
      onInputChange={this.handleControlesLecheSearchChange}
      value={this.state.controlesLecheOptions.find(option => 
        option.value === form.id_control_leche
      )}
      isClearable
      isSearchable
      isLoading={this.state.isLoadingControlesLeche}
      placeholder="Escriba número de frasco para buscar..."
      noOptionsMessage={(obj) => {
        if (obj.inputValue && obj.inputValue.length > 0) {
          if (obj.inputValue.length < 2) {
            return "Escriba al menos 2 caracteres...";
          }
          return `No se encontraron frascos para "${obj.inputValue}"`;
        }
        return "Escriba para buscar frascos...";
      }}
      loadingMessage={() => "Buscando frascos..."}
      styles={{
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : null,
          color: state.isSelected ? 'white' : 'black',
        }),
        control: (provided, state) => ({
          ...provided,
          borderColor: state.isFocused ? '#80bdff' : '#ced4da',
          boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : null,
        })
      }}
    />
  </div>
</div>
              </div>
              <br />

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="edad_de_ingreso">Edad de Ingreso</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    name="edad_de_ingreso" 
                    id="edad_de_ingreso" 
                    onChange={this.handleChange} 
                    value={form ? form.edad_de_ingreso : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="peso_al_nacer">Peso al Nacer</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01"
                    name="peso_al_nacer" 
                    id="peso_al_nacer" 
                    onChange={this.handleChange} 
                    value={form ? form.peso_al_nacer : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="peso_actual">Peso Actual</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    step="0.01"
                    name="peso_actual" 
                    id="peso_actual" 
                    onChange={this.handleChange} 
                    value={form ? form.peso_actual : ''} 
                  />
                </div>
              </div>
              <br />

              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="tipo_paciente">Tipo de Paciente</label>
                  <select 
                    className="form-control" 
                    name="tipo_paciente" 
                    id="tipo_paciente" 
                    onChange={this.handleChange} 
                    value={form ? form.tipo_paciente : ''}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Prematuro">Prematuro</option>
                    <option value="Término">Término</option>
                    <option value="Post-término">Post-término</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="servicio">Servicio</label>
                  <select 
                    className="form-control" 
                    name="servicio" 
                    id="servicio" 
                    onChange={this.handleChange} 
                    value={form ? form.servicio : ''}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Alto riesgo">Alto riesgo</option>
                    <option value="Mediano riesgo">Mediano riesgo</option>
                    <option value="Bajo riesgo">Bajo riesgo</option>
                  </select>
                </div>
              </div>
              <br />

              <label htmlFor="solicita">Solicita</label>
              <input 
                className="form-control" 
                type="text" 
                name="solicita" 
                id="solicita" 
                onChange={this.handleChange} 
                value={form ? form.solicita : ''} 
              />
              <br />

              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="kcal_o">Kcal/Onza</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    name="kcal_o" 
                    id="kcal_o" 
                    onChange={this.handleChange} 
                   value={form ? form.kcal_o : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="volumen_toma_cc">Volumen Toma (cc)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    name="volumen_toma_cc" 
                    id="volumen_toma_cc" 
                    onChange={this.handleChange} 
                    value={form ? form.volumen_toma_cc : ''} 
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="numero_tomas">Número de Tomas</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    name="numero_tomas" 
                    id="numero_tomas" 
                    onChange={this.handleChange} 
                    value={form ? form.numero_tomas : ''} 
                  />
                </div>
              </div>
              <br />

              <label htmlFor="total_vol_solicitado">Total Volumen Solicitado</label>
              <input 
                className="form-control" 
                type="number" 
                name="total_vol_solicitado" 
                id="total_vol_solicitado" 
                onChange={this.handleChange} 
                value={form ? form.total_vol_solicitado : ''} 
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-primary" onClick={() => this.peticionPut()}>
              Actualizar
            </button>
            <button className="btn btn-secondary" onClick={() => this.modalActualizar()}>
              Cancelar
            </button>
          </ModalFooter>
        </Modal>

        {/* Modal para Eliminar */}
        <Modal isOpen={this.state.modalEliminar} toggle={() => this.setState({ modalEliminar: false })}>
          <ModalHeader toggle={() => this.setState({ modalEliminar: false })}>
            Eliminar Solicitud
          </ModalHeader>
          <ModalBody>
            ¿Estás seguro que deseas eliminar la solicitud {form && form.id_solicitud}?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={() => this.peticionDelete()}>
              Sí, Eliminar
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => this.setState({ modalEliminar: false })}
            >
              Cancelar
            </button>
          </ModalFooter>
        </Modal>
      </div>
      </div>
    );
  }
}

function ShowSolicitudWrapper() {
  const navigate = useNavigate();
  return <ShowSolicitud navigate={navigate} />;
}

export default ShowSolicitudWrapper;
