# PULSO Landing Page

Landing page oficial de PULSO - Panel Inteligente de Control Financiero para PyMEs Argentinas.

## 🚀 Tecnologías

- **Framework:** Next.js 16 con App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Components:** Shadcn/UI + Radix UI
- **Icons:** Lucide React
- **Package Manager:** npm

## 📦 Instalación

```bash
# Desde la raíz del monorepo
cd apps/landing
npm install
```

## 🏃 Desarrollo

```bash
# Opción 1: Desde apps/landing
cd apps/landing
npm run dev

# Opción 2: Desde la raíz del monorepo
npm run dev:landing

# Opción 3: Correr TODOS los servicios (API + Web + Landing)
npm run dev:all
```

El servidor estará disponible en **http://localhost:3001** (configurado para evitar conflicto con API en puerto 3000).

## 🏗️ Build para Producción

```bash
# Desde apps/landing
npm run build

# Desde la raíz del monorepo
npm run build:landing
```

## 📄 Estructura de Componentes

```
components/
├── navbar.tsx              # Navegación principal con logo PULSO
├── hero.tsx                # Hero section con CTAs principales
├── pain-points.tsx         # Problemas que resuelve PULSO
├── solution.tsx            # Solución que ofrece la plataforma
├── how-it-works.tsx        # 3 pasos para empezar
├── mercado-pago-integration.tsx  # Integración destacada
├── testimonials.tsx        # Testimonios de usuarios
├── pricing.tsx             # Planes y precios
├── faq.tsx                 # Preguntas frecuentes
├── final-cta.tsx           # CTA final antes del footer
├── footer.tsx              # Footer con links y redes
└── dashboard-mockup.tsx    # Mockup visual del dashboard
```

## 🎨 Personalización

### Colores

Los colores se configuran en `app/globals.css` usando CSS variables:

- `--primary`: Azul PULSO (#0369A1)
- `--success`: Verde (#16A34A)
- `--background`: Fondo claro (#F9FAFB)
- `--foreground`: Texto oscuro (#111827)

### Contenido

Para modificar textos, edita directamente los componentes en `components/`. Los puntos clave son:

- **Hero**: `components/hero.tsx` - Headline y CTAs
- **Pricing**: `components/pricing.tsx` - Planes y precios
- **FAQ**: `components/faq.tsx` - Preguntas frecuentes

## 🔗 Integración con Backend

Los botones CTA actualmente no están conectados. Para integrar:

1. **"Empezar Gratis"** → Redirigir a `/registro` o al dashboard
2. **"Conectar Mercado Pago"** → OAuth flow de MP
3. **"Ingresar"** → Página de login (`/login`)

Ejemplo de modificación en `components/hero.tsx`:

```tsx
import Link from 'next/link'

<Link href="/registro">
  <Button size="lg">
    Empezar Gratis - 14 días
  </Button>
</Link>
```

## 📱 Responsive Design

La landing page está optimizada para:

- **Desktop**: 1920px+
- **Laptop**: 1024px - 1919px
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

Usa las clases de Tailwind (`sm:`, `md:`, `lg:`) para ajustes responsive.

## 🌐 URLs de Secciones

Navegación interna por IDs:

- `#funciones` → Sección de funcionalidades
- `#pricing` → Planes y precios
- `#contacto` → Footer con información de contacto

## 📝 SEO y Metadata

Edita metadata en `app/layout.tsx`:

```tsx
export const metadata = {
  title: 'PULSO - Control Financiero para PyMEs',
  description: 'Conectá Mercado Pago y dejá que la IA clasifique automáticamente',
}
```

## 🚀 Deploy

### Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd apps/landing
vercel
```

Configuración en Vercel dashboard:
- **Framework Preset**: Next.js
- **Root Directory**: `apps/landing`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Railway

Crear `railway.json` en `apps/landing`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 📊 Port Configuration

Por defecto Next.js usa el puerto **3000**. Para cambiarlo:

```json
// package.json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

O mediante variable de entorno:

```bash
PORT=3001 npm run dev
```

## 🔧 Troubleshooting

### Error: Port 3001 already in use

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Nota**: La landing usa puerto 3001 para evitar conflicto con la API (puerto 3000).

### Error: Module not found

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: TypeScript errors

```bash
# Regenerar tipos de Next.js
npm run dev
# Espera a que diga "✓ Ready"
# Luego Ctrl+C y vuelve a correr
```

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

## 📞 Soporte

Para issues relacionados con la landing page, consultar el `roadmap.md` en la raíz del monorepo.

---

**Última actualización:** 2026-01-12
