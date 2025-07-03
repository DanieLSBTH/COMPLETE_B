import React, { useState } from 'react';
import axios from 'axios';
import { Button, Table, Container, Row, Col, Card, CardBody } from 'reactstrap';
import { FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ResumenRegistroMedico = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultado, setResultado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor ingrese un registro médico',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/solicitud_de_leches/search?registro_medico=${searchTerm}`);
      setResultado(response.data);
      
      if (response.data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin Resultados',
          text: 'No se encontraron registros para este registro médico',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al obtener los datos. Por favor, intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="px-3 px-md-4">
      <Row className="justify-content-center my-4">
        <Col xs={12} lg={10}>
          <h3 className="text-center mb-4">Resumen de Registro Médico</h3>
          
          {/* Barra de búsqueda */}
          <Row className="justify-content-center mb-4">
            <Col xs={12} sm={8} md={6} className="d-flex">
              <input
                type="text"
                placeholder="Ingrese Registro Médico"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control me-2"
              />
              <Button 
                color="primary" 
                onClick={handleSearch} 
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : <FaSearch />}
              </Button>
            </Col>
          </Row>

          {/* Contenido del resultado */}
          {resultado && resultado.map((solicitud, index) => (
            <Card key={index} className="mb-4 shadow-sm">
              <CardBody>
                <h5 className="card-title">Detalles de Solicitud de Leche</h5>
                
                {/* Información Personal */}
                <Row>
                  <Col xs={12} md={6}>
                    <Table bordered hover size="sm" className="mb-3">
                      <tbody>
                        <tr>
                          <th className="bg-light">Registro Médico</th>
                          <td>{solicitud.registro_medico}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Nombre Recién Nacido</th>
                          <td>{solicitud.nombre_recien_nacido}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Fecha Nacimiento</th>
                          <td>{solicitud.fecha_nacimiento}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Edad de Ingreso</th>
                          <td>{solicitud.edad_de_ingreso}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  
                  {/* Información Médica */}
                  <Col xs={12} md={6}>
                    <Table bordered hover size="sm" className="mb-3">
                      <tbody>
                        <tr>
                          <th className="bg-light">Tipo Paciente</th>
                          <td>{solicitud.tipo_paciente}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Peso al Nacer</th>
                          <td>{solicitud.peso_al_nacer} kg</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Peso Actual</th>
                          <td>{solicitud.peso_actual} kg</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Kilocalorías</th>
                          <td>{solicitud.kcal_o}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                {/* Detalles de la Solicitud */}
                <Row>
                  <Col xs={12}>
                    <Table bordered hover size="sm">
                      <tbody>
                        <tr>
                          <th className="bg-light">Volumen Toma (cc)</th>
                          <td>{solicitud.volumen_toma_cc}</td>
                          <th className="bg-light">Número de Tomas</th>
                          <td>{solicitud.numero_tomas}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Total Volumen Solicitado</th>
                          <td>{solicitud.total_vol_solicitado}</td>
                          <th className="bg-light">Servicio</th>
                          <td>{solicitud.servicio}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Fecha Entrega</th>
                          <td>{solicitud.fecha_entrega}</td>
                          <th className="bg-light">Solicitado Por</th>
                          <td>{solicitud.solicita}</td>
                        </tr>
                        <tr>
                          <th className="bg-light">Onzas</th>
                          <td>{solicitud.onzas}</td>
                          <th className="bg-light">Litros</th>
                          <td>{solicitud.litros}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                {/* Detalles de Control de Leche (si está presente) */}
                {solicitud.control_de_leches && (
                  <div className="mt-4">
                    <h6>Detalles de Control de Leche</h6>
                    <Table bordered hover size="sm">
                      <thead className="bg-light">
                        <tr>
                          <th>No. Frasco Registro</th>
                          <th>Fecha Almacenamiento</th>
                          <th>Volumen (ml/onza)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{solicitud.control_de_leches.no_frascoregistro}</td>
                          <td>{solicitud.control_de_leches.fecha_almacenamiento}</td>
                          <td>{solicitud.control_de_leches.volumen_ml_onza}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default ResumenRegistroMedico;