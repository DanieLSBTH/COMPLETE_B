// ShowUsuario.js
import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "http://localhost:8080/api/usuarios/";

class ShowUsuario extends Component {
  state = {
    usuarios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_usuario: '',
      nombre: '',
      correo: '',
      contrasena: '',
      tipoModal: ''
    },
    errors: {},
    totalRecords: 0,
    page: 1,
    rows: 10
  };

  componentDidMount() {
    this.peticionGet();
  }

  peticionGet = () => {
    const { page, rows } = this.state;
    axios.get(`${url}?page=${page}&limit=${rows}`).then(response => {
      this.setState({
        usuarios: response.data.usuarios || response.data,
        totalRecords: response.data.totalRecords || response.data.length
      });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
    });
  }

  onPageChange = (event) => {
    this.setState({ page: event.page + 1 }, this.peticionGet);
  }

  peticionPost = async () => {
    if (this.validarFormulario()) {
      const formData = { ...this.state.form };
      delete formData.id_usuario;
      delete formData.tipoModal;
      
      try {
        const response = await axios.post(url + 'registrar', formData);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Usuario creado exitosamente', 'success');
      } catch (error) {
        console.error('Error al crear el usuario:', error);
        const mensaje = error.response?.data?.mensaje || 'No se pudo crear el usuario';
        Swal.fire('Error', mensaje, 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      const formData = { ...this.state.form };
      delete formData.tipoModal;
      
      // Si no se proporciona contraseña, no enviarla
      if (!formData.contrasena || formData.contrasena.trim() === '') {
        delete formData.contrasena;
      }
      
      try {
        await axios.put(url + this.state.form.id_usuario, formData);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
      } catch (error) {
        console.error('Error al actualizar:', error);
        const mensaje = error.response?.data?.mensaje || 'No se pudo actualizar el usuario';
        Swal.fire('Error', mensaje, 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      await axios.delete(url + this.state.form.id_usuario);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Usuario eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      const mensaje = error.response?.data?.mensaje || 'No se pudo eliminar el usuario';
      Swal.fire('Error', mensaje, 'error');
    }
  }

  validarFormulario = () => {
    const { nombre, correo, contrasena } = this.state.form;
    const { tipoModal } = this.state;
    let errors = {};
    let formIsValid = true;

    // Validar nombre
    if (!nombre || nombre.trim() === '') {
      formIsValid = false;
      errors["nombre"] = "El nombre es requerido";
    } else if (nombre.length > 50) {
      formIsValid = false;
      errors["nombre"] = "El nombre no puede exceder 50 caracteres";
    }

    // Validar correo
    if (!correo || correo.trim() === '') {
      formIsValid = false;
      errors["correo"] = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      formIsValid = false;
      errors["correo"] = "El formato del correo no es válido";
    }

    // Validar contraseña (solo requerida al insertar)
    if (tipoModal === 'insertar' && (!contrasena || contrasena.trim() === '')) {
      formIsValid = false;
      errors["contrasena"] = "La contraseña es requerida";
    } else if (contrasena && contrasena.length < 6) {
      formIsValid = false;
      errors["contrasena"] = "La contraseña debe tener al menos 6 caracteres";
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

  seleccionarUsuario = (usuario) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        contrasena: '' // No mostrar la contraseña actual
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

  render() {
    const { form, errors, usuarios, totalRecords, rows, page } = this.state;

    return (
      <>
        <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg,rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', minHeight: '100vh' }}>
          
          {/* Header Card */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card hover-card" style={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="text-gradient mb-0" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
                        <i className="fas fa-users me-3"></i>Gestión de Usuarios
                      </h2>
                      <p className="text-muted mb-0">Administra los usuarios del sistema</p>
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
                          form: { nombre: '', correo: '', contrasena: '' }, 
                          tipoModal: 'insertar', 
                          errors: {} 
                        }); 
                        this.modalInsertar() 
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>Agregar Usuario
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
                            <i className="fas fa-envelope me-2"></i>Correo
                          </th>
                          <th style={{ color: 'white', fontWeight: '600', padding: '20px', borderTopRightRadius: '20px', border: 'none' }}>
                            <i className="fas fa-cogs me-2"></i>Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario, index) => (
                          <tr key={usuario.id_usuario} className="hover-row" style={{ transition: 'all 0.2s ease' }}>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>
                              <span className="badge" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', color: 'white', padding: '8px 12px', borderRadius: '15px' }}>
                                {usuario.id_usuario}
                              </span>
                            </td>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle me-3" style={{
                                  background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <i className="fas fa-user text-white" style={{ fontSize: '14px' }}></i>
                                </div>
                                <div>
                                  <div className="fw-bold">{usuario.nombre}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '15px 20px', border: 'none', fontWeight: '500' }}>
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle me-3" style={{
                                  background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <i className="fas fa-envelope text-white" style={{ fontSize: '14px' }}></i>
                                </div>
                                <div>
                                  <div className="fw-bold">{usuario.correo}</div>
                                </div>
                              </div>
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
                                onClick={() => { this.seleccionarUsuario(usuario); this.modalInsertar() }}
                              >
                                <i className="fas fa-edit me-1"></i>Editar
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
              {this.state.tipoModal === 'insertar' ? 'Agregar Usuario' : 'Editar Usuario'}
            </ModalHeader>
            <ModalBody style={{ padding: '30px' }}>
              <div className="container-fluid">
                <div className="form-group mb-3">
                  <label htmlFor="id_usuario" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                    <i className="fas fa-hashtag me-2"></i>ID
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="text" 
                    name="id_usuario" 
                    id="id_usuario" 
                    readOnly 
                    value={form ? form.id_usuario : ''}
                    style={{ 
                      borderRadius: '15px',
                      border: '2px solid #e0e6ed',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
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
                
                <div className="form-group mb-3">
                  <label htmlFor="correo" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                    <i className="fas fa-envelope me-2"></i>Correo
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="email" 
                    name="correo" 
                    id="correo" 
                    onChange={this.handleChange} 
                    value={form ? form.correo : ''}
                    style={{ 
                      borderRadius: '15px',
                      border: errors.correo ? '2px solid #ff6b6b' : '2px solid #e0e6ed',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {errors.correo && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle me-1"></i>{errors.correo}</div>}
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="contrasena" className="form-label" style={{ fontWeight: '600', color: '#667eea' }}>
                    <i className="fas fa-lock me-2"></i>Contraseña
                    {this.state.tipoModal === 'actualizar' && <small className="text-muted ms-2">(Dejar vacío para mantener la actual)</small>}
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="password" 
                    name="contrasena" 
                    id="contrasena" 
                    onChange={this.handleChange} 
                    value={form ? form.contrasena : ''}
                    style={{ 
                      borderRadius: '15px',
                      border: errors.contrasena ? '2px solid #ff6b6b' : '2px solid #e0e6ed',
                      padding: '12px 16px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  {errors.contrasena && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle me-1"></i>{errors.contrasena}</div>}
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
          .avatar-circle {
            transition: all 0.3s ease;
          }
          .hover-row:hover .avatar-circle {
            transform: scale(1.1);
          }
          @media (max-width: 768px) {
            .table-responsive {
              font-size: 0.875rem;
            }
            .hover-card {
              margin: 10px;
            }
            .avatar-circle {
              width: 30px !important;
              height: 30px !important;
            }
            .avatar-circle i {
              font-size: 12px !important;
            }
            .btn-sm {
              padding: 6px 12px !important;
              font-size: 12px !important;
            }
          }
        `}</style>
      </>
    );
  }
}

export default ShowUsuario;