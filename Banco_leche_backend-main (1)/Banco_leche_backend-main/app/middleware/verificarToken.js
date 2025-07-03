const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extrae el token de la cabecera

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
    req.usuarioId = decoded.id; // Guarda el id del usuario en la solicitud
    next(); // Continúa con la siguiente función middleware
  });
};


module.exports = verificarToken;
