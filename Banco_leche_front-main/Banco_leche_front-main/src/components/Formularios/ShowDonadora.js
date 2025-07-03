import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator';

const url = "http://localhost:8080/api/donadora/";

class ShowDonadora extends Component {
  state = {
    donadoras: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_donadora: '',
      nombre: '',
      apellido: '',
      tipoModal: ''
    },
    totalRecords: 0,
    currentPage: 1,
    rowsPerPage: 10,
    // Nuevos estados para la búsqueda
    searchTerm: '',
    isSearching: false,
    searchTimeout: null
  }

  // Función para obtener los registros con paginación (sin búsqueda)
  peticionGet = async () => {
    const { currentPage, rowsPerPage } = this.state;
    try {
      const response = await axios.get(`${url}?page=${currentPage}&limit=${rowsPerPage}`);
      this.setState({ 
        donadoras: response.data.donadoras,
        totalRecords: response.data.totalRecords,
        isSearching: false
      });
    } catch (error) {
      console.error('Error al obtener donadoras:', error);
      Swal.fire('Error', 'Error al cargar las donadoras', 'error');
    }
  }

  // Nueva función para búsqueda
  peticionSearch = async (searchTerm = '') => {
    const { currentPage, rowsPerPage } = this.state;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      // Si no hay término de búsqueda válido, mostrar todos los registros
      this.peticionGet();
      return;
    }

    try {
      const response = await axios.get(`${url}search/advanced`, {
        params: {
          q: searchTerm.trim(),
          page: currentPage,
          limit: rowsPerPage
        }
      });

      this.setState({ 
        donadoras: response.data.donadoras,
        totalRecords: response.data.totalRecords,
        isSearching: true
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      Swal.fire('Error', 'Error al realizar la búsqueda', 'error');
    }
  }

  // Función para manejar el cambio en el campo de búsqueda con debounce
  handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    this.setState({ searchTerm });

    // Limpiar el timeout anterior
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }

    // Crear un nuevo timeout para la búsqueda
    const newTimeout = setTimeout(() => {
      this.setState({ currentPage: 1 }, () => {
        this.peticionSearch(searchTerm);
      });
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    this.setState({ searchTimeout: newTimeout });
  }

  // Función para limpiar la búsqueda
  clearSearch = () => {
    this.setState({ 
      searchTerm: '', 
      currentPage: 1,
      isSearching: false 
    }, () => {
      this.peticionGet();
    });
  }

  peticionPost = async () => {
    if (!this.validarFormulario()) return;

    delete this.state.form.id_donadora;
    try {
      await axios.post(url, this.state.form);
      this.modalInsertar();
      // Después de insertar, recargar la lista actual (búsqueda o todos)
      this.recargarLista();
      Swal.fire('Éxito', 'Donadora creada exitosamente', 'success');
    } catch (error) {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la donadora', 'error');
    }
  }

  peticionPut = async () => {
    if (!this.validarFormulario()) return;

    try {
      await axios.put(url + this.state.form.id_donadora, this.state.form);
      this.modalInsertar();
      // Después de actualizar, recargar la lista actual (búsqueda o todos)
      this.recargarLista();
      Swal.fire('Éxito', 'Donadora actualizada exitosamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'Error al actualizar la donadora', 'error');
      console.log(error.message);
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_donadora);
      this.setState({ modalEliminar: false });
      // Después de eliminar, recargar la lista actual (búsqueda o todos)
      this.recargarLista();
      Swal.fire('Éxito', 'Donadora eliminada exitosamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'Error al eliminar la donadora', 'error');
      console.log(error.message);
    }
  }

  // Función auxiliar para recargar la lista apropiada
  recargarLista = () => {
    if (this.state.isSearching && this.state.searchTerm) {
      this.peticionSearch(this.state.searchTerm);
    } else {
      this.peticionGet();
    }
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarDonadora = (donadora) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_donadora: donadora.id_donadora,
        nombre: donadora.nombre,
        apellido: donadora.apellido
      }
    })
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

    const { nombre, apellido } = form;
    if (!nombre || !apellido) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return false;
    }

    return true;
  }

  onPageChange = (event) => {
    this.setState(
      { currentPage: event.page + 1 },
      () => {
        // Determinar si recargar con búsqueda o sin ella
        this.recargarLista();
      }
    );
  }

  componentDidMount() {
    this.peticionGet();
  }

  componentWillUnmount() {
    // Limpiar el timeout si el componente se desmonta
    if (this.state.searchTimeout) {
      clearTimeout(this.state.searchTimeout);
    }
  }

  render() {
    const { form, totalRecords, rowsPerPage, currentPage, donadoras, searchTerm, isSearching } = this.state;
    
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
              <h3 className="mb-1 text-white fw-bold">Gestión de Donadoras</h3>
              <p className="mb-0 text-white opacity-75">Administra y controla el registro de donadoras</p>
            </div>
            <div className="d-flex align-items-center">
              <div className="me-3 text-white">
                <small>Total: {totalRecords} donadoras</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body p-4">
          {/* Sección de búsqueda mejorada */}
          <div className="row mb-4">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-body p-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="🔍 Buscar por nombre o apellido..."
                      value={searchTerm}
                      onChange={this.handleSearchChange}
                      style={{
                        borderRadius: '10px 0 0 10px',
                        background: '#f8f9fa',
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                    />
                    {searchTerm && (
                      <div className="input-group-append">
                        <button 
                          className="btn border-0" 
                          type="button"
                          onClick={this.clearSearch}
                          style={{
                            borderRadius: '0 10px 10px 0',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white'
                          }}
                          title="Limpiar búsqueda"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  {isSearching && (
                    <small className="text-muted mt-2 d-block">
                      📊 Mostrando resultados de: <strong>"{searchTerm}"</strong>
                    </small>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-lg w-100 d-flex align-items-center justify-content-center"
                onClick={() => { 
                  this.setState({ form: null, tipoModal: 'insertar' }); 
                  this.modalInsertar() 
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
                ➕ Agregar Donadora
              </button>
            </div>
          </div>

          {/* Tabla mejorada */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0 modern-table">
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  }}>
                    <th className="border-0 py-3 px-4 fw-bold text-white" style={{ borderRadius: '15px 0 0 0' }}>
                      📋 No.
                    </th>
                    <th className="border-0 py-3 px-4 fw-bold text-white">
                      👤 Nombre
                    </th>
                    <th className="border-0 py-3 px-4 fw-bold text-white">
                      📝 Apellido
                    </th>
                    <th className="border-0 py-3 px-4 fw-bold text-white text-center" style={{ borderRadius: '0 15px 0 0' }}>
                      ⚙️ Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {donadoras.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <div className="mb-3" style={{ fontSize: '48px', opacity: 0.3 }}>
                            📋
                          </div>
                          <h5 className="text-muted">
                            {isSearching ? 
                              `No se encontraron resultados para "${searchTerm}"` : 
                              'No hay donadoras registradas'
                            }
                          </h5>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    donadoras.map((donadora, index) => {
                      return (
                        <tr key={donadora.id_donadora} className="hover-row">
                          <td className="border-0 py-3 px-4">
                            <span className="badge rounded-pill px-3 py-2" style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white'
                            }}>
                              {index + 1 + (currentPage - 1) * rowsPerPage}
                            </span>
                          </td>
                          <td className="border-0 py-3 px-4">
                            <div className="d-flex align-items-center">
                              
                              <span className="fw-semibold">{donadora.nombre}</span>
                            </div>
                          </td>
                          <td className="border-0 py-3 px-4 fw-semibold">
                            {donadora.apellido}
                          </td>
                          <td className="border-0 py-3 px-4 text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-sm d-flex align-items-center"
                                onClick={() => { 
                                  this.seleccionarDonadora(donadora); 
                                  this.modalInsertar() 
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                  color: 'white',
                                  padding: '8px 12px'
                                }}
                                title="Editar donadora"
                              >
                                ✏️
                              </button>
                              <button 
                                className="btn btn-sm d-flex align-items-center"
                                onClick={() => { 
                                  this.seleccionarDonadora(donadora); 
                                  this.setState({ modalEliminar: true }) 
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                  border: 'none',
                                  borderRadius: '10px',
                                  color: 'white',
                                  padding: '8px 12px'
                                }}
                                title="Eliminar donadora"
                              >
                                🗑️
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
          {totalRecords > 0 && (
            <div className="d-flex justify-content-center mt-4">
              <div className="custom-paginator">
                <Paginator
                  first={(currentPage - 1) * rowsPerPage}
                  rows={rowsPerPage}
                  totalRecords={totalRecords}
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
              {this.state.tipoModal === 'insertar' ? 'Nueva Donadora' : 'Editar Donadora'}
            </h4>
            <p className="text-muted mb-0">
              {this.state.tipoModal === 'insertar' ? 
                'Registra una nueva donadora en el sistema' : 
                'Actualiza los datos de la donadora'
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
                <label htmlFor="id_donadora" className="form-label fw-semibold">
                  🆔 ID de Donadora
                </label>
                <input 
                  className="form-control" 
                  type="text" 
                  name="id_donadora" 
                  id="id_donadora" 
                  readOnly 
                  onChange={this.handleChange} 
                  value={form ? form.id_donadora : ''}
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
              <label htmlFor="nombre" className="form-label fw-semibold">
                👤 Nombre
              </label>
              <input 
                className="form-control" 
                type="text" 
                name="nombre" 
                id="nombre" 
                placeholder="Ingrese el nombre..."
                onChange={this.handleChange} 
                value={form ? form.nombre : ''}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  padding: '12px'
                }}
              />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="apellido" className="form-label fw-semibold">
                📝 Apellido
              </label>
              <input 
                className="form-control" 
                type="text" 
                name="apellido" 
                id="apellido" 
                placeholder="Ingrese el apellido..."
                onChange={this.handleChange} 
                value={form ? form.apellido : ''}
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
      
      <ModalFooter className="border-0 pt-0">
        <div className="d-flex gap-3 w-100 justify-content-end">
          {this.state.tipoModal === 'insertar' ? 
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={() => this.peticionPost()}
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
              ➕ Crear Donadora
            </button> :
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={() => this.peticionPut()}
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
            onClick={() => this.modalInsertar()}
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
                  ¿Está seguro que desea eliminar a la donadora?
                </strong>
                <div className="mt-2">
                  <span className="badge bg-danger px-3 py-2 rounded-pill">
                    {form && `${form.nombre} ${form.apellido}`}
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

export default ShowDonadora;