import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "http://localhost:8080/api/personal/";

class ShowPersonal extends Component {
  state = {
    personal: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_personal: '',
      nombre: '',
      apellido: '',
      puesto: '',
      tipoModal: ''
    },
    errors: {},
    // Estados para la paginación
    totalRecords: 0,
    page: 1,
    rows: 10, // Número de registros por página
  }

  // Método modificado para soportar paginación
  peticionGet = () => {
    const { page, rows } = this.state;
    axios.get(`${url}?page=${page}&limit=${rows}`).then(response => {
      this.setState({ 
        personal: response.data.personal,// Asigna directamente los datos de personal
        totalRecords: response.data.totalRecords // Asegúrate de que estás obteniendo el total de registros
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de personal', 'error');
    });
  }
  

  onPageChange = (event) => {
    this.setState({ page: event.page + 1 }, () => {
      this.peticionGet(); // Actualiza los datos cuando se cambia de página
    });
  }
  

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_personal;
      try {
        await axios.post(url, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Personal creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creating personal:', error);
        Swal.fire('Error', 'Error al crear el personal', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
        await axios.put(url + this.state.form.id_personal, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Personal actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating personal:', error);
        Swal.fire('Error', 'Error al actualizar el personal', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_personal);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Personal eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting personal:', error);
      Swal.fire('Error', 'Error al eliminar el personal', 'error');
    }
  }

  validarFormulario = () => {
    const { nombre, apellido, puesto } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!nombre || nombre.trim() === '') {
      formIsValid = false;
      errors["nombre"] = "El nombre es requerido";
    } else if (nombre.length > 50) {
      formIsValid = false;
      errors["nombre"] = "El nombre no puede exceder 50 caracteres";
    }

    if (!apellido || apellido.trim() === '') {
      formIsValid = false;
      errors["apellido"] = "El apellido es requerido";
    } else if (apellido.length > 50) {
      formIsValid = false;
      errors["apellido"] = "El apellido no puede exceder 50 caracteres";
    }

    if (!puesto || puesto.trim() === '') {
      formIsValid = false;
      errors["puesto"] = "El puesto es requerido";
    } else if (puesto.length > 100) {
      formIsValid = false;
      errors["puesto"] = "El puesto no puede exceder 100 caracteres";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }

  modalInsertar = () => {
    this.setState(prevState => ({
      modalInsertar: !prevState.modalInsertar,
      errors: {}
    }));
  }

  seleccionarPersonal = (personal) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_personal: personal.id_personal,
        nombre: personal.nombre,
        apellido: personal.apellido,
        puesto: personal.puesto
      },
      errors: {}
    })
  }

  handleChange = async (e) => {
    const { name, value } = e.target;
    await this.setState(prevState => ({
      form: {
        ...prevState.form,
        [name]: value
      }
    }));
    this.validarFormulario();
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form, errors, personal, totalRecords, rows, page } = this.state;
    return (
      <>
        <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg,rgba(102, 126, 234, 0) 0%, #7rgba(118, 75, 162, 0)0%)', minHeight: '100vh' }}>
          
          {/* Header Card */}
          
          <div className="row mb-4">
            <div className="col-12">
              <div className="card hover-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="text-gradient mb-0" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                        <i className="fas fa-users me-3"></i>Gestión de Personal
                      </h2>
                      <p className="text-muted mb-0">Administra tu equipo de trabajo</p>
                    </div>
                    <button 
                      className="btn btn-gradient-primary px-4 py-2" 
                      style={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        border: 'none',
                        borderRadius: '25px',
                        color: 'white',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => { 
                        this.setState({ 
                          form: { nombre: '', apellido: '', puesto: '' }, 
                          tipoModal: 'insertar', 
                          errors: {} 
                        }); 
                        this.modalInsertar() 
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>Agregar Personal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="row">
            <div className="col-12">
              <div className="card hover-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table modern-table mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                        <tr>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', borderTopLeftRadius: '20px', border: 'none' }}>
                            <i className="fas fa-hashtag me-2"></i>ID
                          </th>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', border: 'none' }}>
                            <i className="fas fa-user me-2"></i>Nombre
                          </th>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', border: 'none' }}>
                            <i className="fas fa-user-tag me-2"></i>Apellido
                          </th>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', border: 'none' }}>
                            <i className="fas fa-briefcase me-2"></i>Puesto
                          </th>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', borderTopRightRadius: '20px', border: 'none' }}>
                            <i className="fas fa-cogs me-2"></i>Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {personal.map((persona, index) => (
                          <tr key={persona.id_personal} className="hover-row" style={{ transition: 'all 0.2s ease' }}>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>
                              <span className="badge" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', padding: '8px 12px', borderRadius: '15px' }}>
                                {persona.id_personal}
                              </span>
                            </td>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>{persona.nombre}</td>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>{persona.apellido}</td>
                            <td style={{ padding: '15px 20px', border: 'none' }}>
                              <span className="badge bg-light text-dark" style={{ padding: '8px 12px', borderRadius: '15px', fontWeight: '500' }}>
                                {persona.puesto}
                              </span>
                            </td>
                            <td style={{ padding: '15px 20px', border: 'none' }}>
                              <button 
                                className="btn btn-sm me-2" 
                                style={{ 
                                  background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                                  border: 'none',
                                  borderRadius: '15px',
                                  color: 'white',
                                  padding: '8px 15px',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => { this.seleccionarPersonal(persona); this.modalInsertar() }}
                              >
                                <i className="fas fa-edit me-1"></i>Editar
                              </button>
                              <button 
                                className="btn btn-sm"
                                style={{ 
                                  background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                                  border: 'none',
                                  borderRadius: '15px',
                                  color: 'white',
                                  padding: '8px 15px',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => { this.seleccionarPersonal(persona); this.setState({ modalEliminar: true }) }}
                              >
                                <i className="fas fa-trash me-1"></i>Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="p-4">
                    <Paginator 
                      first={(page - 1) * rows} 
                      rows={rows} 
                      totalRecords={totalRecords} 
                      onPageChange={this.onPageChange}
                      className="p-paginator-modern"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Insertar/Editar */}
          <Modal isOpen={this.state.modalInsertar} toggle={this.modalInsertar} className="modal-modern">
            <ModalHeader 
              toggle={this.modalInsertar}
              style={{ 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem',
                border: 'none'
              }}
            >
              <i className={`fas ${this.state.tipoModal === 'insertar' ? 'fa-plus-circle' : 'fa-edit'} me-2`}></i>
              {this.state.tipoModal === 'insertar' ? 'Agregar Personal' : 'Editar Personal'}
            </ModalHeader>
            <ModalBody style={{ padding: '30px' }}>
              <div className="container-fluid">
                <div className="form-group mb-3">
                  <label htmlFor="id_personal" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                    <i className="fas fa-hashtag me-2"></i>ID
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="text" 
                    name="id_personal" 
                    id="id_personal" 
                    readOnly 
                    value={form ? form.id_personal : this.state.personal.length + 1}
                    style={{ 
                      borderRadius: '15px',
                      border: '2px solid #e0e6ed',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="nombre" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                        <i className="fas fa-user me-2"></i>Nombre
                      </label>
                      <input 
                        className="form-control modern-input" 
                        type="text" 
                        name="nombre" 
                        id="nombre" 
                        onChange={this.handleChange} 
                        value={form ? form.nombre : ''}
                        style={{ 
                          borderRadius: '15px',
                          border: errors.nombre ? '2px solid #ff6b6b' : '2px solid #e0e6ed',
                          padding: '12px 16px',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      {errors.nombre && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle me-1"></i>{errors.nombre}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label htmlFor="apellido" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                        <i className="fas fa-user-tag me-2"></i>Apellido
                      </label>
                      <input 
                        className="form-control modern-input" 
                        type="text" 
                        name="apellido" 
                        id="apellido" 
                        onChange={this.handleChange} 
                        value={form ? form.apellido : ''}
                        style={{ 
                          borderRadius: '15px',
                          border: errors.apellido ? '2px solid #ff6b6b' : '2px solid #e0e6ed',
                          padding: '12px 16px',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      {errors.apellido && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle me-1"></i>{errors.apellido}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="puesto" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                    <i className="fas fa-briefcase me-2"></i>Puesto
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="text" 
                    name="puesto" 
                    id="puesto" 
                    onChange={this.handleChange} 
                    value={form ? form.puesto : ''}
                    style={{ 
                      borderRadius: '15px',
                      border: errors.puesto ? '2px solid #ff6b6b' : '2px solid #e0e6ed',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {errors.puesto && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle me-1"></i>{errors.puesto}</div>}
                </div>
              </div>
            </ModalBody>
            <ModalFooter style={{ padding: '20px 30px', borderTop: '1px solid #e0e6ed' }}>
              {this.state.tipoModal === 'insertar' ?
                <button 
                  className="btn btn-gradient-primary me-2" 
                  onClick={this.peticionPost}
                  style={{ 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '15px',
                    color: 'white',
                    padding: '10px 25px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-save me-2"></i>Guardar
                </button> :
                <button 
                  className="btn btn-gradient-primary me-2" 
                  onClick={this.peticionPut}
                  style={{ 
                    background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                    border: 'none',
                    borderRadius: '15px',
                    color: 'white',
                    padding: '10px 25px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="fas fa-edit me-2"></i>Actualizar
                </button>
              }
              <button 
                className="btn btn-secondary" 
                onClick={this.modalInsertar}
                style={{ 
                  background: '#6c757d',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  padding: '10px 25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </ModalFooter>
          </Modal>

          {/* Modal Eliminar */}
          <Modal isOpen={this.state.modalEliminar} className="modal-modern">
            <ModalBody style={{ padding: '40px', textAlign: 'center' }}>
              <div className="mb-4">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: '#ff6b6b' }}></i>
              </div>
              <h4 style={{ color: '#495057', marginBottom: '20px' }}>¿Confirmar eliminación?</h4>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                ¿Estás seguro de que deseas eliminar el registro de <strong>{form && form.nombre} {form && form.apellido}</strong>?
              </p>
              <p style={{ color: '#dc3545', fontSize: '0.9rem' }}>Esta acción no se puede deshacer.</p>
            </ModalBody>
            <ModalFooter style={{ padding: '20px 40px', borderTop: '1px solid #e0e6ed', justifyContent: 'center' }}>
              <button 
                className="btn me-3" 
                onClick={this.peticionDelete}
                style={{ 
                  background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  padding: '10px 25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-trash me-2"></i>Eliminar
              </button>
              <button 
                className="btn" 
                onClick={() => this.setState({ modalEliminar: false })}
                style={{ 
                  background: '#6c757d',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  padding: '10px 25px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-times me-2"></i>Cancelar
              </button>
            </ModalFooter>
          </Modal>
        </div>

        {/* Estilos CSS mejorados */}
        <style jsx>{`
          .hover-card {
            transition: all 0.3s ease;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15) !important;
          }
          .hover-row {
            transition: all 0.2s ease;
          }
          .hover-row:hover {
            background: linear-gradient(45deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)) !important;
            transform: scale(1.01);
          }
          .modern-table {
            border-collapse: separate;
            border-spacing: 0;
          }
          .modern-table tbody tr:last-child td:first-child {
            border-bottom-left-radius: 20px;
          }
          .modern-table tbody tr:last-child td:last-child {
            border-bottom-right-radius: 20px;
          }
          .modern-input:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
            outline: none;
          }
          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
          }
          .modal-modern .modal-content {
            border-radius: 1rem;
            border: none;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
          }
          .p-paginator-modern {
            border: none !important;
            background: transparent !important;
          }
          .p-paginator-modern .p-paginator-pages .p-paginator-page {
            border-radius: 50% !important;
            margin: 0 5px !important;
            transition: all 0.3s ease !important;
          }
          .p-paginator-modern .p-paginator-pages .p-paginator-page.p-highlight {
            background: linear-gradient(45deg, #667eea, #764ba2) !important;
            color: white !important;
          }
          @media (max-width: 768px) {
            .table-responsive {
              font-size: 0.875rem;
            }
            .hover-card {
              margin: 10px;
            }
          }
        `}</style>
      </>
    );
  }
}

export default ShowPersonal;