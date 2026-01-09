const { query } = require('../db/conexion');

/**
 * Servicio de alertas
 */
class AlertasService {
  constructor() {
    this.reglas = {
      cash_bajo: this.evaluarCashBajo.bind(this),
      gasto_inusual: this.evaluarGastoInusual.bind(this),
      sin_actividad: this.evaluarSinActividad.bind(this),
      vencimiento: this.evaluarVencimientos.bind(this),
    };
  }

  /**
   * Evalúa todas las reglas para una empresa
   */
  async evaluarTodasLasReglas(empresaId) {
    const alertasGeneradas = [];
    
    for (const [tipo, evaluador] of Object.entries(this.reglas)) {
      try {
        const alertas = await evaluador(empresaId);
        if (alertas && alertas.length > 0) {
          for (const alerta of alertas) {
            // Verificar que no exista una alerta similar reciente (últimas 24h)
            const existe = await this.existeAlertaReciente(empresaId, tipo, alerta.datos);
            if (!existe) {
              const nueva = await this.crearAlerta(empresaId, tipo, alerta);
              alertasGeneradas.push(nueva);
            }
          }
        }
      } catch (error) {
        console.error(`Error evaluando regla ${tipo}:`, error);
      }
    }
    
    return alertasGeneradas;
  }

  /**
   * Regla: Cash bajo
   */
  async evaluarCashBajo(empresaId) {
    // Obtener configuración de umbral (default: $50,000)
    const config = await this.obtenerConfiguracion(empresaId);
    const umbral = config.alerta_cash_bajo || 50000;
    
    // Obtener cash actual
    const result = await query(
      `SELECT COALESCE(SUM(saldo_actual), 0) as cash_total
       FROM cuentas_bancarias
       WHERE empresa_id = $1 AND estado = 'connected'`,
      [empresaId]
    );
    
    const cashTotal = parseFloat(result.rows[0].cash_total);
    
    if (cashTotal < umbral) {
      return [{
        severidad: cashTotal < umbral * 0.5 ? 'critical' : 'warning',
        titulo: '💸 Cash bajo',
        mensaje: `Tu saldo actual es de $${cashTotal.toLocaleString('es-AR')}. Está por debajo del umbral de $${umbral.toLocaleString('es-AR')}.`,
        datos: { cash_actual: cashTotal, umbral }
      }];
    }
    
    return [];
  }

  /**
   * Regla: Gasto inusual en una categoría
   */
  async evaluarGastoInusual(empresaId) {
    const alertas = [];
    
    // Comparar gastos del mes actual vs promedio de 3 meses anteriores
    const result = await query(
      `WITH gastos_por_categoria AS (
        SELECT 
          categoria_id,
          SUM(CASE WHEN fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE) THEN monto ELSE 0 END) as gasto_mes_actual,
          AVG(CASE WHEN fecha_transaccion < DATE_TRUNC('month', CURRENT_DATE) 
                   AND fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months' 
               THEN monto ELSE 0 END) as promedio_3_meses
        FROM movimientos
        WHERE empresa_id = $1 AND tipo = 'egreso' AND categoria_id IS NOT NULL
        GROUP BY categoria_id
      )
      SELECT g.*, c.nombre as categoria_nombre
      FROM gastos_por_categoria g
      JOIN categorias c ON c.id = g.categoria_id
      WHERE g.gasto_mes_actual > g.promedio_3_meses * 1.5
        AND g.promedio_3_meses > 0`,
      [empresaId]
    );
    
    for (const row of result.rows) {
      const porcentajeAumento = ((row.gasto_mes_actual / row.promedio_3_meses - 1) * 100).toFixed(0);
      alertas.push({
        severidad: 'warning',
        titulo: `📈 Gasto inusual en ${row.categoria_nombre}`,
        mensaje: `El gasto en "${row.categoria_nombre}" este mes es ${porcentajeAumento}% mayor al promedio.`,
        datos: { 
          categoria_id: row.categoria_id,
          gasto_actual: parseFloat(row.gasto_mes_actual),
          promedio: parseFloat(row.promedio_3_meses)
        }
      });
    }
    
    return alertas;
  }

