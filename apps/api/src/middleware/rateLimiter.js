const rateLimit = require('express-rate-limit');

// Rate limiter general para API
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    error: 'Demasiados intentos de login, intenta nuevamente en 15 minutos'
  },
  skipSuccessfulRequests: true,
});

// Rate limiter para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: {
    success: false,
    error: 'Demasiados registros desde esta IP, intenta nuevamente más tarde'
  },
});

module.exports = {
  rateLimiter,
  loginLimiter,
  registerLimiter
};
