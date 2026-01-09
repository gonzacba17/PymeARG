const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const proyeccionesService = require('../services/proyeccionesService');

/**
 * GET /api/v1/proyecciones
 * Obtiene proyecciones de cash flow
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const dias = Math.min(parseInt(req.query.dias) || 30, 90);
  const escenario = req.query.escenario || 'realista';
  
  // Verificar si hay proyecciones guardadas recientes (últimas 24h)
  const guardadas = await proyeccionesService.obtenerProyeccionesGuardadas(empresaId, escenario);
  
  if (guardadas.length > 0) {
    // Verificar si son recientes
    const primeraFecha = new Date(guardadas[0].created_at);
    const horasDesdeCreacion = (Date.now() - primeraFecha.getTime()) / (1000 * 60 * 60);
    
    if (horasDesdeCreacion < 24) {
      return res.json({
        success: true,
        data: {
          escenario,
          proyecciones: guardadas,
          desde_cache: true
        }
      });
    }
  }
  
  // Generar nuevas proyecciones
  const proyecciones = await proyeccionesService.generarProyecciones(empresaId, dias);
  
  // Guardar en DB
  await proyeccionesService.guardarProyecciones(empresaId, proyecciones);
  
  res.json({
    success: true,
    data: {
      escenario,
      proyecciones: proyecciones.proyecciones[escenario],
      metadata: proyecciones.metadata,
      desde_cache: false
    }
  });
}));

/**
 * POST /api/v1/proyecciones/generar
 * Fuerza regeneración de proyecciones
 */
router.post('/generar', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const dias = Math.min(parseInt(req.body.dias) || 30, 90);
  
  const proyecciones = await proyeccionesService.generarProyecciones(empresaId, dias);
  await proyeccionesService.guardarProyecciones(empresaId, proyecciones);
  
  res.json({
    success: true,
    data: {
      proyecciones: proyecciones.proyecciones,
      metadata: proyecciones.metadata
    }
  });
}));

/**
 * GET /api/v1/proyecciones/resumen
 * Resumen rápido de proyección a 30 días
 */
router.get('/resumen', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  
  let resumen = await proyeccionesService.obtenerResumen30Dias(empresaId);
  
  // Si no hay proyecciones, generar
  if (!resumen) {
    const proyecciones = await proyeccionesService.generarProyecciones(empresaId, 30);
    await proyeccionesService.guardarProyecciones(empresaId, proyecciones);
    resumen = await proyeccionesService.obtenerResumen30Dias(empresaId);
  }
  
  res.json({
    success: true,
    data: resumen
  });
}));

/**
 * GET /api/v1/proyecciones/escenarios
 * Obtiene los 3 escenarios comparados
 */
router.get('/escenarios', authenticate, asyncHandler(async (req, res) => {
  const empresaId = req.user.empresa_id;
  const dias = Math.min(parseInt(req.query.dias) || 30, 90);
  
  const proyecciones = await proyeccionesService.generarProyecciones(empresaId, dias);
  
  // Resumir para gráfico: solo algunos puntos clave
  const puntosResumen = [1, 7, 14, 21, 30].filter(d => d <= dias);
  
  const resumen = {
    optimista: [],
    realista: [],
    pesimista: []
  };
  
  for (const escenario of Object.keys(resumen)) {
    for (const punto of puntosResumen) {
      const p = proyecciones.proyecciones[escenario].find(pr => pr.dia_numero === punto);
      if (p) {
        resumen[escenario].push({
          dia: punto,
          fecha: p.fecha,
          cash: p.cash_proyectado
        });
      }
    }
  }
  
  res.json({
    success: true,
    data: {
      cash_actual: proyecciones.cash_actual,
      escenarios: resumen,
      metadata: proyecciones.metadata
    }
  });
}));

module.exports = router;
