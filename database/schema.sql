-- =============================================================================
-- PULSO - Schema de Base de Datos
-- Panel Inteligente de Control Financiero para PyMEs Argentinas
-- =============================================================================
-- Versión: 1.0.0
-- PostgreSQL 15+
-- =============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLA: empresas
-- Entidad principal del sistema
-- =============================================================================
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    cuit VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(255),
    industria VARCHAR(100),
    
    -- Configuración de plan
    plan_activo VARCHAR(50) DEFAULT 'free' CHECK (plan_activo IN ('free', 'starter', 'pro', 'enterprise')),
    modulos_activos JSONB DEFAULT '["financiero"]'::jsonb,
    
    -- Estado de la cuenta
    estado VARCHAR(20) DEFAULT 'active' CHECK (estado IN ('active', 'trial', 'suspended', 'cancelled')),
    fecha_vencimiento_trial TIMESTAMPTZ,
    
    -- Configuración
    configuracion JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_empresas_cuit ON empresas(cuit);
CREATE INDEX idx_empresas_estado ON empresas(estado);

-- =============================================================================
-- TABLA: usuarios
-- Usuarios del sistema con roles
-- =============================================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Datos personales
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    
    -- Autenticación
    password_hash VARCHAR(255) NOT NULL,
    
    -- Rol y permisos
    rol VARCHAR(20) DEFAULT 'viewer' CHECK (rol IN ('owner', 'admin', 'editor', 'viewer')),
    
    -- Onboarding
    onboarding_completado BOOLEAN DEFAULT FALSE,
    pasos_onboarding JSONB DEFAULT '[]'::jsonb,
    
    -- Preferencias
    preferencias JSONB DEFAULT '{}'::jsonb,
    
    -- Tracking
    ultimo_login TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =============================================================================
-- TABLA: categorias
-- Categorías de movimientos (predefinidas + custom por empresa)
-- =============================================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE, -- NULL = predefinida
    
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    
    -- Visual
    icono VARCHAR(10) DEFAULT '📌',
    color VARCHAR(7) DEFAULT '#6b7280', -- Hex color
    
    -- Metadata
    descripcion TEXT,
    es_predefinida BOOLEAN DEFAULT FALSE,
    
    -- Para IA
    keywords JSONB DEFAULT '[]'::jsonb, -- Palabras clave para clasificación
    
    -- Orden de visualización
    orden INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, nombre, tipo)
);

CREATE INDEX idx_categorias_empresa ON categorias(empresa_id);
CREATE INDEX idx_categorias_tipo ON categorias(tipo);
CREATE INDEX idx_categorias_predefinida ON categorias(es_predefinida);

-- =============================================================================
-- TABLA: cuentas_bancarias
-- Conexiones a Mercado Pago y otros proveedores
-- =============================================================================
CREATE TABLE cuentas_bancarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Proveedor
    proveedor VARCHAR(50) NOT NULL CHECK (proveedor IN ('mercadopago', 'banco_galicia', 'banco_nacion', 'banco_provincia', 'manual')),
    nombre_cuenta VARCHAR(100) NOT NULL,
    
    -- Tokens encriptados (AES-256-GCM)
    access_token_encrypted BYTEA,
    refresh_token_encrypted BYTEA,
    token_expires_at TIMESTAMPTZ,
    
    -- Identificadores del proveedor
    external_user_id VARCHAR(255),
    external_account_id VARCHAR(255),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'connected' CHECK (estado IN ('connected', 'disconnected', 'error', 'pending')),
    ultimo_sync TIMESTAMPTZ,
    error_mensaje TEXT,
    
    -- Saldo actual (cache)
    saldo_actual DECIMAL(15, 2) DEFAULT 0,
    moneda VARCHAR(3) DEFAULT 'ARS',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cuentas_empresa ON cuentas_bancarias(empresa_id);
CREATE INDEX idx_cuentas_proveedor ON cuentas_bancarias(proveedor);
CREATE INDEX idx_cuentas_estado ON cuentas_bancarias(estado);

