-- =========================================================
-- SCRIPT DE VERIFICACIÓN TABLA POR TABLA
-- =========================================================
-- Ejecutar cada sección por separado
-- Reemplazar 'NOMBRE_TABLA' con el nombre real de cada tabla
-- =========================================================

-- =========================================================
-- PASO 1: OBTENER LISTA DE TABLAS (Ejecutar primero)
-- =========================================================
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =========================================================
-- PASO 2: PARA CADA TABLA, EJECUTAR ESTAS CONSULTAS
-- Reemplazar 'NOMBRE_TABLA' con el nombre real de la tabla
-- =========================================================

-- 2.1. COLUMNAS DE UNA TABLA ESPECÍFICA
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo",
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN data_type || '(' || character_maximum_length || ')'
        WHEN numeric_precision IS NOT NULL 
        THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
        ELSE data_type
    END AS "Tipo Completo",
    CASE WHEN is_nullable = 'YES' THEN 'Sí' ELSE 'No' END AS "Permite NULL",
    column_default AS "Valor por Defecto"
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY ordinal_position;

-- 2.2. PRIMARY KEY DE UNA TABLA ESPECÍFICA
SELECT
    kcu.column_name AS "Columna PK"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY kcu.ordinal_position;

-- 2.3. FOREIGN KEYS DE UNA TABLA ESPECÍFICA
SELECT
    kcu.column_name AS "Columna",
    ccu.table_name AS "Tabla Referenciada",
    ccu.column_name AS "Columna Referenciada",
    rc.delete_rule AS "ON DELETE"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY kcu.column_name;

-- 2.4. UNIQUE CONSTRAINTS DE UNA TABLA ESPECÍFICA
SELECT
    kcu.column_name AS "Columna",
    tc.constraint_name AS "Nombre Constraint"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY kcu.column_name;

-- 2.5. ÍNDICES DE UNA TABLA ESPECÍFICA
SELECT
    indexname AS "Índice",
    indexdef AS "Definición"
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    AND indexname NOT LIKE '%_pkey'
ORDER BY indexname;

-- 2.6. RLS POLICIES DE UNA TABLA ESPECÍFICA
SELECT
    policyname AS "Nombre Policy",
    cmd AS "Comando",
    roles AS "Roles"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY policyname;

-- =========================================================
-- ALTERNATIVA: CONSULTA RÁPIDA DE TODAS LAS COLUMNAS
-- (Sin detalles, solo nombres y tipos básicos)
-- =========================================================
SELECT 
    table_name AS "Tabla",
    column_name AS "Columna",
    data_type AS "Tipo"
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position
LIMIT 500;  -- Limitar a 500 filas para evitar timeout

