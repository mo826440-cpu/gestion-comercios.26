-- =========================================================
-- CONSULTA ULTRA SIMPLE - SOLO NOMBRES DE TABLAS
-- =========================================================
-- Si esto también falla, usar Table Editor de Supabase
-- =========================================================

SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