-- =============================================================================
-- TABLA: movimientos
-- Transacciones financieras
-- =============================================================================
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    cuenta_id UUID NOT NULL REFERENCES cuentas_bancarias(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    
    -- Datos de la transacción
    monto DECIMAL(15, 2) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    moneda VARCHAR(3) DEFAULT 'ARS',
    
    -- Descripción
    descripcion TEXT,
    descripcion_original TEXT, -- Del proveedor, sin modificar
    
    -- Fechas
    fecha_transaccion TIMESTAMPTZ NOT NULL,
    fecha_liquidacion TIMESTAMPTZ,
    
    -- Referencia externa
    external_id VARCHAR(255),
    external_status VARCHAR(50),
    
    -- Clasificación
    clasificacion_origen VARCHAR(20) DEFAULT 'pendiente' CHECK (clasificacion_origen IN ('pendiente', 'ia', 'manual', 'regla')),
    clasificacion_confianza DECIMAL(3, 2), -- 0.00 a 1.00
    
    -- Metadata adicional del proveedor
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movimientos_empresa ON movimientos(empresa_id);
CREATE INDEX idx_movimientos_cuenta ON movimientos(cuenta_id);
CREATE INDEX idx_movimientos_categoria ON movimientos(categoria_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha_transaccion);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_clasificacion ON movimientos(clasificacion_origen);
CREATE INDEX idx_movimientos_external ON movimientos(external_id);

-- Índice compuesto para queries de dashboard
CREATE INDEX idx_movimientos_empresa_fecha ON movimientos(empresa_id, fecha_transaccion DESC);

-- =============================================================================
-- TABLA: clasificaciones_ia
-- Histórico de clasificaciones de IA para training/audit
-- =============================================================================
CREATE TABLE clasificaciones_ia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movimiento_id UUID NOT NULL REFERENCES movimientos(id) ON DELETE CASCADE,
    
    -- Clasificación sugerida
    categoria_sugerida_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    confianza DECIMAL(3, 2) NOT NULL, -- 0.00 a 1.00
    
    -- Modelo utilizado
    modelo VARCHAR(50) DEFAULT 'gpt-4-turbo',
    prompt_version VARCHAR(20),
    
    -- Respuesta cruda
    respuesta_raw JSONB,
    
    -- Feedback
    fue_aceptada BOOLEAN,
    categoria_corregida_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    corregido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_correccion TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clasificaciones_movimiento ON clasificaciones_ia(movimiento_id);
CREATE INDEX idx_clasificaciones_aceptada ON clasificaciones_ia(fue_aceptada);

-- =============================================================================
-- TABLA: alertas
-- Sistema de notificaciones
-- =============================================================================
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Tipo y severidad
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('cash_bajo', 'gasto_inusual', 'vencimiento', 'sin_actividad', 'meta_alcanzada', 'sync_error', 'custom')),
    severidad VARCHAR(20) DEFAULT 'info' CHECK (severidad IN ('info', 'warning', 'critical')),
    
    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Datos relacionados
    datos JSONB DEFAULT '{}'::jsonb,
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMPTZ,
    descartada BOOLEAN DEFAULT FALSE,
    
    -- Acciones tomadas
    accion_url VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_empresa ON alertas(empresa_id);
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_severidad ON alertas(severidad);
CREATE INDEX idx_alertas_leida ON alertas(leida);
CREATE INDEX idx_alertas_fecha ON alertas(created_at DESC);

-- =============================================================================
-- TABLA: proyecciones_cash
-- Predicciones de flujo de caja
-- =============================================================================
CREATE TABLE proyecciones_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Fecha de la proyección
    fecha_proyeccion DATE NOT NULL,
    
    -- Valores proyectados
    cash_proyectado DECIMAL(15, 2) NOT NULL,
    ingresos_proyectados DECIMAL(15, 2) DEFAULT 0,
    egresos_proyectados DECIMAL(15, 2) DEFAULT 0,
    
    -- Escenarios
    escenario VARCHAR(20) DEFAULT 'realista' CHECK (escenario IN ('optimista', 'realista', 'pesimista')),
    
    -- Confianza (decrece con el tiempo)
    confianza DECIMAL(3, 2) NOT NULL, -- 0.00 a 1.00
    
    -- Metadata del cálculo
    algoritmo_version VARCHAR(20),
    factores JSONB DEFAULT '{}'::jsonb, -- Factores que influyeron
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(empresa_id, fecha_proyeccion, escenario)
);

