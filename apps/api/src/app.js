require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Sentry = require('@sentry/node');

// Middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth');
const cuentasRoutes = require('./routes/cuentas');
const movimientosRoutes = require('./routes/movimientos');
const categoriasRoutes = require('./routes/categorias');
const dashboardRoutes = require('./routes/dashboard');
const alertasRoutes = require('./routes/alertas');
const proyeccionesRoutes = require('./routes/proyecciones');
const iaRoutes = require('./routes/ia');
const chatRoutes = require('./routes/chat');
const integracionesRoutes = require('./routes/integraciones');
const onboardingRoutes = require('./routes/onboarding');


const app = express();
const PORT = process.env.PORT || 3000;

// Sentry initialization (optional)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Security & logging
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cuentas', cuentasRoutes);
app.use('/api/v1/movimientos', movimientosRoutes);
app.use('/api/v1/categorias', categoriasRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/alertas', alertasRoutes);
app.use('/api/v1/proyecciones', proyeccionesRoutes);
app.use('/api/v1/ia', iaRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/integraciones', integracionesRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Pulso API corriendo en http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
});

module.exports = app;
