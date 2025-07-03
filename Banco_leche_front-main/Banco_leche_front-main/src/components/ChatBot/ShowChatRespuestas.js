import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "http://localhost:8080/api/chat_respuestas/";
const subtemasUrl = 'http://localhost:8080/api/chat_subtemas/';

class ShowChatRespuestas extends Component {
    state = {
        respuestas: [],
        subtemas: [],
        modalInsertar: false,
        modalEliminar: false,
        loading: true,
        form: {
            id_chat: '',
            pregunta: '',
            respuesta: '',
            enlace: '',
            id_subtema: '',
            tipoModal: ''
        }
    }

    componentDidMount() {
        this.peticionGet();
    }

    peticionGet = async () => {
        this.setState({ loading: true });
        try {
            const [respuestasResponse, subtemasResponse] = await Promise.all([
                axios.get(url),
                axios.get(subtemasUrl)
            ]);
            this.setState({
                respuestas: respuestasResponse.data,
                subtemas: subtemasResponse.data,
                enlace: respuestasResponse.data,
                loading: false
            });
        } catch (error) {
            console.log(error.message);
            Swal.fire('Error', 'Error al cargar los datos', 'error');
            this.setState({ loading: false });
        }
    }

    peticionPost = async () => {
        delete this.state.form.id_chat;
        try {
            await axios.post(url, this.state.form);
            this.modalInsertar();
            this.peticionGet();
            Swal.fire('Éxito', 'Respuesta creada exitosamente', 'success');
        } catch (error) {
            console.log(error.message);
            Swal.fire('Error', 'Error al crear la respuesta', 'error');
        }
    }

    peticionPut = async () => {
        try {
            await axios.put(url + this.state.form.id_chat, this.state.form);
            this.modalInsertar();
            this.peticionGet();
            Swal.fire('Éxito', 'Respuesta actualizada exitosamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error al actualizar la respuesta', 'error');
            console.log(error.message);
        }
    }

    peticionDelete = async () => {
        try {
            await axios.delete(url + this.state.form.id_chat);
            this.setState({ modalEliminar: false });
            this.peticionGet();
            Swal.fire('Éxito', 'Respuesta eliminada exitosamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error al eliminar la respuesta', 'error');
            console.log(error.message);
        }
    }

    modalInsertar = () => {
        this.setState(prevState => ({
            modalInsertar: !prevState.modalInsertar,
            form: {
                id_chat: '',
                pregunta: '',
                respuesta: '',
                enlace: '',
                id_subtema: '',
                tipoModal: 'insertar'
            }
        }));
    }

    seleccionarRespuesta = (respuesta) => {
        this.setState({
            tipoModal: 'actualizar',
            form: {
                id_chat: respuesta.id_chat,
                pregunta: respuesta.pregunta,
                respuesta: respuesta.respuesta,
                enlace: respuesta.enlace,
                id_subtema: respuesta.id_subtema
            },
            modalInsertar: true
        });
    }

    handleChange = (e) => {
        this.setState({
            form: {
                ...this.state.form,
                [e.target.name]: e.target.value
            }
        });
    }

    getNombreSubtema = (id_subtema) => {
        const subtema = this.state.subtemas.find(s => s.id_subtema === id_subtema);
        return subtema ? subtema.nombre : 'N/A';
    }

    render() {
        const { form, loading, subtemas, respuestas } = this.state;

        if (loading) {
            return <div>Cargando...</div>;
        }

        return (
            <div className="container-fluid">
                <br /><br /><br />
                <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-success" onClick={this.modalInsertar}>Agregar Respuesta</button>
                <br /><br />
               </div>

               <div className="table-responsive">
          <table className="table table-striped table-hover">
         
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pregunta</th>
                            <th>Respuesta</th>
                            <th>Enlace</th>
                            <th>Subtema</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {respuestas.map(respuesta => (
                            <tr key={respuesta.id_chat}>
                                <td>{respuesta.id_chat}</td>
                                <td>{respuesta.pregunta}</td>
                                <td>{respuesta.respuesta}</td>
                                <td>{respuesta.enlace}</td>
                                <td>{this.getNombreSubtema(respuesta.id_subtema)}</td>
                                <td>
                                    <button className="btn btn-primary" onClick={() => this.seleccionarRespuesta(respuesta)}>Editar</button>
                                    {" "}
                                    <button className="btn btn-danger" onClick={() => this.setState({ modalEliminar: true, form: respuesta })}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>

                <Modal isOpen={this.state.modalInsertar}>
                    <ModalHeader style={{ display: 'block' }}>
                        <span style={{ float: 'right' }} onClick={this.modalInsertar}>x</span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="form-group">
                            <label htmlFor="id_chat">ID</label>
                            <input className="form-control" type="text" name="id_chat" id="id_chat" readOnly onChange={this.handleChange} value={form ? form.id_chat : respuestas.length + 1} />
                            <br />
                            <label htmlFor="pregunta">Pregunta</label>
                            <input className="form-control" type="text" name="pregunta" id="pregunta" onChange={this.handleChange} value={form ? form.pregunta : ''} />
                            <br />
                            <label htmlFor="respuesta">Respuesta</label>
                            <textarea className="form-control" name="respuesta" id="respuesta" onChange={this.handleChange} value={form ? form.respuesta : ''} />
                            <br />
                            <label htmlFor="enlace">Enlace (opcional)</label>
                            <input className="form-control" type="text" name="enlace" id="enlace" onChange={this.handleChange} value={form ? form.enlace : ''} />
                            <br />
                            <label htmlFor="id_subtema">Subtema</label>
                            <select className="form-control" name="id_subtema" id="id_subtema" onChange={this.handleChange} value={form ? form.id_subtema : ''}>
                                <option value="">Seleccione un subtema</option>
                                {subtemas.map(subtema => (
                                    <option key={subtema.id_subtema} value={subtema.id_subtema}>{subtema.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        {this.state.form.tipoModal === 'insertar' ? 
                            <button className="btn btn-success" onClick={this.peticionPost}>
                                Insertar
                             </button> : <button className="btn btn-primary" onClick={this.peticionPut}>
                                Actualizar
                            </button>
                        }
                        <button className="btn btn-danger" onClick={this.modalInsertar}>Cancelar</button>
                    </ModalFooter>
                </Modal>

                <Modal isOpen={this.state.modalEliminar}>
                    <ModalBody>
                        Estás seguro que deseas eliminar la respuesta {form && form.pregunta}?
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

export default ShowChatRespuestas;
