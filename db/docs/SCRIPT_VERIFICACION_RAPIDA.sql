-- =========================================================
-- SCRIPT DE VERIFICACIÓN RÁPIDA DE BASE DE DATOS
-- =========================================================
-- Ejecutar este script en SQL Editor de Supabase
-- para verificar si las tablas existen
-- =========================================================

-- Verificar existencia de tablas principales
SELECT 
    'comercios' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'comercios'
    ) THEN 'EXISTE' ELSE 'NO EXISTE' END as estado;

SELECT 
    'usuarios' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'usuarios'
    ) THEN 'EXISTE' ELSE 'NO EXISTE' END as estado;

SELECT 
    'productos' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'productos'
    ) THEN 'EXISTE' ELSE 'NO EXISTE' END as estado;

SELECT 
    'ventas' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ventas'
    ) THEN 'EXISTE' ELSE 'NO EXISTE' END as estado;

-- Contar total de tablas
SELECT 
    COUNT(*) as total_tablas,
    STRING_AGG(table_name, ', ' ORDER BY table_name) as lista_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

