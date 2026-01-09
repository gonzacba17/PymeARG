const pool = require('../config/database');

class DashboardService {
  /**
   * Obtener resumen completo del dashboard para una empresa
   */
  async obtenerResumenDashboard(empresaId) {
    try {
      // Obtener KPIs principales
      const kpis = await this.obtenerKPIs(empresaId);
      
      // Obtener alertas activas
      const alertas = await this.obtenerAlertasActivas(empresaId);
      
      // Obtener movimientos recientes
      const movimientosRecientes = await this.obtenerMovimientosRecientes(empresaId, 5);
      
      // Obtener proyección del mes actual
      const proyeccion = await this.obtenerProyeccionMesActual(empresaId);
      
      return {
        kpis,
        alertas,
        movimientos_recientes: movimientosRecientes,
        proyeccion
      };
    } catch (error) {
      console.error('Error al obtener resumen dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener KPIs: saldo actual, ingresos del mes, egresos del mes
   */
  async obtenerKPIs(empresaId) {
    const query = `
      WITH mes_actual AS (
        SELECT 
          DATE_TRUNC('month', CURRENT_DATE) AS inicio_mes,
          CURRENT_DATE AS fecha_actual
      ),
      saldo AS (
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM movimientos
        WHERE empresa_id = $1
      ),
      ingresos_mes AS (
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM movimientos m, mes_actual ma
        WHERE m.empresa_id = $1
          AND m.tipo = 'ingreso'
          AND m.fecha >= ma.inicio_mes
          AND m.fecha <= ma.fecha_actual
      ),
      egresos_mes AS (
        SELECT COALESCE(ABS(SUM(monto)), 0) AS total
        FROM movimientos m, mes_actual ma
        WHERE m.empresa_id = $1
          AND m.tipo = 'egreso'
          AND m.fecha >= ma.inicio_mes
          AND m.fecha <= ma.fecha_actual
      ),
      ingresos_mes_anterior AS (
        SELECT COALESCE(SUM(monto), 0) AS total
        FROM movimientos m, mes_actual ma
        WHERE m.empresa_id = $1
          AND m.tipo = 'ingreso'
          AND m.fecha >= (ma.inicio_mes - INTERVAL '1 month')
          AND m.fecha < ma.inicio_mes
      ),
      egresos_mes_anterior AS (
        SELECT COALESCE(ABS(SUM(monto)), 0) AS total
        FROM movimientos m, mes_actual ma
        WHERE m.empresa_id = $1
          AND m.tipo = 'egreso'
          AND m.fecha >= (ma.inicio_mes - INTERVAL '1 month')
          AND m.fecha < ma.inicio_mes
      )
      SELECT 
        (SELECT total FROM saldo) AS saldo_actual,
        (SELECT total FROM ingresos_mes) AS ingresos_mes,
        (SELECT total FROM egresos_mes) AS egresos_mes,
        (SELECT total FROM ingresos_mes_anterior) AS ingresos_mes_anterior,
        (SELECT total FROM egresos_mes_anterior) AS egresos_mes_anterior
    `;

    const result = await pool.query(query, [empresaId]);
    const data = result.rows[0];

    // Calcular cambios porcentuales
    const cambioIngresos = data.ingresos_mes_anterior > 0
      ? ((data.ingresos_mes - data.ingresos_mes_anterior) / data.ingresos_mes_anterior) * 100
      : 0;

    const cambioEgresos = data.egresos_mes_anterior > 0
      ? ((data.egresos_mes - data.egresos_mes_anterior) / data.egresos_mes_anterior) * 100
      : 0;

    return {
      saldo_actual: parseFloat(data.saldo_actual),
      ingresos_mes: parseFloat(data.ingresos_mes),
      egresos_mes: parseFloat(data.egresos_mes),
      cambio_ingresos: parseFloat(cambioIngresos.toFixed(1)),
      cambio_egresos: parseFloat(cambioEgresos.toFixed(1))
    };
  }

  /**
   * Obtener alertas activas (no leídas ni descartadas)
   */
  async obtenerAlertasActivas(empresaId) {
    const query = `
      SELECT 
        id,
        tipo,
        titulo,
        mensaje,
        severidad,
        metadata,
        created_at
      FROM alertas
      WHERE empresa_id = $1
        AND estado = 'activa'
        AND leida = false
      ORDER BY 
        CASE severidad
          WHEN 'critical' THEN 1
          WHEN 'warning' THEN 2
          WHEN 'info' THEN 3
        END,
        created_at DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [empresaId]);
    return result.rows;
  }

  /**
   * Obtener movimientos recientes
   */
  async obtenerMovimientosRecientes(empresaId, limite = 5) {
    const query = `
      SELECT 
        m.id,
        m.descripcion,
        m.monto,
        m.tipo,
        m.fecha,
        m.estado,
        c.nombre AS categoria,
        cl.confianza AS clasificacion_confianza
      FROM movimientos m
      LEFT JOIN categorias c ON m.categoria_id = c.id
      LEFT JOIN clasificaciones cl ON m.id = cl.movimiento_id
      WHERE m.empresa_id = $1
      ORDER BY m.fecha DESC, m.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [empresaId, limite]);
    return result.rows;
  }

  /**
   * Obtener proyección del mes actual
   */
  async obtenerProyeccionMesActual(empresaId) {
    const query = `
      SELECT 
        fecha_inicio,
        fecha_fin,
        escenario,
        saldo_inicial,
        saldo_proyectado,
        ingresos_proyectados,
        egresos_proyectados,
        puntos_datos
      FROM proyecciones_cash
      WHERE empresa_id = $1
        AND fecha_fin >= CURRENT_DATE
        AND fecha_inicio <= CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 3
    `;

    const result = await pool.query(query, [empresaId]);
    return result.rows;
  }
}

module.exports = new DashboardService();
