import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingHeart, faDroplet, faShieldHeart, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useSpring, animated } from '@react-spring/web';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import logo from '../Images/backgrounds/Fondo_banco-1.jpg';
import logo2 from '../Images/backgrounds/fondo_azul.jpg';
import logo3 from '../Images/backgrounds/fondo_negro_2.jpg';
import CarouselSection from './CarouselSection'; // Importa el nuevo componente
import ChatBotExample from '../ChatBot/ChatBotExample';
import HeroSection from './HeroSection'; // Importa el nuevo componente

import logo5 from '../Images/backgrounds/postgresql.png';
import logo6 from '../Images/backgrounds/node.png';
import logo7 from '../Images/backgrounds/react.png';

const LandingPage = () => {
  // Animation for hero section
  const heroProps = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 }
  });

  // Animation for feature cards
  const featureProps = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { duration: 600 }
  });

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <HeroSection /> 

      {/* Mission Section */}
      <animated.section style={featureProps} className="features-section bg-light py-5">
      
      <section className="mission-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-4">Nuestra Visión</h2>
              <p style={{ textAlign: 'justify' }} className="text-muted">
              La visión del Banco de Leche Humana “Dr. Miguel Ángel Soto Galindo” 
              es sumar esfuerzos para recolectar y distribuir leche humana con calidad 
              certificada en cantidades acordes a las necesidades de la población neonatal 
              y así reducir la mortalidad y morbilidad neonatal e infantil. 
              Fortalecer la Red Nacional de Bancos de Leche Humana Nacional e Iberoamericana, 
              siendo el centro de capacitación de referencia a nivel Nacional e Internacional.<br /><br />
              “Toda madre puede ser donadora de leche humana, hasta que se demuestre lo contrario.”
              </p>
            </Col>
            <Col md={6}>
              <img 
                src={logo} 
                alt="Misión del Banco de Leche" 
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>
      </animated.section>

       {/* Mission Section */}
       <animated.section style={featureProps} className="features-section bg-light py-5">
      
      <section className="mission-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-4">Impacto </h2>
              <p style={{ textAlign: 'justify' }} className="text-muted">
              Desde 2008, el Hospital Nacional Pedro de Bethancourt estableció 
              el primer Banco de Leche Humana en Guatemala y Centroamérica. 
              Ha sido una referencia para otros hospitales nacionales, garantizando 
              el acceso a leche materna segura y de calidad para los bebés que más lo necesitan.
              </p>
            </Col>
            <Col md={6}>
              <img 
                src={logo2} 
                alt="Misión del Banco de Leche" 
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>
      </animated.section>
      {/* Key Features */}
      <animated.section style={featureProps} className="features-section bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Por Qué Somos Importantes</h2>
          <Row>
            {[
              {
                icon: faHandHoldingHeart,
                title: 'Apoyo a Bebés Vulnerables',
                description: 'Proporcionamos leche materna segura para bebés prematuros y con necesidades especiales.'
              },
              {
                icon: faDroplet,
                title: 'Proceso de Donación Seguro',
                description: 'Garantizamos la máxima calidad y seguridad en cada gota de leche donada.'
              },
              {
                icon: faShieldHeart,
                title: 'Impacto en la Salud Infantil',
                description: 'Cada donación ayuda a reducir riesgos de enfermedades en recién nacidos.'
              }
            ].map((feature, index) => (
              <Col key={index} md={4} className="text-center mb-4">
                <div className="feature-card p-4 bg-white rounded shadow-sm">
                  <FontAwesomeIcon 
                    icon={feature.icon} 
                    className="text-primary mb-3" 
                    size="3x" 
                  />
                  <h4>{feature.title}</h4>
                  <p className="text-muted">{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </animated.section>

      {/* Video Section */}
      <section className="video-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Nuestra Historia</h2>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <div className="video-wrapper position-relative">
                <ReactPlayer
                  url="https://youtu.be/qi3lMLEkCFk?si=6T-EAmD7ustTbsLj"
                  width="100%"
                  height="480px"
                  controls
                  playing={false}
                  light
                  playIcon={
                    <div className="custom-play-icon position-absolute top-50 start-50 translate-middle">
                      <FontAwesomeIcon 
                        icon={faPlay} 
                        size="3x" 
                        className="text-primary bg-white rounded-circle p-3 shadow" 
                      />
                    </div>
                  }
                />
              </div>
              <p className="text-center mt-3 text-muted">
                Conoce más sobre nuestro impacto en la salud infantil
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="cta-section py-5 text-center bg-primary text-white">
        <Container>
          <h2 className="mb-4">Únete a Nuestra Misión</h2>
          <p className="lead mb-4">
            Cada donación de leche materna puede marcar la diferencia en la vida de un bebé.
          </p>
          
         {/* <div> 
            <Button color="light" size="lg" className="mx-2" tag={Link} to="/donar">
              Quiero Donar
            </Button>
            <Button color="outline-light" size="lg" className="mx-2" tag={Link} to="/contacto">
              Contáctanos
            </Button>
          </div>*/}
        </Container>
      </section>
      <CarouselSection />
      <ChatBotExample></ChatBotExample>
      
    </div>
  );
};

export default LandingPage;