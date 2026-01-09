const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/conexion');

/**
 * GET /api/v1/onboarding/status
 * Estado del onboarding del usuario
 */
router.get('/status', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.usuario_id;
  const empresaId = req.user.empresa_id;
  
  // Obtener datos del usuario
  const usuario = await query(
    `SELECT onboarding_completado, pasos_onboarding FROM usuarios WHERE id = $1`,
    [usuarioId]
  );
  
  // Verificar estado de la empresa
  const empresa = await query(
    `SELECT 
       (SELECT COUNT(*) FROM cuentas_bancarias WHERE empresa_id = $1 AND estado = 'connected') as cuentas_conectadas,
       (SELECT COUNT(*) FROM movimientos WHERE empresa_id = $1) as total_movimientos
     FROM empresas WHERE id = $1`,
    [empresaId]
  );
  
  const pasosCompletados = usuario.rows[0]?.pasos_onboarding || [];
  const cuentasConectadas = parseInt(empresa.rows[0]?.cuentas_conectadas) || 0;
  const tieneMovimientos = parseInt(empresa.rows[0]?.total_movimientos) > 0;
  
  // Definir pasos del onboarding
  const pasos = [
    {
      id: 'bienvenida',
      nombre: 'Bienvenida',
      completado: pasosCompletados.includes('bienvenida'),
      orden: 1
    },
    {
      id: 'conectar_cuenta',
      nombre: 'Conectar cuenta',
      completado: cuentasConectadas > 0,
      orden: 2,
      descripcion: 'Conectá tu cuenta de Mercado Pago o agregá una cuenta manual'
    },
    {
      id: 'primer_movimiento',
      nombre: 'Primer movimiento',
      completado: tieneMovimientos,
      orden: 3,
      descripcion: 'Registrá tu primer ingreso o egreso'
    },
    {
      id: 'configurar_alertas',
      nombre: 'Configurar alertas',
      completado: pasosCompletados.includes('configurar_alertas'),
      orden: 4,
      descripcion: 'Definí cuándo querés recibir notificaciones'
    }
  ];
  
  const completados = pasos.filter(p => p.completado).length;
  const porcentaje = Math.round((completados / pasos.length) * 100);
  
  res.json({
    success: true,
    data: {
      onboarding_completado: usuario.rows[0]?.onboarding_completado || false,
      porcentaje_completado: porcentaje,
      pasos,
      siguiente_paso: pasos.find(p => !p.completado) || null
    }
  });
}));

/**
 * POST /api/v1/onboarding/completar-paso
 * Marca un paso como completado
 */
router.post('/completar-paso', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.usuario_id;
  const { paso_id } = req.body;
  
  if (!paso_id) {
    return res.status(400).json({
      success: false,
      error: 'paso_id es requerido'
    });
  }
  
  // Agregar paso al array si no existe
  await query(
    `UPDATE usuarios 
     SET pasos_onboarding = (
       CASE 
         WHEN NOT pasos_onboarding @> $2::jsonb 
         THEN pasos_onboarding || $2::jsonb
         ELSE pasos_onboarding
       END
     )
     WHERE id = $1`,
    [usuarioId, JSON.stringify([paso_id])]
  );
  
  res.json({
    success: true,
    data: { message: `Paso "${paso_id}" completado` }
  });
}));

/**
 * POST /api/v1/onboarding/completar
 * Marca el onboarding como completado
 */
router.post('/completar', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.usuario_id;
  
  await query(
    `UPDATE usuarios SET onboarding_completado = TRUE WHERE id = $1`,
    [usuarioId]
  );
  
  res.json({
    success: true,
    data: { message: 'Onboarding completado' }
  });
}));

/**
 * POST /api/v1/onboarding/skip
 * Salta el onboarding
 */
router.post('/skip', authenticate, asyncHandler(async (req, res) => {
  const usuarioId = req.user.usuario_id;
  
  await query(
    `UPDATE usuarios 
     SET onboarding_completado = TRUE, 
         pasos_onboarding = '["skipped"]'::jsonb
     WHERE id = $1`,
    [usuarioId]
  );
  
  res.json({
    success: true,
    data: { message: 'Onboarding saltado' }
  });
}));

module.exports = router;
