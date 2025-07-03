// src/components/Dashboard/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ChatBot from '../ChatBot/ChatBot'; // Asegúrate de que la ruta sea correcta
import Grafica from './Grafica'; // Asumiendo que tienes un componente Grafica

const Dashboard = () => {
  const { auth } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      {/* Contenido principal del dashboard */}
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <Grafica />
        
        {auth.user ? (
          <p>Bienvenido, {auth.user.nombre}!</p>
        ) : (
          <p>...</p>
        )}
      </div>

      {/* Integración del ChatBot */}
      <ChatBot />

      {/* Estilos necesarios */}
      <style jsx>{`
        .dashboard-container {
          position: relative;
          width: 100%;
          height: 100vh;
          padding: 20px;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Asegurarse de que el chatbot se superponga correctamente */
        :global(.chatbot-container) {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
