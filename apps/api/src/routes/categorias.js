const express = require('express');
const router = express.Router();
const { query } = require('../db/conexion');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/v1/categorias
 * Obtener todas las categorías (predefinidas + custom de la empresa)
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  const result = await query(
    `SELECT id, nombre, tipo, icono, color, es_predefinida, descripcion
     FROM categorias
     WHERE empresa_id IS NULL OR empresa_id = $1
     ORDER BY es_predefinida DESC, tipo, nombre`,
    [empresaId]
  );
  
  const categorias = result.rows;
  
  // Agrupar por tipo
  const ingresos = categorias.filter(c => c.tipo === 'ingreso');
  const egresos = categorias.filter(c => c.tipo === 'egreso');
  
  res.json({
    success: true,
    data: {
      ingresos,
      egresos
    }
  });
}));

/**
 * POST /api/v1/categorias
 * Crear categoría personalizada
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const { nombre, tipo, icono, color } = req.body;
  
  const result = await query(
    `INSERT INTO categorias (empresa_id, nombre, tipo, icono, color, es_predefinida)
     VALUES ($1, $2, $3, $4, $5, FALSE)
     RETURNING id, nombre, tipo, icono, color, es_predefinida`,
    [empresaId, nombre, tipo, icono || '📌', color || '#6b7280']
  );
  
  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
}));

module.exports = router;
