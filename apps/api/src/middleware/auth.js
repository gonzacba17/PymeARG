const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar info del usuario al request
    req.user = {
      usuario_id: decoded.usuario_id,
      empresa_id: decoded.empresa_id,
      rol: decoded.rol,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

/**
 * Middleware para verificar rol
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para esta acción'
      });
    }
    
    next();
  };
};

/**
 * Generar JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'pulso-api',
    audience: 'pulso-app'
  });
};

module.exports = {
  authenticate,
  requireRole,
  generateToken
};
