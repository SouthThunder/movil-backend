import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: 'Token de autenticación inválido' });
    }

    // Adjuntar información del usuario al objeto de solicitud
    req.id = decoded.id_usuario;
    next(); // Pasar al siguiente middleware o ruta
  });
};

const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Formato de token no válido' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: 'Token de autenticación inválido' });
    }

    req.id = decoded.id_usuario;
    res.status(200)
    next(); // Pasar al siguiente middleware o ruta
  });
};

export { authMiddleware, authorize };