import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { get, post, put, del } from '../../services/api';
import { MdHealthAndSafety } from 'react-icons/md';
const url = "servicio_in/";

class ShowServicioIn extends Component {
  state = {
    servicios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_intrahospitalario: '',
      servicio: '',
      tipoModal: ''
    },
    errors: {}
  }

  peticionGet = () => {
    get(url).then(response => {
      this.setState({ servicios: response.data });
    }).catch(error => {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'No se pudieron cargar los servicios', 'error');
    })
  }

  peticionPost = async () => {
    if (this.validarFormulario()) {
      delete this.state.form.id_intrahospitalario;
      try {
        await post(url, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Servicio creado exitosamente', 'success');
      } catch (error) {
        console.error('Error creating service:', error);
        Swal.fire('Error', 'Error al crear el servicio', 'error');
      }
    }
  }

  peticionPut = async () => {
    if (this.validarFormulario()) {
      try {
         put(url + this.state.form.id_intrahospitalario, this.state.form);
        this.modalInsertar();
        this.peticionGet();
        Swal.fire('Éxito', 'Servicio actualizado exitosamente', 'success');
      } catch (error) {
        console.error('Error updating service:', error);
        Swal.fire('Error', 'Error al actualizar el servicio', 'error');
      }
    }
  }

  peticionDelete = async () => {
    try {
      del(url + this.state.form.id_intrahospitalario);
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Servicio eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting service:', error);
      Swal.fire('Error', 'Error al eliminar el servicio', 'error');
    }
  }

  validarFormulario = () => {
    const { servicio } = this.state.form;
    let errors = {};
    let formIsValid = true;

    if (!servicio || servicio.trim() === '') {
      formIsValid = false;
      errors["servicio"] = "El nombre del servicio es requerido";
    } else if (servicio.length > 50) {
      formIsValid = false;
      errors["servicio"] = "El nombre del servicio no puede exceder 50 caracteres";
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

  seleccionarServicio = (servicio) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_intrahospitalario: servicio.id_intrahospitalario,
        servicio: servicio.servicio,
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
    const { form, errors } = this.state;
    return (
      <div className="container-fluid px-4">
        {/* Estilos CSS adicionales */}
        <style jsx>{`
          .hover-card {
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 15px;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
          
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4) !important;
          }
          
          .hover-row {
            transition: all 0.2s ease;
            border-radius: 12px;
            margin-bottom: 8px;
          }
          
          .hover-row:hover {
            background-color: rgba(102, 126, 234, 0.05);
            transform: scale(1.01);
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .modern-table {
            border-collapse: separate;
            border-spacing: 0 8px;
            background: transparent;
          }
          
          .modern-table thead th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
          }
          
          .modern-table thead th:first-child {
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
          }
          
          .modern-table thead th:last-child {
            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
          }
          
          .modern-table tbody td {
            background: white;
            border: none;
            padding: 15px;
            vertical-align: middle;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .modern-table tbody tr:first-child td:first-child {
            border-top-left-radius: 12px;
          }
          
          .modern-table tbody tr:first-child td:last-child {
            border-top-right-radius: 12px;
          }
          
          .modern-table tbody tr:last-child td:first-child {
            border-bottom-left-radius: 12px;
          }
          
          .modern-table tbody tr:last-child td:last-child {
            border-bottom-right-radius: 12px;
          }
          
          .modern-input {
            border-radius: 12px;
            border: 2px solid #e9ecef;
            padding: 12px 18px;
            transition: all 0.3s ease;
            font-size: 1rem;
          }
          
          .modern-input:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
            outline: none;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            padding: 10px 25px;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          
          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
            color: white;
          }
          
          .btn-gradient-success {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            border: none;
            border-radius: 12px;
            padding: 10px 25px;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
          }
          
          .btn-gradient-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4) !important;
            color: white;
          }
          
          .btn-gradient-danger {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            border: none;
            border-radius: 12px;
            padding: 8px 20px;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
          }
          
          .btn-gradient-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4) !important;
            color: white;
          }
          
          .btn-modern-secondary {
            background: #6c757d;
            border: none;
            border-radius: 12px;
            padding: 10px 25px;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
          }
          
          .btn-modern-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4) !important;
            color: white;
            background: #5a6268;
          }
          
          .modal-modern .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .modal-modern .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 20px 30px;
          }
          
          .modal-modern .modal-header .close {
            color: white;
            opacity: 0.8;
            font-size: 1.5rem;
          }
          
          .modal-modern .modal-header .close:hover {
            opacity: 1;
          }
          
          .modal-modern .modal-body {
            padding: 30px;
            background: #f8f9fa;
          }
          
          .modal-modern .modal-footer {
            padding: 20px 30px;
            border: none;
            background: white;
          }
          
          .main-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
          }
          
          .table-container {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            margin-top: 20px;
          }
          
          .error-message {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 5px;
            padding: 5px 10px;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 8px;
            border-left: 3px solid #dc3545;
          }
          
          @media (max-width: 768px) {
            .table-responsive {
              font-size: 0.875rem;
            }
            .modern-table tbody td {
              padding: 10px;
            }
            .btn-gradient-primary, .btn-gradient-success, .btn-gradient-danger {
              padding: 8px 15px;
              font-size: 0.875rem;
            }
          }
        `}</style>

        {/* Header Principal */}
        <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           borderRadius: '50px',
                           padding: '15px 30px',
                           boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                         }}>
                      <MdHealthAndSafety className="text-white me-3" size={32} />
                      <h2 className="mb-0 text-white fw-bold">Servicios Intrahospitalarios</h2>
                    </div>
                    <p className="text-muted fs-5">Gestión y administración de servicios Internos</p>
                  </div>

        {/* Botón Agregar */}
        <div className="d-flex justify-content-center mb-4">
          <button 
            className="btn hover-card btn-lg"
            onClick={() => { 
              this.setState({ form: { servicio: '' }, tipoModal: 'insertar', errors: {} }); 
              this.modalInsertar() 
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Agregar Nuevo Servicio
          </button>
        </div>

        {/* Tabla de Servicios */}
        <div className="table-container">
          <div className="table-responsive">
            <table className="table modern-table">
              <thead>
                <tr>
                  <th>
                    <i className="fas fa-hashtag me-2"></i>
                    ID
                  </th>
                  <th>
                    <i className="fas fa-hospital me-2"></i>
                    Servicio
                  </th>
                  <th>
                    <i className="fas fa-cogs me-2"></i>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.servicios.map(servicio => (
                  <tr key={servicio.id_intrahospitalario} className="hover-row">
                    <td>
                      <span className="badge bg-light text-dark px-3 py-2" style={{ fontSize: '0.9rem' }}>
                        {servicio.id_intrahospitalario}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#495057', fontSize: '1.05rem' }}>
                        {servicio.servicio}
                      </strong>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-gradient-primary btn-sm"
                          onClick={() => { 
                            this.seleccionarServicio(servicio); 
                            this.modalInsertar() 
                          }}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Editar
                        </button>
                        <button 
                          className="btn btn-gradient-danger btn-sm"
                          onClick={() => { 
                            this.seleccionarServicio(servicio); 
                            this.setState({ modalEliminar: true }) 
                          }}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Insertar/Editar */}
        <Modal 
          isOpen={this.state.modalInsertar} 
          toggle={this.modalInsertar}
          className="modal-modern"
          size="lg"
          centered
        >
          <ModalHeader toggle={this.modalInsertar}>
            <i className={`fas ${this.state.tipoModal === 'insertar' ? 'fa-plus-circle' : 'fa-edit'} me-2`}></i>
            {this.state.tipoModal === 'insertar' ? 'Crear Nuevo Servicio' : 'Editar Servicio'}
          </ModalHeader>
          <ModalBody>
            <div className="row">
              <div className="col-md-12">
                <div className="form-group mb-4">
                  <label htmlFor="id_intrahospitalario" className="form-label fw-bold text-muted">
                    <i className="fas fa-hashtag me-2"></i>
                    ID del Servicio
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="text" 
                    name="id_intrahospitalario" 
                    id="id_intrahospitalario" 
                    readOnly 
                    value={form ? form.id_intrahospitalario : this.state.servicios.length + 1}
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
                
                <div className="form-group mb-3">
                  <label htmlFor="servicio" className="form-label fw-bold text-muted">
                    <i className="fas fa-hospital me-2"></i>
                    Nombre del Servicio
                  </label>
                  <input 
                    className="form-control modern-input" 
                    type="text" 
                    name="servicio" 
                    id="servicio" 
                    onChange={this.handleChange} 
                    value={form ? form.servicio : ''}
                    placeholder="Ingrese el nombre del servicio..."
                  />
                  {errors.servicio && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {errors.servicio}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="d-flex gap-2 w-100 justify-content-end">
              {this.state.tipoModal === 'insertar' ? (
                <button className="btn btn-gradient-success" onClick={this.peticionPost}>
                  <i className="fas fa-save me-2"></i>
                  Crear Servicio
                </button>
              ) : (
                <button className="btn btn-gradient-primary" onClick={this.peticionPut}>
                  <i className="fas fa-sync-alt me-2"></i>
                  Actualizar
                </button>
              )}
              <button className="btn btn-modern-secondary" onClick={this.modalInsertar}>
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
            </div>
          </ModalFooter>
        </Modal>

        {/* Modal Eliminar */}
        <Modal 
          isOpen={this.state.modalEliminar} 
          toggle={() => this.setState({ modalEliminar: false })}
          className="modal-modern"
          centered
        >
          <ModalHeader>
            <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <div className="text-center p-3">
              <i className="fas fa-trash-alt text-danger mb-3" style={{ fontSize: '3rem' }}></i>
              <h5 className="mb-3">¿Estás seguro de eliminar este servicio?</h5>
              <div className="alert alert-warning" role="alert">
                <strong>Servicio a eliminar:</strong> {form && form.servicio}
              </div>
              <p className="text-muted">Esta acción no se puede deshacer.</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="d-flex gap-2 w-100 justify-content-center">
              <button className="btn btn-gradient-danger" onClick={this.peticionDelete}>
                <i className="fas fa-trash-alt me-2"></i>
                Sí, Eliminar
              </button>
              <button className="btn btn-modern-secondary" onClick={() => this.setState({ modalEliminar: false })}>
                <i className="fas fa-ban me-2"></i>
                Cancelar
              </button>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default ShowServicioIn;