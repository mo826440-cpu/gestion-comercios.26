-- ========================================
-- SCRIPT: Agregar columnas faltantes a COMERCIOS
-- Sistema de Gestión de Kioscos
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- Agregar columnas faltantes para la pantalla de Configuración
ALTER TABLE comercios 
    ADD COLUMN IF NOT EXISTS nombre_fantasia VARCHAR(255),
    ADD COLUMN IF NOT EXISTS condicion_iva VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100),
    ADD COLUMN IF NOT EXISTS provincia VARCHAR(100),
    ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10),
    ADD COLUMN IF NOT EXISTS sitio_web VARCHAR(255);

-- Comentarios para documentación
COMMENT ON COLUMN comercios.nombre_fantasia IS 'Nombre comercial o nombre fantasia del comercio';
COMMENT ON COLUMN comercios.condicion_iva IS 'Condición frente al IVA (Responsable Inscripto, Monotributo, etc.)';
COMMENT ON COLUMN comercios.ciudad IS 'Ciudad donde se encuentra el comercio';
COMMENT ON COLUMN comercios.provincia IS 'Provincia donde se encuentra el comercio';
COMMENT ON COLUMN comercios.codigo_postal IS 'Código postal del comercio';
COMMENT ON COLUMN comercios.sitio_web IS 'Sitio web del comercio (URL)';

-- Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'comercios'
ORDER BY ordinal_position;

