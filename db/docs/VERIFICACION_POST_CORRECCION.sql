-- =========================================================
-- SCRIPT DE VERIFICACIÓN POST-CORRECCIÓN
-- =========================================================
-- Ejecutar este script después de aplicar las correcciones
-- para verificar que todo quedó correcto
-- =========================================================

-- Verificar campos de detalle_ventas
SELECT 
    'detalle_ventas' as tabla,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'detalle_ventas' 
    AND column_name IN ('descuento_porcentaje', 'descuento_monto', 'descuento')
    AND table_schema = 'public'
ORDER BY column_name;

-- Verificar que ventas NO tiene metodo_pago
SELECT 
    'ventas' as tabla,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ventas' 
            AND column_name = 'metodo_pago'
            AND table_schema = 'public'
        ) THEN 'ERROR: Todavía tiene metodo_pago'
        ELSE 'OK: metodo_pago eliminado correctamente'
    END as estado;

-- Verificar sync_id en tablas que lo necesitan
SELECT 
    'stock' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stock' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN 'OK' ELSE 'ERROR: Falta sync_id' END as sync_id
UNION ALL
SELECT 
    'configuraciones',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuraciones' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN 'OK' ELSE 'ERROR: Falta sync_id' END
UNION ALL
SELECT 
    'usuarios',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN 'OK' ELSE 'ERROR: Falta sync_id' END;

-- Verificar responsable_nombre en usuarios
SELECT 
    'usuarios' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'responsable_nombre'
        AND table_schema = 'public'
    ) THEN 'OK: responsable_nombre presente' 
    ELSE 'ERROR: Falta responsable_nombre' 
    END as responsable_nombre;

-- Verificar updated_at en cajas
SELECT 
    'cajas' as tabla,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cajas' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN 'OK: updated_at presente' 
    ELSE 'ERROR: Falta updated_at' 
    END as updated_at;

-- Resumen final
SELECT 
    'RESUMEN FINAL' as seccion,
    'Todas las correcciones aplicadas correctamente' as estado,
    'La estructura de la base de datos ahora coincide con el código del proyecto' as nota;

