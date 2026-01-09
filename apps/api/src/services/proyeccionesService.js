const { query } = require('../db/conexion');

/**
 * Servicio de proyecciones de cash flow
 */
class ProyeccionesService {
  constructor() {
    this.algoritmoVersion = '1.0.0';
  }

  /**
   * Genera proyecciones de cash flow para los próximos N días
   */
  async generarProyecciones(empresaId, diasFuturos = 30) {
    // 1. Obtener cash actual
    const cashActual = await this.obtenerCashActual(empresaId);
    
    // 2. Obtener histórico de movimientos (últimos 90 días)
    const historico = await this.obtenerHistorico(empresaId, 90);
    
    // 3. Detectar patrones recurrentes
    const patronesFijos = this.detectarPatrones(historico);
    
    // 4. Calcular promedios
    const promedios = this.calcularPromedios(historico);
    
    // 5. Generar proyección día a día
    const proyecciones = [];
    let cashProyectado = cashActual;
    const hoy = new Date();
    
    for (let dia = 1; dia <= diasFuturos; dia++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + dia);
      
      // Factor estacional (simplificado)
      const factorEstacional = this.getFactorEstacional(fecha.getMonth());
      
      // Aplicar patrones fijos del día
      const patronDelDia = this.getPatronDelDia(patronesFijos, fecha.getDate());
      
      // Calcular ingreso/egreso estimado del día
      const ingresoEstimado = (promedios.ingresoDiario * factorEstacional) + (patronDelDia.ingresos || 0);
      const egresoEstimado = (promedios.egresoDiario * factorEstacional) + (patronDelDia.egresos || 0);
      
      cashProyectado = cashProyectado + ingresoEstimado - egresoEstimado;
      
      // Confianza decrece con el tiempo
      const confianza = Math.max(0.5, 1 - (dia * 0.015));
      
      proyecciones.push({
        fecha: fecha.toISOString().split('T')[0],
        dia_numero: dia,
        cash_proyectado: Math.round(cashProyectado * 100) / 100,
        ingresos_proyectados: Math.round(ingresoEstimado * 100) / 100,
        egresos_proyectados: Math.round(egresoEstimado * 100) / 100,
        confianza: Math.round(confianza * 100) / 100,
      });
    }
    
    // Generar los 3 escenarios
    const escenarios = this.generarEscenarios(proyecciones);
    