CREATE INDEX idx_proyecciones_empresa ON proyecciones_cash(empresa_id);
CREATE INDEX idx_proyecciones_fecha ON proyecciones_cash(fecha_proyeccion);

-- =============================================================================
-- TABLA: reglas_clasificacion
-- Reglas automáticas de clasificación
-- =============================================================================
CREATE TABLE reglas_clasificacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    
    -- Condiciones
    condicion_tipo VARCHAR(20) NOT NULL CHECK (condicion_tipo IN ('contiene', 'empieza_con', 'termina_con', 'regex', 'monto_exacto', 'monto_rango')),
    condicion_valor VARCHAR(255) NOT NULL,
    condicion_campo VARCHAR(50) DEFAULT 'descripcion', -- descripcion, monto, etc.
    
    -- Prioridad (menor = mayor prioridad)
    prioridad INT DEFAULT 100,
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    
    -- Stats
    veces_aplicada INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reglas_empresa ON reglas_clasificacion(empresa_id);
CREATE INDEX idx_reglas_activa ON reglas_clasificacion(activa);

-- =============================================================================
-- TABLA: audit_log
-- Log de auditoría para seguridad
-- =============================================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Acción
    accion VARCHAR(100) NOT NULL,
    recurso_tipo VARCHAR(50), -- 'movimiento', 'categoria', 'cuenta', etc.
    recurso_id UUID,
    
    -- Detalles
    detalle JSONB DEFAULT '{}'::jsonb,
    
    -- Request info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_empresa ON audit_log(empresa_id);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_accion ON audit_log(accion);
CREATE INDEX idx_audit_fecha ON audit_log(created_at DESC);

-- Partición por mes para performance (opcional, descomentar si es necesario)
-- CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
--     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- =============================================================================
-- VIEW: dashboard_resumen
-- Vista materializada para el dashboard principal
-- =============================================================================
CREATE OR REPLACE VIEW dashboard_resumen AS
SELECT 
    e.id AS empresa_id,
    
    -- Cash total (suma de saldos de cuentas conectadas)
    COALESCE(SUM(cb.saldo_actual), 0) AS cash_total,
    
    -- Cuentas
    COUNT(DISTINCT cb.id) FILTER (WHERE cb.estado = 'connected') AS total_cuentas,
    
    -- Movimientos del mes actual
    COALESCE(SUM(m.monto) FILTER (
        WHERE m.tipo = 'ingreso' 
        AND m.fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) AS ingresos_mes,
    
    COALESCE(SUM(m.monto) FILTER (
        WHERE m.tipo = 'egreso' 
        AND m.fecha_transaccion >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) AS egresos_mes,
    
    -- Movimientos pendientes de clasificar
    COUNT(m.id) FILTER (WHERE m.clasificacion_origen = 'pendiente') AS movimientos_pendientes,
    
    -- Última sincronización
    MAX(cb.ultimo_sync) AS ultimo_sync
    
FROM empresas e
LEFT JOIN cuentas_bancarias cb ON cb.empresa_id = e.id
LEFT JOIN movimientos m ON m.empresa_id = e.id
GROUP BY e.id;

-- =============================================================================
-- TRIGGERS: Actualización automática de updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cuentas_updated_at BEFORE UPDATE ON cuentas_bancarias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movimientos_updated_at BEFORE UPDATE ON movimientos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reglas_updated_at BEFORE UPDATE ON reglas_clasificacion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FIN DEL SCHEMA
-- =============================================================================
