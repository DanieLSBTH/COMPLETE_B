// Importaciones de Bootstra
import React, { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { Container, Row, Col, Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import BarsChart from '../Charts/BarsCharts';
import PiesChart from "../Charts/PiesChart";     // Asegúrate de que la ruta es correcta
import ResumenMensualSolicitudL from "../Charts/ResumenMensualSolicitudL"; // Asegúrate de que la ruta es correcta
import ResumenPasteurizacion from '../Charts/ResumenPasteurizacion';

const AnimatedCard = animated(Card);

const ChartCard = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const contentProps = useSpring({
    opacity: isOpen ? 1 : 0,
    maxHeight: isOpen ? 1000 : 0,
    config: config.gentle
  });

  const iconProps = useSpring({
    transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)',
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedCard className="mb-4 shadow">
      <CardHeader 
        className="d-flex justify-content-between align-items-center"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        <h5 className="mb-0">{title}</h5>
        <animated.div style={iconProps}>
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </animated.div>
      </CardHeader>
      <animated.div style={contentProps}>
        <CardBody>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            children
          )}
        </CardBody>
      </animated.div>
    </AnimatedCard>
  );
};

const DashboardInteractivo = () => {
  const fadeIn = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 1000 }
  });

  return (
    <animated.div style={fadeIn}>
      <Container fluid className="p-4">
        <Row>
          
          <Col lg={12}>
            <ChartCard title="Resumen por Mes de Donaciones">
              <PiesChart />
            </ChartCard>
          </Col>
          <Col lg={12}>
            <ChartCard title="Resumen de Estimulaciones">
              <BarsChart />
            </ChartCard>
          </Col>
          <Col lg={12}>
            <ChartCard title="Resumen de Pasteurizacion">
              <ResumenPasteurizacion />
            </ChartCard>
          </Col>
          <Col lg={12}>
            <ChartCard title="Resumen Mensual de Solicitud de Leche">
              <ResumenMensualSolicitudL />
            </ChartCard>
          </Col>
        </Row>
      </Container>
    </animated.div>
  );
};

export default DashboardInteractivo;