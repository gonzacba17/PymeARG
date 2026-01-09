const openaiClient = require('./openaiClient');
const { query } = require('../db/conexion');

/**
 * Servicio de clasificación de movimientos con IA
 */
class IAService {
  constructor() {
    this.promptVersion = '1.0.0';
  }

  /**
   * Genera el prompt del sistema con las categorías disponibles
   */
  async buildSystemPrompt(empresaId) {
    // Obtener categorías de la empresa (predefinidas + custom)
    const result = await query(
      `SELECT id, nombre, tipo, descripcion, keywords 
       FROM categorias 
       WHERE empresa_id IS NULL OR empresa_id = $1
       ORDER BY tipo, orden`,
      [empresaId]
    );

    const categorias = result.rows;
    
    const categoriasTexto = categorias.map(c => {
      const keywords = c.keywords ? c.keywords.join(', ') : '';
      return `- ${c.nombre} (${c.tipo}): ${c.descripcion || ''} [Keywords: ${keywords}]`;
    }).join('\n');

    return `Eres un contador experto en PyMEs argentinas. Tu tarea es clasificar transacciones financieras.

CONTEXTO:
- Las transacciones provienen de cuentas de PyMEs argentinas
- Pueden ser de Mercado Pago, bancos u otras fuentes
- Considera impuestos argentinos: Monotributo, IVA, IIBB, AFIP/ARCA

CATEGORÍAS DISPONIBLES:
${categoriasTexto}

REGLAS DE CLASIFICACIÓN:
1. Si ves "AFIP", "ARCA", "MONOTRIBUTO" → categoría de impuestos correspondiente
2. Si ves "TRANSFERENCIA DE [NOMBRE]" → probablemente cobro de cliente
3. Si ves "MERPAGO" o "MP *" → comisiones de Mercado Pago
4. Si el monto es fijo y la descripción sugiere periodicidad → alquiler o servicio
5. Si ves nombres de empresas de servicios (EDENOR, METROGAS, TELECENTRO) → servicios correspondientes
6. Si no estás seguro, usa "Otros ingresos" u "Otros egresos" según corresponda

FORMATO DE RESPUESTA (solo JSON válido):
{
  "categoria_id": "uuid de la categoría elegida",
  "confianza": 0.0 a 1.0,
  "razon": "breve explicación de por qué elegiste esta categoría"
}`;
  }

