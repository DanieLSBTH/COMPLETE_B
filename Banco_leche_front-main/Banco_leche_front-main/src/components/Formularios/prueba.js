import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select'; // Importa react-select
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaChartBar } from 'react-icons/fa';
import { Button } from 'reactstrap';
import { Paginator } from 'primereact/paginator';

const urlSolicitudLeche = "http://localhost:8080/api/solicitud_de_leches/";
const urlControlLeche = "http://localhost:8080/api/control_de_leches/";



class ShowSolicitudLeche extends Component {
  state = {
    solicitudesLeches: [],
    controlLeches: [],
    modalInsertar: false,
    filtroControlLeche: '', 
    form: {
      id_solicitud: '',
      registro_medico: '',
      nombre_recien_nacido: '',
      fecha_nacimiento: '',
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
      fecha_entrega: '',
      solicita: '',
      onzas: '',
      tipoModal: ''
    },
    errors: {},
    rows: 10, // Registros por página pageSize: 10,
    first: 0, // Índice del primer registro= totalRecords
    currentPage: 1, // Página actual =
    
  };

  componentDidMount() {
    this.fetchSolicitudesLeches();
    this.fetchControlLeches();
  }

  handleNavigate = () => {
    this.props.navigate('/resumen-por-solicitud')
  }

  fetchSolicitudesLeches  = (page, pageSize) => {
    axios.get(urlSolicitudLeche, {
      params: {
        page: page,
        pageSize: pageSize,
      }
    })
      .then(response => {
        this.setState({
          solicitudesLeches: response.data.solicitudes,
          totalRecords: response.data.totalRecords,
          currentPage: response.data.currentPage,
          // totalPages: response.data.totalPages, // Opcional, no es necesario si usas totalRecords y pageSize
        });
      })
      .catch(error => {
        console.log('Error al obtener controlLeches:', error.message);
      });
  };
  fetchControlLeches = () => {
    axios.get(urlControlLeche).then(response => {
      this.setState({ controlLeches: response.data.controlDeLeches });
    }).catch(error => {
      console.log(error.message);
    });
  };
  onPageChange = (event) => {
    const { first, rows } = event;
    const page = first / rows;

    this.setState({ first, currentPage: page + 1 });
    this.fetchSolicitudesLeches(page, rows);
  };

  validateForm = () => {
    const { form } = this.state;
    let errors = { registro_medico: '', general: '' };
    let formIsValid = true;

    if (!form) {
      errors.general = 'El formulario está vacío.';
      formIsValid = false;
    }
     // Verifica que el objeto form no sea null
  if (!form) {
    return { valid: false, errors: { general: "El formulario no está inicializado." } };
  }

    // Verificar cada campo y agregar errores a `errors`
    const requiredFields = [
      { key: 'registro_medico', message: 'El registro médico es obligatorio.' },
      { key: 'nombre_recien_nacido', message: 'El nombre del recién nacido es requerido.' },
      { key: 'fecha_nacimiento', message: 'La fecha de nacimiento es requerida.' },
      { key: 'tipo_paciente', message: 'El tipo de paciente es requerido.' },
      { key: 'peso_al_nacer', message: 'El peso debe ser mayor a 0.', condition: (value) => value <= 0 },
      { key: 'peso_actual', message: 'El peso debe ser mayor a 0.', condition: (value) => value <= 0 },
      { key: 'kcal_o', message: 'El tipo de leche es requerido.' },
      { key: 'volumen_toma_cc', message: 'El volumen de toma es requerido.' },
      { key: 'numero_tomas', message: 'El número de tomas es requerido.' },
      { key: 'id_control_leche', message: 'Debe seleccionar un control de leche.' },
      { key: 'servicio', message: 'El servicio es requerido.' },
      { key: 'fecha_entrega', message: 'La fecha de entrega es requerida.' },
      { key: 'solicita', message: 'El solicita es requerido.' }
    ];

    requiredFields.forEach(({ key, message, condition }) => {
      if (!form[key] || (condition && condition(form[key]))) {
        errors[key] = message;
        formIsValid = false;
      }
    });

    // Si hay errores, establece un mensaje de error general
    if (!formIsValid) {
      errors.general = 'Por favor, completa todos los campos requeridos.';
    }

    this.setState({ errors });
    return formIsValid;
    
  };

