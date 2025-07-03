// InsertarPersonaModal.js
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FaUserPlus, FaUser, FaIdCard, FaClipboardCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const InsertarPersonaModal = ({ isOpen, toggle, onPersonaInsertada }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const peticionPost = async () => {
    if (!nombre || !apellido) {
      Swal.fire({
        title: 'Campos requeridos',
        text: 'Todos los campos son obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#667eea',
        background: '#fff',
        color: '#333'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/personal_estimulacion/', {
        nombre,
        apellido,
      });
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Persona agregada exitosamente',
        icon: 'success',
        confirmButtonColor: '#11998e',
        background: '#fff',
        color: '#333'
      });
      
      onPersonaInsertada(response.data);
      
      // Limpiar formulario
      setNombre('');
      setApellido('');
      toggle();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Error al agregar la persona',
        icon: 'error',
        confirmButtonColor: '#f5576c',
        background: '#fff',
        color: '#333'
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setNombre('');
    setApellido('');
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className="modern-modal" size="lg">
      <ModalHeader className="border-0 pb-0" toggle={handleClose}>
        <div className="d-flex align-items-center">
          <div style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px'
          }}>
            <FaUserPlus className="text-white" size={24} />
          </div>
          <div>
            <h4 className="mb-1 fw-bold text-primary">Registrar Nueva Persona</h4>
            <p className="text-muted mb-0">Complete la información de la persona</p>
          </div>
        </div>
      </ModalHeader>
      
      <ModalBody className="p-4">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="col-md-10">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="card-header border-0" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px 15px 0 0'
                }}>
                  <h6 className="mb-0 text-white fw-bold d-flex align-items-center">
                    <FaUser className="me-2" />
                    Información Personal
                  </h6>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Campo Nombre */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="nombre" className="form-label fw-semibold">
                          <FaUser className="me-2 text-primary" />
                          Nombre
                        </label>
                        <div className="position-relative">
                          <input
                            className="form-control"
                            type="text"
                            name="nombre"
                            id="nombre"
                            placeholder="Ingrese el nombre"
                            onChange={(e) => setNombre(e.target.value)}
                            value={nombre}
                            disabled={isLoading}
                            style={{
                              borderRadius: '10px',
                              border: '2px solid #e9ecef',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              paddingLeft: '16px'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e9ecef';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campo Apellido */}
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="apellido" className="form-label fw-semibold">
                          <FaIdCard className="me-2 text-primary" />
                          Apellido
                        </label>
                        <div className="position-relative">
                          <input
                            className="form-control"
                            type="text"
                            name="apellido"
                            id="apellido"
                            placeholder="Ingrese el apellido"
                            onChange={(e) => setApellido(e.target.value)}
                            value={apellido}
                            disabled={isLoading}
                            style={{
                              borderRadius: '10px',
                              border: '2px solid #e9ecef',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              paddingLeft: '16px'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#667eea';
                              e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#e9ecef';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
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
            disabled={isLoading || !nombre || !apellido}
            style={{
              background: isLoading || !nombre || !apellido 
                ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' 
                : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: isLoading || !nombre || !apellido 
                ? 'none' 
                : '0 8px 20px rgba(17, 153, 142, 0.3)',
              cursor: isLoading || !nombre || !apellido ? 'not-allowed' : 'pointer',
              opacity: isLoading || !nombre || !apellido ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? (
              <>
                <FaSpinner className="me-2 fa-spin" size={18} />
                Guardando...
              </>
            ) : (
              <>
                <FaClipboardCheck className="me-2" size={18} />
                Registrar Persona
              </>
            )}
          </button>
          
          <button 
            className="btn btn-lg d-flex align-items-center"
            onClick={handleClose}
            disabled={isLoading}
            style={{
              background: isLoading 
                ? 'linear-gradient(135deg, #6c757d 0%, #495057 100%)' 
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: isLoading 
                ? 'none' 
                : '0 8px 20px rgba(240, 147, 251, 0.3)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            <FaTimes className="me-2" size={16} />
            Cancelar
          </button>
        </div>
      </ModalFooter>

      {/* Estilos CSS adicionales */}
      <style jsx>{`
        .modern-modal .modal-content {
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }

        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2) !important;
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .d-flex.gap-3 {
            flex-direction: column;
          }
          
          .btn-lg {
            font-size: 14px;
            padding: 10px 16px;
          }
          
          .modal-dialog {
            margin: 10px;
          }
        }

        .alert {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-control {
          transition: all 0.3s ease !important;
        }

        .form-control:hover:not(:disabled) {
          border-color: #667eea;
        }
      `}</style>
    </Modal>
  );
};

export default InsertarPersonaModal;