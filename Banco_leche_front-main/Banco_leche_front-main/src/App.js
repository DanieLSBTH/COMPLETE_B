// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Auth/Login';
import Landpage from './components/Auth/Landpage';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Layout/Navbar';
import PrivateRoute from './components/Layout/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import ShowDonadora from './components/Formularios/ShowDonadora';
import ShowPersonal from './components/Formularios/ShowPersonal';
import ShowServicioEx from './components/Formularios/ShowServicioEx';
import ShowServicioIn from './components/Formularios/ShowServicioIn';
import ShowDonadoraDetalle from './components/Formularios/ShowDonadoraDetalle';
import ResumenPorServicio from './components/Formularios/ResumenPorServicio';
import ShowStimulation from './components/Formularios/ShowStimulation';
import ResumenEstimulacion from './components/Formularios/ResumenEstimulacion';
import ShowPasteurizacion from './components/Formularios/ShowPasteurizacion';
import ShowControlLeche from './components/Formularios/ShowControlLeche';
import ShowSolicitudLeche from './components/Formularios/ShowSolicitudLeche';
import ResumenPorFechaSolicitud from './components/Formularios/ResumenPorFechaSolicitud'
import ChatBotExample from './components/ChatBot/ChatBotExample';
import ShowChat from './components/ChatBot/ShowChat';
import ShowSubChat from './components/ChatBot/ShowSubChat';
import ShowChatRespuestas from './components/ChatBot/ShowChatRespuestas';
import ShowUsuario from './components/Formularios/ShowUsuario';
import ChatBot from './components/ChatBot/ChatBot';
import ResumenPasteurizacion from './components/ChatBot/ResumenPasteurizacion';
import ShowEstimulacionPersonas from './components/Formularios/ShowEstimulacionPersonas';
import ResumenEstimulacionNombre from './components/Formularios/ResumenEstimulacionNombre';
import ResumenDonadoraNombre from './components/Formularios/ResumenDonadoraNombre';
import ResumenControlLecheFrascos from './components/Formularios/ResumenControlLecheFrascos';
import InsertarDonadoraModal from './components/Formularios/InsertarDonadoraModal';
import TopDonadoras from './components/Formularios/TopDonadoras';
import ShowRegistroMedico from './components/Formularios/ShowRegistroMedico';
import Etical from './components/Auth/Etical'
import ResumenSolicitudNombre from './components/Formularios/ResumenSolicitudNombre'
import ResumenFrascosEstados from './components/Formularios/ResumenFrascosEstados'
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='App'>
        <Navbar />
        <ConditionalContainer>
          <Routes>
          <Route path="/" element={<Landpage />}/>
          <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /> </PrivateRoute>}/>
            <Route path="/showdonadora" element={<PrivateRoute><ShowDonadora /> </PrivateRoute>}/>
            <Route path="/insertardonadoramodal" element={<PrivateRoute><InsertarDonadoraModal /> </PrivateRoute>}/>
            <Route path="/showpersonal" element={<PrivateRoute><ShowPersonal /> </PrivateRoute>}/>
            <Route path="/showusuario" element={<PrivateRoute><ShowUsuario /> </PrivateRoute>}/>

            <Route path="/showservicioex" element={<PrivateRoute><ShowServicioEx /> </PrivateRoute>}/>
            <Route path="/showservicioin" element={<PrivateRoute><ShowServicioIn /> </PrivateRoute>}/>
            <Route path="/showdonadoradetalle" element={<PrivateRoute><ShowDonadoraDetalle /></PrivateRoute>}/>
            <Route path="/resumendonadoranombre" element={<PrivateRoute><ResumenDonadoraNombre /></PrivateRoute>}/>
            <Route path="/topdonadoras" element={<PrivateRoute><TopDonadoras /></PrivateRoute>}/>
            
            <Route path="/resumen-por-servicio" element={<PrivateRoute><ResumenPorServicio /></PrivateRoute>}/>
            <Route path="/resumenpasteurizacion" element={<PrivateRoute><ResumenPasteurizacion /></PrivateRoute>}/>
            
            <Route path="/showstimulation" element={<PrivateRoute><ShowStimulation /></PrivateRoute>}/>
            <Route path="/showestimulacionpersonas" element={<PrivateRoute><ShowEstimulacionPersonas /></PrivateRoute>}/>
            <Route path="/resumen-estimulacion" element={<PrivateRoute><ResumenEstimulacion /></PrivateRoute>}/>
            <Route path="/resumenestimulacionnombre" element={<PrivateRoute><ResumenEstimulacionNombre /></PrivateRoute>}/>
            
            <Route path="/showpasteurizacion" element={<PrivateRoute><ShowPasteurizacion /></PrivateRoute>}/>
            <Route path="/showcontrolleche" element={<PrivateRoute><ShowControlLeche /></PrivateRoute>}/>
            <Route path="/resumencontrollechefrascos" element={<PrivateRoute><ResumenControlLecheFrascos /></PrivateRoute>}/>
            <Route path="/resumenfrascosestados" element={<PrivateRoute><ResumenFrascosEstados/></PrivateRoute>}/>
            
            <Route path="/showregistromedico" element={<PrivateRoute> <ShowRegistroMedico/> </PrivateRoute>}/>
            <Route path="/showsolicitudleche" element={<PrivateRoute><ShowSolicitudLeche /></PrivateRoute>}/>
            <Route path="/resumensolicitudnombre" element={<PrivateRoute><ResumenSolicitudNombre/></PrivateRoute>}/>
            
            <Route path="/resumen-por-solicitud" element={<PrivateRoute><ResumenPorFechaSolicitud /></PrivateRoute>}/>
            <Route path="/chatbotexample" element={<PrivateRoute><ChatBotExample /></PrivateRoute>}/>
            <Route path="/showchat" element={<PrivateRoute><ShowChat /></PrivateRoute>}/>
            <Route path="/showsubchat" element={<PrivateRoute><ShowSubChat /></PrivateRoute>}/>
            <Route path="/chatbot" element={<PrivateRoute><ChatBot/></PrivateRoute>}/>
            <Route path="/showchatrespuestas" element={<PrivateRoute><ShowChatRespuestas /></PrivateRoute>}/>
            
            
            
          </Routes>
          
          </ConditionalContainer>
          </div>
      </Router>
    </AuthProvider>
  );
}

function ConditionalContainer({ children }) {
  const location = useLocation();
  const noContainerRoutes = ['/', '/login', '/register'];

  const isNoContainer = noContainerRoutes.includes(location.pathname);

  return isNoContainer ? <>{children}</> : <div className="container mt-4">{children}</div>;
}
export default App;
