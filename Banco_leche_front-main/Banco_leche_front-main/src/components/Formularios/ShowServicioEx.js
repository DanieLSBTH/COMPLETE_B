import React, { Component } from 'react';
import Swal from 'sweetalert2';
import { 
  Modal, 
  ModalBody, 
  ModalFooter, 
  ModalHeader, 
  Container, 
  Card, 
  CardBody, 
  Button, 
  Table, 
  Badge,
  Row,
  Col 
} from 'reactstrap';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaHospital, 
  FaSave, 
  FaTimes,
  FaList,
  FaBuilding
} from 'react-icons/fa';
import { MdHealthAndSafety } from 'react-icons/md';
import { get, post, put, del } from '../../services/api';

const url = "servicio_ex/";

class ShowServicioEx extends Component {
  state = {
    servicios: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_extrahospitalario: '',
      servicio: '',
      tipoModal: ''
    }
  }

  peticionGet = () => {
    get(url).then(response => {
      this.setState({ servicios: response.data });
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al cargar los servicios', 'error');
    });
  }

  peticionPost = async () => {
    if (!this.validarFormulario()) return;

    delete this.state.form.id_extrahospitalario;
    await post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire({
        title: '¡Éxito!',
        text: 'Servicio creado exitosamente',
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
    }).catch(error => {
      console.log(error.message);
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el servicio',
        icon: 'error',
        confirmButtonColor: '#f5576c'
      });
    });
  }

  peticionPut = () => {
    if (!this.validarFormulario()) return;

    put(url + this.state.form.id_extrahospitalario, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire({
        title: '¡Actualizado!',
        text: 'Servicio actualizado exitosamente',
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
    }).catch(error => {
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el servicio',
        icon: 'error',
        confirmButtonColor: '#f5576c'
      });
      console.log(error.message);
    });
  }

  peticionDelete = () => {
    del(url + this.state.form.id_extrahospitalario).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire({
        title: '¡Eliminado!',
        text: 'Servicio eliminado exitosamente',
        icon: 'success',
        confirmButtonColor: '#667eea'
      });
    }).catch(error => {
      Swal.fire({
        title: 'Error',
        text: 'Error al eliminar el servicio',
        icon: 'error',
        confirmButtonColor: '#f5576c'
      });
      console.log(error.message);
    });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarServicio = (servicio) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_extrahospitalario: servicio.id_extrahospitalario,
        servicio: servicio.servicio,
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
      Swal.fire({
        title: 'Error',
        text: 'El formulario está vacío.',
        icon: 'error',
        confirmButtonColor: '#f5576c'
      });
      return false;
    }

    const { servicio } = form;
    if (!servicio || servicio.trim() === '') {
      Swal.fire({
        title: 'Campo Requerido',
        text: 'El campo "Servicio" es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }

    return true;
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form } = this.state;
    
    return (
      <div style={{ 
        background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(253, 254, 255) 100%)',
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>
        <Container>
          {/* Header moderno */}
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center mb-3" 
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   borderRadius: '50px',
                   padding: '15px 30px',
                   boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                 }}>
              <MdHealthAndSafety className="text-white me-3" size={32} />
              <h2 className="mb-0 text-white fw-bold">Servicios Extrahospitalarios</h2>
            </div>
            <p className="text-muted fs-5">Gestión y administración de servicios externos</p>
          </div>

          {/* Botón agregar servicio */}
          <div className="d-flex justify-content-center mb-4">
            <Button 
              onClick={() => { 
                this.setState({ 
                  form: { id_extrahospitalario: '', servicio: '' }, 
                  tipoModal: 'insertar' 
                }); 
                this.modalInsertar() 
              }}
              className="btn-gradient-primary"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 25px',
                boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              <FaPlus className="me-2" />
              Agregar Nuevo Servicio
            </Button>
          </div>


          {/* Tabla de servicios */}
          <Card className="border-0 shadow-lg" style={{ borderRadius: '20px' }}>
            <CardBody className="p-0">
              <div className="p-4 pb-0">
                <h4 className="d-flex align-items-center text-primary fw-bold mb-4">
                  <FaBuilding className="me-3" size={24} />
                  Lista de Servicios
                  <Badge color="primary" className="ms-3 rounded-pill">
                    {this.state.servicios.length}
                  </Badge>
                </h4>
              </div>
              
              <div className="table-responsive">
                <Table className="mb-0 modern-table">
                  <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <tr>
                      <th className="text-white fw-semibold border-0 py-3">ID</th>
                      <th className="text-white fw-semibold border-0 py-3">Servicio</th>
                      <th className="text-white fw-semibold border-0 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.servicios.length > 0 ? (
                      this.state.servicios.map(servicio => (
                        <tr key={servicio.id_extrahospitalario} className="hover-row">
                          <td className="py-3">
                            <Badge color="info" className="rounded-pill">
                              {servicio.id_extrahospitalario}
                            </Badge>
                          </td>
                          <td className="py-3 fw-semibold">{servicio.servicio}</td>
                          <td className="text-center py-3">
                            <Button 
                              size="sm" 
                              className="me-2"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 15px'
                              }}
                              onClick={() => { 
                                this.seleccionarServicio(servicio); 
                                this.modalInsertar() 
                              }}
                            >
                              <FaEdit className="me-1" size={12} />
                              Editar
                            </Button>
                            <Button 
                              size="sm"
                              style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 15px'
                              }}
                              onClick={() => { 
                                this.seleccionarServicio(servicio); 
                                this.setState({ modalEliminar: true }) 
                              }}
                            >
                              <FaTrash className="me-1" size={12} />
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5 text-muted">
                          <FaHospital size={48} className="mb-3 opacity-50" />
                          <p>No se encontraron servicios registrados.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>

          {/* Modal Insertar/Editar */}
          <Modal 
            isOpen={this.state.modalInsertar} 
            toggle={() => this.modalInsertar()}
            className="modal-modern"
            size="md"
          >
            <ModalHeader 
              toggle={() => this.modalInsertar()}
              className="border-0 pb-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '0.5rem 0.5rem 0 0'
              }}
            >
              <div className="d-flex align-items-center">
                {this.state.tipoModal === 'insertar' ? <FaPlus className="me-2" /> : <FaEdit className="me-2" />}
                {this.state.tipoModal === 'insertar' ? 'Nuevo Servicio' : 'Editar Servicio'}
              </div>
            </ModalHeader>
            
            <ModalBody className="p-4">
              <div className="form-group mb-3">
                <label htmlFor="id_extrahospitalario" className="form-label fw-semibold text-primary">
                  ID del Servicio
                </label>
                <input 
                  className="form-control modern-input" 
                  type="text" 
                  name="id_extrahospitalario" 
                  id="id_extrahospitalario" 
                  readOnly 
                  onChange={this.handleChange} 
                  value={form ? form.id_extrahospitalario : this.state.servicios.length + 1}
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px 15px',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="servicio" className="form-label fw-semibold text-primary">
                  Nombre del Servicio *
                </label>
                <input 
                  className="form-control modern-input" 
                  type="text" 
                  name="servicio" 
                  id="servicio" 
                  onChange={this.handleChange} 
                  value={form ? form.servicio : ''}
                  placeholder="Ingrese el nombre del servicio"
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px 15px',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </ModalBody>
            
            <ModalFooter className="border-0 pt-0">
              {this.state.tipoModal === 'insertar' ? (
                <Button 
                  onClick={() => this.peticionPost()}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px'
                  }}
                >
                  <FaSave className="me-2" />
                  Guardar
                </Button>
              ) : (
                <Button 
                  onClick={() => this.peticionPut()}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px'
                  }}
                >
                  <FaSave className="me-2" />
                  Actualizar
                </Button>
              )}
              <Button 
                onClick={() => this.modalInsertar()}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px'
                }}
              >
                <FaTimes className="me-2" />
                Cancelar
              </Button>
            </ModalFooter>
          </Modal>

          {/* Modal Eliminar */}
          <Modal 
            isOpen={this.state.modalEliminar} 
            toggle={() => this.setState({ modalEliminar: false })}
            className="modal-modern"
            size="md"
          >
            <ModalHeader 
              className="border-0 pb-0"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '0.5rem 0.5rem 0 0'
              }}
            >
              <div className="d-flex align-items-center">
                <FaTrash className="me-2" />
                Eliminar Servicio
              </div>
            </ModalHeader>
            
            <ModalBody className="p-4">
              <div className="text-center">
                <FaTrash size={48} className="text-danger mb-3" />
                <h5 className="mb-3">¿Estás seguro?</h5>
                <p className="text-muted">
                  ¿Deseas eliminar el servicio <strong>"{form && form.servicio}"</strong>?
                  <br />
                  <small className="text-danger">Esta acción no se puede deshacer.</small>
                </p>
              </div>
            </ModalBody>
            
            <ModalFooter className="border-0 pt-0 justify-content-center">
              <Button 
                onClick={() => this.peticionDelete()}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px'
                }}
              >
                <FaTrash className="me-2" />
                Sí, Eliminar
              </Button>
              <Button 
                onClick={() => this.setState({ modalEliminar: false })}
                color="secondary"
                style={{
                  borderRadius: '10px',
                  padding: '10px 20px'
                }}
              >
                Cancelar
              </Button>
            </ModalFooter>
          </Modal>
        </Container>

        {/* Estilos CSS adicionales */}
        <style jsx>{`
          .hover-card {
            transition: all 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
          }
          
          .hover-row {
            transition: all 0.2s ease;
          }
          
          .hover-row:hover {
            background-color: rgba(102, 126, 234, 0.05);
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
          }
          
          .btn-gradient-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4) !important;
          }
          
          .modal-modern .modal-content {
            border-radius: 1rem;
            border: none;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          }
          
          @media (max-width: 768px) {
            .table-responsive {
              font-size: 0.875rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default ShowServicioEx;