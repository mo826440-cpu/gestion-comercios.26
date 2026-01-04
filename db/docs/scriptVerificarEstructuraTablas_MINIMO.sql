-- =========================================================
-- SCRIPT MÍNIMO - SOLO LO ESENCIAL
-- =========================================================
-- Si esto también da timeout, usar Table Editor de Supabase
-- =========================================================

-- =========================================================
-- CONSULTA ÚNICA: LISTA DE TABLAS Y COLUMNAS BÁSICAS
-- =========================================================
SELECT 
    t.table_name AS "Tabla",
    c.column_name AS "Columna",
    c.data_type AS "Tipo"
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position
LIMIT 200;  -- Limitar a 200 filas máximo

