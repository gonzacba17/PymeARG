# 🚀 Guía Rápida: Deploy Frontend a Vercel

## Opción 1: Deploy desde Vercel Dashboard (Recomendado para principiantes)

### Paso 1: Ir a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"** o **"Log In"** con GitHub

### Paso 2: Importar Proyecto
1. Click en **"Add New Project"**
2. Click en **"Import Git Repository"**
3. Buscar y seleccionar: `gonzacba17/PymeARG`
4. Click en **"Import"**

### Paso 3: Configurar el Proyecto

**Framework Preset:** `Vite`

**Root Directory:** 
```
📁 apps/web
```
☝️ MUY IMPORTANTE: Click en "Edit" y cambiar a `apps/web`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

### Paso 4: Variables de Entorno

Click en **"Environment Variables"** y agregar:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` (cambiar después) |

> **Nota:** Cuando tengas el backend deployado, cambia esto a la URL real del backend.

### Paso 5: Deploy
1. Click en **"Deploy"**
2. Esperar 2-3 minutos
3. ¡Listo! Tu frontend estará en: `https://tu-proyecto.vercel.app`

---

## Opción 2: Deploy desde CLI (Para desarrolladores)

### Paso 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### Paso 2: Login

```powershell
vercel login
```

### Paso 3: Deploy

Desde la raíz del proyecto:

```powershell
cd c:\wamp64\www\pymes\apps\web
vercel
```

Responder las preguntas:
```
? Set up and deploy "~\pymes\apps\web"? [Y/n] y
? Which scope? → Tu cuenta
? Link to existing project? [y/N] n
? What's your project's name? pulso-frontend
? In which directory is your code located? ./
? Override settings? [y/N] n
```

### Paso 4: Variables de Entorno

```powershell
vercel env add VITE_API_URL
```

Valor: `http://localhost:3000/api/v1`

### Paso 5: Deploy a Producción

```powershell
vercel --prod
```

---

## Configuración Archivo `vercel.json` (Fronend Solo)

Ya tienes `vercel.json` en la raíz, pero para **SOLO frontend**, crea este archivo en `apps/web/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Conectar con Backend

### Si backend está en Railway:

1. **Obtener URL del backend** de Railway (ej: `https://pulso-api.railway.app`)

2. **Actualizar variable de entorno** en Vercel Dashboard:
   ```
   VITE_API_URL=https://pulso-api.railway.app/api/v1
   ```

3. **Redeploy** (automático si cambias en dashboard, o manual con CLI):
   ```powershell
   vercel --prod
   ```

### Si backend está en localhost (desarrollo):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Configurar API Client en Frontend

Crea `apps/web/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Uso en componentes:

```javascript
import api from './services/api';

// En tu componente
const fetchMovimientos = async () => {
  const response = await api.get('/movimientos');
  return response.data;
};
```

---

## Configurar CORS en Backend

**IMPORTANTE:** El backend debe permitir requests desde tu dominio de Vercel.

En `apps/api/src/app.js`, actualizar:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev
    'https://tu-proyecto.vercel.app', // Vercel production
    'https://*.vercel.app' // Todos los previews de Vercel
  ],
  credentials: true
}));
```

---

## Dominios Custom (Opcional)

### En Vercel Dashboard:

1. **Settings** → **Domains**
2. Click **"Add"**
3. Escribir tu dominio: `pulso.app`
4. Seguir instrucciones para configurar DNS

**Tipos de DNS:**
- **A Record:** `76.76.21.21` (IPv4 de Vercel)
- **CNAME:** `cname.vercel-dns.com`

---

## Troubleshooting

### ❌ "Command not found: vite"

**Solución:** Vercel debe instalar dependencias en `apps/web`. Asegúrate de:
1. Root Directory está configurado a `apps/web`
2. Install Command es `npm install`

### ❌ "404 on refresh"

**Solución:** Las SPA necesitan rewrite rules. Asegúrate de tener en `vercel.json`:

```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

### ❌ CORS Error

**Solución:** Backend debe tener configurado CORS con el dominio de Vercel.

### ❌ API calls fallan

**Solución:** 
1. Verificar `VITE_API_URL` en Vercel Environment Variables
2. Usar `import.meta.env.VITE_API_URL` en código
3. Redeploy después de cambiar variables

---

## Checklist Pre-Deploy

- [ ] Frontend build funciona localmente (`npm run build`)
- [ ] Variables de entorno configuradas (`VITE_API_URL`)
- [ ] Root Directory apunta a `apps/web`
- [ ] Backend tiene CORS configurado
- [ ] API client usa `import.meta.env.VITE_API_URL`

---

## Auto-Deploy

Una vez configurado, Vercel auto-deploya en cada push a `main`:

```bash
git add .
git commit -m "feat: frontend improvements"
git push origin main
```

**Vercel detecta el push y auto-deploya** 🚀

---

## URLs del Proyecto

**Preview URLs:** Cada PR obtiene su propia URL  
**Production URL:** `https://tu-proyecto.vercel.app`  
**Custom Domain:** `https://pulso.app` (cuando lo configures)

---

## Siguiente Paso

Después de deployar frontend:
1. Deploy backend a Railway
2. Actualizar `VITE_API_URL` con URL de Railway
3. ¡Probar end-to-end!
