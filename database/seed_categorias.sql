-- =============================================================================
-- PULSO - Seed de Categorías Predefinidas
-- Categorías específicas para PyMEs Argentinas
-- =============================================================================

-- =============================================================================
-- INGRESOS
-- =============================================================================

INSERT INTO categorias (id, nombre, tipo, icono, color, descripcion, es_predefinida, keywords, orden) VALUES
-- Ingresos operativos
(uuid_generate_v4(), 'Ventas de productos', 'ingreso', '🛒', '#10b981', 'Ventas de mercadería y productos físicos', TRUE, '["venta", "producto", "mercaderia", "articulo"]'::jsonb, 1),
(uuid_generate_v4(), 'Servicios profesionales', 'ingreso', '💼', '#3b82f6', 'Cobros por servicios prestados', TRUE, '["servicio", "honorario", "consultoria", "asesoria"]'::jsonb, 2),
(uuid_generate_v4(), 'Cobros a clientes', 'ingreso', '💰', '#22c55e', 'Cobros de facturas y deudas de clientes', TRUE, '["cobro", "cliente", "factura", "cuenta corriente"]'::jsonb, 3),
(uuid_generate_v4(), 'Transferencias recibidas', 'ingreso', '📥', '#14b8a6', 'Transferencias bancarias recibidas', TRUE, '["transferencia", "recibida", "deposito"]'::jsonb, 4),

-- Ingresos financieros
(uuid_generate_v4(), 'Intereses ganados', 'ingreso', '📈', '#8b5cf6', 'Intereses de plazos fijos e inversiones', TRUE, '["interes", "plazo fijo", "inversion", "renta"]'::jsonb, 5),
(uuid_generate_v4(), 'Reintegros y devoluciones', 'ingreso', '↩️', '#06b6d4', 'Devoluciones de proveedores y reintegros', TRUE, '["reintegro", "devolucion", "nota credito", "reembolso"]'::jsonb, 6),

-- Otros ingresos
(uuid_generate_v4(), 'Otros ingresos', 'ingreso', '📌', '#6b7280', 'Ingresos varios no categorizados', TRUE, '["otro", "varios", "miscelaneo"]'::jsonb, 99);

-- =============================================================================
-- EGRESOS OPERATIVOS
-- =============================================================================

INSERT INTO categorias (id, nombre, tipo, icono, color, descripcion, es_predefinida, keywords, orden) VALUES
-- Compras
(uuid_generate_v4(), 'Compras de mercadería', 'egreso', '📦', '#f59e0b', 'Compra de productos para reventa', TRUE, '["compra", "mercaderia", "stock", "proveedor"]'::jsonb, 1),
(uuid_generate_v4(), 'Insumos y materiales', 'egreso', '🔧', '#eab308', 'Materiales para producción o servicios', TRUE, '["insumo", "material", "materia prima"]'::jsonb, 2),

-- Gastos fijos
(uuid_generate_v4(), 'Alquiler de local', 'egreso', '🏢', '#ef4444', 'Alquiler mensual del local comercial', TRUE, '["alquiler", "local", "oficina", "inmueble"]'::jsonb, 3),
(uuid_generate_v4(), 'Sueldos y cargas sociales', 'egreso', '👥', '#dc2626', 'Salarios, aguinaldo, cargas sociales', TRUE, '["sueldo", "salario", "empleado", "afip", "f931", "cargas"]'::jsonb, 4),
(uuid_generate_v4(), 'Honorarios profesionales', 'egreso', '📋', '#f97316', 'Contador, abogado, consultores externos', TRUE, '["honorario", "contador", "estudio", "abogado", "profesional"]'::jsonb, 5),

-- Servicios
(uuid_generate_v4(), 'Electricidad', 'egreso', '⚡', '#fbbf24', 'Factura de luz', TRUE, '["edenor", "edesur", "luz", "electricidad", "energia"]'::jsonb, 6),
(uuid_generate_v4(), 'Gas', 'egreso', '🔥', '#fb923c', 'Factura de gas natural', TRUE, '["metrogas", "gas", "gasnor"]'::jsonb, 7),
(uuid_generate_v4(), 'Agua', 'egreso', '💧', '#38bdf8', 'Factura de agua', TRUE, '["aysa", "agua", "aguas"]'::jsonb, 8),
(uuid_generate_v4(), 'Internet y telefonía', 'egreso', '📡', '#a855f7', 'Servicios de comunicaciones', TRUE, '["internet", "telefono", "celular", "movistar", "claro", "personal", "fibertel", "telecentro"]'::jsonb, 9),

