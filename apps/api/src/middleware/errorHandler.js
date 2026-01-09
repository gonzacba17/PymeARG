/**
 * Error handler middleware global
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Error de validación Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: err.details.map(d => d.message)
    });
  }
  
  // Error de PostgreSQL
  if (err.code) {
    // Violación de unique constraint
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'El registro ya existe'
      });
    }
    
    // Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Referencia inválida'
      });
    }
    
    // Check constraint violation
    if (err.code === '23514') {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos según restricciones'
      });
    }
  }
  
  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor'
    : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not found handler
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Recurso no encontrado'
  });
};

/**
 * Async handler wrapper para evitar try-catch en controllers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
