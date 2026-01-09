# 🚀 PULSO API - Endpoints Disponibles

Backend API completo para el dashboard financiero PULSO.

## 🔗 Base URL

```
Desarrollo: http://localhost:3000/api/v1
Producción: https://tu-backend.railway.app/api/v1
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/*`) requieren JWT token en el header:

```
Authorization: Bearer {token}
```

---

## 📊 Dashboard

### GET `/dashboard`

Resumen ejecutivo completo del dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "cash_total": 2847350,
    "mes_actual": {
      "ingresos": 1234500,
      "egresos": 876200,
      "margen": 358300,
      "margen_porcentaje": 29.02
    },
    "comparacion_mes_anterior": {
      "ingresos_variacion": 12.5,
      "egresos_variacion": -3.2
    },
    "proyeccion_30_dias": {
      "fecha": "2026-02-08",
      "cash_proyectado": 3100000,
      "confianza": 0.85,
      "tendencia": "subiendo"
    },
    "alertas_criticas": 2,
    "movimientos_pendientes": 5,
    "cuentas_conectadas": 1
  }
}
```

---

## 💸 Movimientos

### GET `/movimientos`

Listar movimientos con paginación y filtros.

**Query Params:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 20, max: 100)
- `tipo` (opcional): `ingreso` | `egreso`
- `categoria_id` (opcional): UUID de categoría
- `fecha_desde` (opcional): YYYY-MM-DD
- `fecha_hasta` (opcional): YYYY-MM-DD
- `search` (opcional): Buscar en descripción

**Response:**
```json
{
  "success": true,
  "data": {
    "movimientos": [
      {
        "id": "uuid",
        "descripcion": "Mercado Pago - Venta Online",
        "monto": 45000,
        "tipo": "ingreso",
        "fecha": "2026-01-09",
        "estado": "confirmado",
        "categoria": "Ventas",
        "clasificacion_confianza": 0.95
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    }
  }
}
```

### POST `/movimientos`

Crear movimiento manual.

**Body:**
```json
{
  "descripcion": "Pago AWS Services",
  "monto": -12500,
  "tipo": "egreso",
  "fecha": "2026-01-09",
  "categoria_id": "uuid-opcional",
  "cuenta_id": "uuid",
  "metadata": {}
}
```

### PATCH `/movimientos/:id`

Actualizar movimiento.

### DELETE `/movimientos/:id`

Eliminar movimiento.

---

## 🚨 Alertas

### GET `/alertas`

Listar alertas activas.

**Query Params:**
- `estado` (opcional): `activa` | `descartada` | `resuelta`
- `severidad` (opcional): `critical` | `warning` | `info`
- `leida` (opcional): `true` | `false`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipo": "cash_bajo",
      "titulo": "Saldo bajo proyectado",
      "mensaje": "Podrías quedarte sin fondos el viernes",
      "severidad": "critical",
      "leida": false,
      "metadata": {
        "dias_hasta_cero": 5,
        "saldo_proyectado": -50000
      },
      "created_at": "2026-01-09T10:30:00Z"
    }
  ],
  "total": 3
}
```

### POST `/alertas/:id/leer`

Marcar alerta como leída.

### POST `/alertas/:id/descartar`

Descartar alerta.

### POST `/alertas/evaluar`

Forzar evaluación de alertas para la empresa (útil para testing).

---

## 📈 Proyecciones

### GET `/proyecciones`

Obtener proyección de cash flow.

**Query Params:**
- `dias` (opcional): Días a proyectar (default: 30, max: 90)
- `escenario` (opcional): `optimista` | `realista` | `pesimista`

**Response:**
```json
{
  "success": true,
  "data": {
    "fecha_inicio": "2026-01-09",
    "fecha_fin": "2026-02-08",
    "saldo_inicial": 2847350,
    "puntos_datos": [
      {
        "fecha": "2026-01-09",
        "saldo_proyectado": 2847350,
        "ingresos_proyectados": 0,
        "egresos_proyectados": 0
      },
      {
        "fecha": "2026-01-10",
        "saldo_proyectado": 2900000,
        "ingresos_proyectados": 75000,
        "egresos_proyectados": 22350
      }
    ],
    "confianza": 0.82,
    "escenario": "realista"
  }
}
```

### POST `/proyecciones/generar`

Generar nueva proyección on-demand.

**Body:**
```json
{
  "dias": 30,
  "escenarios": ["optimista", "realista", "pesimista"]
}
```

---

## 🏷️ Categorías

### GET `/categorias`

Listar categorías disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Ventas productos",
      "tipo": "ingreso",
      "color": "#10B981",
      "es_predefinida": true
    }
  ]
}
```

### POST `/categorias`

Crear categoría personalizada.

---

## 🤖 IA - Clasificación

### POST `/ia/clasificar`

Clasificar un movimiento con IA.

**Body:**
```json
{
  "movimiento_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categoria_id": "uuid",
    "categoria_nombre": "Servicios",
    "confianza": 0.92,
    "razonamiento": "AWS Services indica gasto en infraestructura cloud"
  }
}
```

### POST `/ia/clasificar-batch`

Clasificar múltiples movimientos.

**Body:**
```json
{
  "movimiento_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### POST `/ia/feedback`

Enviar corrección de clasificación (mejora el modelo).

**Body:**
```json
{
  "movimiento_id": "uuid",
  "categoria_correcta_id": "uuid",
  "comentario": "Esta transacción es realmente un pago de impuestos"
}
```

---

## 🔑 Autenticación

### POST `/auth/register`

Registrar nueva empresa y usuario.

**Body:**
```json
{
  "empresa": {
    "razon_social": "Mi PyME SRL",
    "cuit": "30-12345678-9"
  },
  "usuario": {
    "nombre": "Martín",
    "email": "martin@mipyme.com",
    "password": "SecurePass123!"
  }
}
```

### POST `/auth/login`

Iniciar sesión.

**Body:**
```json
{
  "email": "martin@mipyme.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nombre": "Martín",
      "email": "martin@mipyme.com",
      "empresa_id": "uuid"
    }
  }
}
```

### GET `/auth/me`

Obtener usuario actual (requiere token).

---

## 🎯 Onboarding

### GET `/onboarding/estado`

Obtener estado del onboarding.

**Response:**
```json
{
  "success": true,
  "data": {
    "completado": false,
    "pasos": {
      "crear_cuenta": true,
      "conectar_banco": false,
      "primera_categoria": false,
      "primer_movimiento": false
    },
    "progreso_porcentaje": 25
  }
}
```

### POST `/onboarding/completar-paso`

Marcar paso como completado.

---

## 🏦 Cuentas Bancarias

### GET `/cuentas`

Listar cuentas conectadas.

### POST `/cuentas`

Agregar cuenta manual.

---

## 🔌 Integraciones

### GET `/integraciones/mercadopago/auth-url`

Obtener URL de autorización OAuth de Mercado Pago.

### POST `/integraciones/mercadopago/callback`

Callback OAuth (manejado automáticamente).

---

## 🛠️ Utilidades

### GET `/health`

Health check del servidor.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-09T13:10:00Z",
  "environment": "production"
}
```

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (datos inválidos) |
| 401 | Unauthorized (token missing/invalid) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

**Formato de error:**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "message": "Detalles adicionales"
}
```

---

## 🚀 Comenzar

1. **Instalar dependencias:**
   ```bash
   cd apps/api
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales
   ```

3. **Inicializar base de datos:**
   ```bash
   psql -U postgres -d pulso -f database/init.sql
   ```

4. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

La API estará disponible en `http://localhost:3000`

---

## 📝 Notas de Implementación

- Todos los montos están en centavos (x100)
- Las fechas están en formato ISO 8601
- Los UUIDs son v4
- Rate limit: 100 requests/15min por IP
- Tokens JWT expiran en 7 días

---

## 🔗 Enlaces

- [Documentación completa](./API_DOCS.md)
- [Roadmap](../../roadmap.md)
- [Schema DB](../../database/schema.sql)
