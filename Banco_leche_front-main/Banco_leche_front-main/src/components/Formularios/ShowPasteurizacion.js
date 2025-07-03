import React, { Component } from 'react';
import axios from 'axios';
import { Paginator } from 'primereact/paginator';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';

const url = "http://localhost:8080/api/trabajo_de_pasteurizaciones/";

class ShowPasteurizacion extends Component {
  state = {
    pasteurizaciones: [],
    modalInsertar: false,
    modalEliminar: false,
    mesActual: false,
    mostrarTodos: false,
      tipoModal: '', // Agregar esta línea
    form: {
      id_pasteurizacion: '',
      fecha: '',
      numero: '',
      no_frasco: '',
      crematorio_1_1: '',
      crematorio_1_2: '',
      crematorio_2_1: '',
      crematorio_2_2: '',
      crematorio_3_1: '',
      crematorio_3_2: '',
      acidez: '',
      total_crematorio_1: '',
      total_crematorio_2: '',
      total_crematorio_3: '',
      porcentaje_crema: '',
      kcal_l: '',
      kcal_onz: '',
      porcentaje_grasa: ''
    },
      // Estados para la paginación
      totalRecords: 0,
      page: 1,
      rows: 10, // Número de registros por página
  }
  handleNavigate = () => {
    // Usa la función navigate pasada como prop
    this.props.navigate('/resumenpasteurizacion');
  };
  // Add more detailed logging to understand what's happening
  peticionGet = () => {
    const { page, rows, mostrarTodos } = this.state;
    
    // Preparar los parámetros de la solicitud
    const params = new URLSearchParams({
      page: page,            // Número de página
      pageSize: rows,        // Tamaño de página
      mesActual: mostrarTodos ? 'false' : 'true'  // Modificado para ser más explícito
    });
  
    console.log('Parámetros de solicitud:', params.toString());
    
    axios
      .get(`${url}?${params.toString()}`)
      .then(response => {
        console.log('Respuesta completa:', response.data);
        
        this.setState({ 
          pasteurizaciones: response.data.pasteurizaciones || [], 
          totalRecords: response.data.totalRecords || 0,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1
        });
      })
      .catch(error => {
        console.error('Error detallado:', error.response || error);
        Swal.fire('Error', 'No se pudo cargar la lista de pasteurizaciones', 'error');
      });
  };
  
  
  // Update the onPageChange method
  onPageChange = (event) => {
    const newPage = event.page + 1; // PrimeReact usa índices basados en cero
    
    this.setState({ 
      page: newPage 
    }, () => {
      this.peticionGet(); // Obtener datos para la nueva página
    });
  };
  
