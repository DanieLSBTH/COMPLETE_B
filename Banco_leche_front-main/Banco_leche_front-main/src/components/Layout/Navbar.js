import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaHospital, FaRobot, FaSignInAlt, FaComments, FaCommentAlt, FaPaperPlane, FaUsers, FaFemale, FaUserNurse, FaHospitalUser, FaUserMd, FaBaby, FaClipboard, FaChartLine, FaSignOutAlt, FaHeartbeat, FaFlask, FaWater, FaHandsHelping } from 'react-icons/fa';
import './Navbar.css';
import logo from '../Images/backgrounds/Logo_bancon.png';

const NavbarComponent = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (auth.token) {
      setTimeout(() => setAnimate(true), 100);
    } else {
      setAnimate(false);
    }
  }, [auth.token]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const NavContent = () => (
    <>
      <Nav className={`me-auto modern-nav ${animate ? 'nav-animate' : ''}`}>
        <Link className="nav-link modern-nav-item" to="/dashboard" onClick={handleClose}>
          <div className="nav-icon-wrapper dashboard-icon">
            <FaChartLine />
          </div>
          <span className="nav-text">Dashboard</span>
        </Link>
        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper personal-icon">
                <FaUserNurse />
              </div>
              <span className="nav-text">Personal</span>
            </div>
          } 
          id="estimulacion-dropdown"
          className="modern-dropdown"
        >
        <Link className="dropdown-item modern-dropdown-item" to="/showpersonal" onClick={handleClose}>
          <div className="nav-icon-wrapper personal-icon">
            <FaUserNurse />
          </div>
          <span className="nav-text">Personal</span>
        </Link>
        
        <Link className="dropdown-item modern-dropdown-item" to="/showusuario" onClick={handleClose}>
          <div className="nav-icon-wrapper usuario-icon">
            <FaUserNurse />
          </div>
          <span className="nav-text">Usuario</span>
        </Link>
</NavDropdown>
        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper estimulacion-icon">
                <FaHeartbeat />
              </div>
              <span className="nav-text">Estimulación</span>
            </div>
          } 
          id="estimulacion-dropdown"
          className="modern-dropdown"
        >
          <Link className="dropdown-item modern-dropdown-item" to="/showestimulacionpersonas" onClick={handleClose}>
            <FaHeartbeat className="dropdown-icon" />
            <span>Estimulación Personas</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/showstimulation" onClick={handleClose}>
            <FaHeartbeat className="dropdown-icon" />
            <span>Detalle Estimulación</span>
          </Link>
        </NavDropdown>

        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper donadoras-icon">
                <FaUsers />
              </div>
              <span className="nav-text">Donadoras</span>
            </div>
          } 
          id="donadoras-dropdown"
          className="modern-dropdown"
        >
          <Link className="dropdown-item modern-dropdown-item" to="/showdonadoradetalle" onClick={handleClose}>
            <FaBaby className="dropdown-icon" />
            <span>Donadora Detalle</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/showdonadora" onClick={handleClose}>
            <FaFemale className="dropdown-icon" />
            <span>Donadora</span>
          </Link>
        </NavDropdown>

        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper servicios-icon">
                <FaHospitalUser />
              </div>
              <span className="nav-text">Servicios</span>
            </div>
          } 
          id="servicios-dropdown"
          className="modern-dropdown"
        >
          <Link className="dropdown-item modern-dropdown-item" to="/showservicioex" onClick={handleClose}>
            <FaUserNurse className="dropdown-icon" />
            <span>ServicioEx</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/showservicioin" onClick={handleClose}>
            <FaUserMd className="dropdown-icon" />
            <span>ServicioIn</span>
          </Link>
        </NavDropdown>

        <NavDropdown 
  title={
    <div className="dropdown-title-wrapper">
      <div className="nav-icon-wrapper pasteurizacion-icon">
        <FaFlask />
      </div>
      <span className="nav-text">Procesos Leche</span>
    </div>
  } 
  id="procesos-leche-dropdown"
  className="modern-dropdown"
>
  <Link className="dropdown-item modern-dropdown-item" to="/Showpasteurizacion" onClick={handleClose}>
    <FaFlask className="dropdown-icon" />
    <span>Pasteurización</span>
  </Link>
  <Link className="dropdown-item modern-dropdown-item" to="/Showcontrolleche" onClick={handleClose}>
    <FaWater className="dropdown-icon" />
    <span>Control Leche</span>
  </Link>