    return {
      cash_actual: cashActual,
      proyecciones: escenarios,
      metadata: {
        dias_historico: historico.length,
        patrones_detectados: Object.keys(patronesFijos).length,
        algoritmo_version: this.algoritmoVersion,
        generado_en: new Date().toISOString()
      }
    };
  }

  /**
   * Obtiene el cash actual de las cuentas conectadas
   */
  async obtenerCashActual(empresaId) {
    const result = await query(
      `SELECT COALESCE(SUM(saldo_actual), 0) as total
       FROM cuentas_bancarias
       WHERE empresa_id = $1 AND estado = 'connected'`,
      [empresaId]
    );
    return parseFloat(result.rows[0].total);
  }

  /**
   * Obtiene histórico de movimientos
   */
  async obtenerHistorico(empresaId, dias) {
    const result = await query(
      `SELECT 
         fecha_transaccion::date as fecha,
         tipo,
         monto,
         EXTRACT(DAY FROM fecha_transaccion) as dia_del_mes
       FROM movimientos
       WHERE empresa_id = $1
         AND fecha_transaccion >= CURRENT_DATE - INTERVAL '${dias} days'
       ORDER BY fecha_transaccion`,
      [empresaId]
    );
    return result.rows;
  }

  /**
   * Detecta patrones recurrentes (pagos fijos en ciertos días)
   */
  detectarPatrones(historico) {
    const patronesPorDia = {};
    
    // Agrupar movimientos por día del mes
    for (const mov of historico) {
      const dia = parseInt(mov.dia_del_mes);
      if (!patronesPorDia[dia]) {
        patronesPorDia[dia] = { ingresos: [], egresos: [] };
      }
      
      const monto = parseFloat(mov.monto);
      if (mov.tipo === 'ingreso') {
        patronesPorDia[dia].ingresos.push(monto);
      } else {
        patronesPorDia[dia].egresos.push(monto);
      }
    }
    
    // Detectar montos que se repiten (posibles pagos fijos)
    const patrones = {};
    for (const [dia, datos] of Object.entries(patronesPorDia)) {
      const ingresosRepetidos = this.detectarRepetidos(datos.ingresos);
      const egresosRepetidos = this.detectarRepetidos(datos.egresos);
      
      if (ingresosRepetidos > 0 || egresosRepetidos > 0) {
        patrones[dia] = {
          ingresos: ingresosRepetidos,
          egresos: egresosRepetidos
        };
      }
    }
    
    return patrones;
  }

  /**
   * Detecta montos que se repiten (con tolerancia del 5%)
   */
  detectarRepetidos(montos) {
    if (montos.length < 2) return 0;
    
    // Ordenar y buscar montos similares
    const sorted = [...montos].sort((a, b) => a - b);
    const grupos = [];
    
    for (const monto of sorted) {
      let agregado = false;
      for (const grupo of grupos) {
        const promedio = grupo.reduce((a, b) => a + b, 0) / grupo.length;
        if (Math.abs(monto - promedio) / promedio < 0.05) {
          grupo.push(monto);
          agregado = true;
          break;
        }
      }
      if (!agregado) {
        grupos.push([monto]);
      }
    }
    
    // Retornar el promedio del grupo más repetido
    const grupoMasGrande = grupos.reduce((a, b) => a.length > b.length ? a : b, []);
    if (grupoMasGrande.length >= 2) {
      return grupoMasGrande.reduce((a, b) => a + b, 0) / grupoMasGrande.length;
    }
    
    return 0;
  }

  /**
   * Calcula promedios diarios
   */
  calcularPromedios(historico) {
    let totalIngresos = 0;
    let totalEgresos = 0;
    const dias = new Set();
    
    for (const mov of historico) {
      dias.add(mov.fecha);
      const monto = parseFloat(mov.monto);
      if (mov.tipo === 'ingreso') {
        totalIngresos += monto;
      } else {
        totalEgresos += monto;
      }
    }
    
    const cantidadDias = Math.max(dias.size, 1);
    
    return {
      ingresoDiario: totalIngresos / cantidadDias,
      egresoDiario: totalEgresos / cantidadDias,
      margenDiario: (totalIngresos - totalEgresos) / cantidadDias
    };
  }

  /**
   * Factor estacional por mes (Argentina)
   */
  getFactorEstacional(mes) {
    const factores = {
      0: 0.7,   // Enero (vacaciones)
      1: 0.85,  // Febrero
      2: 1.0,   // Marzo (vuelta a clases)
      3: 1.0,   // Abril
      4: 1.0,   // Mayo
      5: 0.95,  // Junio
      6: 0.9,   // Julio (vacaciones invierno)
      7: 0.95,  // Agosto
      8: 1.0,   // Septiembre
      9: 1.05,  // Octubre
      10: 1.1,  // Noviembre
      11: 1.3   // Diciembre (fiestas)
    };
    return factores[mes] || 1.0;
  }

  /**
   * Obtiene patrón del día específico
   */
  getPatronDelDia(patrones, diaDelMes) {
    return patrones[diaDelMes] || { ingresos: 0, egresos: 0 };
  }

  /**
   * Genera los 3 escenarios: optimista, realista, pesimista
   */
  generarEscenarios(proyeccionesBase) {
    return {
      optimista: proyeccionesBase.map(p => ({
        ...p,
        escenario: 'optimista',
        cash_proyectado: Math.round(p.cash_proyectado * 1.15 * 100) / 100
      })),
      realista: proyeccionesBase.map(p => ({
        ...p,
        escenario: 'realista'
      })),
      pesimista: proyeccionesBase.map(p => ({
        ...p,
        escenario: 'pesimista',
        cash_proyectado: Math.round(p.cash_proyectado * 0.85 * 100) / 100
      }))
    };
  }

  /**
   * Guarda proyecciones en la base de datos
   */
  async guardarProyecciones(empresaId, proyecciones) {
    // Eliminar proyecciones antiguas
    await query(
      `DELETE FROM proyecciones_cash WHERE empresa_id = $1`,
      [empresaId]
    );
    
    // Insertar nuevas proyecciones
    for (const escenario of ['optimista', 'realista', 'pesimista']) {
      for (const p of proyecciones.proyecciones[escenario]) {
        await query(
          `INSERT INTO proyecciones_cash 
           (empresa_id, fecha_proyeccion, cash_proyectado, ingresos_proyectados, 
            egresos_proyectados, escenario, confianza, algoritmo_version)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            empresaId,
            p.fecha,
            p.cash_proyectado,
            p.ingresos_proyectados,
            p.egresos_proyectados,
            escenario,
            p.confianza,
            this.algoritmoVersion
          ]
        );
      }
    }
  }

  /**
   * Obtiene proyecciones guardadas
   */
  async obtenerProyeccionesGuardadas(empresaId, escenario = 'realista') {
    const result = await query(
      `SELECT * FROM proyecciones_cash
       WHERE empresa_id = $1 AND escenario = $2
       ORDER BY fecha_proyeccion`,
      [empresaId, escenario]
    );
    return result.rows;
  }

  /**
   * Obtiene resumen de proyección a 30 días
   */
  async obtenerResumen30Dias(empresaId) {
    const proyeccion = await query(
      `SELECT cash_proyectado, confianza, escenario
       FROM proyecciones_cash
       WHERE empresa_id = $1 
         AND fecha_proyeccion >= CURRENT_DATE + INTERVAL '25 days'
         AND fecha_proyeccion <= CURRENT_DATE + INTERVAL '35 days'
       ORDER BY fecha_proyeccion
       LIMIT 3`,
      [empresaId]
    );
    
    if (proyeccion.rows.length === 0) {
      return null;
    }
    
    const cashActual = await this.obtenerCashActual(empresaId);
    const realista = proyeccion.rows.find(p => p.escenario === 'realista');
    
    return {
      cash_actual: cashActual,
      cash_proyectado_30d: realista ? parseFloat(realista.cash_proyectado) : null,
      tendencia: realista && parseFloat(realista.cash_proyectado) > cashActual ? 'subiendo' : 'bajando',
      confianza: realista ? parseFloat(realista.confianza) : null
    };
  }
}

module.exports = new ProyeccionesService();
