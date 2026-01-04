-- =========================================================
-- SCRIPT DE VERIFICACIÓN DE ESTRUCTURA DE TABLAS
-- =========================================================
-- Este script muestra la estructura completa de todas las
-- tablas del proyecto para verificar que estén correctamente
-- armadas según los requisitos del sistema.
-- =========================================================

-- =========================================================
-- 1. LISTA DE TODAS LAS TABLAS DEL PROYECTO
-- =========================================================
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =========================================================
-- 2. ESTRUCTURA DETALLADA DE CADA TABLA
-- =========================================================
-- Nota: Esta sección se omite por complejidad de sintaxis
-- Usar las consultas siguientes que son más simples y directas

-- =========================================================
-- 3. RESUMEN POR TABLA (VISTA SIMPLIFICADA)
-- =========================================================

SELECT 
    t.table_name AS "Tabla",
    COUNT(DISTINCT c.column_name) AS "Cantidad Columnas",
    COUNT(DISTINCT pk.constraint_name) AS "Primary Keys",
    COUNT(DISTINCT fk.constraint_name) AS "Foreign Keys",
    COUNT(DISTINCT uq.constraint_name) AS "Unique Constraints",
    COUNT(DISTINCT idx.indexname) AS "Índices",
    COUNT(DISTINCT pol.policyname) AS "RLS Policies",
    CASE WHEN t.table_name IN (
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
    ) THEN 'Sí' ELSE 'No' END AS "RLS Habilitado"
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN information_schema.table_constraints pk
    ON t.table_name = pk.table_name 
    AND t.table_schema = pk.table_schema
    AND pk.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.table_constraints fk
    ON t.table_name = fk.table_name 
    AND t.table_schema = fk.table_schema
    AND fk.constraint_type = 'FOREIGN KEY'
LEFT JOIN information_schema.table_constraints uq
    ON t.table_name = uq.table_name 
    AND t.table_schema = uq.table_schema
    AND uq.constraint_type = 'UNIQUE'
LEFT JOIN pg_indexes idx
    ON t.table_name = idx.tablename 
    AND idx.schemaname = 'public'
LEFT JOIN pg_policies pol
    ON t.table_name = pol.tablename 
    AND pol.schemaname = 'public'
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- =========================================================
-- 4. DETALLE DE COLUMNAS POR TABLA
-- =========================================================

SELECT 
    t.table_name AS "Tabla",
    c.column_name AS "Columna",
    c.data_type AS "Tipo",
    CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN c.data_type || '(' || c.character_maximum_length || ')'
        WHEN c.numeric_precision IS NOT NULL 
        THEN c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        ELSE c.data_type
    END AS "Tipo Completo",
    CASE WHEN c.is_nullable = 'YES' THEN 'Sí' ELSE 'No' END AS "Permite NULL",
    c.column_default AS "Valor por Defecto",
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PK'
        WHEN fk.column_name IS NOT NULL THEN 'FK'
        WHEN uq.column_name IS NOT NULL THEN 'UQ'
        ELSE ''
    END AS "Constraints"
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    SELECT kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
LEFT JOIN (
    SELECT kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE'
) uq ON c.table_name = uq.table_name AND c.column_name = uq.column_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- =========================================================
-- 5. FOREIGN KEYS DETALLADAS
-- =========================================================

SELECT
    tc.table_name AS "Tabla Origen",
    kcu.column_name AS "Columna",
    ccu.table_name AS "Tabla Referenciada",
    ccu.column_name AS "Columna Referenciada",
    tc.constraint_name AS "Nombre Constraint",
    rc.update_rule AS "ON UPDATE",
    rc.delete_rule AS "ON DELETE"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =========================================================
-- 6. ÍNDICES DETALLADOS
-- =========================================================

SELECT
    tablename AS "Tabla",
    indexname AS "Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =========================================================
-- 7. RLS POLICIES DETALLADAS
-- =========================================================

SELECT
    schemaname AS "Schema",
    tablename AS "Tabla",
    policyname AS "Nombre Policy",
    permissive AS "Permisivo",
    roles AS "Roles",
    cmd AS "Comando",
    qual AS "USING (condición)",
    with_check AS "WITH CHECK (condición)"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =========================================================
-- 8. VERIFICACIÓN DE CAMPOS ESPECÍFICOS DEL PROYECTO
-- =========================================================

-- Verificar que las tablas principales tengan sync_id
SELECT 
    t.table_name AS "Tabla",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'sync_id'
        ) THEN '✓'
        ELSE '✗'
    END AS "Tiene sync_id",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'created_at'
        ) THEN '✓'
        ELSE '✗'
    END AS "Tiene created_at",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'updated_at'
        ) THEN '✓'
        ELSE '✗'
    END AS "Tiene updated_at",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'comercio_id'
        ) THEN '✓'
        ELSE '✗'
    END AS "Tiene comercio_id"
FROM information_schema.tables t
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN ('roles', 'permisos', 'roles_permisos') -- Excluir tablas maestras
ORDER BY t.table_name;

-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- y copiar todos los resultados para análisis
-- =========================================================

