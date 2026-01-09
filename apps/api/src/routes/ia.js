const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const iaService = require('../services/iaService');
const { query } = require('../db/conexion');

/**
 * POST /api/v1/ia/clasificar
 * Clasifica un movimiento individual
 */
router.post('/clasificar', authenticate, asyncHandler(async (req, res) => {
  const { movimiento_id } = req.body;
  const empresaId = req.user.empresa_id;
  
  if (!movimiento_id) {
    return res.status(400).json({
      success: false,
      error: 'movimiento_id es requerido'
    });
  }
  
  // Verificar que el movimiento pertenece a la empresa
  const movResult = await query(
    `SELECT id, descripcion, descripcion_original, monto, tipo, fecha_transaccion
     FROM movimientos 
     WHERE id = $1 AND empresa_id = $2`,
    [movimiento_id, empresaId]
  );
  
  if (movResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Movimiento no encontrado'
    });
  }
  
  const movimiento = movResult.rows[0];
  const resultado = await iaService.clasificarMovimiento(movimiento, empresaId);
  
  if (!resultado) {
    return res.status(500).json({
      success: false,
      error: 'No se pudo clasificar el movimiento'
    });
  }
  
  // Actualizar movimiento con la clasificación
  await query(
    `UPDATE movimientos 
     SET categoria_id = $1, 
         clasificacion_origen = 'ia',
         clasificacion_confianza = $2,
         updated_at = NOW()
     WHERE id = $3`,
    [resultado.categoria_id, resultado.confianza, movimiento_id]
  );
  
  res.json({
    success: true,
    data: resultado
  });
}));

/**
 * POST /api/v1/ia/clasificar/batch
 * Clasifica múltiples movimientos
 */
router.post('/clasificar/batch', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const { movimiento_ids, clasificar_pendientes } = req.body;
  
  let movimientos;
  
  if (clasificar_pendientes) {
    // Clasificar todos los pendientes
    movimientos = await iaService.obtenerPendientes(empresaId, 50);
  } else if (movimiento_ids && movimiento_ids.length > 0) {
    // Clasificar IDs específicos
    const result = await query(
      `SELECT id, descripcion, descripcion_original, monto, tipo, fecha_transaccion
       FROM movimientos 
       WHERE id = ANY($1) AND empresa_id = $2`,
      [movimiento_ids, empresaId]
    );
    movimientos = result.rows;
  } else {
    return res.status(400).json({
      success: false,
      error: 'Proporcione movimiento_ids o clasificar_pendientes=true'
    });
  }
  
  if (movimientos.length === 0) {
    return res.json({
      success: true,
      data: {
        clasificados: 0,
        resultados: []
      }
    });
  }
  
  const resultados = await iaService.clasificarBatch(movimientos, empresaId);
  
  // Actualizar movimientos con clasificaciones exitosas
  for (const r of resultados) {
    if (r.categoria_id) {
      await query(
        `UPDATE movimientos 
         SET categoria_id = $1, 
             clasificacion_origen = 'ia',
             clasificacion_confianza = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [r.categoria_id, r.confianza, r.movimiento_id]
      );
    }
  }
  
  const exitosos = resultados.filter(r => !r.error).length;
  
  res.json({
    success: true,
    data: {
      total: movimientos.length,
      clasificados: exitosos,
      errores: movimientos.length - exitosos,
      resultados
    }
  });
}));

/**
 * POST /api/v1/ia/feedback
 * Registra corrección del usuario
 */
router.post('/feedback', authenticate, asyncHandler(async (req, res) => {
  const { movimiento_id, categoria_id } = req.body;
  const usuarioId = req.user.usuario_id;
  const empresaId = req.user.empresa_id;
  
  // Validar input
  if (!movimiento_id || !categoria_id) {
    return res.status(400).json({
      success: false,
      error: 'movimiento_id y categoria_id son requeridos'
    });
  }
  
  // Verificar pertenencia
  const movCheck = await query(
    'SELECT id FROM movimientos WHERE id = $1 AND empresa_id = $2',
    [movimiento_id, empresaId]
  );
  
  if (movCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Movimiento no encontrado'
    });
  }
  
  const resultado = await iaService.registrarFeedback(movimiento_id, categoria_id, usuarioId);
  
  res.json({
    success: true,
    data: resultado || { mensaje: 'No había clasificación previa para este movimiento' }
  });
}));

/**
 * GET /api/v1/ia/metricas
 * Obtiene métricas de accuracy
 */
router.get('/metricas', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const metricas = await iaService.obtenerMetricas(empresaId);
  
  res.json({
    success: true,
    data: metricas
  });
}));

/**
 * GET /api/v1/ia/pendientes
 * Lista movimientos pendientes de clasificar
 */
router.get('/pendientes', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const limite = Math.min(parseInt(req.query.limite) || 50, 100);
  
  const pendientes = await iaService.obtenerPendientes(empresaId, limite);
  
  res.json({
    success: true,
    data: {
      total: pendientes.length,
      movimientos: pendientes
    }
  });
}));

/**
 * GET /api/v1/ia/status
 * Estado del servicio de IA
 */
router.get('/status', authenticate, asyncHandler(async (req, res) => {
  const openaiClient = require('../services/openaiClient');
  
  res.json({
    success: true,
    data: {
      configurado: openaiClient.isConfigured(),
      modelo: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      prompt_version: '1.0.0'
    }
  });
}));

module.exports = router;
