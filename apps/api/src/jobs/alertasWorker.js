const { Worker } = require('bullmq');
const { connection, QUEUE_NAMES } = require('./queues');
const alertasService = require('../services/alertasService');
const { query } = require('../db/conexion');

/**
 * Worker para evaluación de alertas
 */
const alertasWorker = new Worker(
  QUEUE_NAMES.ALERTAS,
  async (job) => {
    console.log(`🔔 [Alertas] Procesando job ${job.id}: ${job.name}`);
    
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
      
      let totalAlertas = 0;
      
      for (const empId of empresas) {
        console.log(`   🏢 Evaluando alertas para empresa ${empId}...`);
        
        const nuevasAlertas = await alertasService.evaluarTodasLasReglas(empId);
        totalAlertas += nuevasAlertas.length;
        
        if (nuevasAlertas.length > 0) {
          console.log(`   📢 ${nuevasAlertas.length} nuevas alertas creadas`);
        }
        
        // Reportar progreso
        await job.updateProgress({
          empresa: empId,
          alertas_creadas: nuevasAlertas.length,
        });
      }
      
      console.log(`   ✅ Total alertas generadas: ${totalAlertas}`);
      
      return { 
        success: true, 
        empresas_procesadas: empresas.length,
        total_alertas: totalAlertas 
      };
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 5,
  }
);

alertasWorker.on('completed', (job, result) => {
  console.log(`✅ [Alertas] Job ${job.id} completado:`, result);
});

alertasWorker.on('failed', (job, error) => {
  console.error(`❌ [Alertas] Job ${job?.id} falló:`, error.message);
});

module.exports = alertasWorker;
