-- =========================================================
-- SCRIPT RÁPIDO DE VERIFICACIÓN
-- =========================================================
-- Consultas optimizadas y limitadas para evitar timeouts
-- =========================================================

-- =========================================================
-- CONSULTA 1: LISTA DE TABLAS (MUY RÁPIDA)
-- =========================================================
SELECT table_name AS "Tabla"
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =========================================================
-- CONSULTA 2: COLUMNAS (LIMITADA Y SIMPLE)
-- =========================================================
SELECT 
    table_name AS "Tabla",
    column_name AS "Columna",
    data_type AS "Tipo",
    is_nullable AS "Nullable"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =========================================================
-- CONSULTA 3: PRIMARY KEYS (RÁPIDA)
-- =========================================================
SELECT
    tc.table_name AS "Tabla",
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS "Columnas PK"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY tc.table_name;

-- =========================================================
-- CONSULTA 4: FOREIGN KEYS (SIMPLIFICADA)
-- =========================================================
SELECT
    tc.table_name AS "Tabla",
    kcu.column_name AS "Columna FK",
    ccu.table_name AS "Referencia Tabla",
    ccu.column_name AS "Referencia Columna"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =========================================================
-- CONSULTA 5: VERIFICACIÓN DE CAMPOS ESPECÍFICOS (RÁPIDA)
-- =========================================================
SELECT 
    t.table_name AS "Tabla",
    MAX(CASE WHEN c.column_name = 'sync_id' THEN 'Sí' ELSE 'No' END) AS "Tiene sync_id",
    MAX(CASE WHEN c.column_name = 'created_at' THEN 'Sí' ELSE 'No' END) AS "Tiene created_at",
    MAX(CASE WHEN c.column_name = 'updated_at' THEN 'Sí' ELSE 'No' END) AS "Tiene updated_at",
    MAX(CASE WHEN c.column_name = 'comercio_id' THEN 'Sí' ELSE 'No' END) AS "Tiene comercio_id"
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
    AND c.column_name IN ('sync_id', 'created_at', 'updated_at', 'comercio_id')
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

