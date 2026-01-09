# 🚀 Guía de Deployment - PULSO

## ⚠️ Importante: Limitaciones de Vercel

Vercel está **optimizado para frontends** y serverless functions. Tu backend PULSO requiere:
- ✅ PostgreSQL persistente
- ✅ Procesos de larga duración
- ✅ Webhooks confiables
- ✅ Cron jobs para alertas

**Recomendación Fuerte:** Usa **Railway.app** o **Render.com** para el backend.

---

## Opción 1: Vercel (Solo Frontend) + Railway (Backend) ⭐ RECOMENDADO

### Backend en Railway (Gratis hasta $5/mes)

1. **Crear cuenta en [Railway.app](https://railway.app)**

2. **Nuevo proyecto desde GitHub:**
   ```
   - Connect GitHub repository
   - Seleccionar: gonzacba17/PymeARG
   - Detectará automáticamente Node.js
   ```

3. **Agregar PostgreSQL:**
   ```
   - New → Database → PostgreSQL
   - Railway creará automáticamente DATABASE_URL
   ```

4. **Configurar Variables de Entorno:**
   En Railway Dashboard → Variables:
   ```
   NODE_ENV=production
   PORT=3000
   OPENAI_API_KEY=sk-proj-xxx
   MP_CLIENT_ID=xxx
   MP_CLIENT_SECRET=xxx
   MP_REDIRECT_URI=https://tu-backend.railway.app/api/v1/mercadopago/callback
   JWT_SECRET=xxx
   ENCRYPTION_KEY=xxx
   ```

5. **Configurar Build:**
   Railway autodetecta `package.json`, pero asegúrate:
   ```json
   Workspace: apps/api
   Build Command: npm install
   Start Command: npm start
   ```

6. **Deploy:**
   ```
   - Commit y push a GitHub
   - Railway auto-deploya
   - Tu API estará en: https://tu-proyecto.railway.app
   ```

### Frontend en Vercel

1. **Importar repo en Vercel:**
   ```
   - New Project → Import gonzacba17/PymeARG
   - Framework Preset: Vite
   - Root Directory: apps/web
   ```

2. **Variables de entorno:**
   ```
   VITE_API_URL=https://tu-proyecto.railway.app/api/v1
   ```

3. **Deploy automático** en cada push a `main`

---

## Opción 2: Todo en Railway (Más Simple)

1. **Crear proyecto en Railway**
2. **Conectar GitHub**
3. **Agregar PostgreSQL**
4. **Configurar variables de entorno** (ver arriba)
5. **Railway sirve tanto API como frontend**

**Ventaja:** Una sola plataforma, más fácil  
**URL:** `https://tu-proyecto.railway.app`

---

## Opción 3: Vercel (Si insistes) con DB Externa

### Paso 1: Base de Datos PostgreSQL

Necesitas PostgreSQL alojado en la nube. Opciones gratuitas:

**A) Neon.tech** (Recomendado - Serverless PostgreSQL)
```
1. Crear cuenta en https://neon.tech
2. Crear proyecto → PostgreSQL
3. Copiar DATABASE_URL
4. Pegar en Vercel Environment Variables
```

**B) Supabase**
```
1. Cuenta en https://supabase.com
2. New Project → PostgreSQL
3. Settings → Database → Connection String
4. Copiar y usar en Vercel
```

**C) ElephantSQL** (Gratis 20MB)
```
1. https://elephantsql.com
2. Create New Instance (Tiny Turtle - Free)
3. Copiar URL
```

### Paso 2: Configurar Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy desde la raíz del proyecto:**
   ```bash
   cd c:\wamp64\www\pymes
   vercel
   ```

4. **Configurar en el dashboard:**
   - Build Command: `npm run build`
   - Output Directory: `apps/web/dist` (para frontend)
   - Install Command: `npm install`

5. **Environment Variables** (en Vercel Dashboard):
   ```
   DATABASE_URL=postgresql://... (de Neon/Supabase)
   OPENAI_API_KEY=sk-proj-xxx
   MP_CLIENT_ID=xxx
   MP_CLIENT_SECRET=xxx
   MP_REDIRECT_URI=https://tu-proyecto.vercel.app/api/v1/mercadopago/callback
   JWT_SECRET=xxx
   ENCRYPTION_KEY=xxx
   ```

### Paso 3: Migrar Base de Datos

Después del deploy, ejecuta desde tu máquina local:

```bash
# Conectar a la BD de producción
psql "postgresql://usuario:password@host:5432/db"

# O ejecutar scripts SQL
psql $DATABASE_URL < database/init.sql
psql $DATABASE_URL < database/schema.sql
psql $DATABASE_URL < database/seed_categorias.sql
```

---

## 🔴 Limitaciones de Vercel para PULSO

1. **Serverless timeout:** 10-30 segundos máximo por request
   - Sincronización de MP puede tardar más → **Problema**

2. **No hay cron jobs nativos:**
   - Alertas no se evaluarán automáticamente
   - Solución: Usar Vercel Cron (Beta) o servicio externo como cron-job.org

3. **Funciones sin estado:**
   - No puedes tener procesos background persistentes
   - Redis (ioredis) necesita conexión externa (Upstash)

4. **Cold starts:**
   - Primera request tarda 2-5 segundos

---

## ✅ Mi Recomendación Final

### Para Producción:

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://pulso.vercel.app           │
│  - React + Vite                     │
│  - Deploy automático                │
└────────────┬────────────────────────┘
             │
             │ API Calls
             ▼
┌─────────────────────────────────────┐
│  Backend (Railway)                  │
│  https://pulso-api.railway.app      │
│  - Express + Node.js                │
│  - PostgreSQL incluida              │
│  - Webhooks estables                │
│  - $5/mes (gratis con $5 crédito)   │
└─────────────────────────────────────┘
```

**Railway es mejor para PULSO porque:**
- ✅ PostgreSQL integrada (gratis)
- ✅ Sin límites de timeout
- ✅ Procesos persistentes
- ✅ Webhooks confiables
- ✅ Cron jobs nativos
- ✅ Logs en tiempo real
- ✅ $5 gratis cada mes

---

## 📋 Checklist Pre-Deploy

- [ ] Variables `.env` configuradas
- [ ] Base de datos migrada
- [ ] Seed de categorías ejecutado
- [ ] Credenciales de Mercado Pago configuradas
- [ ] API Key de OpenAI válida
- [ ] Webhook URL actualizada en MP Developers
- [ ] CORS configurado con dominio de frontend
- [ ] Dominio custom (opcional)

---

## 🆘 Si algo falla

**Logs en Vercel:**
```bash
vercel logs
```

**Logs en Railway:**
Dashboard → Deployments → View Logs

**Testing local del build:**
```bash
npm run build
PORT=3000 npm start
```

---

¿Prefieres Railway (recomendado) o insistes con Vercel puro?
