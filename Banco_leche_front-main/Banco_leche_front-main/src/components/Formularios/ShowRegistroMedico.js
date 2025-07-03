// ShowRegistroMedico.js
import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "http://localhost:8080/api/registro_medico/";

class ShowRegistroMedico extends Component {
  state = {
    registros: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_registro_medico: '',
      registro_medico:'',
      recien_nacido: '',
      tipoModal: ''
    },
    errors: {},
    totalRecords: 0,
    page: 1,
    rows: 10,
    // Nuevos estados para búsqueda
    searchTerm: '',
    isSearching: false,
    searchResults: [],
    searchPagination: null,
    showSearchResults: false,
    searchTimeout: null
  };

  componentDidMount() {
    this.peticionGet();
  }

  peticionGet = () => {
    const { page, rows } = this.state;
    axios.get(`${url}?page=${page}&limit=${rows}`).then(response => {
      this.setState({
        registros: response.data.registros,
        totalRecords: response.data.totalRecords
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de registros médicos', 'error');
    });
  }

  // Nueva función para búsqueda
  peticionSearch = (searchTerm, page = 1) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      this.setState({
        showSearchResults: false,
        searchResults: [],
        searchPagination: null,
        isSearching: false
      });
      return;
    }

    this.setState({ isSearching: true });

    const { rows } = this.state;
    const searchUrl = `${url}search/${encodeURIComponent(searchTerm.trim())}?page=${page}&limit=${rows}&type=partial`;

    axios.get(searchUrl)
      .then(response => {
        this.setState({
          searchResults: response.data.registros,
          searchPagination: response.data.pagination,
          showSearchResults: true,
          isSearching: false
        });
      })
      .catch(error => {
        console.error('Error en búsqueda:', error);
        this.setState({
          isSearching: false,
          showSearchResults: false,
          searchResults: []
        });
        Swal.fire('Error', 'Error al realizar la búsqueda', 'error');
      });
  }

  // Manejo de cambio en el campo de búsqueda
  handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    this.setState({ searchTerm });

    // Limpiar timeout anterior
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }

    // Si el campo está vacío, mostrar todos los registros
    if (!searchTerm.trim()) {
      this.setState({
        showSearchResults: false,
        searchResults: [],
        searchPagination: null,
        searchTimeout: null
      });
      return;
    }

    // Búsqueda con debounce
    const timeout = setTimeout(() => {
      this.peticionSearch(searchTerm);
    }, 500);

    this.setState({ searchTimeout: timeout });
  }

  // Limpiar búsqueda
  clearSearch = () => {
    this.setState({
      searchTerm: '',
      showSearchResults: false,
      searchResults: [],
      searchPagination: null,
      isSearching: false
    });
    
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }
  }

  onPageChange = (event) => {
    const newPage = event.page + 1;
    
    if (this.state.showSearchResults) {
      // Paginación para resultados de búsqueda
      this.peticionSearch(this.state.searchTerm, newPage);
    } else {
      // Paginación normal
      this.setState({ page: newPage }, this.peticionGet);
    }
  }

  // Paginación específica para búsqueda
  onSearchPageChange = (event) => {
    const newPage = event.page + 1;
    this.peticionSearch(this.state.searchTerm, newPage);
  }

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_registro_medico;
      try {
        await axios.post(url, this.state.form);
        this.modalInsertar();
        // Actualizar tanto la lista principal como los resultados de búsqueda si están activos
        if (this.state.showSearchResults) {
          this.peticionSearch(this.state.searchTerm);
        } else {
          this.peticionGet();
        }
        Swal.fire('Éxito', 'Registro médico creado exitosamente', 'success');
      } catch (error) {
        console.error('Error al crear el registro médico:', error);
        Swal.fire('Error', 'No se pudo crear el registro médico', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
        await axios.put(url + this.state.form.id_registro_medico, this.state.form);
        this.modalInsertar();
        // Actualizar tanto la lista principal como los resultados de búsqueda si están activos
        if (this.state.showSearchResults) {
          this.peticionSearch(this.state.searchTerm);
        } else {
          this.peticionGet();
        }
        Swal.fire('Éxito', 'Registro actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar:', error);
        Swal.fire('Error', 'No se pudo actualizar el registro', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_registro_medico);
      this.setState({ modalEliminar: false });
      // Actualizar tanto la lista principal como los resultados de búsqueda si están activos
      if (this.state.showSearchResults) {
        this.peticionSearch(this.state.searchTerm);
      } else {
        this.peticionGet();
      }
      Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
    }
  }

  validarFormulario = () => {
    const { registro_medico, recien_nacido } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!registro_medico || registro_medico.trim() === '') {
      formIsValid = false;
      errors["registro_medico"] = "El registro médico es requerido";
    }

    if (!recien_nacido || recien_nacido.trim() === '') {
      formIsValid = false;
      errors["recien_nacido"] = "El campo recién nacido es requerido";
    }

    this.setState({ errors });
    return formIsValid;
  }

  modalInsertar = () => {
    this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      errors: {}
    }));
  }

  seleccionarRegistro = (registro) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_registro_medico: registro.id_registro_medico,
        registro_medico: registro.registro_medico,
        recien_nacido: registro.recien_nacido
      }
    });
  }

  handleChange = async e => {
    const { name, value } = e.target;
    await this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: value
      }
    }));
    this.validarFormulario();
  }

  componentWillUnmount() {
    // Limpiar timeout al desmontar el componente
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }
  }

  render() {
    const { 
      form, 
      errors, 
      registros, 
      totalRecords, 
      rows, 
      page,
      searchTerm,
      isSearching,
      searchResults,
      searchPagination,
      showSearchResults
    } = this.state;

    // Determinar qué datos mostrar
    const currentRegistros = showSearchResults ? searchResults : registros;
    const currentTotalRecords = showSearchResults ? 
      (searchPagination ? searchPagination.totalRecords : 0) : totalRecords;
    const currentPage = showSearchResults ? 
      (searchPagination ? searchPagination.currentPage : 1) : page;

    return (
      <div className="App">
        <br /><br /><br />
        
        {/* Header Principal */}
        <div className="container-fluid">
          <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px' }}>
            <div className="card-header border-0 py-4" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px 20px 0 0'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-1 text-white fw-bold">Gestión de Registros Médicos</h3>
                  <p className="mb-0 text-white opacity-75">Administra y controla el registro médico y recién nacidos</p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3 text-white">
                    <small>
                      {showSearchResults ? 
                        `Encontrados: ${currentTotalRecords} registros` : 
                        `Total: ${totalRecords} registros`
                      }
                    </small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              {/* Sección de búsqueda y botón agregar */}
              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="search-container position-relative">
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '15px 0 0 15px',
                        color: 'white'
                      }}>
                        🔍
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 shadow-sm"
                        placeholder="Buscar por registro médico o recién nacido..."
                        value={searchTerm}
                        onChange={this.handleSearchChange}
                        style={{
                          borderRadius: '0 15px 15px 0',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #e9ecef'
                        }}
                      />
                      {searchTerm && (
                        <button
                          className="btn position-absolute end-0 top-50 translate-middle-y me-2"
                          onClick={this.clearSearch}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#6c757d',
                            zIndex: 10
                          }}
                          title="Limpiar búsqueda"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                    
                    {/* Indicador de búsqueda */}
                    {isSearching && (
                      <div className="position-absolute w-100 mt-2">
                        <div className="alert alert-info border-0 d-flex align-items-center" style={{ borderRadius: '10px' }}>
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          <span>Buscando...</span>
                        </div>
                      </div>
                    )}

                    {/* Indicador de resultados de búsqueda */}
                    {showSearchResults && !isSearching && (
                      <div className="position-absolute w-100 mt-2">
                        <div className="alert border-0 d-flex align-items-center justify-content-between" 
                             style={{ 
                               borderRadius: '10px',
                               background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                             }}>
                          <span>
                            📋 Mostrando resultados para: <strong>"{searchTerm}"</strong>
                          </span>
                          <button 
                            className="btn btn-sm"
                            onClick={this.clearSearch}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                          >
                            Ver todos
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <button 
                    className="btn btn-lg w-100 d-flex align-items-center justify-content-center"
                    onClick={() => {
                      this.setState({
                        form: { registro_medico: '', recien_nacido: '' },
                        tipoModal: 'insertar'
                      });
                      this.modalInsertar();
                    }}
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
                    ➕ Agregar Registro Médico
                  </button>
                </div>
              </div>

              {/* Espaciado adicional si hay indicadores de búsqueda */}
              {(isSearching || showSearchResults) && <div style={{ marginTop: '60px' }}></div>}

              {/* Tabla mejorada */}
              <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                  <table className="table table-hover mb-0 modern-table">
                    <thead>
                      <tr style={{ 
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      }}>
                        <th className="border-0 py-3 px-4 fw-bold text-white" style={{ borderRadius: '15px 0 0 0' }}>
                          📋 ID
                        </th>
                        <th className="border-0 py-3 px-4 fw-bold text-white">
                          👨‍⚕️ Registro Médico
                        </th>
                        <th className="border-0 py-3 px-4 fw-bold text-white">
                          👶 Recién Nacido
                        </th>
                        <th className="border-0 py-3 px-4 fw-bold text-white text-center" style={{ borderRadius: '0 15px 0 0' }}>
                          ⚙️ Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRegistros.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-5">
                            <div className="d-flex flex-column align-items-center">
                              <div className="mb-3" style={{ fontSize: '48px', opacity: 0.3 }}>
                                {showSearchResults ? '🔍' : '🏥'}
                              </div>
                              <h5 className="text-muted">
                                {showSearchResults ? 
                                  `No se encontraron registros para "${searchTerm}"` : 
                                  'No hay registros médicos disponibles'
                                }
                              </h5>
                              {showSearchResults && (
                                <button 
                                  className="btn btn-sm mt-2"
                                  onClick={this.clearSearch}
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px'
                                  }}
                                >
                                  Ver todos los registros
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentRegistros.map((registro, index) => {
                          return (
                            <tr key={registro.id_registro_medico} className="hover-row">
                              <td className="border-0 py-3 px-4">
                                <span className="badge rounded-pill px-3 py-2" style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white'
                                }}>
                                  {registro.id_registro_medico}
                                </span>
                              </td>
                              <td className="border-0 py-3 px-4">
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
                                    <span className="text-white" style={{ fontSize: '14px' }}>👨‍⚕️</span>
                                  </div>
                                  <span className="fw-semibold">{registro.registro_medico}</span>
                                </div>
                              </td>
                              <td className="border-0 py-3 px-4">
                                <div className="d-flex align-items-center">
                                  <div style={{
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    borderRadius: '50%',
                                    width: '35px',
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px'
                                  }}>
                                    <span className="text-white" style={{ fontSize: '14px' }}>👶</span>
                                  </div>
                                  <span className="fw-semibold">{registro.recien_nacido}</span>
                                </div>
                              </td>
                              <td className="border-0 py-3 px-4 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <button 
                                    className="btn btn-sm d-flex align-items-center"
                                    onClick={() => { this.seleccionarRegistro(registro); this.modalInsertar(); }}
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: 'white',
                                      padding: '8px 12px'
                                    }}
                                    title="Editar registro"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button 
                                    className="btn btn-sm d-flex align-items-center"
                                    onClick={() => { this.seleccionarRegistro(registro); this.setState({ modalEliminar: true }); }}
                                    style={{
                                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      color: 'white',
                                      padding: '8px 12px'
                                    }}
                                    title="Eliminar registro"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginador mejorado */}
              {currentTotalRecords > 0 && (
                <div className="d-flex justify-content-center mt-4">
                  <div className="custom-paginator">
                    <Paginator 
                      first={(currentPage - 1) * rows}
                      rows={rows}
                      totalRecords={currentTotalRecords}
                      onPageChange={this.onPageChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal para insertar/editar mejorado */}
        <Modal isOpen={this.state.modalInsertar} className="modern-modal">
          <ModalHeader className="border-0 pb-0">
            <div className="d-flex align-items-center">
              <div style={{
                background: this.state.tipoModal === 'insertar' ? 
                  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' :
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <span className="text-white" style={{ fontSize: '20px' }}>
                  {this.state.tipoModal === 'insertar' ? '➕' : '✏️'}
                </span>
              </div>
              <div>
                <h4 className="mb-1 fw-bold">
                  {this.state.tipoModal === 'insertar' ? 'Nuevo Registro Médico' : 'Editar Registro Médico'}
                </h4>
                <p className="text-muted mb-0">
                  {this.state.tipoModal === 'insertar' ? 
                    'Registra un nuevo registro médico en el sistema' : 
                    'Actualiza los datos del registro médico'
                  }
                </p>
              </div>
            </div>
          </ModalHeader>
          
          <ModalBody className="px-4 py-3">
            <div className="row">
              <div className="col-12">
                {this.state.tipoModal === 'actualizar' && (
                  <div className="form-group mb-3">
                    <label htmlFor="id_registro_medico" className="form-label fw-semibold">
                      🆔 ID del Registro
                    </label>
                    <input 
                      className="form-control" 
                      type="text" 
                      name="id_registro_medico" 
                      id="id_registro_medico" 
                      readOnly 
                      value={form.id_registro_medico || ''}
                      style={{
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        padding: '12px',
                        background: '#f8f9fa'
                      }}
                    />
                  </div>
                )}
                
                <div className="form-group mb-3">
                  <label htmlFor="registro_medico" className="form-label fw-semibold">
                    👨‍⚕️ Registro Médico
                  </label>
                  <input 
                    className="form-control" 
                    type="text" 
                    name="registro_medico" 
                    id="registro_medico" 
                    placeholder="Ingrese el número de registro médico..."
                    onChange={this.handleChange} 
                    value={form.registro_medico || ''}
                    style={{
                      borderRadius: '10px',
                      border: errors.registro_medico ? '2px solid #dc3545' : '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  />
                  {errors.registro_medico && (
                    <div className="alert alert-danger mt-2 border-0" style={{ borderRadius: '10px', padding: '8px 12px' }}>
                      ⚠️ {errors.registro_medico}
                    </div>
                  )}
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="recien_nacido" className="form-label fw-semibold">
                    👶 Recién Nacido
                  </label>
                  <input 
                    className="form-control" 
                    type="text" 
                    name="recien_nacido" 
                    id="recien_nacido" 
                    placeholder="Ingrese información del recién nacido..."
                    onChange={this.handleChange} 
                    value={form.recien_nacido || ''}
                    style={{
                      borderRadius: '10px',
                      border: errors.recien_nacido ? '2px solid #dc3545' : '2px solid #e9ecef',
                      padding: '12px'
                    }}
                  />
                  {errors.recien_nacido && (
                    <div className="alert alert-danger mt-2 border-0" style={{ borderRadius: '10px', padding: '8px 12px' }}>
                      ⚠️ {errors.recien_nacido}
                    </div>
                  )}
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
                  ➕ Crear Registro
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
                  ✏️ Actualizar
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

        {/* Modal de eliminar mejorado */}
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
                <span className="text-white" style={{ fontSize: '20px' }}>⚠️</span>
              </div>
              <div>
                <h4 className="mb-1 fw-bold text-danger">Confirmar Eliminación</h4>
                <p className="text-muted mb-0">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </ModalHeader>
          
          <ModalBody className="px-4 py-3">
            <div className="text-center">
              <div className="alert border-0 mb-3" 
                   style={{ 
                     background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
                     borderRadius: '15px'
                   }}>
                <div className="d-flex align-items-center justify-content-center">
                  <div className="me-3" style={{ fontSize: '24px' }}>🗑️</div>
                  <div>
                    <strong className="text-danger">
                      ¿Está seguro que desea eliminar este registro médico?
                    </strong>
                    <div className="mt-2">
                      <span className="badge bg-danger px-3 py-2 rounded-pill">
                        {form && form.registro_medico}
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
                onClick={this.peticionDelete}
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
                🗑️ Sí, Eliminar
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

        {/* Estilos CSS adicionales */}
        <style jsx>{`
          .modern-table .hover-row:hover {
            background-color: rgba(102, 126, 234, 0.05);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
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
            .d-flex.gap-3 {
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

export default ShowRegistroMedico;