const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const { query, transaction } = require('../db/conexion');
const { generateToken, authenticate } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');

// Validation schemas
const registerSchema = Joi.object({
  empresa: Joi.object({
    nombre: Joi.string().min(2).max(255).required(),
    cuit: Joi.string().pattern(/^\d{11}$/).required(),
    razon_social: Joi.string().max(255),
    industria: Joi.string().max(100)
  }).required(),
  usuario: Joi.object({
    email: Joi.string().email().required(),
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    telefono: Joi.string().max(20),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Password debe tener mayúscula, minúscula, número y símbolo'
      })
  }).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * POST /api/v1/auth/register
 * Registrar nueva empresa + usuario owner
 */
router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  // Validar input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: error.details.map(d => d.message)
    });
  }
  
  const { empresa, usuario } = value;
  
  // Verificar que el CUIT no exista
  const cuitCheck = await query(
    'SELECT id FROM empresas WHERE cuit = $1',
    [empresa.cuit]
  );
  
  if (cuitCheck.rows.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'El CUIT ya está registrado'
    });
  }
  
  // Verificar que el email no exista
  const emailCheck = await query(
    'SELECT id FROM usuarios WHERE email = $1',
    [usuario.email]
  );
  
  if (emailCheck.rows.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'El email ya está registrado'
    });
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(usuario.password, 12);
  
  // Crear empresa y usuario en transacción
  const result = await transaction(async (client) => {
    // Crear empresa
    const empresaResult = await client.query(
      `INSERT INTO empresas (nombre, cuit, razon_social, industria)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, cuit, plan_activo`,
      [empresa.nombre, empresa.cuit, empresa.razon_social || null, empresa.industria || null]
    );
    
    const nuevaEmpresa = empresaResult.rows[0];
    
    // Crear usuario owner
    const usuarioResult = await client.query(
      `INSERT INTO usuarios (empresa_id, email, nombre, apellido, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5, $6, 'owner')
       RETURNING id, email, nombre, apellido, rol`,
      [
        nuevaEmpresa.id,
        usuario.email,
        usuario.nombre,
        usuario.apellido,
        usuario.telefono || null,
        passwordHash
      ]
    );
    
    const nuevoUsuario = usuarioResult.rows[0];
    
    return { empresa: nuevaEmpresa, usuario: nuevoUsuario };
  });
  
  // Generar JWT
  const token = generateToken({
    usuario_id: result.usuario.id,
    empresa_id: result.empresa.id,
    rol: result.usuario.rol,
    email: result.usuario.email
  });
  
  // Respuesta sin password
  res.status(201).json({
    success: true,
    data: {
      empresa_id: result.empresa.id,
      usuario_id: result.usuario.id,
      token,
      onboarding_url: '/onboarding'
    }
  });
}));

/**
 * POST /api/v1/auth/login
 * Login con email y password
 */
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  // Validar input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos'
    });
  }
  
  const { email, password } = value;
  
  // Buscar usuario con empresa
  const result = await query(
    `SELECT 
      u.id, u.email, u.nombre, u.apellido, u.password_hash, u.rol, 
      u.onboarding_completado,
      e.id as empresa_id, e.nombre as empresa_nombre, e.plan_activo, e.estado
     FROM usuarios u
     JOIN empresas e ON e.id = u.empresa_id
     WHERE u.email = $1`,
    [email]
  );
  
  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      error: 'Credenciales inválidas'
    });
  }
  
  const usuario = result.rows[0];
  
  // Verificar que la empresa esté activa
  if (usuario.estado === 'suspended' || usuario.estado === 'cancelled') {
    return res.status(403).json({
      success: false,
      error: 'Cuenta suspendida o cancelada. Contacta a soporte.'
    });
  }
  
  // Verificar password
  const passwordValid = await bcrypt.compare(password, usuario.password_hash);
  
  if (!passwordValid) {
    return res.status(401).json({
      success: false,
      error: 'Credenciales inválidas'
    });
  }
  
  // Actualizar ultimo_login
  await query(
    'UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1',
    [usuario.id]
  );
  
  // Generar JWT
  const token = generateToken({
    usuario_id: usuario.id,
    empresa_id: usuario.empresa_id,
    rol: usuario.rol,
    email: usuario.email
  });
  
  // Respuesta sin password
  delete usuario.password_hash;
  
  res.json({
    success: true,
    data: {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        empresa: {
          id: usuario.empresa_id,
          nombre: usuario.empresa_nombre,
          plan_activo: usuario.plan_activo
        },
        onboarding_completado: usuario.onboarding_completado
      }
    }
  });
}));

/**
 * GET /api/v1/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT 
      u.id, u.email, u.nombre, u.apellido, u.rol, u.telefono,
      u.onboarding_completado, u.pasos_onboarding, u.preferencias,
      u.ultimo_login,
      e.id as empresa_id, e.nombre as empresa_nombre, e.cuit, 
      e.plan_activo, e.modulos_activos
     FROM usuarios u
     JOIN empresas e ON e.id = u.empresa_id
     WHERE u.id = $1`,
    [req.user.usuario_id]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Usuario no encontrado'
    });
  }
  
  const usuario = result.rows[0];
  
  res.json({
    success: true,
    data: {
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        onboarding_completado: usuario.onboarding_completado,
        pasos_onboarding: usuario.pasos_onboarding,
        preferencias: usuario.preferencias,
        ultimo_login: usuario.ultimo_login,
        empresa: {
          id: usuario.empresa_id,
          nombre: usuario.empresa_nombre,
          cuit: usuario.cuit,
          plan_activo: usuario.plan_activo,
          modulos_activos: usuario.modulos_activos
        }
      },
      permisos: ['ver_dashboard', 'clasificar_movimientos', 'conectar_cuentas'] // Expandir según rol
    }
  });
}));

module.exports = router;
