const { Worker } = require('bullmq');
const { connection, QUEUE_NAMES } = require('./queues');
const iaService = require('../services/iaService');
const { query } = require('../db/conexion');

/**
 * Worker para clasificación de movimientos con IA
 */
const clasificacionWorker = new Worker(
  QUEUE_NAMES.CLASIFICACION,
  async (job) => {
    console.log(`🤖 [Clasificación] Procesando job ${job.id}: ${job.name}`);
    
    const { empresaId, tipo } = job.data;
    
    try {
      let empresas;
      
      if (tipo === 'todas-las-empresas') {
        // Job cron: procesar todas las empresas activas
        const result = await query(
          `SELECT id FROM empresas WHERE estado = 'active'`
        );
        empresas = result.rows.map(r => r.id);
      } else {
        // Job individual
        empresas = [empresaId];
      }
      
      let totalClasificados = 0;
      
      for (const empId of empresas) {
        // Obtener movimientos pendientes
        const pendientes = await iaService.obtenerPendientes(empId, 20);
        
        if (pendientes.length === 0) {
          continue;
        }
        
        console.log(`   📊 Empresa ${empId}: ${pendientes.length} pendientes`);
        
        // Clasificar en batch
        const resultados = await iaService.clasificarBatch(pendientes, empId);
        
        // Actualizar movimientos
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
            totalClasificados++;
          }
        }
        
        // Reportar progreso
        await job.updateProgress({
          empresa: empId,
          clasificados: totalClasificados,
        });
      }
      
      console.log(`   ✅ Total clasificados: ${totalClasificados}`);
      
      return { 
        success: true, 
        empresas_procesadas: empresas.length,
        total_clasificados: totalClasificados 
      };
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000, // Max 10 jobs por minuto
    },
  }
);

clasificacionWorker.on('completed', (job, result) => {
  console.log(`✅ [Clasificación] Job ${job.id} completado:`, result);
});

clasificacionWorker.on('failed', (job, error) => {
  console.error(`❌ [Clasificación] Job ${job?.id} falló:`, error.message);
});

module.exports = clasificacionWorker;
