-- =============================================================================
-- PULSO - Script de Inicialización
-- Ejecuta schema + seeds en orden
-- =============================================================================
-- Uso: psql -U postgres -d pulso_db -f init.sql
-- =============================================================================

\echo '============================================='
\echo 'PULSO - Inicializando Base de Datos'
\echo '============================================='

\echo ''
\echo '[1/2] Ejecutando schema.sql...'
\i schema.sql

\echo ''
\echo '[2/2] Ejecutando seed_categorias.sql...'
\i seed_categorias.sql

\echo ''
\echo '============================================='
\echo 'Inicialización completada!'
\echo '============================================='

-- Verificación rápida
\echo ''
\echo 'Verificación:'
SELECT 'Tablas creadas: ' || COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT 'Categorías predefinidas: ' || COUNT(*)::text FROM categorias WHERE es_predefinida = TRUE;

\echo ''
\echo 'Tablas disponibles:'
\dt

\echo ''
\echo 'Listo! La base de datos está configurada.'
