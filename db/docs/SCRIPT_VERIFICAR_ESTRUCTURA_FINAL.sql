-- CONSULTA 3: PRIMARY KEYS
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

-- CONSULTA 4: FOREIGN KEYS
SELECT
    tc.table_name AS "Tabla Origen",
    kcu.column_name AS "Columna FK",
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
ORDER BY tc.table_name, kcu.column_name;

-- CONSULTA 5: UNIQUE CONSTRAINTS
SELECT
    tc.table_name AS "Tabla",
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS "Columnas",
    tc.constraint_name AS "Nombre Constraint"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- CONSULTA 6: INDICES
SELECT
    tablename AS "Tabla",
    indexname AS "Indice",
    indexdef AS "Definicion"
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- CONSULTA 7: VERIFICACION DE CAMPOS ESPECIFICOS
SELECT 
    t.table_name AS "Tabla",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'sync_id'
            AND c.table_schema = 'public'
        ) THEN 'Si' ELSE 'No'
    END AS "Tiene sync_id",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'created_at'
            AND c.table_schema = 'public'
        ) THEN 'Si' ELSE 'No'
    END AS "Tiene created_at",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'updated_at'
            AND c.table_schema = 'public'
        ) THEN 'Si' ELSE 'No'
    END AS "Tiene updated_at",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'comercio_id'
            AND c.table_schema = 'public'
        ) THEN 'Si' ELSE 'No'
    END AS "Tiene comercio_id",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns c
            WHERE c.table_name = t.table_name
            AND c.column_name = 'responsable_nombre'
            AND c.table_schema = 'public'
        ) THEN 'Si' ELSE 'No'
    END AS "Tiene responsable_nombre"
FROM information_schema.tables t
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

