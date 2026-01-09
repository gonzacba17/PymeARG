const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../db/conexion');

// Schemas de validación
const movimientoSchema = Joi.object({
  cuenta_id: Joi.string().uuid().required(),
  categoria_id: Joi.string().uuid(),
  monto: Joi.number().positive().required(),
  tipo: Joi.string().valid('ingreso', 'egreso').required(),
  descripcion: Joi.string().max(500),
  fecha_transaccion: Joi.date().iso().required()
});

/**
 * GET /api/v1/movimientos
 * Lista movimientos con filtros y paginación
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const {
    tipo,
    categoria_id,
    cuenta_id,
    desde,
    hasta,
    clasificacion,
    page = 1,
    limit = 50
  } = req.query;
  
  let whereClause = 'WHERE m.empresa_id = $1';
  const params = [empresaId];
  let paramIndex = 2;
  
  if (tipo) {
    whereClause += ` AND m.tipo = $${paramIndex++}`;
    params.push(tipo);
  }
  
  if (categoria_id) {
    whereClause += ` AND m.categoria_id = $${paramIndex++}`;
    params.push(categoria_id);
  }
  
  if (cuenta_id) {
    whereClause += ` AND m.cuenta_id = $${paramIndex++}`;
    params.push(cuenta_id);
  }
  
  if (desde) {
    whereClause += ` AND m.fecha_transaccion >= $${paramIndex++}`;
    params.push(desde);
  }
  
  if (hasta) {
    whereClause += ` AND m.fecha_transaccion <= $${paramIndex++}`;
    params.push(hasta);
  }
  
  if (clasificacion) {
    whereClause += ` AND m.clasificacion_origen = $${paramIndex++}`;
    params.push(clasificacion);
  }
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Obtener total
  const countResult = await query(
    `SELECT COUNT(*) FROM movimientos m ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);
  
  // Obtener movimientos
  const result = await query(
    `SELECT 
       m.id, m.monto, m.tipo, m.descripcion, m.descripcion_original,
       m.fecha_transaccion, m.clasificacion_origen, m.clasificacion_confianza,
       m.created_at,
       c.id as categoria_id, c.nombre as categoria_nombre, c.icono as categoria_icono,
       cb.nombre_cuenta
     FROM movimientos m
     LEFT JOIN categorias c ON c.id = m.categoria_id
     LEFT JOIN cuentas_bancarias cb ON cb.id = m.cuenta_id
     ${whereClause}
     ORDER BY m.fecha_transaccion DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, parseInt(limit), offset]
  );
  
  res.json({
    success: true,
    data: {
      movimientos: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

/**
 * GET /api/v1/movimientos/:id
 * Obtiene un movimiento específico
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  const result = await query(
    `SELECT 
       m.*,
       c.nombre as categoria_nombre, c.icono as categoria_icono, c.tipo as categoria_tipo,
       cb.nombre_cuenta, cb.proveedor
     FROM movimientos m
     LEFT JOIN categorias c ON c.id = m.categoria_id
     LEFT JOIN cuentas_bancarias cb ON cb.id = m.cuenta_id
     WHERE m.id = $1 AND m.empresa_id = $2`,
    [id, empresaId]
  );
  
  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Movimiento no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * POST /api/v1/movimientos
 * Crea un movimiento manual
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const { error, value } = movimientoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: error.details.map(d => d.message)
    });
  }
  
  // Verificar que la cuenta pertenece a la empresa
  const cuentaCheck = await query(
    'SELECT id FROM cuentas_bancarias WHERE id = $1 AND empresa_id = $2',
    [value.cuenta_id, empresaId]
  );
  
  if (cuentaCheck.rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Cuenta no encontrada'
    });
  }
  
  const result = await query(
    `INSERT INTO movimientos 
     (empresa_id, cuenta_id, categoria_id, monto, tipo, descripcion, fecha_transaccion, clasificacion_origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'manual')
     RETURNING *`,
    [
      empresaId,
      value.cuenta_id,
      value.categoria_id || null,
      value.monto,
      value.tipo,
      value.descripcion || null,
      value.fecha_transaccion
    ]
  );
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * PUT /api/v1/movimientos/:id
 * Actualiza un movimiento
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  const { categoria_id, descripcion } = req.body;
  
  // Verificar pertenencia
  const check = await query(
    'SELECT id FROM movimientos WHERE id = $1 AND empresa_id = $2',
    [id, empresaId]
  );
  
  if (check.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Movimiento no encontrado'
    });
  }
  
  const result = await query(
    `UPDATE movimientos 
     SET categoria_id = COALESCE($1, categoria_id),
         descripcion = COALESCE($2, descripcion),
         clasificacion_origen = CASE WHEN $1 IS NOT NULL THEN 'manual' ELSE clasificacion_origen END,
         updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [categoria_id, descripcion, id]
  );
  
  res.json({
    success: true,
    data: result.rows[0]
  });
}));

/**
 * DELETE /api/v1/movimientos/:id
 * Elimina un movimiento (solo manuales)
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empresaId = req.user.empresa_id;
  
  // Solo permitir eliminar movimientos manuales
  const check = await query(
    `SELECT id, clasificacion_origen FROM movimientos 
     WHERE id = $1 AND empresa_id = $2`,
    [id, empresaId]
  );
  
  if (check.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Movimiento no encontrado'
    });
  }
  
  if (check.rows[0].clasificacion_origen !== 'manual') {
    return res.status(400).json({
      success: false,
      error: 'Solo se pueden eliminar movimientos manuales'
    });
  }
  
  await query('DELETE FROM movimientos WHERE id = $1', [id]);
  
  res.json({
    success: true,
    data: { message: 'Movimiento eliminado' }
  });
}));

/**
 * GET /api/v1/movimientos/stats/resumen
 * Estadísticas de movimientos
 */
router.get('/stats/resumen', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const { desde, hasta } = req.query;
  
  let dateFilter = '';
  const params = [empresaId];
  
  if (desde) {
    dateFilter += ' AND fecha_transaccion >= $2';
    params.push(desde);
  }
  if (hasta) {
    dateFilter += ` AND fecha_transaccion <= $${params.length + 1}`;
    params.push(hasta);
  }
  
  const result = await query(
    `SELECT 
       COUNT(*) as total_movimientos,
       COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
       COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as total_egresos,
       COUNT(*) FILTER (WHERE clasificacion_origen = 'pendiente') as pendientes_clasificar,
       COUNT(*) FILTER (WHERE clasificacion_origen = 'ia') as clasificados_ia,
       COUNT(*) FILTER (WHERE clasificacion_origen = 'manual') as clasificados_manual
     FROM movimientos
     WHERE empresa_id = $1 ${dateFilter}`,
    params
  );
  
  const stats = result.rows[0];
  
  res.json({
    success: true,
    data: {
      total_movimientos: parseInt(stats.total_movimientos),
      total_ingresos: parseFloat(stats.total_ingresos),
      total_egresos: parseFloat(stats.total_egresos),
      balance: parseFloat(stats.total_ingresos) - parseFloat(stats.total_egresos),
      clasificacion: {
        pendientes: parseInt(stats.pendientes_clasificar),
        ia: parseInt(stats.clasificados_ia),
        manual: parseInt(stats.clasificados_manual)
      }
    }
  });
}));

module.exports = router;