-- Otros operativos
(uuid_generate_v4(), 'Transporte y fletes', 'egreso', '🚚', '#84cc16', 'Envíos, fletes, combustible', TRUE, '["flete", "envio", "transporte", "nafta", "combustible", "oca", "andreani"]'::jsonb, 10),
(uuid_generate_v4(), 'Publicidad y marketing', 'egreso', '📢', '#ec4899', 'Campañas publicitarias, redes sociales', TRUE, '["publicidad", "marketing", "facebook", "google ads", "instagram"]'::jsonb, 11),
(uuid_generate_v4(), 'Software y suscripciones', 'egreso', '💻', '#8b5cf6', 'Herramientas digitales y suscripciones', TRUE, '["software", "suscripcion", "saas", "licencia", "google", "microsoft", "adobe"]'::jsonb, 12),
(uuid_generate_v4(), 'Mantenimiento y reparaciones', 'egreso', '🔨', '#78716c', 'Reparaciones de equipos e instalaciones', TRUE, '["mantenimiento", "reparacion", "arreglo", "tecnico"]'::jsonb, 13);

-- =============================================================================
-- EGRESOS IMPOSITIVOS (Argentina)
-- =============================================================================

INSERT INTO categorias (id, nombre, tipo, icono, color, descripcion, es_predefinida, keywords, orden) VALUES
(uuid_generate_v4(), 'Monotributo', 'egreso', '🏛️', '#7c3aed', 'Cuota mensual de monotributo AFIP', TRUE, '["monotributo", "afip", "arca", "regimen simplificado"]'::jsonb, 20),
(uuid_generate_v4(), 'IVA', 'egreso', '📊', '#6366f1', 'Impuesto al Valor Agregado', TRUE, '["iva", "impuesto", "afip", "arca"]'::jsonb, 21),
(uuid_generate_v4(), 'Ingresos Brutos (IIBB)', 'egreso', '📑', '#4f46e5', 'Impuesto provincial sobre ingresos', TRUE, '["iibb", "ingresos brutos", "arba", "agip", "rentas"]'::jsonb, 22),
(uuid_generate_v4(), 'Retenciones AFIP', 'egreso', '✂️', '#4338ca', 'Retenciones de ganancias e IVA', TRUE, '["retencion", "afip", "arca", "percepcion"]'::jsonb, 23),
(uuid_generate_v4(), 'Ganancias', 'egreso', '💹', '#3730a3', 'Impuesto a las ganancias', TRUE, '["ganancias", "impuesto", "afip", "anticipo"]'::jsonb, 24),
(uuid_generate_v4(), 'Tasas municipales', 'egreso', '🏘️', '#312e81', 'ABL, seguridad e higiene, habilitaciones', TRUE, '["abl", "tasa", "municipal", "habilitacion", "bomberos"]'::jsonb, 25),
(uuid_generate_v4(), 'Cargas sociales empleados', 'egreso', '🏥', '#581c87', 'Aportes y contribuciones patronales', TRUE, '["f931", "cargas sociales", "suss", "obra social", "art"]'::jsonb, 26);

-- =============================================================================
-- EGRESOS FINANCIEROS
-- =============================================================================

INSERT INTO categorias (id, nombre, tipo, icono, color, descripcion, es_predefinida, keywords, orden) VALUES
(uuid_generate_v4(), 'Comisiones Mercado Pago', 'egreso', '💳', '#00bcff', 'Comisiones por ventas y servicios de MP', TRUE, '["mercado pago", "mp", "comision", "fee"]'::jsonb, 30),
(uuid_generate_v4(), 'Comisiones bancarias', 'egreso', '🏦', '#64748b', 'Mantenimiento de cuenta, transferencias', TRUE, '["comision", "banco", "mantenimiento", "transferencia"]'::jsonb, 31),
(uuid_generate_v4(), 'Intereses de préstamos', 'egreso', '📉', '#be123c', 'Intereses de créditos y préstamos', TRUE, '["interes", "prestamo", "credito", "cuota"]'::jsonb, 32),
(uuid_generate_v4(), 'Tarjeta de crédito', 'egreso', '💳', '#e11d48', 'Pagos y resúmenes de tarjetas', TRUE, '["tarjeta", "visa", "mastercard", "american", "credito", "resumen"]'::jsonb, 33),
(uuid_generate_v4(), 'Gastos financieros varios', 'egreso', '🔢', '#94a3b8', 'ITF, sellados, otros gastos bancarios', TRUE, '["itf", "sellado", "impuesto debitos", "cheque"]'::jsonb, 34);

-- =============================================================================
-- OTROS EGRESOS
-- =============================================================================

INSERT INTO categorias (id, nombre, tipo, icono, color, descripcion, es_predefinida, keywords, orden) VALUES
(uuid_generate_v4(), 'Retiros personales', 'egreso', '👤', '#475569', 'Retiros del dueño/socio', TRUE, '["retiro", "personal", "socio", "dueno"]'::jsonb, 40),
(uuid_generate_v4(), 'Otros egresos', 'egreso', '📌', '#6b7280', 'Gastos varios no categorizados', TRUE, '["otro", "varios", "miscelaneo"]'::jsonb, 99);

-- =============================================================================
-- FIN DEL SEED
-- =============================================================================
