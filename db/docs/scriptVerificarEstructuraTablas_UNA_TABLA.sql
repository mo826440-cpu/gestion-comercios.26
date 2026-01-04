-- =========================================================
-- SCRIPT ULTRA SIMPLE - UNA TABLA A LA VEZ
-- =========================================================
-- Ejecutar ESTA consulta primero para obtener la lista de tablas
-- Luego ejecutar las consultas siguientes para CADA tabla
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
-- PASO 2: PARA CADA TABLA, ejecutar estas 4 consultas
-- Reemplazar 'NOMBRE_TABLA' con el nombre real
-- =========================================================

-- 2.1. COLUMNAS (MUY SIMPLE)
SELECT 
    column_name AS "Columna",
    data_type AS "Tipo"
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
ORDER BY ordinal_position;

-- 2.2. PRIMARY KEY (MUY SIMPLE)
SELECT column_name AS "Columna PK"
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
    AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    AND constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY'
        AND table_schema = 'public'
        AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    );

-- 2.3. FOREIGN KEYS (MUY SIMPLE)
SELECT
    column_name AS "Columna FK",
    constraint_name AS "Nombre FK"
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
    AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    AND constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
        AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    );

-- 2.4. VERIFICAR CAMPOS ESPECÍFICOS (MUY SIMPLE)
SELECT 
    column_name AS "Campo",
    data_type AS "Tipo"
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'NOMBRE_TABLA'  -- CAMBIAR AQUÍ
    AND column_name IN ('sync_id', 'created_at', 'updated_at', 'comercio_id', 'activo', 'responsable_nombre')
ORDER BY column_name;

