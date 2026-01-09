const express = require('express');
const router = express.Router();
const { query } = require('../db/conexion');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/v1/dashboard
 * Resumen ejecutivo del dashboard
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  // Usar la view predefinida dashboard_resumen
  const dashboardResult = await query(
    'SELECT * FROM dashboard_resumen WHERE empresa_id = $1',
    [empresaId]
  );
  
  if (dashboardResult.rows.length === 0) {
    // Primera vez, devolver datos vacíos
    return res.json({
      success: true,
      data: {
        cash_total: 0,
        mes_actual: {
          ingresos: 0,
          egresos: 0,
          margen: 0,
          margen_porcentaje: 0
        },
        comparacion_mes_anterior: {
          ingresos_variacion: 0,
          egresos_variacion: 0
        },
        proyeccion_30_dias: null,
        alertas_criticas: 0,
        movimientos_pendientes: 0,
        cuentas_conectadas: 0
      }
    });
  }
  
  const dashboard = dashboardResult.rows[0];
  
  // Calcular margen
  const ingresos = parseFloat(dashboard.ingresos_mes) || 0;
  const egresos = parseFloat(dashboard.egresos_mes) || 0;
  const margen = ingresos - egresos;
  const margenPorcentaje = ingresos > 0 ? (margen / ingresos * 100) : 0;
  
  // Obtener proyección más cercana (30 días aprox)
  const proyeccionResult = await query(
    `SELECT fecha_proyeccion, cash_proyectado, confianza
     FROM proyecciones_cash
     WHERE empresa_id = $1 
       AND fecha_proyeccion >= CURRENT_DATE + INTERVAL '25 days'
       AND fecha_proyeccion <= CURRENT_DATE + INTERVAL '35 days'
     ORDER BY fecha_proyeccion ASC
     LIMIT 1`,
    [empresaId]
  );
  
  const proyeccion = proyeccionResult.rows[0] || null;
  
  // Calcular variación vs mes anterior
  const mesAnteriorResult = await query(
    `SELECT 
      COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as ingresos_mes_anterior,
      COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as egresos_mes_anterior
     FROM movimientos
     WHERE empresa_id = $1
       AND fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
       AND fecha_transaccion < DATE_TRUNC('month', CURRENT_DATE)`,
    [empresaId]
  );
  
  const mesAnterior = mesAnteriorResult.rows[0];
  const ingresosAnterior = parseFloat(mesAnterior.ingresos_mes_anterior) || 0;
  const egresosAnterior = parseFloat(mesAnterior.egresos_mes_anterior) || 0;
  
  const ingresosVariacion = ingresosAnterior > 0 
    ? ((ingresos - ingresosAnterior) / ingresosAnterior * 100) 
    : 0;
  const egresosVariacion = egresosAnterior > 0 
    ? ((egresos - egresosAnterior) / egresosAnterior * 100) 
    : 0;
  
  // Contar alertas críticas no leídas
  const alertasCriticasResult = await query(
    `SELECT COUNT(*) as count
     FROM alertas
     WHERE empresa_id = $1 AND leida = FALSE AND severidad = 'critical'`,
    [empresaId]
  );
  
  const proyeccionData = proyeccion ? {
    fecha: proyeccion.fecha_proyeccion,
    cash_proyectado: parseFloat(proyeccion.cash_proyectado),
    confianza: parseFloat(proyeccion.confianza),
    tendencia: parseFloat(proyeccion.cash_proyectado) < parseFloat(dashboard.cash_total) ? 'bajando' : 'subiendo'
  } : null;
  
  res.json({
    success: true,
    data: {
      cash_total: parseFloat(dashboard.cash_total),
      mes_actual: {
        ingresos: ingresos,
        egresos: egresos,
        margen: margen,
        margen_porcentaje: margenPorcentaje
      },
      comparacion_mes_anterior: {
        ingresos_variacion: ingresosVariacion,
        egresos_variacion: egresosVariacion
      },
      proyeccion_30_dias: proyeccionData,
      alertas_criticas: parseInt(alertasCriticasResult.rows[0].count),
      movimientos_pendientes: parseInt(dashboard.movimientos_pendientes),
      cuentas_conectadas: parseInt(dashboard.total_cuentas)
    }
  });
}));

module.exports = router;