  /**
   * Clasifica un movimiento individual
   */
  async clasificarMovimiento(movimiento, empresaId) {
    if (!openaiClient.isConfigured()) {
      throw new Error('OpenAI API key no configurada');
    }

    const systemPrompt = await this.buildSystemPrompt(empresaId);
    
    const userMessage = `Clasificá esta transacción:
- Descripción: ${movimiento.descripcion || movimiento.descripcion_original}
- Monto: $${movimiento.monto}
- Tipo: ${movimiento.tipo}
- Fecha: ${movimiento.fecha_transaccion}`;

    try {
      const response = await openaiClient.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);

      const resultado = JSON.parse(response.content);
      
      // Validar que la categoría existe
      const categoriaValida = await this.validarCategoria(resultado.categoria_id, empresaId);
      
      if (!categoriaValida) {
        console.warn('IA retornó categoría inválida:', resultado.categoria_id);
        return null;
      }

      // Guardar clasificación en histórico
      await this.guardarClasificacion(movimiento.id, resultado, response.model);

      return {
        categoria_id: resultado.categoria_id,
        confianza: resultado.confianza,
        razon: resultado.razon,
        modelo: response.model,
        tokens_usados: response.usage?.total_tokens
      };
    } catch (error) {
      console.error('Error clasificando movimiento:', error);
      throw error;
    }
  }

  /**
   * Clasifica múltiples movimientos en batch
   */
  async clasificarBatch(movimientos, empresaId) {
    const resultados = [];
    
    for (const movimiento of movimientos) {
      try {
        const resultado = await this.clasificarMovimiento(movimiento, empresaId);
        resultados.push({
          movimiento_id: movimiento.id,
          ...resultado,
          error: null
        });
      } catch (error) {
        resultados.push({
          movimiento_id: movimiento.id,
          error: error.message
        });
      }
      
      // Pequeña pausa entre requests para no exceder rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return resultados;
  }

  /**
   * Valida que una categoría exista
   */
  async validarCategoria(categoriaId, empresaId) {
    const result = await query(
      `SELECT id FROM categorias 
       WHERE id = $1 AND (empresa_id IS NULL OR empresa_id = $2)`,
      [categoriaId, empresaId]
    );
    return result.rows.length > 0;
  }

  /**
   * Guarda la clasificación en el histórico
   */
  async guardarClasificacion(movimientoId, resultado, modelo) {
    await query(
      `INSERT INTO clasificaciones_ia 
       (movimiento_id, categoria_sugerida_id, confianza, modelo, prompt_version, respuesta_raw)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        movimientoId,
        resultado.categoria_id,
        resultado.confianza,
        modelo,
        this.promptVersion,
        JSON.stringify(resultado)
      ]
    );
  }

  /**
   * Registra feedback del usuario (corrección)
   */
  async registrarFeedback(movimientoId, categoriaCorregidaId, usuarioId) {
    // Buscar la última clasificación de este movimiento
    const clasificacion = await query(
      `SELECT id, categoria_sugerida_id FROM clasificaciones_ia 
       WHERE movimiento_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [movimientoId]
    );

    if (clasificacion.rows.length === 0) {
      return null;
    }

    const clasiId = clasificacion.rows[0].id;
    const fueAceptada = clasificacion.rows[0].categoria_sugerida_id === categoriaCorregidaId;

    // Actualizar clasificación con feedback
    await query(
      `UPDATE clasificaciones_ia 
       SET fue_aceptada = $1, categoria_corregida_id = $2, 
           corregido_por = $3, fecha_correccion = NOW()
       WHERE id = $4`,
      [fueAceptada, categoriaCorregidaId, usuarioId, clasiId]
    );

    // Actualizar el movimiento con la categoría correcta
    await query(
      `UPDATE movimientos 
       SET categoria_id = $1, clasificacion_origen = 'manual', updated_at = NOW()
       WHERE id = $2`,
      [categoriaCorregidaId, movimientoId]
    );

    return { actualizado: true, fue_aceptada: fueAceptada };
  }

  /**
   * Obtiene métricas de accuracy
   */
  async obtenerMetricas(empresaId) {
    const result = await query(
      `SELECT 
         COUNT(*) as total_clasificaciones,
         COUNT(*) FILTER (WHERE fue_aceptada = TRUE) as aceptadas,
         COUNT(*) FILTER (WHERE fue_aceptada = FALSE) as corregidas,
         COUNT(*) FILTER (WHERE fue_aceptada IS NULL) as sin_feedback,
         AVG(confianza) as confianza_promedio
       FROM clasificaciones_ia ci
       JOIN movimientos m ON m.id = ci.movimiento_id
       WHERE m.empresa_id = $1`,
      [empresaId]
    );

    const stats = result.rows[0];
    const total = parseInt(stats.total_clasificaciones) || 0;
    const aceptadas = parseInt(stats.aceptadas) || 0;
    const corregidas = parseInt(stats.corregidas) || 0;
    
    const conFeedback = aceptadas + corregidas;
    const accuracy = conFeedback > 0 ? (aceptadas / conFeedback * 100) : null;

    return {
      total_clasificaciones: total,
      aceptadas,
      corregidas,
      sin_feedback: parseInt(stats.sin_feedback) || 0,
      accuracy_porcentaje: accuracy ? accuracy.toFixed(2) : null,
      confianza_promedio: stats.confianza_promedio ? parseFloat(stats.confianza_promedio).toFixed(2) : null
    };
  }

  /**
   * Obtiene movimientos pendientes de clasificar
   */
  async obtenerPendientes(empresaId, limite = 50) {
    const result = await query(
      `SELECT id, descripcion, descripcion_original, monto, tipo, fecha_transaccion
       FROM movimientos
       WHERE empresa_id = $1 AND clasificacion_origen = 'pendiente'
       ORDER BY fecha_transaccion DESC
       LIMIT $2`,
      [empresaId, limite]
    );
    
    return result.rows;
  }
}

module.exports = new IAService();
