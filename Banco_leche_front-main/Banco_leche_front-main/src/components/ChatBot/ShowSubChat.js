import React, { Component } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const url = "http://localhost:8080/api/chat_subtemas/";
const temasUrl = 'http://localhost:8080/api/chat_temas/';

class ShowSubChat extends Component {
    state = {
        subtemas: [],
        temas: [],
        modalInsertar: false,
        modalEliminar: false,
        loading: true,
        form: {
            id_subtema: '',
            nombre: '',
            id_tema: '',
            tipoModal: ''
        }
    }

    componentDidMount() {
        this.peticionGet();
    }

    peticionGet = async () => {
        this.setState({ loading: true });
        try {
            const [subtemasResponse, temasResponse] = await Promise.all([
                axios.get(url),
                axios.get(temasUrl)
            ]);
            this.setState({ 
                subtemas: subtemasResponse.data,
                temas: temasResponse.data,
                loading: false
            });
        } catch (error) {
            console.log(error.message);
            Swal.fire('Error', 'Error al cargar los datos', 'error');
            this.setState({ loading: false });
        }
    }

    peticionPost = async () => {
        delete this.state.form.id_subtema;
        try {
            await axios.post(url, this.state.form);
            this.modalInsertar();
            this.peticionGet();
            Swal.fire('Éxito', 'Subtema creado exitosamente', 'success');
        } catch (error) {
            console.log(error.message);
            Swal.fire('Error', 'Error al crear el subtema', 'error');
        }
    }

    peticionPut = async () => {
        try {
            await axios.put(url + this.state.form.id_subtema, this.state.form);
            this.modalInsertar();
            this.peticionGet();
            Swal.fire('Éxito', 'Subtema actualizado exitosamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error al actualizar el subtema', 'error');
            console.log(error.message);
        }
    }

    peticionDelete = async () => {
        try {
            await axios.delete(url + this.state.form.id_subtema);
            this.setState({ modalEliminar: false });
            this.peticionGet();
            Swal.fire('Éxito', 'Subtema eliminado exitosamente', 'success');
        } catch (error) {
            Swal.fire('Error', 'Error al eliminar el subtema', 'error');
            console.log(error.message);
        }
    }

    modalInsertar = () => {
        this.setState(prevState => ({
            modalInsertar: !prevState.modalInsertar,
            form: {
                id_subtema: '',
                nombre: '',
                id_tema: '',
                tipoModal: 'insertar'
            }
        }));
    }

    seleccionarSubtema = (subtema) => {
        this.setState({
            tipoModal: 'actualizar',
            form: {
                id_subtema: subtema.id_subtema,
                nombre: subtema.nombre,
                id_tema: subtema.id_tema
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

    // Obtener el nombre del tema correctamente desde subtemas
    getNombreTema = (subtema) => {
        return subtema.chat_temas ? subtema.chat_temas.tema : 'N/A';
    }

    render() {
        const { form, loading, temas, subtemas } = this.state;

        if (loading) {
            return <div>Cargando...</div>;
        }

        return (
            <div className="container-fluid">
                <br /><br /><br />
                <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="btn btn-success" onClick={this.modalInsertar}>Agregar Subtema</button>
                </div>
                <br /><br />
                <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sub-tema</th>
                            <th>Tema</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subtemas.map(subtema => (
                            <tr key={subtema.id_subtema}>
                                <td>{subtema.id_subtema}</td>
                                <td>{subtema.nombre}</td>
                                <td>{this.getNombreTema(subtema)}</td> {/* Modificación aquí */}
                                <td>
                                    <button className="btn btn-primary" onClick={() => this.seleccionarSubtema(subtema)}>Editar</button>
                                    {" "}
                                    <button className="btn btn-danger" onClick={() => this.setState({ modalEliminar: true, form: subtema })}>Eliminar</button>
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
                            <label htmlFor="id_subtema">ID</label>
                            <input className="form-control" type="text" name="id_subtema" id="id_subtema" readOnly onChange={this.handleChange} value={form ? form.id_subtema : subtemas.length + 1} />
                            <br />
                            <label htmlFor="nombre">Sub-tema</label>
                            <input className="form-control" type="text" name="nombre" id="nombre" onChange={this.handleChange} value={form ? form.nombre : ''} />
                            <br />
                            <label htmlFor="id_tema">Tema</label>
                            <select className="form-control" name="id_tema" id="id_tema" onChange={this.handleChange} value={form ? form.id_tema : ''}>
                                <option value="">Seleccione un tema</option>
                                {temas.map(tema => (
                                    <option key={tema.id_tema} value={tema.id_tema}>{tema.tema}</option>
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
                        Estás seguro que deseas eliminar el subtema {form && form.nombre}?
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

export default ShowSubChat;
