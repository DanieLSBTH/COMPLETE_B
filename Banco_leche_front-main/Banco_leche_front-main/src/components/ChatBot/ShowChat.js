import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import ShowSubChat from './ShowSubChat';
const url = "http://localhost:8080/api/chat_temas/";

class ShowChat extends Component {
  state = {
    temas: [],
    modalInsertar: false,
    modalEliminar: false,
    form: {
      id_tema: '',
      tema: '',
      tipoModal: ''
    }
  }

  peticionGet = () => {
    axios.get(url).then(response => {
      this.setState({ temas: response.data });
    }).catch(error => {
      console.log(error.message);
    })
  }

  peticionPost = async () => {
    delete this.state.form.id_tema;
    await axios.post(url, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Tema creado exitosamente', 'success');
    }).catch(error => {
      console.log(error.message);
      Swal.fire('Error', 'Error al crear el tema', 'error');
    })
  }

  peticionPut = () => {
    axios.put(url + this.state.form.id_tema, this.state.form).then(response => {
      this.modalInsertar();
      this.peticionGet();
      Swal.fire('Éxito', 'Tema actualizado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al actualizar el tema', 'error');
      console.log(error.message);
    })
  }

  peticionDelete = () => {
    axios.delete(url + this.state.form.id_tema).then(response => {
      this.setState({ modalEliminar: false });
      this.peticionGet();
      Swal.fire('Éxito', 'Tema eliminado exitosamente', 'success');
    }).catch(error => {
      Swal.fire('Error', 'Error al eliminar el tema', 'error');
      console.log(error.message);
    })
  }

  modalInsertar = () => {
    this.setState({ modalInsertar: !this.state.modalInsertar });
  }

  seleccionarTema = (tema) => {
    this.setState({
      tipoModal: 'actualizar',
      form: {
        id_tema: tema.id_tema,
        tema: tema.tema
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
    console.log(this.state.form);
  }

  componentDidMount() {
    this.peticionGet();
  }

  render() {
    const { form } = this.state;
    return (
      <div className="container-fluid">
        <br /><br /><br />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-success" onClick={() => { this.setState({ form: null, tipoModal: 'insertar' }); this.modalInsertar() }}>Agregar Tema</button>
        </div>
        <br /><br />
        <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tema</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {this.state.temas.map(tema => {
              return (
                <tr key={tema.id_tema}>
                  <td>{tema.id_tema}</td>
                  <td>{tema.tema}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => { this.seleccionarTema(tema); this.modalInsertar() }}>Editar</button>
                    {"   "}
                    <button className="btn btn-danger" onClick={() => { this.seleccionarTema(tema); this.setState({ modalEliminar: true }) }}>Eliminar</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        <div className="modal-dialog">
          <Modal isOpen={this.state.modalInsertar} toggle={() => this.modalInsertar()}>
            <ModalHeader toggle={() => this.modalInsertar()}>{this.state.tipoModal === 'insertar' ? 'Insertar Tema' : 'Editar Tema'}</ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="id_tema">ID</label>
                <input className="form-control" type="text" name="id_tema" id="id_tema" readOnly onChange={this.handleChange} value={form ? form.id_tema : this.state.temas.length + 1} />
                <br />
                <label htmlFor="tema">Tema</label>
                <input className="form-control" type="text" name="tema" id="tema" onChange={this.handleChange} value={form ? form.tema : ''} />
              </div>
            </ModalBody>
            <ModalFooter>
              {this.state.tipoModal === 'insertar' ?
                <button className="btn btn-success" onClick={() => this.peticionPost()}>Insertar</button> :
                <button className="btn btn-primary" onClick={() => this.peticionPut()}>Actualizar</button>
              }
              <button className="btn btn-danger" onClick={() => this.modalInsertar()}>Cancelar</button>
            </ModalFooter>
          </Modal>
        </div>

        <div className="modal-dialog">
          <Modal isOpen={this.state.modalEliminar} toggle={() => this.modalInsertar()}>
            <ModalHeader>Eliminar Tema</ModalHeader>
            <ModalBody>
              Estás seguro que deseas eliminar el tema {form && form.tema}
            </ModalBody>
            <ModalFooter>
              <button className="btn btn-danger" onClick={() => this.peticionDelete()}>Sí</button>
              <button className="btn btn-secondary" onClick={() => this.setState({ modalEliminar: false })}>No</button>
            </ModalFooter>
          </Modal>
         
        </div>
      </div>

      
    );
  }
}

export default ShowChat;
