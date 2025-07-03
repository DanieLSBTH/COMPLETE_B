import React, { useState, useRef, useEffect } from 'react';
import '../Css/ChatBotExample.css';
import agentIcon from '../Images/backgrounds/agent-icon.png';
import userIcon from '../Images/backgrounds/user-icon.png';
import sendIcon from '../Images/backgrounds/send-icon.png';
import closeIcon from '../Images/backgrounds/close-icon.png';
import ReactPlayer from 'react-player/youtube';

const ChatBotExample = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy PediBot 🤖 ¿Cómo te llamas?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [greetingSent, setGreetingSent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState(null);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [subtemasDisponibles, setSubtemasDisponibles] = useState([]);
  const [preguntasDisponibles, setPreguntasDisponibles] = useState([]);
  const [waitingForRestart, setWaitingForRestart] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [chatEnded, setChatEnded] = useState(false); // Nuevo estado para controlar si el chat se ha despedido

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
  
  const mostrarMensajesSecuenciales = async (mensajes, delayEntreMsg = 1000) => {
    for (const mensaje of mensajes) {
      await mostrarMensajeConTyping(mensaje, delayEntreMsg);
    }
  };

  const validarEntrada = (input, opciones, tipo) => {
    const numero = parseInt(input);
    const numerosValidos = opciones.map(item => item.id_tema || item.id_subtema || item.id_chat);
    
    if (isNaN(numero)) {
      return {
        valido: false,
        mensaje: `Por favor, ingresa solo números.`
      };
    }

    if (!numerosValidos.includes(numero)) {
      return {
        valido: false,
        mensaje: `Por favor, ingresa un número válido 🙁 entre ${Math.min(...numerosValidos)} y ${Math.max(...numerosValidos)}.`
      };
    }

    return { valido: true };
  };


  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = input.trim().toLowerCase();
      const newMessages = [...messages, { text: input, isBot: false }];
      
      setMessages(newMessages);
      setInput('');
       // Si el chat había terminado, reiniciar el ciclo de confirmación con cualquier entrada
       if (chatEnded) {
        setChatEnded(false);
        setWaitingForConfirmation(true);
        await mostrarMensajeConTyping("Soy PediBot estoy programado para informarte 🤖 ¿quieres informarte? puedes digitar Si/no");
        return;
      }
       // Detectar si el mensaje es "gracias"
    if (userMessage === 'gracias' ) {
      // Reiniciar estados de selección
      setTemaSeleccionado(null);
      setSubtemaSeleccionado(null);
      setPreguntaSeleccionada(null);
      
      // Mostrar mensaje de agradecimiento
      await mostrarMensajeConTyping(`Es un placer poder informarte ${userName}, espero que sean de ayuda para ti 😊`);
      
      // Obtener y mostrar temas nuevamente
     // Activar el estado de espera para la siguiente entrada
     setWaitingForRestart(true);
     return;
    }else   if (userMessage === 'adios') {
      setWaitingForConfirmation(false);
      setChatEnded(true);
      await mostrarMensajeConTyping(`¡Hasta luego ${userName}! Ha sido un placer ayudarte. Si necesitas más información, no dudes en volver a consultarme.`);
      // Opcional: cerrar el chat después de un tiempo
      setTimeout(() => {
        handleClose();
      }, 3000);
    } 



   
    // Manejar el estado de espera después del agradecimiento
    if (waitingForRestart) {
      setWaitingForRestart(false);
      setWaitingForConfirmation(true);
      await mostrarMensajeConTyping("Soy PediBot estoy programado para informarte 🤖 ¿quieres informarte? puedes digitar Si/no");
      return;
    }
    // Manejar la confirmación (Si/No)
    if (waitingForConfirmation) {
      if (userMessage === 'si') {
        setWaitingForConfirmation(false);
        // Reiniciar el ciclo
        try {
          const response = await fetch('http://localhost:8080/api/chat_temas/');
          const temas = await response.json();
          setTemasDisponibles(temas);
          mostrarTemasUnoPorUno(temas, userName);
        } catch (error) {
          await mostrarMensajeConTyping('Lo siento, hubo un problema al consultar los temas.');
        }
      } else if (userMessage === 'no') {
        setWaitingForConfirmation(false);
        setChatEnded(true);
        await mostrarMensajeConTyping(`¡Hasta luego ${userName}! Ha sido un placer ayudarte. Si necesitas más información, no dudes en volver a consultarme.`);
        // Opcional: cerrar el chat después de un tiempo
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        // Si la respuesta no es si/no, volver a preguntar
        await mostrarMensajeConTyping("Por favor, responde con 'Si' o 'No'. ¿Quieres informarte?");
      }
      return;
    }
  
      if (!userName) {
        // Manejo del nombre permanece igual
        setUserName(input);
        setGreetingSent(true);
        
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prevMessages => [
            ...prevMessages,
            { text: `Mucho gusto, ${input}. ¿Analizo que esta aqui para informarte?`, isBot: true }
          ]);
        }, 1000);
      
        setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:8080/api/chat_temas/');
            const temas = await response.json();
            setTemasDisponibles(temas);
            mostrarTemasUnoPorUno(temas, userName);
          } catch (error) {
            setIsTyping(false);
            setMessages(prevMessages => [
              ...prevMessages,
              { text: 'Lo siento, hubo un problema al consultar los temas.', isBot: true }
            ]);
          }
        }, 1000);
      } else if (temaSeleccionado && !subtemaSeleccionado) {
        const validacion = validarEntrada(input, temasDisponibles, 'tema');
        if (!validacion.valido) {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: validacion.mensaje, isBot: true }
          ]);
          return;
        }
        obtenerSubtemas(parseInt(input));
      } else if (subtemaSeleccionado && !preguntaSeleccionada) {
        const validacion = validarEntrada(input, subtemasDisponibles, 'subtema');
        if (!validacion.valido) {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: validacion.mensaje, isBot: true }
          ]);
          return;
        }
        obtenerPreguntas(parseInt(input));
      } else if (preguntaSeleccionada) {
        const validacion = validarEntrada(input, preguntasDisponibles, 'pregunta');
        if (!validacion.valido) {
          setMessages(prevMessages => [
            ...prevMessages,
            { text: validacion.mensaje, isBot: true }
          ]);
          return;
        }
        obtenerRespuestas(parseInt(input));
      }
    }
  };
  const resetAllStates = () => {
    setTemaSeleccionado(null);
    setSubtemaSeleccionado(null);
    setPreguntaSeleccionada(null);
    setWaitingForRestart(false);
    setWaitingForConfirmation(false);
    setTemasDisponibles([]);
    setSubtemasDisponibles([]);
    setPreguntasDisponibles([]);
  };


  const obtenerSubtemas = async (id_tema) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat_subtemas/tema/${id_tema}`);
      const subtemas = await response.json();
      setSubtemasDisponibles(subtemas);

      if (subtemas.length > 0) {
        await mostrarMensajeConTyping('Puedo ayudarte informándote sobre estos subtemas 👀');

        for (const subtema of subtemas) {
          await mostrarMensajeConTyping(`Subtema ${subtema.id_subtema}: ${subtema.nombre}`);
        }
        
        await mostrarMensajeConTyping('Por favor ingresa el número del subtema que te interesa 📝');
        setSubtemaSeleccionado(true);
      } else {
        await mostrarMensajeConTyping('No se encontraron subtemas para este tema.');
      }
    } catch (error) {
      await mostrarMensajeConTyping('Lo siento, hubo un problema al consultar los subtemas.');
    }
  };

  const obtenerPreguntas = async (id_subtema) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chat_respuestas/subtema/${id_subtema}`);
      const preguntas = await response.json();
      setPreguntasDisponibles(preguntas);

      if (preguntas.length > 0) {
        await mostrarMensajeConTyping('Aquí tienes algunas preguntas frecuentes relacionadas con este subtema:');

        for (const pregunta of preguntas) {
          await mostrarMensajeConTyping(`Pregunta ${pregunta.id_chat}: ${pregunta.pregunta}`);
        }
        
        await mostrarMensajeConTyping('Por favor ingresa el número de la pregunta que te interesa 📝');
        setPreguntaSeleccionada(true);
      } else {
        await mostrarMensajeConTyping('No se encontraron preguntas para este subtema.');
      }
    } catch (error) {
      await mostrarMensajeConTyping('Lo siento, hubo un problema al consultar las preguntas 😟');
    }
  };

  const mostrarTemasUnoPorUno = (temas, userName) => {
    let delay = 0;
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: `Con gusto ${userName}. Puedo ayudarte informándote sobre estos temas 🧐`, isBot: true }
      ]);

      temas.forEach((tema, index) => {
        const temaId = tema.id_tema || index + 1;
        const temaTexto = tema.tema || 'Tema sin nombre';

        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prevMessages => [
              ...prevMessages,
              { text: `Tema ${temaId}: ${temaTexto}`, isBot: true }
            ]);
            setTemaSeleccionado(true);
          }, 1000);
        }, delay);

        delay += 2000;
      });

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Por favor ingresa el número del tema que te interesa 📝', isBot: true }
        ]);
      }, delay + 1000);
    }, 1000);
  };

 

  const obtenerRespuestas = async (id_chat) => {
    setIsTyping(true);
    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Aquí tienes la respuesta a tu pregunta:', isBot: true }
    ]);

    try {
      const response = await fetch(`http://localhost:8080/api/chat_respuestas/chat/${id_chat}`);
      const respuesta = await response.json();

      if (respuesta && Array.isArray(respuesta) && respuesta.length > 0) {
        const responseMessage = respuesta[0].respuesta;
        const enlace = respuesta[0].enlace;

        setMessages(prevMessages => [
          ...prevMessages,
          { text: responseMessage, enlace, isBot: true },
         ]);
         mostrarMensajeConTyping('Si te quedaste con alguna duda puedes comunicarte a ☎️5555-5554 📠ext 54 ')
       
      } else {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Lo siento, no encontré una respuesta a tu pregunta.', isBot: true }
        ]);
      }
    } catch (error) {
      setMessages(prevMessages => [
        ...prevMessages,
        { text: 'Lo siento, hubo un problema al consultar la respuesta.', isBot: true }
      ]);
    }
    setIsTyping(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 3000);
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
      {isOpen && (
        <div className={`chatbox ${isClosing ? 'chatbox-closing chatbox-hidden' : ''}`}>
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
                    <div className="message-bubble bot-bubble">
                      {message.text}
                      {message.enlace && (
                        <>
                          <a href={message.enlace} target="_blank" rel="noopener noreferrer">
                            {message.enlace}
                          </a>
                          {message.enlace.includes('youtube.com') && (
                            <div className="video-container">
                              <ReactPlayer 
                                url={message.enlace} 
                                controls={true} 
                                width="100%" 
                                height="200px"
                                light={true} // Muestra la vista previa (thumbnail)
                                playIcon={
                                  <button style={{
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '64px',
                                    height: '64px',
                                    cursor: 'pointer'
                                  }}>
                                    ▶
                                  </button>
                                }
                                config={{
                                  youtube: {
                                    playerVars: { origin: window.location.origin }
                                  }
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
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
              placeholder="Escriba el mensaje..."
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

export default ChatBotExample;
