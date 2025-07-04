import React, { useState, useEffect, useContext } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaBaby, FaShieldAlt, FaHeart } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import Swal from 'sweetalert2';
import ChatBotExample from '../ChatBot/ChatBotExample';
import fondo1 from '../Images/backgrounds/Fondo_banco-1.jpg';
import fondo2 from '../Images/backgrounds/Fondo_banco-2.jpg';
import fondo3 from '../Images/backgrounds/Fondo_banco-3.jpg';

import logo5 from '../Images/backgrounds/postgresql.png';
import logo6 from '../Images/backgrounds/node.png';
import logo7 from '../Images/backgrounds/react.png';

const ImprovedLoginWithAPI = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingText, setCurrentLoadingText] = useState('');
  const [showMainContent, setShowMainContent] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  // Contexto de autenticación
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mensajes de carga
  const loadingMessages = [
    'Inicializando Sistema de Banco de Leche...',
    'Conectando con Base de Datos PostgreSQL...',
    'Cargando Módulos de Node.js...',
    'Preparando Interfaz React...',
    'Configurando Seguridad del Sistema...',
    'Verificando Conexiones de Red...',
    'Cargando Datos de Donantes...',
    'Preparando Dashboard Médico...',
    '¡Sistema Listo para Usar!'
  ];

  // Imágenes de fondo
  const backgroundImages = [fondo1, fondo2, fondo3];

  // Efectos principales del componente
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para la pantalla de carga después del login
  useEffect(() => {
    if (showLoadingScreen) {
      const loadingInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
              setShowLoadingScreen(false);
              navigate('/dashboard');
            }, 1000);
            return 100;
          }
          return prev + 1.2;
        });
      }, 80);

      return () => clearInterval(loadingInterval);
    }
  }, [showLoadingScreen, navigate]);

  // Actualizar texto de carga
  useEffect(() => {
    if (showLoadingScreen) {
      const messageIndex = Math.floor((loadingProgress / 100) * (loadingMessages.length - 1));
      setCurrentLoadingText(loadingMessages[messageIndex] || loadingMessages[0]);
    }
  }, [loadingProgress, showLoadingScreen]);

  // Animaciones para el contenido principal
  const heroProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: showMainContent ? 1 : 0, transform: showMainContent ? 'translateY(0)' : 'translateY(20px)' },
    config: { duration: 800 }
  });

  const featureProps = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: showMainContent ? 1 : 0, transform: showMainContent ? 'scale(1)' : 'scale(0.9)' },
    config: { duration: 600 },
    delay: 200
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función de manejo de envío integrada con API
  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/usuarios/login', { correo, contrasena });
      login(response.data.token);
      
      // Mostrar mensaje de éxito con SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 2000,
        showConfirmButton: false
      });

      // Activar pantalla de carga
      setShowLoadingScreen(true);
      setLoadingProgress(0);
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: error || 'Error al iniciar sesión. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Componente de Logo Tecnológico
  const TechLogo = ({ src, alt, delay = 0 }) => (
    <div 
      className="tech-logo-container"
      style={{
        animationDelay: `${delay}s`,
        opacity: showLoadingScreen ? 1 : 0,
        transform: showLoadingScreen ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(180deg)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        className="tech-logo"
      />
    </div>
  );

  // Pantalla de carga después del login exitoso
  if (showLoadingScreen) {
    return (
      <div className="loading-screen">
        {/* Fondo animado */}
        <div className="loading-background">
          <div className="gradient-overlay"></div>
          <div className="floating-particles">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Contenido de carga */}
        <div className="loading-content">
          {/* Logo del Hospital */}
          <div className="hospital-logo-container">
            <div className="hospital-logo">
             <svg viewBox="0 0 24 24" className="hospital-icon">
  <defs>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff7e00" />
      <stop offset="100%" stopColor="#ffffff" />
    </linearGradient>
  </defs>
  <path fill="url(#heartGradient)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>

            </div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring-2"></div>
          </div>

          {/* Título Principal */}
          <div className="title-section">
  <h1 style={{ color: 'white', fontWeight: 'bold' }}>
    Bienvenido al Sistema<span className="loading-dots">.</span>
  </h1>
</div>


          {/* Logos de Tecnología */}
          <div className="tech-logos">
            <TechLogo src={logo5} alt="PostgreSQL" delay={0} />
            <TechLogo src={logo6} alt="Node.js" delay={0.3} />
            <TechLogo src={logo7} alt="React" delay={0.6} />
          </div>

          {/* Barra de Progreso */}
          <div className="progress-section">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="progress-shine"></div>
                </div>
              </div>
              <div className="progress-info">
                <span className="progress-percentage">{Math.round(loadingProgress)}%</span>
                <span className="progress-text">{currentLoadingText}</span>
              </div>
            </div>
          </div>

          {/* Spinner Principal */}
          <div className="main-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring-2"></div>
            <div className="spinner-core">
              <svg viewBox="0 0 24 24" className="spinner-icon">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Estilos CSS de la pantalla de carga */}
        <style jsx>{`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .loading-background {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 25%, #be185d 50%, #dc2626 75%, #1e3a8a 100%);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }

          .gradient-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
          }

          .floating-particles {
            position: absolute;
            inset: 0;
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            animation: float 5s ease-in-out infinite, twinkle 2s ease-in-out infinite;
          }

          .loading-content {
            position: relative;
            text-align: center;
            z-index: 10;
            max-width: 600px;
            padding: 2rem;
          }

          .hospital-logo-container {
            position: relative;
            margin-bottom: 3rem;
            display: inline-block;
          }

          .hospital-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 3;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }

          .hospital-icon {
            width: 60px;
            height: 60px;
            color: #1e40af;
          }

          .pulse-ring, .pulse-ring-2 {
            position: absolute;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            animation: pulse-ring 2s ease-out infinite;
          }

          .pulse-ring {
            width: 140px;
            height: 140px;
            top: -10px;
            left: -10px;
          }

          .pulse-ring-2 {
            width: 160px;
            height: 160px;
            top: -20px;
            left: -20px;
            animation-delay: 1s;
          }

          .title-section {
            margin-bottom: 3rem;
          }
          .loading-dots {
  display: inline-block;
  width: 20px;
  text-align: left;
}

.loading-dots:after {
  content: '.';
  animation: dots 1.5s steps(5, end) infinite;
}

@keyframes dots {
  0%, 20% {
    color: rgba(255,255,255,0);
    text-shadow: 0.25em 0 0 rgba(255,255,255,0),
                 0.5em 0 0 rgba(255,255,255,0);
  }
  40% {
    color: white;
    text-shadow: 0.25em 0 0 rgba(255,255,255,0),
                 0.5em 0 0 rgba(255,255,255,0);
  }
  60% {
    text-shadow: 0.25em 0 0 white,
                 0.5em 0 0 rgba(255,255,255,0);
  }
  80%, 100% {
    text-shadow: 0.25em 0 0 white,
                 0.5em 0 0 white;
  }
}
          .main-title {
            font-size: 3.5rem;
            font-weight: 800;
            color: white;
            margin-bottom: 0.5rem;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            animation: glow 2s ease-in-out infinite alternate;
            line-height: 1.1;
          }

          .subtitle {
            font-size: 1.8rem;
            color: rgba(255,255,255,0.9);
            font-weight: 300;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }

          .title-underline {
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
            margin: 0 auto;
            border-radius: 2px;
            animation: expandContract 2s ease-in-out infinite;
          }

          .tech-logos {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .tech-logo-container {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 1rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            animation: float 3s ease-in-out infinite;
          }

          .tech-logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            filter: brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.3));
          }

          .progress-section {
            margin-bottom: 3rem;
          }

          .progress-container {
            max-width: 400px;
            margin: 0 auto;
          }

          .progress-bar {
            width: 100%;
            height: 12px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 1rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
            background-size: 200% 100%;
            border-radius: 20px;
            position: relative;
            animation: shimmer 2s linear infinite;
            transition: width 0.3s ease;
          }

          .progress-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shine 2s ease-out infinite;
          }

          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
          }

          .progress-percentage {
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }

          .progress-text {
            font-size: 0.9rem;
            opacity: 0.9;
            text-align: right;
            animation: pulse 2s ease-in-out infinite;
          }

          .main-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto;
          }

          .spinner-ring, .spinner-ring-2 {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-radius: 50%;
          }

          .spinner-ring {
            border-top-color: #60a5fa;
            border-right-color: #a78bfa;
            animation: spin 1.5s linear infinite;
          }

          .spinner-ring-2 {
            border-bottom-color: #f472b6;
            border-left-color: #fbbf24;
            animation: spin 1.5s linear infinite reverse;
          }

          .spinner-core {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          }

          .spinner-icon {
            width: 20px;
            height: 20px;
            color: white;
            animation: pulse 2s ease-in-out infinite;
          }

          /* Animaciones */
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }

          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }

          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0; }
          }

          @keyframes glow {
            from { text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2); }
            to { text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.4); }
          }

          @keyframes expandContract {
            0%, 100% { width: 100px; }
            50% { width: 150px; }
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          @keyframes shine {
            0% { left: -100%; }
            100% { left: 100%; }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .main-title { font-size: 2.5rem; }
            .subtitle { font-size: 1.4rem; }
            .tech-logos { gap: 1rem; }
            .tech-logo { width: 50px; height: 50px; }
            .hospital-logo { width: 100px; height: 100px; }
            .hospital-icon { width: 50px; height: 50px; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* Fondo animado */}
      <div className="solid-background">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`background-slide ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="background-overlay" />
      </div>

      {/* Partículas flotantes */}
      <div className="floating-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="login-content">
        {/* Branding del hospital */}
        <div className={`hospital-branding ${showForm ? 'slide-in' : ''}`}>
          <div className="hospital-logo">
            <div className="logo-icon">
              <FaBaby />
              <FaHeart className="heart-icon" />
            </div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring-2"></div>
          </div>
          <h1 className="hospital-title">
            Sistema Banco de Leche
          </h1>
          <p className="hospital-subtitle">
          Dr. Miguel Angel Soto Galindo
          </p>
          <p className="hospital-subtitle">
           Coordinador Banco de Leche Humana
          </p>
         
          <p className="hospital-subtitle">
             
          </p>
        </div>

        {/* Formulario de login */}
        <div className={`login-form-container ${showForm ? 'slide-in-delay' : ''}`}>
          <div className="login-form">
            <div className="form-header">
              <h2>Iniciar Sesión</h2>
              <p>Accede al sistema de gestión</p>
            </div>

            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <div className="form">
              <div className="input-group">
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="form-input"
                  />
                  <div className="input-underline"></div>
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="input-underline"></div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <span>INGRESAR</span>
                )}
                <div className="button-shine"></div>
              </button>
            </div>

           

            <div className="form-footer">
              <p></p>
              <p className="demo-credentials">
                <small></small>
              </p>
            </div>
          </div>
        </div>
         <ChatBotExample />
      </div>

      <style jsx>{`
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 9998; /* Z-index alto para estar sobre navbar */
          }

        .solid-background {
          position: absolute;
          inset: 0;
           background: #1e3a8a; /* Color sólido base */
          z-index: 1;
        }

        .background-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0;
          transition: opacity 2s ease-in-out;
          filter: blur(1px);
        }

        .background-slide.active {
          opacity: 1;
        }

        .background-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(30, 58, 138, 0.9) 0%, 
            rgba(124, 58, 237, 0.8) 25%, 
            rgba(190, 24, 93, 0.8) 50%, 
            rgba(220, 38, 38, 0.9) 75%, 
            rgba(30, 58, 138, 0.9) 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
          z-index: 2; /* Asegurar que esté sobre las imágenes */
        }

        .floating-particles {
          position: absolute;
          inset: 0;
          z-index: 2;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite, twinkle 3s ease-in-out infinite;
        }

        .login-content {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          width: 100%;
          padding: 2rem;
          align-items: center;
        }

        .hospital-branding {
          text-align: center;
          color: white;
          opacity: 0;
          transform: translateX(-50px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hospital-branding.slide-in {
          opacity: 1;
          transform: translateX(0);
        }

        .hospital-logo {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .logo-icon {
          position: relative;
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          z-index: 3;
        }

        .logo-icon svg {
          font-size: 3rem;
          color: #1e40af;
        }

        .heart-icon {
          position: absolute;
          font-size: 1.5rem !important;
          color: #ef4444 !important;
          bottom: 20px;
          right: 20px;
          animation: heartbeat 2s ease-in-out infinite;
        }

        .pulse-ring, .pulse-ring-2 {
          position: absolute;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse-ring 3s ease-out infinite;
        }

        .pulse-ring {
          width: 140px;
          height: 140px;
          top: -10px;
          left: -10px;
        }

        .pulse-ring-2 {
          width: 160px;
          height: 160px;
          top: -20px;
          left: -20px;
          animation-delay: 1.5s;
        }

        .hospital-subtitle {
          font-size: 1.5rem;
          opacity: 0.9;
          font-weight: 300;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .login-form-container {
          opacity: 0;
          transform: translateX(50px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .login-form-container.slide-in-delay {
          opacity: 1;
          transform: translateX(0);
          transition-delay: 0.3s;
        }

        .login-form {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .form-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .form-header p {
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #fef2f2;
          backdrop-filter: blur(10px);
          animation: shake 0.5s ease-in-out;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.1rem;
          z-index: 2;
          transition: color 0.3s ease;
        }

        .form-input {
          width: 100%;
          padding: 1.25rem 1rem 1.25rem 3rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
          transform: translateY(-2px);
        }

        .form-input:focus + .input-underline {
          width: 100%;
        }

        .form-input:focus ~ .input-icon {
          color: #60a5fa;
        }

        .input-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .password-toggle:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .login-button {
          position: relative;
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 200%;
          border: none;
          border-radius: 16px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: gradientShift 3s ease infinite;
          margin-top: 1rem;
        }

        .login-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-button.loading {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: shine 3s ease-in-out infinite;
        }

        .form-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .demo-credentials {
          margin-top: 0.5rem;
          font-style: italic;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Animaciones */
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        @keyframes glow {
          from { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2); }
          to { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.4); }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes shine {
          0% { left: -100%; }
          50% { left: 100%; }
          100% { left: -100%; }
        }

        /* Diseño responsivo */
        @media (max-width: 1024px) {
          .login-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
          
          .hospital-title {
            font-size: 2.5rem;
          }
          
          .hospital-subtitle {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 768px) {
          .login-content {
            padding: 1rem;
          }
          
          .login-form {
            padding: 2rem;
          }
          
          .hospital-title {
            font-size: 2rem;
          }
          
          .logo-icon {
            width: 100px;
            height: 100px;
          }
          
          .logo-icon svg {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .hospital-title {
            font-size: 1.8rem;
          }
          
          .form-header h2 {
            font-size: 2rem;
          }
          
          .login-form {
            padding: 1.5rem;
          }
            
        }
      `}</style>
    </div>
  );
};

export default ImprovedLoginWithAPI;