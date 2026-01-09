# Database - Pulso

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `schema.sql` | Schema completo de PostgreSQL (10 tablas, índices, triggers) |
| `seed_categorias.sql` | Categorías predefinidas para PyMEs argentinas (30+) |
| `init.sql` | Script de inicialización (ejecuta ambos en orden) |

## Requisitos

- PostgreSQL 15+
- Extensiones: `uuid-ossp`, `pgcrypto` (se instalan automáticamente)

## Instalación

### 1. Crear la base de datos

```bash
createdb -U postgres pulso_db
```

### 2. Ejecutar el schema

```bash
cd database
psql -U postgres -d pulso_db -f init.sql
```

### 3. Verificar

```sql
-- Conectar a la base
psql -U postgres -d pulso_db

-- Ver tablas creadas
\dt

-- Verificar categorías
SELECT COUNT(*) FROM categorias WHERE es_predefinida = TRUE;
-- Debería retornar ~32
```

## Tablas

```
empresas            → Entidad principal
usuarios            → Usuarios con roles
categorias          → Predefinidas + custom
cuentas_bancarias   → Conexiones MP/bancos
movimientos         → Transacciones
clasificaciones_ia  → Histórico IA
alertas             → Notificaciones
proyecciones_cash   → Predicciones
reglas_clasificacion → Reglas automáticas
audit_log           → Log de auditoría
```

## Views

- `dashboard_resumen` - Agregación para endpoint /dashboard
