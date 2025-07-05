import React, { Component } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Paginator } from 'primereact/paginator';
import { useNavigate } from 'react-router-dom';
import { FaChartBar,
  FaWater,
  FaClipboardList,
  FaPlus,
  FaFlask,
  FaCalendar,
  FaUser,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSearch,
  FaExclamationTriangle
} from 'react-icons/fa';

import { Button } from 'reactstrap';

const urlControlLeche = "http://localhost:8080/api/control_de_leches/";
// Nueva URL para búsqueda optimizada de frascos
const urlBuscarFrascos = "http://localhost:8080/api/trabajo_de_pasteurizaciones/search/frasco";

class ShowControlLeche extends Component {
  state = {
    controlLeches: [],
    // Cambiado: ahora solo almacenamos opciones de búsqueda
    frascoOptions: [],
    // Estado para la búsqueda de frascos
    frascoSearchTerm: '',
    frascoLoading: false,
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_control_leche: '',
      id_pasteurizacion: '',
      no_frascoregistro: '',
      frasco: false,
      tipo_frasco: '',
      unidosis: false,
      tipo_unidosis: '',
      fecha_almacenamiento: '',
      volumen_ml_onza: '',
      tipo_de_leche: '',
      fecha_entrega: '',
      responsable: '',
      letra_adicional: '',
      kcal_l: '',
      porcentaje_grasa: '',
      acidez: '',
    },
    errors: {},
    totalRecords: 0,
    currentPage: 1,
    pageSize: 10,
  };

  componentDidMount() {
    this.fetchControlLeches(this.state.currentPage, this.state.pageSize);
    // Ya no cargamos todas las pasteurizaciones al inicio
  }

  fetchControlLeches = (page, pageSize) => {
    axios.get(urlControlLeche, {
      params: {
        page: page,
        pageSize: pageSize,
      }
    })
      .then(response => {
        this.setState({
          controlLeches: response.data.controlDeLeches,
          totalRecords: response.data.totalRecords,
          currentPage: response.data.currentPage,
        });
      })
      .catch(error => {
        console.log('Error al obtener controlLeches:', error.message);
      });
  };

  // Nueva función para búsqueda optimizada de frascos
  searchFrascos = (searchTerm) => {
    if (!searchTerm || searchTerm.length < 1) {
      this.setState({ frascoOptions: [] });
      return;
    }

    this.setState({ frascoLoading: true });

    axios.get(urlBuscarFrascos, {
      params: {
        no_frasco: searchTerm,
        exact: false // Búsqueda parcial para autocompletado
      }
    })
      .then(response => {
        console.log('Respuesta de búsqueda de frascos:', response.data);
        
        const options = response.data.pasteurizaciones.map(pasteurizacion => ({
          value: pasteurizacion.id_pasteurizacion,
          label: pasteurizacion.no_frasco,
          data: pasteurizacion // Guardamos los datos completos para uso posterior
        }));

        this.setState({ 
          frascoOptions: options,
          frascoLoading: false 
        });
      })
      .catch(error => {
        console.log('Error al buscar frascos:', error.message);
        this.setState({ 
          frascoOptions: [],
          frascoLoading: false 
        });
      });
  };

  // Función debounce para optimizar las búsquedas
  debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Crear función debounced para búsqueda
  debouncedSearchFrascos = this.debounce(this.searchFrascos, 300);

  handlePageChange = (event) => {
    const newPage = event.page + 1;
    const newPageSize = event.rows;
    this.setState({ currentPage: newPage, pageSize: newPageSize }, () => {
      this.fetchControlLeches(newPage, newPageSize);
    });
  };

  // Actualizada: maneja la selección y búsqueda de frascos
  handlePasteurizacionChange = (selectedOption) => {
    if (selectedOption) {
      // Si hay datos completos en la opción, los usamos
      const pasteurizacionData = selectedOption.data;
      
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          id_pasteurizacion: selectedOption.value,
          kcal_l: pasteurizacionData?.kcal_l || '',
          porcentaje_grasa: pasteurizacionData?.porcentaje_grasa || '',
          acidez: pasteurizacionData?.acidez || ''
        },
        errors: { ...prevState.errors, id_pasteurizacion: undefined }
      }));
    } else {
      this.setState(prevState => ({
        form: { 
          ...prevState.form, 
          id_pasteurizacion: '',
          kcal_l: '',
          porcentaje_grasa: '',
          acidez: ''
        },
        errors: { ...prevState.errors, id_pasteurizacion: "Debe seleccionar un número de frasco." }
      }));
    }
  };

  // Maneja la entrada de texto en el Select
  handleInputChange = (inputValue) => {
    this.setState({ frascoSearchTerm: inputValue });
    if (inputValue && inputValue.length >= 1) {
      this.debouncedSearchFrascos(inputValue);
    } else {
      this.setState({ frascoOptions: [] });
    }
  };

  handleNavigate = () => {
    this.props.navigate('/resumencontrollechefrascos');
  };
  handleNavigate1 = () => {
    this.props.navigate('/resumenfrascosestados');
  };
  handleNavigate2 = () => {
    this.props.navigate('/showbusquedafrasco');
  };

  validateForm = () => {
    const { form } = this.state;
    let errors = {};
    let formIsValid = true;
  
    if (!form.id_pasteurizacion) {
      formIsValid = false;
      errors["id_pasteurizacion"] = "Debe seleccionar un número de frasco.";
    }
    
    if (!form.tipo_de_leche) {
      formIsValid = false;
      errors["tipo_de_leche"] = "El tipo de leche es requerido.";
    }

    if (form.frasco === true) {
      if (!form.tipo_frasco) {
        formIsValid = false;
        errors["tipo_frasco"] = "Debe especificar el tipo de frasco.";
      }
    }

    if (form.unidosis === true) {
      if (!form.tipo_unidosis) {
        formIsValid = false;
        errors["tipo_unidosis"] = "Debe especificar el tipo de unidosis.";
      }
    }

    if (!form.fecha_almacenamiento) {
      formIsValid = false;
      errors["fecha_almacenamiento"] = "Debe especificar la fecha de almacenamiento.";
    }

    if (!form.responsable) {
      formIsValid = false;
      errors["responsable"] = "Debe especificar un responsable.";
    }

    this.setState({ errors });
    return formIsValid;
  };

  peticionPost = async () => {
    if (this.validateForm()) {
      const { form, currentPage, pageSize } = this.state;
      const dataToSend = { ...form };
      delete dataToSend.id_control_leche;

      if (dataToSend.frasco === true) {
        dataToSend.unidosis = false;
        dataToSend.tipo_unidosis = null;
      }

      if (dataToSend.unidosis === true) {
        dataToSend.frasco = false;
        dataToSend.tipo_frasco = null;
      }

      try {
        const response = await axios.post(urlControlLeche, dataToSend);
        this.modalInsertar();
        this.fetchControlLeches(currentPage, pageSize);
        Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
      } catch (error) {
        console.log('Error al crear el registro:', error.message);
        Swal.fire('Error', 'Error al crear el registro', 'error');
      }
    }
  };

  peticionPut = () => {
    if (this.validateForm()) {
      const { form, currentPage, pageSize } = this.state;
      axios.put(`${urlControlLeche}${form.id_control_leche}`, form)
        .then(response => {
          this.modalInsertar();
          this.fetchControlLeches(currentPage, pageSize);
          Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
        })
        .catch(error => {
          console.log('Error al actualizar el registro:', error.message);
          Swal.fire('Error', 'Error al actualizar el registro', 'error');
        });
    }
  };

  peticionDelete = () => {
    const { form, currentPage, pageSize } = this.state;
    axios.delete(`${urlControlLeche}${form.id_control_leche}`)
      .then(response => {
        this.setState({ modalEliminar: false });
        this.fetchControlLeches(currentPage, pageSize);
        Swal.fire('Éxito', 'Registro eliminado exitosamente', 'success');
      })
      .catch(error => {
        console.log('Error al eliminar el registro:', error.message);
        Swal.fire('Error', 'Error al eliminar el registro', 'error');
      });
  };

  modalInsertar = () => {
    this.setState(prevState => ({ 
      modalInsertar: !prevState.modalInsertar, 
      errors: {},
      // Limpiar las opciones de búsqueda al cerrar el modal
      frascoOptions: [],
      frascoSearchTerm: '',
      form: prevState.modalInsertar ? {} : prevState.form 
    }));
  };

  seleccionarControlLeche = (controlLeche) => {
    this.setState({
      tipoModal: 'actualizar',
      form: { ...controlLeche }
    });
  };

  handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    
    this.setState(prevState => {
      const newForm = { ...prevState.form };

      if (type === 'checkbox') {
        newForm[name] = checked;
        
        if (!checked) {
          if (name === 'frasco') {
            newForm.tipo_frasco = '';
          } else if (name === 'unidosis') {
            newForm.tipo_unidosis = '';
          }
        }
        
        if (checked) {
          if (name === 'frasco') {
            newForm.unidosis = false;
            newForm.tipo_unidosis = '';
          } else if (name === 'unidosis') {
            newForm.frasco = false;
            newForm.tipo_frasco = '';
          }
        }
      } else {
        newForm[name] = value;
      }

      const newErrors = { ...prevState.errors };
      if (newErrors[name]) {
        delete newErrors[name];
      }

      return { 
        form: newForm,
        errors: newErrors
      };
    });
  };

  render() {
    const { form, controlLeches, frascoOptions, frascoLoading, modalInsertar, errors, totalRecords, currentPage, pageSize } = this.state;
    return (
      <div className="container-fluid p-4" style={{ background: 'linear-gradient(135deg,rgb(245, 247, 251) 0%,rgb(255, 255, 255) 100%)', minHeight: '100vh' }}>
        {/* Header con botones de acción */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-2 fw-bold" style={{ color: '#2c3e50' }}>
                      <FaWater className="me-3" style={{ color: '#3498db' }} />
                      Control de Leche
                    </h2>
                    <p className="text-muted mb-0">Gestión y seguimiento de frascos de leche materna</p>
                  </div>
                  
                  <div className="d-flex gap-3 flex-wrap">
                    <Button 
                      color="info" 
                      onClick={this.handleNavigate} 
                      className="d-flex align-items-center shadow-sm"
                      style={{ 
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        padding: '12px 20px'
                      }}
                    >
                      <FaChartBar className="me-2" />
                      Resumen de Frascos
                    </Button>
                    
                    <Button 
                      color="info" 
                      onClick={this.handleNavigate1} 
                      className="d-flex align-items-center shadow-sm"
                      style={{
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        border: 'none',
                        padding: '12px 20px'
                      }}
                    >
                      <FaClipboardList className="me-2" />
                      Stock de Frascos
                    </Button>
                    <Button 
                      color="info" 
                      onClick={this.handleNavigate2} 
                      className="d-flex align-items-center shadow-sm"
                      style={{
                        borderRadius: '15px',
                        background: 'linear-gradient(135deg,rgb(147, 201, 251) 0%,rgba(130, 247, 126, 0.84) 100%)',
                        border: 'none',
                        padding: '12px 20px'
                      }}
                    >
                      <FaClipboardList className="me-2" />
                      Busqueda de frasco
                    </Button>
                    
                    <button 
                      className="btn d-flex align-items-center shadow-sm" 
                      onClick={() => { 
                        this.setState({ form: { id_pasteurizacion: '' }, tipoModal: 'insertar' }); 
                        this.modalInsertar(); 
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        color: 'white',
                        padding: '12px 20px',
                        fontWeight: 'bold'
                      }}
                    >
                      <FaPlus className="me-2" />
                      Agregar Registro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla moderna */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
              <div className="card-header border-0 p-4" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px 20px 0 0'
              }}>
                <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                  <FaFlask className="me-2" />
                  Registros de Control de Leche
                </h5>
              </div>
              
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ borderRadius: '0 0 20px 20px' }}>
                    <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                      <tr>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>ID</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>
                          <FaFlask className="me-2 text-primary" />
                          No. Frasco
                        </th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>
                          <FaCalendar className="me-2 text-success" />
                          Fecha Almacén
                        </th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Volumen</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>kcal/l</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Grasa %</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Acidez</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Tipo de Leche</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Fecha Entrega</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>
                          <FaUser className="me-2 text-info" />
                          Responsable
                        </th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Estado</th>
                        <th className="fw-bold text-dark p-3" style={{ borderBottom: '2px solid #dee2e6' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controlLeches.length > 0 ? (
                        controlLeches.map((control, index) => (
                          <tr 
                            key={control.id_control_leche} 
                            className="hover-row"
                            style={{ 
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <td className="p-3">
                              <span className="badge bg-secondary px-3 py-2 rounded-pill">
                                {control.id_control_leche}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="d-flex align-items-center">
                                <div 
                                  className="me-2 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '35px',
                                    height: '35px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '50%'
                                  }}
                                >
                                  <FaFlask className="text-white" size={14} />
                                </div>
                                <span className="fw-semibold">{control.no_frascoregistro}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                                {control.fecha_almacenamiento}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="fw-bold text-primary">{control.volumen_ml_onza}ml</span>
                            </td>
                            <td className="p-3">
                              <span className="text-success fw-semibold">
                                {control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.kcal_l : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-warning fw-semibold">
                                {control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.porcentaje_grasa : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-info fw-semibold">
                                {control.trabajo_de_pasteurizaciones ? control.trabajo_de_pasteurizaciones.acidez : '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`badge px-3 py-2 rounded-pill ${
                                control.tipo_de_leche === 'Madura' ? 'bg-success' : 'bg-warning text-dark'
                              }`}>
                                {control.tipo_de_leche}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-muted">{control.fecha_entrega || ''}</span>
                            </td>
                            <td className="p-3">
                              <div className="d-flex align-items-center">
                                <FaUser className="me-2 text-secondary" size={12} />
                                <span className="fw-semibold">{control.responsable}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`badge px-3 py-2 rounded-pill d-flex align-items-center ${
                                control.estado ? 'bg-success' : 'bg-danger'
                              }`} style={{ width: 'fit-content' }}>
                                {control.estado ? <FaCheck className="me-1" size={12} /> : <FaTimes className="me-1" size={12} />}
                                {control.estado ? 'Disponible' : 'No disponible'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm d-flex align-items-center shadow-sm" 
                                  onClick={() => { 
                                    this.seleccionarControlLeche(control); 
                                    this.modalInsertar(); 
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    padding: '8px 12px'
                                  }}
                                >
                                  <FaEdit className="me-1" size={12} />
                                  Editar
                                </button>
                                <button 
                                  className="btn btn-sm d-flex align-items-center shadow-sm" 
                                  onClick={() => { 
                                    this.seleccionarControlLeche(control); 
                                    this.setState({ modalEliminar: true }) 
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    padding: '8px 12px'
                                  }}
                                >
                                  <FaTrash className="me-1" size={12} />
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="text-center p-5">
                            <div className="d-flex flex-column align-items-center">
                              <FaFlask size={48} className="text-muted mb-3" />
                              <h5 className="text-muted">No hay registros disponibles</h5>
                              <p className="text-muted">Agregue un nuevo registro para comenzar</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paginador mejorado */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                <div className="card-body p-2">
                  <Paginator 
                    first={(currentPage - 1) * pageSize} 
                    rows={pageSize} 
                    totalRecords={totalRecords} 
                    rowsPerPageOptions={[5, 10, 20, 50]} 
                    onPageChange={this.handlePageChange}
                    className="custom-paginator"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Insertar/Actualizar mejorado */}
        <Modal isOpen={modalInsertar} size="lg" className="modern-modal">
          <ModalHeader className="border-0 pb-0">
            <div className="d-flex align-items-center">
              <div 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: form && form.id_control_leche 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  borderRadius: '50%'
                }}
              >
                {form && form.id_control_leche ? 
                  <FaEdit className="text-white" size={20} /> : 
                  <FaPlus className="text-white" size={20} />
                }
              </div>
              <div>
                <h4 className="mb-1 fw-bold">
                  {form && form.id_control_leche ? 'Actualizar Registro' : 'Agregar Registro'}
                </h4>
                <p className="text-muted mb-0">Complete los campos requeridos</p>
              </div>
            </div>
          </ModalHeader>
          
          <ModalBody className="p-4">
            <div className="row">
              {/* Columna izquierda */}
              <div className="col-md-6">
                <div className="card border-0 mb-3" style={{ background: 'linear-gradient(135deg,rgba(222, 220, 210, 0.75) 0%,rgba(246, 159, 72, 0.51) 100%)', borderRadius: '15px' }}>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <FaSearch className="me-2 text-primary" />
                      Información del Frasco
                    </h6>
                    
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold">
                        <FaFlask className="me-2 text-primary" />
                        No. Frasco
                      </label>
                      <Select
                        className={errors.id_pasteurizacion ? 'is-invalid' : ''}
                        options={frascoOptions}
                        value={frascoOptions.find(option => option.value === (form.id_pasteurizacion || ''))}
                        onChange={this.handlePasteurizacionChange}
                        onInputChange={this.handleInputChange}
                        isClearable
                        isSearchable
                        isLoading={frascoLoading}
                        placeholder="Escriba para buscar número de frasco..."
                        noOptionsMessage={() => this.state.frascoSearchTerm.length < 1 ? "Escriba al menos 1 caracteres" : "No se encontraron frascos"}
                        loadingMessage={() => "Buscando frascos..."}
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderRadius: '10px',
                            border: '2px solid #e9ecef',
                            padding: '8px',
                            borderColor: errors.id_pasteurizacion ? '#dc3545' : state.isFocused ? '#667eea' : '#e9ecef',
                            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(102,126,234,.25)' : 'none',
                            '&:hover': {
                              borderColor: errors.id_pasteurizacion ? '#dc3545' : '#667eea'
                            }
                          })
                        }}
                      />
                      {errors.id_pasteurizacion && (
                        <div className="invalid-feedback" style={{ display: 'block' }}>
                          {errors.id_pasteurizacion}
                        </div>
                      )}
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <div className="card border-0 p-3 text-center" 
                             style={{ 
                               background: form.frasco ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                               borderRadius: '15px',
                               cursor: 'pointer'
                             }}>
                          <div className="form-check ">
                            <input
                              className="form-check-input me-3"
                              type="checkbox"
                              name="frasco"
                              id="frasco"
                              onChange={this.handleChange}
                              checked={form ? form.frasco : false}
                              style={{ transform: "scale(1.3)" }}
                            />
                            <label className={`form-check-label fw-bold ${form.frasco ? 'text-white' : 'text-dark'}`} htmlFor="frasco">
                              Frasco
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card border-0 p-3 text-center" 
                             style={{ 
                               background: form.unidosis ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                               borderRadius: '15px',
                               cursor: 'pointer'
                             }}>
                          <div className="form-check">
                            <input
                              className="form-check-input me-3"
                              type="checkbox"
                              name="unidosis"
                              id="unidosis"
                              onChange={this.handleChange}
                              checked={form ? form.unidosis : false}
                              style={{ transform: "scale(1.3)" }}
                            />
                            <label className={`form-check-label fw-bold ${form.unidosis ? 'text-white' : 'text-dark'}`} htmlFor="unidosis">
                              Unidosis
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold">Tipo de Frasco</label>
                      <select
                        className="form-control"
                        name="tipo_frasco"
                        onChange={this.handleChange}
                        value={form.tipo_frasco || ''}
                        disabled={!form.frasco}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      >
                        <option value="">Seleccione un tipo de frasco</option>
                        <option value="150ml">150ml</option>
                        <option value="180ml">180ml</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label fw-semibold">Tipo de Unidosis</label>
                      <select
                        className="form-control"
                        name="tipo_unidosis"
                        onChange={this.handleChange}
                        value={form.tipo_unidosis || ''}
                        disabled={!form.unidosis}
                        style={{
                          borderRadius: '10px',
                          border: '2px solid #e9ecef',
                          padding: '12px'
                        }}
                      >
                        <option value="">Seleccione un tipo de unidosis</option>
                        <option value="10ml">10ml</option>
                        <option value="20ml">20ml</option>
                        <option value="30ml">30ml</option>
                      </select>
                    </div>
                    <br>
                    
                    </br>
                    <br>
                    
                    </br>
                    <br>
                    
                    </br>
                    <br>
                    
                    </br>
                    
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="col-md-6">
                <div className="card border-0 mb-3" style={{ background: 'linear-gradient(135deg,rgba(222, 220, 210, 0.75) 0%,rgba(246, 159, 72, 0.51) 100%)', borderRadius: '15px' }}>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-3 text-black d-flex align-items-center">
                      <FaCalendar className="me-2" />
                      Detalles del Registro
                    </h6>

                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold text-black">Identificador Adicional</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="letra_adicional" 
                        id="letra_adicional"
                        onChange={this.handleChange} 
                        value={form ? form.letra_adicional : ''} 
                        style={{
                          borderRadius: '10px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white'
                        }}
                        placeholder="Letra o código adicional"
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold text-black">Fecha de Almacenamiento</label>
                      <input 
                        type="date" 
                        className={`form-control ${errors.fecha_almacenamiento ? 'is-invalid' : ''}`} 
                        name="fecha_almacenamiento" 
                        onChange={this.handleChange} 
                        value={form ? form.fecha_almacenamiento : ''} 
                        style={{
                          borderRadius: '10px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.9)'
                        }}
                      />
                      <div className="invalid-feedback">{errors.fecha_almacenamiento}</div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold text-black">Tipo de Leche</label>
                      <select 
                        className={`form-control ${errors.tipo_de_leche ? 'is-invalid' : ''}`} 
                        name="tipo_de_leche" 
                        onChange={this.handleChange} 
                        value={form ? form.tipo_de_leche : ''} 
                        style={{
                          borderRadius: '10px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.9)'
                        }}
                      >
                        <option value="">Selecciona un tipo de leche</option>
                        <option value="Madura">Madura</option>
                        <option value="Calostro">Calostro</option>
                      </select>
                      <div className="invalid-feedback">{errors.tipo_de_leche}</div>
                    </div>

                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold text-black">Fecha de Entrega</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="fecha_entrega" 
                        onChange={this.handleChange} 
                        value={form ? form.fecha_entrega : ''} 
                        style={{
                          borderRadius: '10px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.9)'
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label fw-semibold text-black">Responsable</label>
                      <input 
                        type="text" 
                        className={`form-control ${errors.responsable ? 'is-invalid' : ''}`} 
                        name="responsable" 
                        onChange={this.handleChange} 
                        value={form ? form.responsable : ''} 
                        style={{
                          borderRadius: '10px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.9)'
                        }}
                        placeholder="Nombre del responsable"
                      />
                      <div className="invalid-feedback">{errors.responsable}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-0 pt-0">
            <div className="d-flex gap-3 w-100 justify-content-end">
              {form.id_control_leche ? (
                <button 
                  className="btn btn-lg d-flex align-items-center shadow-sm" 
                  onClick={this.peticionPut}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <FaCheck className="me-2" />
                  Actualizar
                </button>
              ) : (
                <button 
                  className="btn btn-lg d-flex align-items-center shadow-sm" 
                  onClick={this.peticionPost}
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '12px 24px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <FaPlus className="me-2" />
                  Insertar
                </button>
              )}
              <button 
                className="btn btn-lg d-flex align-items-center shadow-sm" 
                onClick={this.modalInsertar}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                <FaTimes className="me-2" />
                Cancelar
              </button>
            </div>
            </ModalFooter>
             </Modal>
            {/* Modal Eliminar mejorado */}
        <Modal isOpen={this.state.modalEliminar} className="modern-modal">
          <ModalHeader className="border-0 pb-0">
            <div className="d-flex align-items-center">
              <div 
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg,rgba(249, 59, 148, 0.91) 0%,rgb(238, 8, 39) 100%)',
                  borderRadius: '50%'
                }}
              >
                <FaExclamationTriangle className="text-white" size={20} />
              </div>
              <div>
                <h4 className="mb-1 fw-bold text-danger">¿Confirmar Eliminación?</h4>
                <p className="text-muted mb-0">Esta acción no se puede deshacer</p>
              </div>
            </div>
          </ModalHeader>
          
          <ModalBody className="p-4">
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <FaExclamationTriangle className="me-2" />
              <div>
                <strong>¡Atención!</strong> Está a punto de eliminar el registro del frasco <strong>{form && form.no_frascoregistro}</strong>.
                Esta acción eliminará permanentemente todos los datos asociados.
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="card border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderRadius: '15px' }}>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-2">Información del Registro</h6>
                    <p className="mb-1"><strong>ID:</strong> {form && form.id_control_leche}</p>
                    <p className="mb-1"><strong>No. Frasco:</strong> {form && form.no_frascoregistro}</p>
                    <p className="mb-0"><strong>Responsable:</strong> {form && form.responsable}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '15px' }}>
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-2 text-white">Detalles Adicionales</h6>
                    <p className="mb-1 text-white"><strong>Fecha Almacén:</strong> {form && form.fecha_almacenamiento}</p>
                    <p className="mb-1 text-white"><strong>Tipo de Leche:</strong> {form && form.tipo_de_leche}</p>
                    <p className="mb-0 text-white"><strong>Estado:</strong> {form && form.estado ? 'Disponible' : 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-0 pt-0">
            <div className="d-flex gap-3 w-100 justify-content-end">
              <button 
                className="btn btn-lg d-flex align-items-center shadow-sm" 
                onClick={this.peticionDelete}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                <FaTrash className="me-2" />
                Sí, Eliminar
              </button>
              <button 
                className="btn btn-lg d-flex align-items-center shadow-sm" 
                onClick={() => this.setState({ modalEliminar: false })}
                style={{
                  background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px 24px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                <FaTimes className="me-2" />
                Cancelar
              </button>
            </div>
          </ModalFooter>
        </Modal>

        {/* CSS personalizado para efectos hover y animaciones */}
        <style jsx>{`
          .hover-row:hover {
            background-color: #f8f9fa !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .modern-modal .modal-content {
            border-radius: 20px !important;
            border: none !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
          }
          
          .custom-paginator .p-paginator {
            background: transparent !important;
            border: none !important;
          }
          
          .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page {
            border-radius: 10px !important;
            margin: 0 2px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
          }
          
          .custom-paginator .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
          }
          
          .custom-paginator .p-paginator .p-paginator-first,
          .custom-paginator .p-paginator .p-paginator-prev,
          .custom-paginator .p-paginator .p-paginator-next,
          .custom-paginator .p-paginator .p-paginator-last {
            border-radius: 10px !important;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
            color: white !important;
            border: none !important;
            margin: 0 2px !important;
          }
          
          .table-responsive::-webkit-scrollbar {
            height: 8px;
          }
          
          .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          .table-responsive::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          
          .table-responsive::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }
          
          .btn:hover {
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
          
          .card {
            transition: all 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-2px);
          }
          
          @media (max-width: 768px) {
            .container-fluid {
              padding: 15px !important;
            }
            
            .card-body {
              padding: 20px !important;
            }
            
            .table-responsive {
              font-size: 0.9rem;
            }
            
            .btn {
              padding: 8px 16px !important;
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    );
}
}

function ResumenControlLecheFrascosWrapper() {
  const navigate = useNavigate();
  return <ShowControlLeche navigate={navigate} />;
}

export default ResumenControlLecheFrascosWrapper;