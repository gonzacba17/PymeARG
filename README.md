# Pulso - Panel Inteligente de Control Financiero para PyMEs

> Control financiero y operativo en tiempo real para que el dueño de PyME duerma tranquilo y tome decisiones antes de que sea tarde.

## 🚀 Stack Tecnológico

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis + BullMQ
- **Auth**: JWT + bcrypt
- **IA**: OpenAI GPT-4 Turbo

### Frontend

- **Framework**: React 18
- **Styling**: TailwindCSS + Shadcn/ui
- **Charts**: Chart.js
- **Build**: Vite

### DevOps

- **Backend Deploy**: Railway
- **Frontend Deploy**: Vercel
- **Monitoring**: Sentry
- **Analytics**: Plausible

## 📁 Estructura del Proyecto

```
pulso/
├── apps/
│   ├── api/                 # Backend Node.js
│   └── web/                 # Frontend React
├── database/
│   ├── schema.sql          # Schema PostgreSQL
│   └── migrations/         # Migraciones
├── docs/                   # Documentación
└── shared/                 # Código compartido
```

## 🏗️ Setup Local

### Prerequisitos

- Node.js 18+
- PostgreSQL 15+
- Redis
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone [repo-url]
cd pulso

# Instalar dependencias backend
cd apps/api
npm install

# Instalar dependencias frontend
cd ../web
npm install

# Setup database
cd ../../database
psql -U postgres -d pulso_db -f schema.sql

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Editar los .env con tus credenciales
```

### Desarrollo

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev

# Terminal 3 - Redis (si no está corriendo)
redis-server
```

Acceder a:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## 📚 Documentación

- [Arquitectura Técnica](docs/technical_architecture.md)
- [Especificación de API](docs/api_specification.md)
- [Guía de Base de Datos](docs/database_guide.md)
- [Diseño UI/UX](docs/ui_wireframes.md)

## 🔐 Seguridad

- Todas las credenciales se encriptan con AES-256-GCM
- Passwords hasheados con bcrypt (12 rounds)
- JWT con expiración de 7 días
- Rate limiting en todos los endpoints
- HTTPS obligatorio en producción

## 📊 Métricas Objetivo

- **Activación**: 80% conectan 1 cuenta
- **Engagement**: 3+ logins/semana
- **Retención**: Churn <5% mensual
- **IA Accuracy**: 75% clasificaciones correctas

## 🗺️ Roadmap

### Sprint 1-2 (Semanas 1-4): MVP Core

- ✅ Arquitectura completa
- [ ] Auth & usuarios
- [ ] Conexión Mercado Pago
- [ ] Dashboard financiero básico
- [ ] Clasificación manual

### Sprint 3-4 (Semanas 5-8): IA & Asistente

- [ ] Motor clasificación IA
- [ ] Sistema de alertas
- [ ] Proyección cash flow
- [ ] Chat asistente básico

### Sprint 5-6 (Semanas 9-12): Beta Privada

- [ ] Onboarding guiado
- [ ] Testing con 10 empresas
- [ ] Primer módulo adicional
- [ ] Polish & optimización

## 🤝 Contribución

Este es un proyecto privado. Si sos parte del equipo:

1. Crear branch desde `develop`
2. Hacer tus cambios
3. Tests deben pasar
4. PR con descripción detallada
5. Code review requerido

## 📝 Licencia

Propietario - Todos los derechos reservados

## 📧 Contacto

- Email: team@pulso.app
- Slack: #pulso-dev

---

**Hecho con ❤️ para PyMEs argentinas**
