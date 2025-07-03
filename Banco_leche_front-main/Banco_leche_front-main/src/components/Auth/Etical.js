import React, { useState } from 'react';
import { faHandHoldingHeart, faDroplet, faShieldHeart, faPlay } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DecideEtic.css';
const DecideEticFramework = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedPrinciples, setExpandedPrinciples] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrinciple, setSelectedPrinciple] = useState(null);
  const [formData, setFormData] = useState({
    dilema: '',
    stakeholders: '',
    marcoLegal: '',
    alternativas: '',
    decision: '',
    evidencia: '',
    evaluacionFinal: {
      trascendencia: '',
      integridad: '',
      consecuencias: ''
    }
  });

  const steps = [
    { 
      id: 'detectar', 
      title: 'Detectar', 
      subtitle: 'Identificar el dilema ético',
  
      color: 'danger',
      bgColor: 'bg-danger-light'
    },
    { 
      id: 'evaluar', 
      title: 'Evaluar', 
      subtitle: 'Analizar stakeholders',
     
      color: 'primary',
      bgColor: 'bg-primary-light'
    },
    { 
      id: 'contextualizar', 
      title: 'Contextualizar', 
      subtitle: 'Marco legal y normativo',
      
      color: 'info',
      bgColor: 'bg-info-light'
    },
    { 
      id: 'identificar', 
      title: 'Identificar', 
      subtitle: 'Explorar alternativas',
     
      color: 'warning',
      bgColor: 'bg-warning-light'
    },
    { 
      id: 'decidir', 
      title: 'Decidir', 
      subtitle: 'Tomar la decisión',
     
      color: 'success',
      bgColor: 'bg-success-light'
    },
    { 
      id: 'evidenciar', 
      title: 'Evidenciar', 
      subtitle: 'Documentar el proceso',
     
      color: 'secondary',
      bgColor: 'bg-secondary-light'
    },
    { 
      id: 'etic', 
      title: 'ETIC', 
      subtitle: 'Evaluación final',
      
      color: 'purple',
      bgColor: 'bg-purple-light'
    }
  ];

  const principles = [
    {
      name: 'Responsabilidad profesional',
      description: 'Responder por las consecuencias de nuestras decisiones técnicas',
    
      color: 'primary'
    },
    {
      name: 'Integridad',
      description: 'Actuar coherentemente con valores y compromisos éticos profesionales',
      
      color: 'success'
    },
    {
      name: 'Confidencialidad',
      description: 'Proteger información sensible sin encubrir riesgos críticos',
     
      color: 'info'
    },
    {
      name: 'No maleficencia',
      description: 'No causar daño, incluyendo daños por omisión',
     
      color: 'danger'
    },
    {
      name: 'Justicia',
      description: 'Garantizar trato justo y equitativo para todas las partes',
     
      color: 'warning'
    },
    {
      name: 'Autonomía ética',
      description: 'Capacidad de actuar moralmente más allá de intereses corporativos',
    
      color: 'purple'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEticChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      evaluacionFinal: {
        ...prev.evaluacionFinal,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const currentStep = steps[activeStep];
  const IconComponent = currentStep.icon;

  return (
    <div className="decide-etic-container">
      {/* Header */}
      <div className="header-gradient text-white py-5">
        <div className="container">
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-4">
              DECIDE-ETIC Framework
            </h1>
            <p className="lead mb-4">
              Framework ético para la toma de decisiones en ciberseguridad
            </p>
            <div className="framework-acronym p-4 rounded">
              <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                <span className="text-danger fw-bold">D</span>etectar •
                <span className="text-primary fw-bold">E</span>valuar •
                <span className="text-info fw-bold">C</span>ontextualizar •
                <span className="text-warning fw-bold">I</span>dentificar •
                <span className="text-success fw-bold">D</span>ecidir •
                <span className="text-secondary fw-bold">E</span>videnciar •
                <span className="text-purple fw-bold">ETIC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Step Navigation */}
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 fw-bold text-dark">Progreso del Framework</h2>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Paso {activeStep + 1} de {steps.length}</span>
              <span className="badge bg-primary rounded-pill">
                {Math.round(((activeStep + 1) / steps.length) * 100)}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress mb-4" style={{height: '12px'}}>
            <div 
              className="progress-bar progress-bar-animated"
              role="progressbar" 
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step Pills */}
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`btn step-pill ${
                    index === activeStep 
                      ? `btn-${step.color} active` 
                      : index < activeStep
                        ? 'btn-outline-success completed'
                        : 'btn-outline-secondary'
                  }`}
                >
                  <StepIcon className="me-2" />
                  <span className="d-none d-sm-inline">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-5">
          <div className={`card shadow-lg border-${currentStep.color}`}>
            <div className={`card-header bg-${currentStep.color} text-white`}>
              <div className="d-flex align-items-center">
                <div className="step-icon-container me-3">
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="h4 mb-1">{activeStep + 1}. {currentStep.title}</h3>
                  <p className="mb-0 opacity-90">{currentStep.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              {/* Step Content */}
              {activeStep === 0 && (
                <div>
                  <label className="form-label h5 fw-semibold">
                    Describe el dilema ético identificado
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="5"
                    value={formData.dilema}
                    onChange={(e) => handleInputChange('dilema', e.target.value)}
                    placeholder="Ejemplo: ¿Es ético guardar silencio sobre una vulnerabilidad crítica fuera del alcance acordado si esta podría exponer a miles de personas?"
                  />
                </div>
              )}

              {activeStep === 1 && (
                <div>
                  <label className="form-label h5 fw-semibold">
                    Lista de stakeholders afectados
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="6"
                    value={formData.stakeholders}
                    onChange={(e) => handleInputChange('stakeholders', e.target.value)}
                    placeholder="Ejemplo:&#10;• Pentester (profesional)&#10;• Empresa cliente&#10;• Terceros conectados&#10;• Usuarios finales&#10;• Organismos reguladores&#10;• Comunidad profesional"
                  />
                </div>
              )}

              {activeStep === 2 && (
                <div>
                  <label className="form-label h5 fw-semibold">
                    Marco legal y códigos éticos aplicables
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="6"
                    value={formData.marcoLegal}
                    onChange={(e) => handleInputChange('marcoLegal', e.target.value)}
                    placeholder="Ejemplo:&#10;• Contrato de pentesting vigente&#10;• Código de ética ISC²&#10;• Normativas de protección de datos&#10;• Legislación de ciberseguridad nacional&#10;• Estándares ISACA"
                  />
                </div>
              )}

              {activeStep === 3 && (
                <div>
                  <label className="form-label h5 fw-semibold">
                    Alternativas identificadas
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="7"
                    value={formData.alternativas}
                    onChange={(e) => handleInputChange('alternativas', e.target.value)}
                    placeholder="Ejemplo:&#10;• Guardar silencio y limitarse al informe oficial&#10;• Persuadir a la empresa para que actúe&#10;• Buscar asesoría ética o legal externa&#10;• Informar directamente a terceros o autoridades&#10;• Documentar hallazgo en informe confidencial&#10;• Consultar con organismos profesionales"
                  />
                </div>
              )}

              {activeStep === 4 && (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-6 mb-3">
                      <div className="card bg-success bg-opacity-10 border-success">
                        <div className="card-body">
                          <h5 className="card-title text-success d-flex align-items-center">
                           
                            Perspectivas éticas
                          </h5>
                          <div className="vstack gap-2">
                            {[
                              { name: 'Consecuencialista', desc: '¿Qué opción causa menos daño?' },
                              { name: 'Deontológica', desc: '¿Cuál es mi deber profesional?' },
                              { name: 'Ética de la virtud', desc: '¿Qué haría una persona íntegra?' },
                              { name: 'Ética del cuidado', desc: '¿Cómo proteger a los vulnerables?' }
                            ].map((item, index) => (
                              <div key={index} className="border-start border-success border-3 ps-3">
                                <div className="fw-semibold text-success">{item.name}</div>
                                <div className="small text-success-emphasis">{item.desc}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <div className="card bg-primary bg-opacity-10 border-primary">
                        <div className="card-body">
                          <h5 className="card-title text-primary d-flex align-items-center">
                       
                            Principios guía clave
                          </h5>
                          <div className="vstack gap-2">
                            {principles.slice(0, 4).map((principle, index) => {
                              const PrincipleIcon = principle.icon;
                              return (
                                <div key={index} className="d-flex align-items-center p-2 bg-white rounded">
                                  <PrincipleIcon className="text-primary me-2" />
                                  <span className="small fw-medium text-primary">{principle.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <label className="form-label h5 fw-semibold">
                    Decisión tomada y justificación
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="5"
                    value={formData.decision}
                    onChange={(e) => handleInputChange('decision', e.target.value)}
                    placeholder="Describe la decisión elegida y los argumentos éticos que la sustentan..."
                  />
                </div>
              )}

              {activeStep === 5 && (
                <div>
                  <label className="form-label h5 fw-semibold">
                    Documentación y evidencia
                  </label>
                  <textarea
                    className="form-control form-control-lg"
                    rows="7"
                    value={formData.evidencia}
                    onChange={(e) => handleInputChange('evidencia', e.target.value)}
                    placeholder="Incluye:&#10;• Registro del dilema identificado&#10;• Consultas realizadas&#10;• Recomendaciones emitidas&#10;• Acción tomada&#10;• Personas consultadas&#10;• Referencias a códigos éticos aplicados"
                  />
                </div>
              )}

              {activeStep === 6 && (
                <div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="card bg-danger bg-opacity-10 border-danger h-100">
                        <div className="card-body">
                          <h5 className="card-title text-danger d-flex align-items-center">
                           
                            Trascendencia
                          </h5>
                          <textarea
                            className="form-control border-danger"
                            rows="4"
                            value={formData.evaluacionFinal.trascendencia}
                            onChange={(e) => handleEticChange('trascendencia', e.target.value)}
                            placeholder="¿Qué impacto a largo plazo tendrá esta decisión?"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <div className="card bg-primary bg-opacity-10 border-primary h-100">
                        <div className="card-body">
                          <h5 className="card-title text-primary d-flex align-items-center">
                            
                            Integridad
                          </h5>
                          <textarea
                            className="form-control border-primary"
                            rows="4"
                            value={formData.evaluacionFinal.integridad}
                            onChange={(e) => handleEticChange('integridad', e.target.value)}
                            placeholder="¿Se mantuvo la coherencia ética y profesional?"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <div className="card bg-success bg-opacity-10 border-success h-100">
                        <div className="card-body">
                          <h5 className="card-title text-success d-flex align-items-center">
                          
                            Consecuencias
                          </h5>
                          <textarea
                            className="form-control border-success"
                            rows="4"
                            value={formData.evaluacionFinal.consecuencias}
                            onChange={(e) => handleEticChange('consecuencias', e.target.value)}
                            placeholder="¿Cuáles son las consecuencias observadas o esperadas?"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Principles Section */}
        <div className="mb-5">
          <div className="card shadow border-0">
            <button
              onClick={() => setExpandedPrinciples(!expandedPrinciples)}
              className="btn principles-header d-flex align-items-center justify-content-between p-4"
            >
              <div className="d-flex align-items-center">
             
                <div className="text-start">
                  <h4 className="mb-1">Principios Éticos Fundamentales</h4>
                  <p className="mb-0 small opacity-90">Principios guía para decisiones éticas en ciberseguridad</p>
                </div>
              </div>
              {expandedPrinciples ? <faHandHoldingHeart size={24} /> : <faHandHoldingHeart size={24} />}
            </button>
            
            {expandedPrinciples && (
              <div className="card-body">
                <div className="row">
                  {principles.map((principle, index) => {
                    const PrincipleIcon = principle.icon;
                    return (
                      <div key={index} className="col-md-6 col-lg-4 mb-3">
                        <div
                          onClick={() => {
                            setSelectedPrinciple(principle);
                            setModalOpen(true);
                          }}
                          className="card h-100 principle-card cursor-pointer"
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-start">
                              <div className={`principle-icon bg-${principle.color} bg-opacity-25 text-${principle.color} me-3`}>
                                <PrincipleIcon size={20} />
                              </div>
                              <div>
                                <h6 className="card-title fw-semibold">{principle.name}</h6>
                                <p className="card-text small text-muted">{principle.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <button
            onClick={prevStep}
            disabled={activeStep === 0}
            className={`btn d-flex align-items-center ${
              activeStep === 0 
                ? 'btn-outline-secondary disabled' 
                : 'btn-outline-primary'
            }`}
          >
           
            Anterior
          </button>

          <div className="text-center">
            <div className="small text-muted mb-1">Paso actual</div>
            <div className="fw-bold h5 mb-0">{currentStep.title}</div>
          </div>

          <button
            onClick={nextStep}
            disabled={activeStep === steps.length - 1}
            className={`btn d-flex align-items-center ${
              activeStep === steps.length - 1
                ? 'btn-outline-secondary disabled'
                : 'btn-primary'
            }`}
          >
            Siguiente
          
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedPrinciple && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex align-items-center">
                  <div className={`principle-icon bg-${selectedPrinciple.color} bg-opacity-25 text-${selectedPrinciple.color} me-3`}>
                    <selectedPrinciple.icon size={24} />
                  </div>
                  <h5 className="modal-title">{selectedPrinciple.name}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  {selectedPrinciple.description}
                </p>
                <p className="small text-muted mb-0">
                  Este principio es fundamental para la toma de decisiones éticas en el campo de la ciberseguridad 
                  y debe ser considerado en cada paso del framework DECIDE-ETIC.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecideEticFramework;