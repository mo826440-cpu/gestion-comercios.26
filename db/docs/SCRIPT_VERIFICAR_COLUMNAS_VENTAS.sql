-- =========================================================
-- SCRIPT PARA VERIFICAR NOMBRES DE COLUMNAS EN TABLA VENTAS
-- =========================================================
-- Este script verifica qué nombres de columnas tiene realmente
-- la tabla ventas en Supabase

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ventas'
    AND table_schema = 'public'
ORDER BY ordinal_position;

