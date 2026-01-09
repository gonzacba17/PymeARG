-- =============================================================================
-- PULSO - Seed de Datos Demo
-- Datos de ejemplo para testing y demostración
-- =============================================================================
-- Ejecutar DESPUÉS de init.sql
-- Uso: psql -U postgres -d pulso_db -f seed_demo.sql
-- =============================================================================

-- Empresa demo
INSERT INTO empresas (id, nombre, cuit, razon_social, industria, plan_activo, estado)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Distribuidora Norte',
  '20345678901',
  'Distribuidora Norte S.R.L.',
  'Comercio mayorista',
  'starter',
  'active'
);

-- Usuario demo (password: Demo123!)
INSERT INTO usuarios (id, empresa_id, email, nombre, apellido, password_hash, rol, onboarding_completado)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'demo@pulso.com.ar',
  'Juan',
  'Demostración',
  '$2b$10$rQZ5QzXqJ5YV8YHMqVvHpe7n5mOpQCDQKQJ9W5i4Vz5sNO5Ld5NXC', -- Demo123!
  'owner',
  TRUE
);

-- Cuenta manual demo
INSERT INTO cuentas_bancarias (id, empresa_id, nombre_cuenta, proveedor, estado, saldo_actual, moneda)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Caja Principal',
  'manual',
  'connected',
  485000.00,
  'ARS'
);

-- Movimientos demo (últimos 30 días)
INSERT INTO movimientos (empresa_id, cuenta_id, categoria_id, monto, tipo, descripcion, fecha_transaccion, clasificacion_origen)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  c.id,
  m.monto,
  m.tipo,
  m.descripcion,
  CURRENT_DATE - (m.dias_atras || ' days')::interval,
  'manual'
FROM (
  VALUES
    (45000.00, 'ingreso', 'Transferencia cliente ABC', 1, 'Cobros a clientes'),
    (12500.00, 'ingreso', 'Venta mostrador', 2, 'Ventas de productos'),
    (8200.00, 'egreso', 'Compra mercadería', 2, 'Compras de mercadería'),
    (2500.00, 'egreso', 'Comisión Mercado Pago', 3, 'Comisiones Mercado Pago'),
    (15000.00, 'egreso', 'Alquiler local', 5, 'Alquiler de local'),
    (3800.00, 'egreso', 'Factura Edenor', 6, 'Electricidad'),
    (32000.00, 'ingreso', 'Transferencia cliente XYZ', 7, 'Cobros a clientes'),
    (4500.00, 'egreso', 'Monotributo AFIP', 8, 'Monotributo'),
    (18000.00, 'ingreso', 'Venta productos', 10, 'Ventas de productos'),
    (6500.00, 'egreso', 'Publicidad Instagram', 12, 'Publicidad y marketing'),
    (1200.00, 'egreso', 'Telecentro Internet', 15, 'Internet y telefonía'),
    (28000.00, 'ingreso', 'Cobro factura 001-00234', 18, 'Cobros a clientes'),
    (9800.00, 'egreso', 'Ingresos Brutos ARBA', 20, 'Ingresos Brutos (IIBB)'),
    (55000.00, 'ingreso', 'Transferencia grande', 22, 'Cobros a clientes'),
    (12000.00, 'egreso', 'Honorarios contador', 25, 'Honorarios profesionales'),
    (7500.00, 'egreso', 'Compra insumos', 28, 'Insumos y materiales')
) AS m(monto, tipo, descripcion, dias_atras, categoria_nombre)
JOIN categorias c ON c.nombre = m.categoria_nombre AND c.es_predefinida = TRUE;

-- Alertas demo
INSERT INTO alertas (empresa_id, tipo, severidad, titulo, mensaje, datos)
VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'vencimiento',
  'warning',
  '📅 Vencimiento próximo: Monotributo',
  'El Monotributo vence el día 20. ¡No te olvides de pagarlo!',
  '{"tipo_vencimiento": "monotributo", "dia_vencimiento": 20}'::jsonb
),
(
  '11111111-1111-1111-1111-111111111111',
  'gasto_inusual',
  'warning',
  '📈 Gasto inusual en Publicidad y marketing',
  'El gasto en "Publicidad y marketing" este mes es 45% mayor al promedio.',
  '{"categoria": "publicidad", "aumento_porcentaje": 45}'::jsonb
);

-- =============================================================================
\echo ''
\echo '✅ Datos demo insertados:'
\echo '   - Empresa: Distribuidora Norte'
\echo '   - Usuario: demo@pulso.com.ar / Demo123!'
\echo '   - Cuenta: Caja Principal ($485,000)'
\echo '   - Movimientos: 16 transacciones'
\echo '   - Alertas: 2 alertas demo'
\echo ''
-- =============================================================================
