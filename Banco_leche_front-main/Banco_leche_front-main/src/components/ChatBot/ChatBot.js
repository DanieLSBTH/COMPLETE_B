import React, { useState, useRef, useEffect } from 'react';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import '../Css/ChatBotExample.css';
import agentIcon from '../Images/backgrounds/agent-icon.png';
import userIcon from '../Images/backgrounds/user-icon.png';
import sendIcon from '../Images/backgrounds/send-icon.png';
import closeIcon from '../Images/backgrounds/close-icon.png';
import logo from '../Images/backgrounds/Logo_banco2.png';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy PediBot. ¿Cómo te llamas?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [option, setOption] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const mostrarMensajeConTyping = async (mensaje, delay = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    setMessages(prevMessages => [...prevMessages, { text: mensaje, isBot: true }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, isBot: false }];
    setMessages(newMessages);
    setInput('');

    if (!userName) {
      setUserName(input);
      await mostrarMensajeConTyping( `Mucho gusto ${input}, puedo ayudarte a generar tus reportes 😃`);
      await mostrarMensajeConTyping( `Selecciona una opción: 
        1. Donadoras 
        2. Estimulación
        3. Control de despacho`);
    } else if (!option) {
      setOption(input);
      if (input === '1') {
        await mostrarMensajeConTyping( 'Seleccionaste Donadoras 👀');
        await mostrarMensajeConTyping( 'Ingresa la fecha de inicio y fin en formato AÑO-MES-DIA:      2024-10-01 2024-10-31');
     
      } else if (input === '2') {
        await mostrarMensajeConTyping( 'Seleccionaste Estimulación 👀');
        await mostrarMensajeConTyping( 'Ingresa la fecha de inicio y fin en formato AÑO-MES-DIA:      2024-10-01 2024-10-31');
      
      } else if (input === '3') {
        await mostrarMensajeConTyping('Seleccionaste Control de Despacho 👀 ');
        await mostrarMensajeConTyping('Ingresa la fecha de inicio y fin en formato AÑO-MES-DIA:      2024-10-01 2024-10-31');
      
      } else {
        await mostrarMensajeConTyping( 'Opción no válida 😥 analizo que esta fuera del rango de la lista.');
        setOption(null);
      }
    } else if (option === '1' || option === '2' || option === '3') {
      const dates = input.match(/\d{4}-\d{2}-\d{2}/g);
      if (dates && dates.length === 2) {
        const [fechaInicio, fechaFin] = dates;
        setIsTyping(true);
        try {
          let apiUrl;
          let generatePDFCallback;

          if (option === '1') {
            apiUrl = `http://localhost:8080/api/donadora_detalle/resumen-por-servicio?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            generatePDFCallback = generatePDFDonadoras;
          } else if (option === '2') {
            apiUrl = `http://localhost:8080/api/estimulacion/resumen_estimulacion-rangoFecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            generatePDFCallback = generatePDFEstimulación;
          } else if (option === '3') {
            apiUrl = `http://localhost:8080/api/solicitud_de_leches/resumen/por-servicio-y-fechas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            generatePDFCallback = generatePDFControlDespacho;
          }

          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data) {
            const doc = await generatePDFCallback(data, fechaInicio, fechaFin);
            doc.save(`Reporte_${option === '1' ? 'Donadoras' : option === '2' ? 'Estimulación' : 'ControlDespacho'}_${fechaInicio}_${fechaFin}.pdf`);
            await mostrarMensajeConTyping( `Reporte generado. Descarga iniciada.`);
          } else {
            await mostrarMensajeConTyping('No se encontraron datos para las fechas especificadas.');
          }
        } catch (error) {
          console.error('Error:', error);
          await mostrarMensajeConTyping('Hubo un problema generando el reporte. Inténtalo nuevamente.');
        } finally {
          setIsTyping(false);
          setOption(null); // Reinicia para futuras opciones
        }
      } else {
        await mostrarMensajeConTyping( 'Por favor, ingresa las fechas en formato YYYY-MM-DD.');
        await mostrarMensajeConTyping( 'Por ejemplo 2024-10-01 2024-10-31.');
      
      }
    }
  };
  const generatePDFHeaderAndFooter = async (doc, fechaInicio, fechaFin) => {
    const logoBase64 = await getBase64ImageFromURL(logo);

    doc.addImage(logoBase64, 'PNG', 10, 10, 32, 25);
    doc.setFontSize(14);
    doc.text("Departamento De Pediatría Banco de Leche Humana", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Reporte (${fechaInicio} - ${fechaFin})`, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text("Dr. Miguel Angel Soto Galindo\nCoordinador Banco de Leche Humana\nJefe Departamento de Pediatría", doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 15, { align: "center" });
};

const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = (error) => {
            reject(new Error('Error al cargar la imagen.'));
        };
    });
};
  const generatePDFDonadoras = async (data, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    await generatePDFHeaderAndFooter(doc, fechaInicio, fechaFin);
    doc.autoTable({
      startY: 40,
      head: [['Servicio Tipo', 'Total Donaciones', 'Total Donadoras', 'Total Litros']],
      body: data.map(item => [item.servicio_tipo, item.total_donaciones, item.total_donadoras, item.total_litros]),
      theme: 'grid',
    });
    return doc;
  };

  const generatePDFEstimulación = async (data, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    await generatePDFHeaderAndFooter(doc, fechaInicio, fechaFin);
    doc.autoTable({
      startY: 40,
      head: [['Mes', 'Total Estimulaciones', 'Total Constantes', 'Total Nuevas']],
      body: data.map(item => [item.mes, item.total_estimulaciones, item.total_constantes, item.total_nuevas]),
      theme: 'grid',
    });
    return doc;
  };

  const generatePDFControlDespacho = async (data, fechaInicio, fechaFin) => {
    const doc = new jsPDF();
    await generatePDFHeaderAndFooter(doc, fechaInicio, fechaFin);
    const asistencia = data.asistencia;
    const totalGeneral = data.totalGeneral;
    doc.autoTable({
      startY: 40,
      head: [['Riesgo', 'Total Beneficiados', 'Total Litros Distribuidos', 'Total Onzas']],
      body: Object.entries(asistencia).map(([riesgo, valores]) => [
        riesgo,
        valores.totalBeneficiados,
        valores.totalLitrosDistribuidos,
        valores.totalOnzas
      ]),
      theme: 'grid',
    });
    return doc;
  };



  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {isOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <span>Chatbot</span>
            <img
              src={closeIcon}
              alt="Close"
              className="close-icon"
              onClick={handleClose}
            />
          </div>
          <div className="message-container" ref={messageContainerRef} aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                {message.isBot ? (
                  <>
                    <img src={agentIcon} alt="Agent" className="message-icon" />
                    <div className="message-bubble bot-bubble">{message.text}</div>
                  </>
                ) : (
                  <>
                    <div className="message-bubble user-bubble">{message.text}</div>
                    <img src={userIcon} alt="User" className="message-icon" />
                  </>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            )}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <img
              src={sendIcon}
              alt="Send"
              className="send-icon"
              onClick={handleSend}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
