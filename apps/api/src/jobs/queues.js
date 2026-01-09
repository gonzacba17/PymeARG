const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

/**
 * Configuración de conexión a Redis
 */
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

/**
 * Colas disponibles
 */
const QUEUE_NAMES = {
  CLASIFICACION: 'clasificacion',
  ALERTAS: 'alertas',
  PROYECCIONES: 'proyecciones',
  SYNC: 'sync-mercadopago',
};

/**
 * Opciones por defecto para jobs
 */
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: 100,
  removeOnFail: 50,
};

/**
 * Crear cola
 */
function createQueue(name) {
  return new Queue(name, {
    connection,
    defaultJobOptions,
  });
}

/**
 * Colas instanciadas
 */
const queues = {
  clasificacion: createQueue(QUEUE_NAMES.CLASIFICACION),
  alertas: createQueue(QUEUE_NAMES.ALERTAS),
  proyecciones: createQueue(QUEUE_NAMES.PROYECCIONES),
  sync: createQueue(QUEUE_NAMES.SYNC),
};

/**
 * Agregar job de clasificación batch
 */
async function addClasificacionJob(empresaId, options = {}) {
  return queues.clasificacion.add(
    'clasificar-pendientes',
    { empresaId },
    {
      ...defaultJobOptions,
      ...options,
    }
  );
}

/**
 * Agregar job de evaluación de alertas
 */
async function addAlertasJob(empresaId, options = {}) {
  return queues.alertas.add(
    'evaluar-alertas',
    { empresaId },
    {
      ...defaultJobOptions,
      ...options,
    }
  );
}

/**
 * Agregar job de generación de proyecciones
 */
async function addProyeccionesJob(empresaId, options = {}) {
  return queues.proyecciones.add(
    'generar-proyecciones',
    { empresaId, dias: 30 },
    {
      ...defaultJobOptions,
      ...options,
    }
  );
}

/**
 * Agregar job de sincronización de Mercado Pago
 */
async function addSyncJob(empresaId, cuentaId, options = {}) {
  return queues.sync.add(
    'sync-transacciones',
    { empresaId, cuentaId },
    {
      ...defaultJobOptions,
      priority: 1, // Alta prioridad
      ...options,
    }
  );
}

/**
 * Programar jobs recurrentes (cron)
 */
async function setupRecurringJobs() {
  // Clasificación: cada hora
  await queues.clasificacion.add(
    'clasificacion-cron',
    { tipo: 'todas-las-empresas' },
    {
      repeat: {
        pattern: '0 * * * *', // Cada hora en punto
      },
    }
  );

  // Alertas: cada 6 horas
  await queues.alertas.add(
    'alertas-cron',
    { tipo: 'todas-las-empresas' },
    {
      repeat: {
        pattern: '0 */6 * * *', // Cada 6 horas
      },
    }
  );

  // Proyecciones: diario a las 3am
  await queues.proyecciones.add(
    'proyecciones-cron',
    { tipo: 'todas-las-empresas' },
    {
      repeat: {
        pattern: '0 3 * * *', // Todos los días a las 3am
      },
    }
  );

  console.log('📅 Jobs recurrentes configurados');
}

/**
 * Cerrar conexiones
 */
async function closeQueues() {
  await Promise.all(Object.values(queues).map(q => q.close()));
  await connection.quit();
}

module.exports = {
  queues,
  connection,
  QUEUE_NAMES,
  addClasificacionJob,
  addAlertasJob,
  addProyeccionesJob,
  addSyncJob,
  setupRecurringJobs,
  closeQueues,
};
