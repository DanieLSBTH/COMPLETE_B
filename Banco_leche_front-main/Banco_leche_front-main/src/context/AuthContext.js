// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
  });

  useEffect(() => {
    if (auth.token) {
      api.get('/usuarios/me', {
        headers: {
          Authorization: `Bearer ${auth.token}`, // Asegúrate de que estás enviando el token
        },
      })
      .then(response => {
        setAuth(prev => ({ ...prev, user: response.data.usuario }));
      })
      .catch(() => {
        setAuth({ token: null, user: null });
        localStorage.removeItem('token');
      });
    }
  }, [auth.token]);
  

  const login = (token) => {
    localStorage.setItem('token', token); // Guarda el token en localStorage
    setAuth({ token }); // Actualiza el contexto con el nuevo token
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