  handleControlLecheChange = (id) => {
    const controlLeche = this.state.controlLeches.find(c => c.id_control_leche === id);
    if (controlLeche) {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          id_control_leche: id
        }
      }));
    }
  };

  

  peticionPost = async () => {
    if (this.validateForm()) {
        // Realiza la petición POST
        await axios.post(urlSolicitudLeche, this.state.form).then(response => {
            this.modalInsertar();

            // Actualizar manualmente la tabla sin recargar toda la lista
            this.setState(prevState => ({
                solicitudesLeches: [...prevState.solicitudesLeches, response.data] // Añade la nueva solicitud
            }));

            Swal.fire('Éxito', 'Registro creado exitosamente', 'success');
        }).catch(error => {
            console.log(error.message);
            Swal.fire('Error', 'Error al crear el registro', 'error');
        });
    } else {
        Swal.fire('Error', 'El formulario está vacío o contiene errores.', 'error');
    }
};


  peticionPut = () => {
    if (this.validateForm()) {
      axios.put(urlSolicitudLeche + this.state.form.id_solicitud, this.state.form)
        .then(response => {
          console.log('Respuesta del PUT:', response); // Para depuración
          this.modalInsertar();
          this.fetchSolicitudesLeches(); // Nombre corregido
          Swal.fire('Éxito', 'Registro actualizado exitosamente', 'success');
        })
        .catch(error => {
          Swal.fire('Error', 'Error al actualizar el registro', 'error');
          console.log(error.message);
        });
    }
  };

  peticionDelete = () => {
    axios.delete(urlSolicitudLeche + this.state.form.id_solicitud).then(response => {
      this.setState({ modalEliminar: false });
      this.fetchSolicitudesLeches();
      Swal.fire('Éxito', 'Solicitud eliminada exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar la solicitud', 'error');
      console.log(error.message);
    });
  };

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar, errors: {} }); // Limpiar errores al abrir el modal
  };

  seleccionarSolicitudLeche = (solicitud) => {
    this.setState({
      tipoModal: 'actualizar',
      form: { ...solicitud }
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      form: { ...prevState.form, [name]: value }
    }));

    // Limpiar errores al cambiar el campo
    if (this.state.errors[name]) {
      this.setState(prevState => ({
        errors: { ...prevState.errors, [name]: undefined }
      }));
    }
  };
  
  formatControlLechesOptions = () => {
    return this.state.controlLeches.map(control => ({
      value: control.id_control_leche,
      label: `${control.no_frascoregistro}`
    }));
  };
  handleControlLecheChange = (selectedOption) => {
    if (selectedOption) {
      this.setState(prevState => ({
        form: {
          ...prevState.form,
          id_control_leche: selectedOption.value
        }
      }));
    } else {
      this.setState(prevState => ({
        form: { 
          ...prevState.form, 
          id_control_leche: ''
        },
        errors: { ...prevState.errors, id_control_leche: "Debe seleccionar un control de leche." }
      }));
    }
  };
  render() {
    const { form, solicitudesLeches, controlLeches, modalInsertar, modalEliminar, errors, first, rows, totalRecords,currentPage,  } = this.state;
    const navigate = this.props.navigate; // Obtenemos la función navigate desde props
    
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Solicitud</button>
          <Button color="info" onClick={this.handleNavigate} className="d-flex align-items-center">
            <FaChartBar className="me-2" />
            Mostrar Resumen por Servicio
          </Button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Registro Médico</th>
                <th>Recién Nacido</th>
                <th>Fecha Nacimiento</th>
                <th>Edad Ingreso</th>
                <th>Tipo paciente</th>
                <th>Peso al Nacer</th>
                <th>Peso Actual</th>
                <th>kcal_o</th>
                <th>Volumen Toma (cc)</th>
                <th>Número Tomas</th>
                <th>Total Volumen Solicitado</th>
                <th>No. Frasco</th>
                <th>Fecha Almacenamiento</th>
                <th>Volumen ml</th>
                <th>kcal_l</th>
                <th>Acidez</th>
                <th>Servicio</th>
                <th>Fecha Entrega</th>
                <th>Solicita</th>
                <th>Onzas</th>
                <th>Litros</th>
                <th>Costos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesLeches.map(solicitud => {
                const controlLeche = controlLeches.find(c => c.id_control_leche === solicitud.id_control_leche);
                return (
                  <tr key={solicitud.id_solicitud}>
                    <td>{solicitud.id_solicitud}</td>
                    <td>{solicitud.registro_medico}</td>
                    <td>{solicitud.nombre_recien_nacido}</td>
                    <td>{solicitud.fecha_nacimiento}</td>
                    <td>{solicitud.edad_de_ingreso}</td>
                    <td>{solicitud.tipo_paciente}</td>
                    <td>{solicitud.peso_al_nacer}</td>
                    <td>{solicitud.peso_actual}</td>
                    <td>{solicitud.kcal_o}</td>
                    <td>{solicitud.volumen_toma_cc}</td>
                    <td>{solicitud.numero_tomas}</td>
                    <td>{solicitud.total_vol_solicitado}</td>
                    <td>{controlLeche ? controlLeche.no_frascoregistro : ''}</td>
                    <td>{controlLeche ? controlLeche.fecha_almacenamiento : ''}</td>
                    <td>{controlLeche ? controlLeche.volumen_ml_onza : ''}</td>
                    <td>{controlLeche ? controlLeche.trabajo_de_pasteurizaciones.kcal_l : ''}</td>
                    <td>{controlLeche ? controlLeche.trabajo_de_pasteurizaciones.acidez : ''}</td>
                    <td>{solicitud.servicio}</td>
                    <td>{solicitud.fecha_entrega}</td>
                    <td>{solicitud.solicita}</td>
                    <td>{solicitud.onzas}</td>
                    <td>{solicitud.litros}</td>
                    <td>{solicitud.costos}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => { this.seleccionarSolicitudLeche(solicitud); this.modalInsertar() }}>Editar</button>
                      <button className="btn btn-danger" onClick={() => { this.seleccionarSolicitudLeche(solicitud); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
  {/* Paginador */}
  <Paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPageChange={this.onPageChange}
        />
        {/* Modal para insertar/editar */}
        <Modal size="lg" isOpen={modalInsertar} toggle={this.modalInsertar}>
          <ModalHeader toggle={this.modalInsertar}>{this.state.tipoModal === 'insertar' ? 'Insertar Solicitud' : 'Editar Solicitud'}</ModalHeader>
          <ModalBody>
            <div className="Container">
              {this.state.errors.general && (
                <div className="alert alert-danger">
                  {this.state.errors.general}
                </div>
              )}
              <div className="row">
                {/* Registro Médico */}
                <div className="form-group col-md-6">
                  <label htmlFor="registro_medico">Registro Médico</label>
                  <input
                    type="text"
                    className={`form-control ${errors.registro_medico ? 'is-invalid' : ''}`}
                    name="registro_medico"
                    onChange={this.handleChange}
                    value={form ? form.registro_medico : ''}
                  />
                  <div className="invalid-feedback">{errors.registro_medico}</div>
                </div>
                {/* Nombre del Recién Nacido */}
                <div className="form-group col-md-6">
                  <label htmlFor="nombre_recien_nacido">Nombre del Recién Nacido</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre_recien_nacido ? 'is-invalid' : ''}`}
                    name="nombre_recien_nacido"
                    onChange={this.handleChange}
                    value={form ? form.nombre_recien_nacido : ''}
                  />
                  <div className="invalid-feedback">{errors.nombre_recien_nacido}</div>
                </div>
                {/* Fecha de Nacimiento */}
                <div className="form-group col-md-6">
                  <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                    name="fecha_nacimiento"
                    onChange={this.handleChange}
                    value={form ? form.fecha_nacimiento : ''}
                  />
                  <div className="invalid-feedback">{errors.fecha_nacimiento}</div>
                </div>
                {/* Edad de Ingreso */}
                <div className="form-group col-md-6">
                  <label htmlFor="edad_de_ingreso">Edad de Ingreso </label>
                  <input
                    type="text"
                    className={`form-control ${errors.edad_de_ingreso ? 'is-invalid' : ''}`}
                    name="edad_de_ingreso"
                    onChange={this.handleChange}
                    value={form ? form.edad_de_ingreso : ''}
                  />
                  <div className="invalid-feedback">{errors.edad_de_ingreso}</div>
                </div>
                {/* Tipo de Paciente */}
                <div className="form-group col-md-6">
  <label htmlFor="tipo_paciente">Tipo de Paciente</label>
  <select 
    className={`form-control ${errors.tipo_paciente ? 'is-invalid' : ''}`} 
    name="tipo_paciente" 
    onChange={this.handleChange} 
    value={form ? form.tipo_paciente : ''} 
  >
    <option value="">Selecciona el tipo de paciente</option>
    <option value="Prematuro">Prematuro</option>
    <option value="Termino">Término</option>
  </select>
  <div className="invalid-feedback">{errors.tipo_paciente}</div>
</div>

                
                {/* Peso al Nacer */}
                <div className="form-group col-md-6">
                  <label htmlFor="peso_al_nacer">Peso al Nacer </label>
                  <input
                    type="number"
                    className={`form-control ${errors.peso_al_nacer ? 'is-invalid' : ''}`}
                    name="peso_al_nacer"
                    onChange={this.handleChange}
                    value={form ? form.peso_al_nacer : ''}
                  />
                  <div className="invalid-feedback">{errors.peso_al_nacer}</div>
                </div>
                {/* Peso Actual */}
                <div className="form-group col-md-6">
                  <label htmlFor="peso_actual">Peso Actual </label>
                  <input
                    type="number"
                    className={`form-control ${errors.peso_actual ? 'is-invalid' : ''}`}
                    name="peso_actual"
                    onChange={this.handleChange}
                    value={form ? form.peso_actual : ''}
                  />
                  <div className="invalid-feedback">{errors.peso_actual}</div>
                </div>
                {/* No. Frasco */}
                <div className="form-group col-md-6">
  <label>No. Frasco</label>
                <Select
  className={`react-select ${errors.id_control_leche ? 'is-invalid' : ''}`}
  options={this.formatControlLechesOptions()}
  onChange={this.handleControlLecheChange}
  value={this.formatControlLechesOptions().find(option => option.value === (form?.id_control_leche ?? ''))} // Usar el operador de coalescencia nula
  isClearable
  isSearchable
  placeholder="Buscar número de frasco..."
  noOptionsMessage={() => "No hay frascos disponibles"}
  styles={{
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: errors.id_control_leche ? '#dc3545' : state.isFocused ? '#80bdff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none',
      '&:hover': {
        borderColor: errors.id_control_leche ? '#dc3545' : '#80bdff'
      }
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: '#6c757d'
    }),
    input: (baseStyles) => ({
      ...baseStyles,
      color: '#495057'
    }),
    option: (baseStyles, { isFocused, isSelected }) => ({
      ...baseStyles,
      backgroundColor: isSelected 
        ? '#007bff' 
        : isFocused 
          ? '#f8f9fa'
          : null,
      color: isSelected ? 'white' : '#495057',
      ':active': {
        backgroundColor: '#007bff',
        color: 'white'
      }
    })
  }}
/>
</div>
                {/* Kcal (O) */}
                <div className="form-group col-md-6">
                  <label htmlFor="kcal_o">Kcal (O)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.kcal_o ? 'is-invalid' : ''}`}
                    name="kcal_o"
                    onChange={this.handleChange}
                    value={form ? form.kcal_o : ''}
                  />
                  <div className="invalid-feedback">{errors.kcal_o}</div>
                </div>
                {/* Volumen Toma (cc) */}
                <div className="form-group col-md-6">
                  <label htmlFor="volumen_toma_cc">Volumen Toma (cc)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.volumen_toma_cc ? 'is-invalid' : ''}`}
                    name="volumen_toma_cc"
                    onChange={this.handleChange}
                    value={form ? form.volumen_toma_cc : ''}
                  />
                  <div className="invalid-feedback">{errors.volumen_toma_cc}</div>
                </div>
                {/* Número de Tomas */}
                <div className="form-group col-md-6">
                  <label htmlFor="numero_tomas">Número de Tomas</label>
                  <input
                    type="number"
                    className={`form-control ${errors.numero_tomas ? 'is-invalid' : ''}`}
                    name="numero_tomas"
                    onChange={this.handleChange}
                    value={form ? form.numero_tomas : ''}
                  />
                  <div className="invalid-feedback">{errors.numero_tomas}</div>
                </div>
                {/* Total Volumen Solicitado (cc) */}
                <div className="form-group col-md-6">
                  <label htmlFor="total_vol_solicitado">Total Volumen Solicitado (cc)</label>
                  <input
                    type="number"
                    className={`form-control ${errors.total_vol_solicitado ? 'is-invalid' : ''}`}
                    name="total_vol_solicitado"
                    onChange={this.handleChange}
                    value={form ? form.total_vol_solicitado : ''}
                  />
                  <div className="invalid-feedback">{errors.total_vol_solicitado}</div>
                </div>
                {/* Servicio */}
                <div className="form-group col-md-6">
  <label htmlFor="servicio">Servicio</label>
  <select 
    className={`form-control ${errors.servicio ? 'is-invalid' : ''}`} 
    name="servicio" 
    onChange={this.handleChange} 
    value={form ? form.servicio : ''} 
  >
    <option value="">Selecciona el servicio</option>
    <option value="Alto riesgo">Alto riesgo</option>
    <option value="Mediano riesgo">Mediano riesgo</option>
    <option value="Recuperación materno neonatal">Recuperación materno neonatal</option>
  </select>
  <div className="invalid-feedback">{errors.servicio}</div>
</div>

                {/* Fecha de Entrega */}
                <div className="form-group col-md-6">
                  <label htmlFor="fecha_entrega">Fecha de Entrega</label>
                  <input
                    type="date"
                    className={`form-control ${errors.fecha_entrega ? 'is-invalid' : ''}`}
                    name="fecha_entrega"
                    onChange={this.handleChange}
                    value={form ? form.fecha_entrega : ''}
                  />
                  <div className="invalid-feedback">{errors.fecha_entrega}</div>
                </div>
                {/* Solicita */}
                <div className="form-group col-md-6">
                  <label htmlFor="solicita">Solicita</label>
                  <input
                    type="text"
                    className={`form-control ${errors.solicita ? 'is-invalid' : ''}`}
                    name="solicita"
                    onChange={this.handleChange}
                    value={form ? form.solicita : ''}
                  />
                  <div className="invalid-feedback">{errors.solicita}</div>
                </div>
                {/* Onzas */}
                
                <br />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {this.state.tipoModal === 'insertar' ?
              <button className="btn btn-success" onClick={this.peticionPost}>Insertar</button> :
              <button className="btn btn-primary" onClick={this.peticionPut}>Actualizar</button>
            }
            <button className="btn btn-danger" onClick={this.modalInsertar}>Cancelar</button>
          </ModalFooter>
        </Modal>

        {/* Modal para eliminar */}
        <Modal isOpen={modalEliminar} toggle={() => this.setState({ modalEliminar: false })}>
          <ModalHeader toggle={() => this.setState({ modalEliminar: false })}>Eliminar Solicitud</ModalHeader>
          <ModalBody>
            ¿Estás seguro que deseas eliminar esta solicitud?
          </ModalBody>
          <ModalFooter>
            <button className="btn btn-danger" onClick={this.peticionDelete}>Sí</button>
            <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

function ShowSolicitudLecheWrapper() {
  const navigate = useNavigate();
  return <ShowSolicitudLeche navigate={navigate} />;
}

export default ShowSolicitudLecheWrapper;