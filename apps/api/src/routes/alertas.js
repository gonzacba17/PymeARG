const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const alertasService = require('../services/alertasService');

/**
 * GET /api/v1/alertas
 * Lista alertas de la empresa
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const soloNoLeidas = req.query.no_leidas === 'true';
  const limite = Math.min(parseInt(req.query.limite) || 50, 100);
  
  const alertas = await alertasService.listarAlertas(empresaId, { soloNoLeidas, limite });
  
  res.json({
    success: true,
    data: alertas
  });
}));

/**
 * GET /api/v1/alertas/count
 * Cuenta alertas no leídas por severidad
 */
router.get('/count', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const conteo = await alertasService.contarNoLeidas(empresaId);
  
  res.json({
    success: true,
    data: conteo
  });
}));

/**
 * POST /api/v1/alertas/evaluar
 * Ejecuta evaluación de reglas (normalmente un cron job)
 */
router.post('/evaluar', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const nuevasAlertas = await alertasService.evaluarTodasLasReglas(empresaId);
  
  res.json({
    success: true,
    data: {
      nuevas_alertas: nuevasAlertas.length,
      alertas: nuevasAlertas
    }
  });
}));

/**
 * PUT /api/v1/alertas/:id/leer
 * Marca una alerta como leída
 */
router.put('/:id/leer', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  await alertasService.marcarLeida(id, empresaId);
  
  res.json({
    success: true,
    data: { message: 'Alerta marcada como leída' }
  });
}));

/**
 * PUT /api/v1/alertas/:id/descartar
 * Descarta una alerta
 */
router.put('/:id/descartar', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  await alertasService.descartar(id, empresaId);
  
  res.json({
    success: true,
    data: { message: 'Alerta descartada' }
  });
}));

/**
 * POST /api/v1/alertas/leer-todas
 * Marca todas las alertas como leídas
 */
router.post('/leer-todas', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const { query } = require('../db/conexion');
  await query(
    `UPDATE alertas SET leida = TRUE, fecha_leida = NOW()
     WHERE empresa_id = $1 AND leida = FALSE`,
    [empresaId]
  );
  
  res.json({
    success: true,
    data: { message: 'Todas las alertas marcadas como leídas' }
  });
}));

module.exports = router;
