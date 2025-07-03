import React from 'react';
import { Container, Carousel } from 'react-bootstrap';

// Importa las imágenes
import Image1 from '../Images/backgrounds/Fondo_banco-3.jpg';
import Image2 from '../Images/backgrounds/Fondo_banco-2.jpg';
import Image3 from '../Images/backgrounds/banco-de-leche.jpg';

const CarouselSection = () => {
  return (
    <section className="carousel-section py-5 bg-soft-pastel">
      <Container>
        <h2 className="text-center mb-5">Nuestro Equipo de Trabajo</h2>
        <Carousel 
          fade 
          indicators={true} 
          controls={true} 
          interval={3000}
          className="rounded shadow-lg"
        >
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={Image1}
              alt="Donación de Leche Materna"
              style={{ 
                maxHeight: '500px', 
                objectFit: 'cover' 
              }}
            />
            <Carousel.Caption className="carousel-caption-custom">
              <h3 className="text-white">Salvando Vidas Pequeñas</h3>
              <p>Cada gota de leche materna es un regalo de esperanza</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={Image2}
              alt="Cuidado Neonatal"
              style={{ 
                maxHeight: '500px', 
                objectFit: 'cover' 
              }}
            />
            <Carousel.Caption className="carousel-caption-custom">
              <h3 className="text-white">Equipo de trabajo</h3>
              <p>Apoyando a los más vulnerables con amor y profesionalismo</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src={Image3}
              alt="Equipo de Profesionales"
              style={{ 
                maxHeight: '500px', 
                objectFit: 'cover' 
              }}
            />
            <Carousel.Caption className="carousel-caption-custom">
              <h3 className="text-white">Compromiso Profesional</h3>
              <p>Un equipo dedicado a la salud y bienestar infantil</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </Container>
    </section>
  );
};

export default CarouselSection;