const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/conexion');

// Schema de validación
const cuentaSchema = Joi.object({
  nombre_cuenta: Joi.string().min(2).max(100).required(),
  proveedor: Joi.string().valid('mercadopago', 'banco_galicia', 'banco_nacion', 'banco_provincia', 'manual').default('manual'),
  saldo_inicial: Joi.number().default(0),
  moneda: Joi.string().length(3).default('ARS')
});

/**
 * GET /api/v1/cuentas
 * Lista todas las cuentas de la empresa
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const result = await query(
    `SELECT 
       id, nombre_cuenta, proveedor, estado, saldo_actual, moneda,
       ultimo_sync, created_at
     FROM cuentas_bancarias
     WHERE empresa_id = $1
     ORDER BY created_at DESC`,
    [empresaId]
  );
  
  // Calcular totales
  const totales = result.rows.reduce((acc, cuenta) => {
    if (cuenta.estado === 'connected') {
      acc.total += parseFloat(cuenta.saldo_actual) || 0;
      acc.conectadas++;
    }
    return acc;
  }, { total: 0, conectadas: 0 });
  
  res.json({
    success: true,
    data: {
      cuentas: result.rows,
      resumen: {
        total_cuentas: result.rows.length,
        cuentas_conectadas: totales.conectadas,
        saldo_total: totales.total
      }
    }
  });
}));

/**
 * GET /api/v1/cuentas/:id
 * Obtiene una cuenta específica
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  const result = await query(
    `SELECT * FROM cuentas_bancarias
     WHERE id = $1 AND empresa_id = $2`,
    [id, empresaId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Cuenta no encontrada'
    });
  }
  
  // No devolver tokens encriptados
  const cuenta = result.rows[0];
  delete cuenta.access_token_encrypted;
  delete cuenta.refresh_token_encrypted;
  
  res.json({
    success: true,
    data: cuenta
  });
}));

/**
 * POST /api/v1/cuentas
 * Crea una cuenta manual
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const { error, value } = cuentaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: error.details.map(d => d.message)
    });
  }
  
  // Validar límite de cuentas (free tier: 5 cuentas)
  const countResult = await query(
    'SELECT COUNT(*) as count FROM cuentas_bancarias WHERE empresa_id = $1',
    [empresaId]
  );
  
  const totalCuentas = parseInt(countResult.rows[0].count);
  const LIMITE_FREE_TIER = 5;
  
  if (totalCuentas >= LIMITE_FREE_TIER) {
    return res.status(403).json({
      success: false,
      error: 'Límite de cuentas alcanzado',
      message: `El plan gratuito permite hasta ${LIMITE_FREE_TIER} cuentas. Contacta ventas para actualizar.`
    });
  }
  
  const result = await query(
    `INSERT INTO cuentas_bancarias 
     (empresa_id, nombre_cuenta, proveedor, saldo_actual, moneda, estado)
     VALUES ($1, $2, $3, $4, $5, 'connected')
     RETURNING id, nombre_cuenta, proveedor, saldo_actual, moneda, estado, created_at`,
    [empresaId, value.nombre_cuenta, value.proveedor, value.saldo_inicial, value.moneda]
  );
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * PUT /api/v1/cuentas/:id
 * Actualiza una cuenta
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  const { nombre_cuenta, saldo_actual } = req.body;
  
  // Verificar pertenencia
  const check = await query(
    'SELECT id, proveedor FROM cuentas_bancarias WHERE id = $1 AND empresa_id = $2',
    [id, empresaId]
  );
  
  if (check.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Cuenta no encontrada'
    });
  }
  
  // Solo permitir editar saldo en cuentas manuales
  const esManual = check.rows[0].proveedor === 'manual';
  
  const result = await query(
    `UPDATE cuentas_bancarias 
     SET nombre_cuenta = COALESCE($1, nombre_cuenta),
         saldo_actual = CASE WHEN $4 THEN COALESCE($2, saldo_actual) ELSE saldo_actual END,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, nombre_cuenta, proveedor, saldo_actual, moneda, estado`,
    [nombre_cuenta, saldo_actual, id, esManual]
  );
  
  res.json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * DELETE /api/v1/cuentas/:id
 * Elimina una cuenta (solo manuales)
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  const check = await query(
    'SELECT proveedor FROM cuentas_bancarias WHERE id = $1 AND empresa_id = $2',
    [id, empresaId]
  );
  
  if (check.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Cuenta no encontrada'
    });
  }
  
  if (check.rows[0].proveedor !== 'manual') {
    return res.status(400).json({
      success: false,
      error: 'Solo se pueden eliminar cuentas manuales. Desconecta la integración primero.'
    });
  }
  
  // Eliminar movimientos asociados primero (cascade)
  await query('DELETE FROM movimientos WHERE cuenta_id = $1', [id]);
  await query('DELETE FROM cuentas_bancarias WHERE id = $1', [id]);
  
  res.json({
    success: true,
    data: { message: 'Cuenta eliminada' }
  });
}));

/**
 * POST /api/v1/cuentas/:id/actualizar-saldo
 * Actualiza el saldo de una cuenta manual
 */
router.post('/:id/actualizar-saldo', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  const { saldo } = req.body;
  
  if (typeof saldo !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'El saldo debe ser un número'
    });
  }
  
  const check = await query(
    'SELECT proveedor FROM cuentas_bancarias WHERE id = $1 AND empresa_id = $2',
    [id, empresaId]
  );
  
  if (check.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Cuenta no encontrada'
    });
  }
  
  if (check.rows[0].proveedor !== 'manual') {
    return res.status(400).json({
      success: false,
      error: 'El saldo de cuentas integradas se actualiza automáticamente'
    });
  }
  
  await query(
    'UPDATE cuentas_bancarias SET saldo_actual = $1, updated_at = NOW() WHERE id = $2',
    [saldo, id]
  );
  
  res.json({
    success: true,
    data: { message: 'Saldo actualizado', saldo_nuevo: saldo }
  });
}));

module.exports = router;
