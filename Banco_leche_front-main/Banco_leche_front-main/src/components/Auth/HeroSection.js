import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { useSpring, animated } from '@react-spring/web';
import logo3 from '../Images/backgrounds/fondo_negro_2.jpg'; // Fondo negro
import '../Css/Navidad.css';
const HeroSection = () => {
  const featureProps = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { duration: 600 },
  });
  const [snowflakes, setSnowflakes] = useState([]);
  useEffect(() => {
    // Generate snowflakes
    const generateSnowflakes = () => {
      const snowflakeCount = 20; // Adjust number of snowflakes
      const newSnowflakes = Array.from({ length: snowflakeCount }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        animationDuration: `${5 + Math.random() * 10}s`,
        size: `${5 + Math.random() * 10}px`
      }));
      setSnowflakes(newSnowflakes);
  };

  generateSnowflakes();
  }, []);

  return (
    <animated.section
      style={{
        ...featureProps,
        position: 'relative', // Necesario para posicionar el fondo y el contenido correctamente
        color: 'white',
        padding: '50px 0',
        overflow: 'hidden', // Asegura que el fondo no se salga de los límites
      }}
    >
      {/* Fondo con desenfoque */}
      <div
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${logo3})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(4px)', // Desenfoque solo al fondo
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1, // Asegura que esté detrás del contenido
        }}
      ></div>

      {/* Contenido principal */}
      <Container style={{ position: 'relative', zIndex: 2 }}>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <h1
              className="display-4 mb-4"
              style={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Banco de Leche Humana
            </h1>
            <p
              className="lead mb-4"
              style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Salvando vidas, una gota a la vez. Cada donación es un acto de
              amor que puede transformar el futuro de un bebé.
            </p>
          </Col>
          <Col md={6} className="text-center">
            <img
              src={logo3}
              alt="Banco de Leche Humana"
              className="img-fluid rounded-circle shadow-lg"
              style={{
                maxWidth: '400px',
                border: '5px solid white',
              }}
            />
          </Col>
        </Row>
      </Container>
      <div className="snow-container">
        {snowflakes.map((flake) => (
          <div 
            key={flake.id} 
            className="snowflake"
            style={{
              left: flake.left,
              animationDuration: flake.animationDuration,
              width: flake.size,
              height: flake.size
            }}
          >
            ❄️
          </div>
        ))}
      </div>
    </animated.section>
  );
};

export default HeroSection;
