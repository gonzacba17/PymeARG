# Pulso API - Documentación

API REST para el Panel Inteligente de Control Financiero para PyMEs Argentinas.

## Base URL

```
http://localhost:3000/api/v1
```

## Autenticación

Todas las rutas (excepto `/auth/register` y `/auth/login`) requieren token JWT en header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### 🔐 Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar empresa + usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Obtener usuario actual |

#### POST /auth/register

```json
{
  "empresa": {
    "nombre": "Mi Empresa",
    "cuit": "20123456789"
  },
  "usuario": {
    "email": "admin@empresa.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "password": "Password123!"
  }
}
```

---

### 📊 Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard` | Resumen ejecutivo |

---

### 💳 Cuentas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cuentas` | Listar cuentas |
| GET | `/cuentas/:id` | Obtener cuenta |
| POST | `/cuentas` | Crear cuenta manual |
| PUT | `/cuentas/:id` | Actualizar cuenta |
| DELETE | `/cuentas/:id` | Eliminar cuenta manual |
| POST | `/cuentas/:id/actualizar-saldo` | Actualizar saldo |

---

### 💰 Movimientos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/movimientos` | Listar con filtros |
| GET | `/movimientos/:id` | Obtener movimiento |
| POST | `/movimientos` | Crear movimiento manual |
| PUT | `/movimientos/:id` | Actualizar (categoría) |
| DELETE | `/movimientos/:id` | Eliminar (solo manuales) |
| GET | `/movimientos/stats/resumen` | Estadísticas |

#### Filtros disponibles (GET /movimientos)

```
?tipo=ingreso|egreso
&categoria_id=uuid
&cuenta_id=uuid
&desde=2026-01-01
&hasta=2026-01-31
&clasificacion=pendiente|ia|manual
&page=1
&limit=50
```

---

### 🏷️ Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/categorias` | Listar categorías |
| POST | `/categorias` | Crear categoría custom |

---

### 🤖 IA (Clasificación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ia/clasificar` | Clasificar movimiento |
| POST | `/ia/clasificar/batch` | Clasificar múltiples |
| POST | `/ia/feedback` | Corregir clasificación |
| GET | `/ia/metricas` | Accuracy stats |
| GET | `/ia/pendientes` | Movimientos sin clasificar |
| GET | `/ia/status` | Estado del servicio |

---

### 🔔 Alertas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/alertas` | Listar alertas |
| GET | `/alertas/count` | Contar no leídas |
| POST | `/alertas/evaluar` | Evaluar reglas |
| PUT | `/alertas/:id/leer` | Marcar leída |
| PUT | `/alertas/:id/descartar` | Descartar |
| POST | `/alertas/leer-todas` | Marcar todas leídas |

---

### 📈 Proyecciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/proyecciones` | Obtener proyección |
| POST | `/proyecciones/generar` | Regenerar |
| GET | `/proyecciones/resumen` | Resumen 30 días |
| GET | `/proyecciones/escenarios` | Comparar escenarios |

---

### 🚀 Onboarding

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/onboarding/status` | Estado actual |
| POST | `/onboarding/completar-paso` | Completar paso |
| POST | `/onboarding/completar` | Finalizar onboarding |
| POST | `/onboarding/skip` | Saltar onboarding |

---

## Respuestas

### Éxito

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": "Mensaje de error"
}
```

---

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request |
| 401 | No autorizado |
| 404 | No encontrado |
| 429 | Rate limit |
| 500 | Error interno |