</NavDropdown>


        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper solicitudes-icon">
                <FaHandsHelping />
              </div>
              <span className="nav-text">Solicitudes</span>
            </div>
          } 
          id="solicitudes-dropdown"
          className="modern-dropdown"
        >
          <Link className="dropdown-item modern-dropdown-item" to="/Showsolicitudleche" onClick={handleClose}>
            <FaHandsHelping className="dropdown-icon" />
            <span>Solicitud Leche</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/Showregistromedico" onClick={handleClose}>
            <FaClipboard className="dropdown-icon" />
            <span>Registro Médico</span>
          </Link>
        </NavDropdown>
          {/*
        <NavDropdown 
          title={
            <div className="dropdown-title-wrapper">
              <div className="nav-icon-wrapper bot-icon">
                <FaRobot />
              </div>
              <span className="nav-text">Bot</span>
            </div>
          } 
          id="bot-dropdown"
          className="modern-dropdown"
        >
          <Link className="dropdown-item modern-dropdown-item" to="/showchat" onClick={handleClose}>
            <FaComments className="dropdown-icon" />
            <span>Chat Tema</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/showsubchat" onClick={handleClose}>
            <FaCommentAlt className="dropdown-icon" />
            <span>Chat Sub-tema</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/showchatrespuestas" onClick={handleClose}>
            <FaPaperPlane className="dropdown-icon" />
            <span>Chat Respuesta</span>
          </Link>
          <Link className="dropdown-item modern-dropdown-item" to="/chatbotexample" onClick={handleClose}>
            <FaRobot className="dropdown-icon" />
            <span>ChatBot</span>
          </Link>
        </NavDropdown>*/}
      </Nav>
      
      <Button 
        variant="outline-light" 
        onClick={handleLogout} 
        className="modern-logout-btn"
      >
        <div className="logout-icon-wrapper">
          <FaSignOutAlt />
        </div>
        <span>Cerrar Sesión</span>
      </Button>
    </>
  );

  return (
    <>
      <Navbar expand="lg" className="modern-navbar" variant="dark">
        <Container fluid className="d-flex justify-content-between align-items-center">
          {/* Logo and title section */}
          <div className="d-flex align-items-center">
            <Navbar.Brand as={Link} to="/" className="modern-navbar-brand ms-0">
              <div className="logo-container">
                <img
                  src={logo}
                  width="80"
                  height="80"
                  className="logo-image"
                  alt="Logo"
                />
                <div className="logo-glow"></div>
              </div>
            </Navbar.Brand>
            
            {!auth.token && (
              <div className="navbar-title-section d-none d-md-block">
                <h1 className="main-title">Banco de Leche Humana</h1>
                <h2 className="sub-title">Departamento de Pediatría</h2>
                <div className="title-decoration"></div>
              </div>
            )}
          </div>

          {/* Login button section */}
          <div className="d-flex align-items-center">
            {!auth.token && (
              <Button
                as={Link}
                to="/login"
                className="modern-login-btn ms-auto"
              >
                <div className="login-icon-wrapper">
                  <FaSignInAlt />
                </div>
                <span>Iniciar Sesión</span>
              </Button>
            )}

            {/* Navbar toggle button */}
            <Navbar.Toggle 
              aria-controls="navbar-content" 
              onClick={handleShow} 
              className="modern-toggle ms-2"
            />
          </div>

          {/* Desktop view */}
          <Navbar.Collapse id="navbar-content" className="d-none d-lg-flex justify-content-end">
            {auth.token && <NavContent />}
          </Navbar.Collapse>
          
          {/* Mobile view */}
          <Offcanvas show={show} onHide={handleClose} placement="end" className="modern-offcanvas d-lg-none">
            <Offcanvas.Header closeButton className="modern-offcanvas-header">
              <Offcanvas.Title className="modern-offcanvas-title">
                <FaHospital className="me-2" />
                Menú Principal
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="modern-offcanvas-body">
              {!auth.token && (
                <div className="mb-4 text-center">
                  <Button
                    as={Link}
                    to="/login"
                    className="modern-mobile-login-btn w-100"
                  >
                    <FaSignInAlt className="me-2" />
                    Iniciar Sesión
                  </Button>
                </div>
              )}
              {auth.token && <NavContent />}
            </Offcanvas.Body>
          </Offcanvas>
        </Container>
      </Navbar>

      {/* Modern CSS Styles */}
     <style jsx>{`
        .modern-navbar {
        background: linear-gradient(135deg, #d48d3b 0%, #4b58a2 60%, #303860 100%);
 
        backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: none;
          padding: 1rem 0;
          position: relative;
          overflow: visible;
          z-index: 1040;
        }

        .modern-navbar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          z-index: 0;
        }

        .modern-navbar > * {
          position: relative;
          z-index: 1;
        }

        .logo-container {
          position: relative;
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          transform: scale(1.05);
        }

        .logo-image {
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .logo-glow {
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .logo-container:hover .logo-glow {
          opacity: 1;
        }

        .navbar-title-section {
          margin-left: 2rem;
          position: relative;
        }

        .main-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          background: linear-gradient(45deg, #ffffff, #f0f0f0);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sub-title {
          font-size: 1.1rem;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }

        .title-decoration {
          height: 2px;
          width: 60px;
          background: linear-gradient(90deg, #ffffff, transparent);
          margin-top: 8px;
          border-radius: 1px;
        }

        .modern-nav {
          gap: 0.5rem;
        }

        /* 🔥 ESTILOS PARA Nav.Link QUE NO SON DROPDOWN - Aplicar estilo como NavDropdown */
        .modern-nav-item {
          display: flex !important;
          align-items: center;
          padding: 0.75rem 1rem !important;
          color: rgba(255, 255, 255, 0.9) !important;
          text-decoration: none !important;
          margin: 0 2px;
          position: relative;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Quitar TODOS los efectos hover/focus/active de Nav.Link que no son dropdown */
        .modern-nav-item:hover,
        .modern-nav-item:focus,
        .modern-nav-item:active,
        .modern-nav-item.active,
        .modern-nav-item:visited {
          background: transparent !important;
          color: rgba(255, 255, 255, 0.9) !important;
          box-shadow: none !important;
          outline: none !important;
          border: none !important;
          transform: none !important;
          text-decoration: none !important;
        }

        /* 🔥 ESTILOS ORIGINALES PARA NavDropdown - SIN TOCAR */
        .modern-dropdown {
          position: relative;
          z-index: 1050;
        }

        .modern-dropdown .dropdown-toggle {
          background-color: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
          display: flex !important;
          align-items: center;
          padding: 0.75rem 1rem !important;
          color: rgba(255, 255, 255, 0.9) !important;
          text-decoration: none !important;
          margin: 0 2px;
        }

        .modern-dropdown .dropdown-toggle:hover {
          background-color: transparent !important;
          border-color: transparent !important;
        }

        .modern-dropdown .dropdown-toggle:focus,
        .modern-dropdown .dropdown-toggle:active,
        .modern-dropdown .dropdown-toggle.show {
          background-color: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }

        .modern-dropdown .dropdown-toggle::after {
          display: none;
        }

        .nav-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .dashboard-icon { background: linear-gradient(135deg, #11998e, #38ef7d); }
        .personal-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
        .usuario-icon { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .estimulacion-icon { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .donadoras-icon { background: linear-gradient(135deg, #43e97b, #38f9d7); }
        .servicios-icon { background: linear-gradient(135deg, #fa709a, #fee140); }
        .pasteurizacion-icon { background: linear-gradient(135deg, #a8edea, #fed6e3); }
        .control-icon { background: linear-gradient(135deg, #72edf2, #5151e5); }
        .solicitudes-icon { background: linear-gradient(135deg, #ffecd2, #fcb69f); }
        .bot-icon { background: linear-gradient(135deg, #667eea, #764ba2); }

        .nav-text {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .dropdown-title-wrapper {
          display: flex;
          align-items: center;
        }

        .modern-dropdown .dropdown-menu {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
          padding: 8px;
          margin-top: 8px;
          z-index: 1055 !important;
          position: absolute !important;
        }

        .modern-dropdown-item {
          display: flex !important;
          align-items: center;
          padding: 12px 16px !important;
          border-radius: 8px;
          transition: all 0.3s ease;
          color: #333 !important;
          text-decoration: none !important;
          margin-bottom: 4px;
        }

        .modern-dropdown-item:hover {
          background: linear-gradient(135deg,rgba(249, 132, 6, 0.72),rgb(154, 245, 115));
          color: white !important;
          transform: translateX(4px);
        }

        .dropdown-icon {
          margin-right: 12px;
          font-size: 14px;
          opacity: 0.8;
        }

        .modern-login-btn {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          border-radius: 25px;
          padding: 12px 24px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
        }

        .modern-login-btn:hover {
          background: linear-gradient(135deg, #0d7377, #2dd4bf);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(17, 153, 142, 0.4);
        }

        .login-icon-wrapper {
          margin-right: 8px;
          font-size: 16px;
        }

        .modern-logout-btn {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          border: none;
          border-radius: 25px;
          padding: 12px 20px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
        }

        .modern-logout-btn:hover {
          background: linear-gradient(135deg, #e056fd, #f72585);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(240, 147, 251, 0.4);
        }

        .logout-icon-wrapper {
          margin-right: 8px;
          font-size: 16px;
        }

        .modern-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px;
        }

        .modern-toggle:focus {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .modern-offcanvas .offcanvas {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }

        .modern-offcanvas {
          z-index: 1060;
        }

        .modern-offcanvas-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
        }

        .modern-offcanvas-title {
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .modern-offcanvas-body {
          padding: 1.5rem;
        }

        .modern-mobile-login-btn {
          background: linear-gradient(135deg, #11998e, #38ef7d);
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          color: white;
        }

        .nav-animate {
          animation: slideInFromTop 0.6s ease-out;
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Bootstrap Overrides para Dropdowns */
        .navbar-nav .dropdown-menu {
          z-index: 1055 !important;
        }

        .navbar .dropdown-menu.show {
          z-index: 1055 !important;
          position: absolute !important;
        }

        /* 🆕 CALENDARIOS Y MODALES - Por encima de navbar */
        
        /* React DatePicker */
        .react-datepicker-popper {
          z-index: 1070 !important;
        }

        .react-datepicker {
          z-index: 1070 !important;
        }

        /* Bootstrap DatePicker */
        .bootstrap-datetimepicker-widget {
          z-index: 1070 !important;
        }

        /* Flatpickr Calendar */
        .flatpickr-calendar {
          z-index: 1070 !important;
        }

        /* React-Calendar */
        .react-calendar {
          z-index: 1070 !important;
        }

        /* Ant Design DatePicker */
        .ant-picker-dropdown {
          z-index: 1070 !important;
        }

        /* Material-UI DatePicker */
        .MuiPickersPopper-root {
          z-index: 1070 !important;
        }

        /* 🆕 PrimeReact Calendar - ESPECÍFICO PARA TU CASO */
        .p-datepicker {
          z-index: 1070 !important;
        }

        .p-datepicker-panel {
          z-index: 1070 !important;
        }

        .p-calendar-panel {
          z-index: 1070 !important;
        }

        .p-datepicker .p-datepicker-panel {
          z-index: 1070 !important;
        }

        /* PrimeReact Overlay Panel (contenedor del calendario) */
        .p-overlaypanel {
          z-index: 1070 !important;
        }

        /* PrimeReact Calendar con clase personalizada */
        .custom-calendar .p-datepicker {
          z-index: 1070 !important;
        }

        .custom-calendar .p-calendar-panel {
          z-index: 1070 !important;
        }

        /* Bootstrap Modals */
        .modal {
          z-index: 1080 !important;
        }

        .modal-backdrop {
          z-index: 1075 !important;
        }

        /* SweetAlert */
        .swal2-container {
          z-index: 1090 !important;
        }

        /* React Modal */
        .ReactModal__Overlay {
          z-index: 1080 !important;
        }

        /* Tooltips y Popovers */
        .tooltip {
          z-index: 1065 !important;
        }

        .popover {
          z-index: 1065 !important;
        }

        .bs-tooltip-top, .bs-tooltip-bottom, .bs-tooltip-start, .bs-tooltip-end {
          z-index: 1065 !important;
        }

        /* Select Dropdowns */
        .react-select__menu {
          z-index: 1060 !important;
        }

        .select2-dropdown {
          z-index: 1060 !important;
        }

        /* Loading Overlays */
        .loading-overlay {
          z-index: 1085 !important;
        }

        .spinner-overlay {
          z-index: 1085 !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .main-title {
            font-size: 1.5rem;
          }
          
          .sub-title {
            font-size: 1rem;
          }
          
          .modern-nav-item,
          .modern-dropdown .dropdown-toggle {
            padding: 1rem !important;
            justify-content: flex-start;
          }
          
          .nav-icon-wrapper {
            margin-right: 12px;
          }

          .modern-dropdown .dropdown-menu {
            position: fixed !important;
            z-index: 1055 !important;
            max-height: 300px;
            overflow-y: auto;
          }

          /* Calendarios en móvil - Mayor prioridad */
          .react-datepicker-popper {
            z-index: 1080 !important;
          }
        }

        @media (max-width: 992px) {
          .navbar-title-section {
            margin-left: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default NavbarComponent;