  peticionPost = async () => {
    const formData = {...this.state.form};
    delete formData.id_pasteurizacion;
    
    // Fix the date timezone issue
    if (formData.fecha) {
      // Parse the date parts and create a date without timezone conversion
      const [year, month, day] = formData.fecha.split('-');
      // Create a date string that explicitly preserves the day you selected
      formData.fecha = `${year}-${month}-${day}`;
    }
    
    await axios.post(url, formData).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización creada exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear la pasteurización', 'error');
    });
  }

  peticionPut = () => {
    axios.put(url + this.state.form.id_pasteurizacion, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización actualizada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar la pasteurización', 'error');
      console.log(error.message);
    });
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_pasteurizacion).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Pasteurización eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la pasteurización', 'error');
      console.log(error.message);
    });
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarPasteurizacion = (pasteurizacion) => {
    this.setState({
      tipoModal: 'actualizar', // Agregar esta línea
      form: {
        id_pasteurizacion: pasteurizacion.id_pasteurizacion,
        fecha: pasteurizacion.fecha,
        numero: pasteurizacion.numero,
        no_frasco: pasteurizacion.no_frasco,
        crematorio_1_1: pasteurizacion.crematorio_1_1,
        crematorio_1_2: pasteurizacion.crematorio_1_2,
        crematorio_2_1: pasteurizacion.crematorio_2_1,
        crematorio_2_2: pasteurizacion.crematorio_2_2,
        crematorio_3_1: pasteurizacion.crematorio_3_1,
        crematorio_3_2: pasteurizacion.crematorio_3_2,
        acidez: pasteurizacion.acidez,
        total_crematorio_1: pasteurizacion.total_crematorio_1,
        total_crematorio_2: pasteurizacion.total_crematorio_2,
        total_crematorio_3: pasteurizacion.total_crematorio_3,
        porcentaje_crema: pasteurizacion.porcentaje_crema,
        kcal_l: pasteurizacion.kcal_l,
        kcal_onz: pasteurizacion.kcal_onz,
        porcentaje_grasa: pasteurizacion.porcentaje_grasa
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

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const {pasteurizaciones, form, totalRecords, rows, page,currentPage, totalPages } = this.state;
    const navigate = this.props.navigate; // Obtenemos la función navigate desde props

    return (
  <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(228, 233, 241) 100%)', minHeight: '100vh' }}>
    {/* Header Section */}
    <div className="row mb-4">
      <div className="col-12">
        <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex align-items-center mb-2 mb-md-0">
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <i className="fas fa-flask text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <h2 className="text-white mb-1 fw-bold">Gestión de Pasteurizaciones</h2>
                  <p className="text-white-50 mb-0">Control y seguimiento de procesos</p>
                </div>
              </div>
              <div className="d-flex gap-3 flex-wrap">
                <button 
                  className="btn btn-lg d-flex align-items-center"
                  onClick={() => { this.setState({ form: {}, tipoModal: 'insertar' }); this.modalInsertar() }}
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
                  <i className="fas fa-plus me-2"></i>
                  Agregar Pasteurización
                </button>
                <Button 
                  color="info" 
                  onClick={this.handleNavigate} 
                  className="btn-lg d-flex align-items-center"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)'
                  }}
                >
                  <FaChartBar className="me-2" />
                  Mostrar Resumen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Filter Section */}
    <div className="row mb-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body p-3">
            <div className="form-check">
              <input 
                type="checkbox" 
                className="form-check-input me-3" 
                id="mostrarTodos"
                checked={!this.state.mostrarTodos}
                onChange={() => this.setState({ 
                  mostrarTodos: !this.state.mostrarTodos, 
                  page: 1 
                }, () => this.peticionGet())}
                style={{ 
                  accentColor: "#667eea",
                  transform: "scale(1.2)"
                }}
              />
              <label className="form-check-label fw-semibold text-primary" htmlFor="mostrarTodos">
                <i className="fas fa-calendar-check me-2"></i>
                Mostrar solo del mes actual
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Table Section */}
    <div className="row">
      <div className="col-12">
        <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="card-header border-0" style={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px 20px 0 0'
          }}>
            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
              <i className="fas fa-table me-2"></i>
              Lista de Pasteurizaciones
              <span className="badge bg-white text-primary ms-3 px-3 py-2 rounded-pill">
                Total: {totalRecords}
              </span>
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 modern-table">
                <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <tr>
                    <th className="text-white fw-bold py-3 px-3 border-0">ID</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Fecha</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Número</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">No. Frasco</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C1_1</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C1_2</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Total C1</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C2_1</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C2_2</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Total C2</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C3_1</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">C3_2</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Total C3</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Crema %</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">kcal_l</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">kcal_onz</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Acidez</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Grasa %</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Estado</th>
                    <th className="text-white fw-bold py-3 px-3 border-0">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.pasteurizaciones.map((pasteurizacion, index) => {
                    return (
                      <tr key={pasteurizacion.id_pasteurizacion} className="hover-row" style={{
                        backgroundColor: index % 2 === 0 ? 'rgba(102, 126, 234, 0.02)' : 'white'
                      }}>
                        <td className="py-3 px-3 fw-bold text-primary">{pasteurizacion.id_pasteurizacion}</td>
                        <td className="py-3 px-3">
                          <div className="d-flex align-items-center">
                            
                            {pasteurizacion.fecha}
                          </div>
                        </td>
                        <td className="py-3 px-3">{pasteurizacion.numero}</td>
                        <td className="py-3 px-3">
                          <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                            {pasteurizacion.no_frasco}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_1_1}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_1_2}</td>
                        <td className="py-3 px-3 text-center fw-bold text-success">{pasteurizacion.total_crematorio_1}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_2_1}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_2_2}</td>
                        <td className="py-3 px-3 text-center fw-bold text-success">{pasteurizacion.total_crematorio_2}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_3_1}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.crematorio_3_2}</td>
                        <td className="py-3 px-3 text-center fw-bold text-success">{pasteurizacion.total_crematorio_3}</td>
                        <td className="py-3 px-3 text-center fw-bold text-info">{pasteurizacion.porcentaje_crema}%</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.kcal_l}</td>
                        <td className="py-3 px-3 text-center">{pasteurizacion.kcal_onz}</td>
                        <td className="py-3 px-3 text-center fw-bold text-warning">{pasteurizacion.acidez}</td>
                        <td className="py-3 px-3 text-center fw-bold text-info">{pasteurizacion.porcentaje_grasa}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`badge px-3 py-2 rounded-pill ${pasteurizacion.estado ? 'bg-success' : 'bg-danger'}`}>
                            <i className={`fas ${pasteurizacion.estado ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                            {pasteurizacion.estado ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm d-flex align-items-center"
                              onClick={() => { this.seleccionarPasteurizacion(pasteurizacion); this.modalInsertar() }}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '8px 12px'
                              }}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Editar
                            </button>
                            <button 
                              className="btn btn-sm d-flex align-items-center"
                              onClick={() => { this.seleccionarPasteurizacion(pasteurizacion); this.setState({ modalEliminar: true }) }}
                              style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                padding: '8px 12px'
                              }}
                            >
                              <i className="fas fa-trash me-1"></i>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Pagination Section */}
    <div className="row mt-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-center">
              <div className="custom-paginator">
                <Paginator 
                  first={(page - 1) * rows} 
                  rows={rows} 
                  totalRecords={totalRecords} 
                  onPageChange={this.onPageChange}
                  totalPages={totalPages}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                /> 
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modals (unchanged for functionality) */}
    <div className="modal-dialog">
      <Modal size="lg" isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()} className="modern-modal">
        <ModalHeader 
          toggle={() => this.modalInsertar()}
          className="border-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${this.state.tipoModal === 'insertar' ? 'fa-plus-circle' : 'fa-edit'} me-2`}></i>
            {this.state.tipoModal === 'insertar' ? 'Insertar Pasteurización' : 'Editar Pasteurización'}
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="container-fluid">
            <div className="form-group mb-3">
              <label htmlFor="id_pasteurizacion" className="form-label fw-semibold text-muted">ID</label>
              <input 
                className="form-control" 
                type="text" 
                name="id_pasteurizacion" 
                id="id_pasteurizacion" 
                readOnly 
                onChange={this.handleChange} 
                value={form ? form.id_pasteurizacion : ''} 
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  padding: '12px',
                  background: '#f8f9fa'
                }}
              />
            </div>
            
            <div className="row">
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="fecha" className="form-label fw-semibold">
                  <i className="fas fa-calendar text-primary me-2"></i>Fecha
                </label>
                <input 
                  className="form-control" 
                  type="date" 
                  name="fecha" 
                  id="fecha" 
                  onChange={this.handleChange} 
                  value={form ? form.fecha : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="no_frasco" className="form-label fw-semibold">
                  <i className="fas fa-vial text-primary me-2"></i>No. Frasco
                </label>
                <input 
                  className="form-control" 
                  type="text" 
                  name="no_frasco" 
                  id="no_frasco" 
                  onChange={this.handleChange} 
                  value={form ? form.no_frasco : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              {/* Crematorio fields with improved styling */}
              <div className="col-12 mb-3">
                <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
                  <i className="fas fa-flask me-2"></i>Valores de Crematorio
                </h6>
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_1_1" className="form-label fw-semibold">Crematocrito 1.1</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_1_1" 
                  id="crematorio_1_1" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_1_1 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_1_2" className="form-label fw-semibold">Crematocrito 1.2</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_1_2" 
                  id="crematorio_1_2" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_1_2 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_2_1" className="form-label fw-semibold">Crematocrito 2.1</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_2_1" 
                  id="crematorio_2_1" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_2_1 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_2_2" className="form-label fw-semibold">Crematocrito 2.2</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_2_2" 
                  id="crematorio_2_2" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_2_2 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_3_1" className="form-label fw-semibold">Crematocrito 3.1</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_3_1" 
                  id="crematorio_3_1" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_3_1 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-6 mb-3">
                <label htmlFor="crematorio_3_2" className="form-label fw-semibold">Crematocrito 3.2</label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="crematorio_3_2" 
                  id="crematorio_3_2" 
                  onChange={this.handleChange} 
                  value={form ? form.crematorio_3_2 : ''} 
                  style={{
                    borderRadius: '10px',
                    border: '2px solid #e9ecef',
                    padding: '12px'
                  }}
                />
              </div>
              
              <div className="form-group col-md-12 mb-3">
                <label htmlFor="acidez" className="form-label fw-semibold">
                  <i className="fas fa-tint text-warning me-2"></i>Acidez
                </label>
                <input 
                  className="form-control" 
                  type="number" 
                  name="acidez" 
                  id="acidez" 
                  onChange={this.handleChange} 
                  value={form ? form.acidez : ''} 
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
        <i className="fas fa-save me-2"></i>Insertar
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
        <i className="fas fa-edit me-2"></i>Actualizar
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
      <i className="fas fa-times me-2"></i>Cancelar
    </button>
  </div>
  </ModalFooter>
      </Modal>
    </div>

    {/* Delete Modal */}
    <div className="modal-dialog">
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
              <i className="fas fa-exclamation-triangle text-white"></i>
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
                <i className="fas fa-flask me-3 text-danger" style={{ fontSize: '24px' }}></i>
                <div>
                  <strong className="text-danger">¿Está seguro que desea eliminar esta pasteurización?</strong>
                  <div className="mt-2">
                    <span className="badge bg-danger px-3 py-2 rounded-pill">
                      ID: {form && form.id_pasteurizacion}
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
              <i className="fas fa-trash me-2"></i>Sí, Eliminar
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
              <i className="fas fa-times me-2"></i>Cancelar
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </div>

    {/* CSS Styles */}
    <style jsx>{`
      .modern-table .hover-row:hover {
        background-color: rgba(102, 126, 234, 0.08) !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .modern-modal .modal-content {
        border: none;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
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
        min-width: 40px;
        height: 40px;
      }

      .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        transform: scale(1.1);
      }

      .custom-paginator .p-paginator .p-paginator-first,
      .custom-paginator .p-paginator .p-paginator-prev,
      .custom-paginator .p-paginator .p-paginator-next,
      .custom-paginator .p-paginator .p-paginator-first,
      .custom-paginator .p-paginator .p-paginator-prev,
      .custom-paginator .p-paginator .p-paginator-next,
      .custom-paginator .p-paginator .p-paginator-last {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        border-radius: 10px;
        margin: 0 5px;
        border: none;
        min-width: 40px;
        height: 40px;
      }

      .custom-paginator .p-paginator .p-paginator-first:hover,
      .custom-paginator .p-paginator .p-paginator-prev:hover,
      .custom-paginator .p-paginator .p-paginator-next:hover,
      .custom-paginator .p-paginator .p-paginator-last:hover,
      .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
      }

      .form-control:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }

      .btn:hover {
        transform: translateY(-2px);
        transition: all 0.3s ease;
      }

      .card {
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .card {
        animation: fadeIn 0.5s ease-out;
      }
    `}</style>
  </div>
);
  }
}

function ShowPasteurizacionWrapper() {
  const navigate = useNavigate();
  return <ShowPasteurizacion navigate={navigate} />;
}

export default ShowPasteurizacionWrapper;