  /**
   * Regla: Sin actividad
   */
  async evaluarSinActividad(empresaId) {
    const diasLimite = 7;
    
    const result = await query(
      `SELECT MAX(fecha_transaccion) as ultimo_movimiento
       FROM movimientos
       WHERE empresa_id = $1`,
      [empresaId]
    );
    
    const ultimoMovimiento = result.rows[0].ultimo_movimiento;
    
    if (!ultimoMovimiento) {
      return []; // No hay movimientos aún
    }
    
    const diasSinActividad = Math.floor(
      (Date.now() - new Date(ultimoMovimiento).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diasSinActividad >= diasLimite) {
      return [{
        severidad: 'info',
        titulo: '🔄 Sin actividad reciente',
        mensaje: `No hay movimientos registrados en los últimos ${diasSinActividad} días.`,
        datos: { dias_sin_actividad: diasSinActividad, ultimo_movimiento: ultimoMovimiento }
      }];
    }
    
    return [];
  }

  /**
   * Regla: Vencimientos próximos (simplificado)
   */
  async evaluarVencimientos(empresaId) {
    // Por ahora, alertar sobre vencimientos típicos argentinos
    const hoy = new Date();
    const alertas = [];
    
    // Monotributo vence el 20 de cada mes
    const diaDelMes = hoy.getDate();
    if (diaDelMes >= 17 && diaDelMes <= 20) {
      alertas.push({
        severidad: 'warning',
        titulo: '📅 Vencimiento próximo: Monotributo',
        mensaje: `El Monotributo vence el día 20. ¡No te olvides de pagarlo!`,
        datos: { tipo_vencimiento: 'monotributo', dia_vencimiento: 20 }
      });
    }
    
    return alertas;
  }

  /**
   * Verifica si existe una alerta similar reciente
   */
  async existeAlertaReciente(empresaId, tipo, datos) {
    const result = await query(
      `SELECT id FROM alertas
       WHERE empresa_id = $1 
         AND tipo = $2
         AND created_at > NOW() - INTERVAL '24 hours'
       LIMIT 1`,
      [empresaId, tipo]
    );
    
    return result.rows.length > 0;
  }

  /**
   * Crea una nueva alerta
   */
  async crearAlerta(empresaId, tipo, alerta) {
    const result = await query(
      `INSERT INTO alertas (empresa_id, tipo, severidad, titulo, mensaje, datos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [empresaId, tipo, alerta.severidad, alerta.titulo, alerta.mensaje, JSON.stringify(alerta.datos)]
    );
    
    return result.rows[0];
  }

  /**
   * Obtiene configuración de alertas de la empresa
   */
  async obtenerConfiguracion(empresaId) {
    const result = await query(
      `SELECT configuracion FROM empresas WHERE id = $1`,
      [empresaId]
    );
    
    return result.rows[0]?.configuracion || {};
  }

  /**
   * Lista alertas de una empresa
   */
  async listarAlertas(empresaId, { soloNoLeidas = false, limite = 50 } = {}) {
    let whereClause = 'WHERE empresa_id = $1 AND descartada = FALSE';
    if (soloNoLeidas) {
      whereClause += ' AND leida = FALSE';
    }
    
    const result = await query(
      `SELECT * FROM alertas
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2`,
      [empresaId, limite]
    );
    
    return result.rows;
  }

  /**
   * Marca una alerta como leída
   */
  async marcarLeida(alertaId, empresaId) {
    await query(
      `UPDATE alertas SET leida = TRUE, fecha_leida = NOW()
       WHERE id = $1 AND empresa_id = $2`,
      [alertaId, empresaId]
    );
  }

  /**
   * Descarta una alerta
   */
  async descartar(alertaId, empresaId) {
    await query(
      `UPDATE alertas SET descartada = TRUE
       WHERE id = $1 AND empresa_id = $2`,
      [alertaId, empresaId]
    );
  }

  /**
   * Cuenta alertas no leídas
   */
  async contarNoLeidas(empresaId) {
    const result = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE severidad = 'critical') as criticas,
         COUNT(*) FILTER (WHERE severidad = 'warning') as warnings,
         COUNT(*) FILTER (WHERE severidad = 'info') as info,
         COUNT(*) as total
       FROM alertas
       WHERE empresa_id = $1 AND leida = FALSE AND descartada = FALSE`,
      [empresaId]
    );
    
    return result.rows[0];
  }
}

module.exports = new AlertasService();
