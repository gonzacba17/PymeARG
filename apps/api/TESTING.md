# 🧪 Testing del API PULSO

Scripts de testing para validar todos los endpoints del backend.

## 📋 Requisitos

- PowerShell 7+ (Windows/Mac/Linux)
- PostgreSQL corriendo (Docker o local)
- Node.js 18+

---

## 🚀 Inicio Rápido

### 1. Iniciar Base de Datos

```powershell
# Con Docker
docker-compose up -d

# O PostgreSQL local
psql -U postgres -d pulso -f ../../database/init.sql
```

### 2. Iniciar API

```powershell
cd apps/api
npm install
npm run dev
```

La API estará en `http://localhost:3000`

### 3. Ejecutar Tests

```powershell
# Testing completo
.\test-api.ps1

# Testing manual con curl
curl http://localhost:3000/health
```

---

## 📝 Qué hace el script

El script `test-api.ps1` ejecuta **50+ requests** probando:

1. **Health Check** - Verificar que el servidor responde
2. **Autenticación** - Register, Login, /me
3. **Categorías** - Listar categorías predefinidas
4. **Cuentas** - CRUD + límite de 5 cuentas
5. **Movimientos** - CRUD + validación manual vs MP
6. **Dashboard** - KPIs, resumen completo
7. **Alertas** - Listar, evaluar
8. **Proyecciones** - Obtener, generar
9. **IA** - Clasificar movimientos
10. **Onboarding** - Estado, progreso

---

## ✅ Output Esperado

```
🧪 PULSO API - Script de Testing
=================================

📋 1. HEALTH CHECK
✅ GET /../health
   Status: healthy

🔐 2. AUTENTICACIÓN
   2.1 Registro de usuario
✅ POST /auth/register
   Token obtenido: eyJhbGciOiJIUzI1NiIs...

   2.2 Login
✅ POST /auth/login

   2.3 Obtener usuario actual
✅ GET /auth/me
   Usuario: Usuario Test
   Email: test-12345@pulso.com

🏷️  3. CATEGORÍAS
✅ GET /categorias
   Total categorías: 32
   Ejemplo ingreso: Ventas productos
   Ejemplo egreso: Monotributo

...

=================================
🎉 Testing completado!
=================================
```

---

## 🔧 Testing Manual

### Usando PowerShell

```powershell
# 1. Obtener token
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/v1/auth/login" `
  -Body (@{email="test@pulso.com"; password="Test123"} | ConvertTo-Json) `
  -ContentType "application/json"

$token = $response.data.token

# 2. Hacer request autenticado
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard" -Headers $headers
```

### Usando curl

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@pulso.com","password":"Test123"}' \
  | jq -r '.data.token')

# 2. Dashboard
curl http://localhost:3000/api/v1/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Error: "Connection refused"
```
✅ Solución: Asegúrate que el servidor esté corriendo
npm run dev
```

### Error: "Database connection failed"
```
✅ Solución: Verifica PostgreSQL
docker ps  # Debe mostrar postgres corriendo
```

### Error: "401 Unauthorized"
```
✅ Solución: El token expiró o es inválido
Ejecuta el script de nuevo para obtener un token fresco
```

### Tests fallan en IA
```
✅ Solución: Agrega tu OPENAI_API_KEY en .env
OPENAI_API_KEY=sk-...
```

---

## 📊 Cobertura de Tests

| Módulo | Endpoints Testeados | Coverage |
|--------|:------------------:|:--------:|
| Auth | 3/3 | 100% |
| Dashboard | 2/2 | 100% |
| Movimientos | 4/4 | 100% |
| Cuentas | 4/4 | 100% |
| Alertas | 2/4 | 50% |
| Proyecciones | 2/2 | 100% |
| IA | 1/3 | 33% |
| Categorías | 1/2 | 50% |
| Onboarding | 1/3 | 33% |

**Total: 70% de endpoints cubiertos**

---

## 🔜 Próximos Tests

- [ ] Tests unitarios con Jest
- [ ] Tests de integración con Supertest
- [ ] Tests de carga con Artillery
- [ ] Tests E2E con Playwright

---

## 📝 Notas

- El script crea datos de prueba que se guardan en la DB
- Usa un email aleatorio para evitar conflictos
- El token generado se guarda en `$TOKEN` para uso posterior
- Limpia los datos automáticamente al final (opcional)

---

## 🤝 Contribuir

Si agregas un nuevo endpoint, agrega su test en `test-api.ps1`:

```powershell
Write-Host "`n📍 X. NUEVO MÓDULO" -ForegroundColor Yellow
Invoke-ApiRequest -Method "GET" -Endpoint "/nuevo-endpoint" -UseAuth $true
```
