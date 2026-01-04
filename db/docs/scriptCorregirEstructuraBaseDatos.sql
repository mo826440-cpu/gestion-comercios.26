-- =========================================================
-- SCRIPT DE CORRECCIÓN DE ESTRUCTURA DE BASE DE DATOS
-- =========================================================
-- Este script corrige los problemas identificados en la
-- estructura de la base de datos para que coincida con
-- el código del proyecto AdminisGo.
-- =========================================================

-- =========================================================
-- 1. CORREGIR detalle_ventas - Campos de descuento
-- =========================================================

-- Eliminar columna descuento si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' 
        AND column_name = 'descuento'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE detalle_ventas DROP COLUMN descuento;
        RAISE NOTICE 'Columna descuento eliminada de detalle_ventas';
    END IF;
END $$;

-- Agregar descuento_porcentaje si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' 
        AND column_name = 'descuento_porcentaje'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE detalle_ventas 
        ADD COLUMN descuento_porcentaje NUMERIC(5,2) DEFAULT 0;
        COMMENT ON COLUMN detalle_ventas.descuento_porcentaje IS 'Descuento aplicado al producto (en porcentaje)';
        RAISE NOTICE 'Columna descuento_porcentaje agregada a detalle_ventas';
    END IF;
END $$;

-- Agregar descuento_monto si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' 
        AND column_name = 'descuento_monto'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE detalle_ventas 
        ADD COLUMN descuento_monto NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN detalle_ventas.descuento_monto IS 'Monto de descuento aplicado al producto';
        RAISE NOTICE 'Columna descuento_monto agregada a detalle_ventas';
    END IF;
END $$;

-- =========================================================
-- 2. ELIMINAR campo metodo_pago de ventas
-- =========================================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' 
        AND column_name = 'metodo_pago'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE ventas DROP COLUMN metodo_pago;
        RAISE NOTICE 'Columna metodo_pago eliminada de ventas (los pagos se manejan en pagos_ventas)';
    END IF;
END $$;

-- =========================================================
-- 3. AGREGAR sync_id a stock
-- =========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stock' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE stock 
        ADD COLUMN sync_id UUID DEFAULT gen_random_uuid();
        COMMENT ON COLUMN stock.sync_id IS 'ID para sincronización offline-first';
        RAISE NOTICE 'Columna sync_id agregada a stock';
    END IF;
END $$;

-- =========================================================
-- 4. AGREGAR sync_id a configuraciones
-- =========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'configuraciones' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE configuraciones 
        ADD COLUMN sync_id UUID DEFAULT gen_random_uuid();
        COMMENT ON COLUMN configuraciones.sync_id IS 'ID para sincronización offline-first';
        RAISE NOTICE 'Columna sync_id agregada a configuraciones';
    END IF;
END $$;

-- =========================================================
-- 5. AGREGAR sync_id a usuarios
-- =========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE usuarios 
        ADD COLUMN sync_id UUID DEFAULT gen_random_uuid();
        COMMENT ON COLUMN usuarios.sync_id IS 'ID para sincronización offline-first';
        RAISE NOTICE 'Columna sync_id agregada a usuarios';
    END IF;
END $$;

-- =========================================================
-- 6. AGREGAR responsable_nombre a usuarios
-- =========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'responsable_nombre'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE usuarios 
        ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN usuarios.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';
        RAISE NOTICE 'Columna responsable_nombre agregada a usuarios';
    END IF;
END $$;

-- =========================================================
-- 7. AGREGAR updated_at a cajas (opcional pero recomendado)
-- =========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cajas' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE cajas 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        COMMENT ON COLUMN cajas.updated_at IS 'Fecha de última actualización';
        RAISE NOTICE 'Columna updated_at agregada a cajas';
    END IF;
END $$;

-- =========================================================
-- 8. VERIFICAR que detalle_ventas.sync_id tenga default
-- =========================================================

DO $$ 
BEGIN
    -- Si sync_id existe pero no tiene default, agregarlo
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' 
        AND column_name = 'sync_id'
        AND table_schema = 'public'
        AND column_default IS NULL
    ) THEN
        ALTER TABLE detalle_ventas 
        ALTER COLUMN sync_id SET DEFAULT gen_random_uuid();
        RAISE NOTICE 'Default agregado a sync_id en detalle_ventas';
    END IF;
END $$;

-- =========================================================
-- RESUMEN DE CAMBIOS
-- =========================================================

SELECT 
    'Correcciones aplicadas exitosamente' AS mensaje,
    'detalle_ventas: descuento_porcentaje y descuento_monto agregados' AS cambio1,
    'ventas: metodo_pago eliminado' AS cambio2,
    'stock: sync_id agregado' AS cambio3,
    'configuraciones: sync_id agregado' AS cambio4,
    'usuarios: sync_id y responsable_nombre agregados' AS cambio5,
    'cajas: updated_at agregado' AS cambio6;

