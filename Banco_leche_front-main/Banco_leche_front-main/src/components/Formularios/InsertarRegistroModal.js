// InsertarPersonaModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaUserMd, FaBaby, FaClipboardCheck, FaTimes, FaHospitalAlt } from 'react-icons/fa';

const InsertarRegistroModal = ({ isOpen, toggle, onPersonaInsertada }) => {
  const [registro_medico, setRegistro_medico] = useState('');
  const [recien_nacido, setRecien_nacido] = useState('');

   // Limpiar campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setRegistro_medico('');
      setRecien_nacido('');
    }
  }, [isOpen]);

  const peticionPost = async () => {
    if (!registro_medico || !recien_nacido) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/registro_medico/', {
        registro_medico,
        recien_nacido,
      });
      Swal.fire('Éxito', 'Persona agregada exitosamente', 'success');
      onPersonaInsertada(response.data);
      toggle();
    } catch (error) {
      Swal.fire('Error', 'Error al agregar la persona', 'error');
      console.log(error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} className="modern-modal" size="lg">
        <ModalHeader className="border-0 pb-0" toggle={toggle}>
          <div className="d-flex align-items-center">
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <FaHospitalAlt className="text-white" size={20} />
            </div>
            <div>
              <h4 className="mb-1 fw-bold text-primary">Insertar Nuevo Registro</h4>
              <p className="text-muted mb-0">Complete los datos del registro médico</p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-4">
          <div className="container-fluid">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="card-header border-0" style={{ 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: '15px 15px 0 0'
              }}>
                <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
                  <FaUserMd className="me-2" />
                  Información del Registro
                </h6>
              </div>
              <div className="card-body p-4">
                {/* Registro Médico */}
                <div className="form-group mb-4">
                  <label htmlFor="registro_medico" className="form-label fw-semibold">
                    <FaUserMd className="me-2 text-primary" />
                    Registro Médico
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="registro_medico"
                    id="registro_medico"
                    placeholder="Ingrese el número de registro médico..."
                    onChange={(e) => setRegistro_medico(e.target.value)}
                    value={registro_medico}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>

                {/* Recién Nacido */}
                <div className="form-group mb-3">
                  <label htmlFor="recien_nacido" className="form-label fw-semibold">
                    <FaBaby className="me-2 text-success" />
                    Recién Nacido
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="recien_nacido"
                    id="recien_nacido"
                    placeholder="Ingrese información del recién nacido..."
                    onChange={(e) => setRecien_nacido(e.target.value)}
                    value={recien_nacido}
                    style={{
                      borderRadius: '10px',
                      border: '2px solid #e9ecef',
                      padding: '12px',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#38ef7d'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-0 pt-0">
          <div className="d-flex gap-3 w-100 justify-content-end">
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={peticionPost}
              style={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(17, 153, 142, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FaClipboardCheck className="me-2" size={18} />
              Insertar Registro
            </button>
            <button 
              className="btn btn-lg d-flex align-items-center"
              onClick={toggle}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FaTimes className="me-2" size={16} />
              Cancelar
            </button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .modern-modal .modal-content {
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        @media (max-width: 768px) {
          .d-flex.gap-3 {
            flex-direction: column;
          }
          
          .btn-lg {
            font-size: 14px;
            padding: 10px 16px;
          }
        }
      `}</style>
    </>
  );
};

export default InsertarRegistroModal;