-- =========================================================
-- ACTUALIZAR TABLAS DE VENTAS
-- =========================================================
-- Agregar campos faltantes y crear tabla de pagos
-- =========================================================

-- =========================================================
-- ACTUALIZAR TABLA VENTAS
-- =========================================================

-- Agregar columna facturacion
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'facturacion'
    ) THEN
        ALTER TABLE ventas ADD COLUMN facturacion TEXT DEFAULT 'No Aplica';
        COMMENT ON COLUMN ventas.facturacion IS 'Número de facturación (opcional)';
    END IF;
END $$;

-- Agregar columna monto_pagado
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'monto_pagado'
    ) THEN
        ALTER TABLE ventas ADD COLUMN monto_pagado NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN ventas.monto_pagado IS 'Monto total pagado por el cliente';
    END IF;
END $$;

-- Agregar columna monto_deuda
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'monto_deuda'
    ) THEN
        ALTER TABLE ventas ADD COLUMN monto_deuda NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN ventas.monto_deuda IS 'Monto que queda debiendo el cliente';
    END IF;
END $$;

-- Agregar columna responsable_nombre
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE ventas ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN ventas.responsable_nombre IS 'Nombre del usuario responsable del registro';
    END IF;
END $$;

-- Agregar columna updated_at si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE ventas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        COMMENT ON COLUMN ventas.updated_at IS 'Fecha de última actualización';
    END IF;
END $$;

-- Actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS set_ventas_updated_at ON ventas;
DROP FUNCTION IF EXISTS set_ventas_updated_at();

CREATE OR REPLACE FUNCTION set_ventas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ventas_updated_at
BEFORE UPDATE ON ventas
FOR EACH ROW
EXECUTE FUNCTION set_ventas_updated_at();

-- =========================================================
-- ACTUALIZAR TABLA DETALLE_VENTAS
-- =========================================================

-- Agregar columna codigo_barra si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'codigo_barra'
    ) THEN
        ALTER TABLE detalle_ventas ADD COLUMN codigo_barra TEXT;
        COMMENT ON COLUMN detalle_ventas.codigo_barra IS 'Código de barras del producto vendido';
    END IF;
END $$;

-- Agregar columna nombre_producto si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'nombre_producto'
    ) THEN
        ALTER TABLE detalle_ventas ADD COLUMN nombre_producto TEXT;
        COMMENT ON COLUMN detalle_ventas.nombre_producto IS 'Nombre del producto vendido';
    END IF;
END $$;

-- Agregar columna precio_unitario si no existe (puede que se llame precio)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'precio_unitario'
    ) THEN
        -- Si existe 'precio', renombrarlo a 'precio_unitario'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'detalle_ventas' AND column_name = 'precio'
        ) THEN
            ALTER TABLE detalle_ventas RENAME COLUMN precio TO precio_unitario;
        ELSE
            ALTER TABLE detalle_ventas ADD COLUMN precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0;
        END IF;
        COMMENT ON COLUMN detalle_ventas.precio_unitario IS 'Precio unitario del producto';
    END IF;
END $$;

-- Agregar columna subtotal si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE detalle_ventas ADD COLUMN subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
        COMMENT ON COLUMN detalle_ventas.subtotal IS 'Subtotal del producto (cantidad * precio_unitario)';
    END IF;
END $$;

-- Agregar columna descuento si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'descuento'
    ) THEN
        ALTER TABLE detalle_ventas ADD COLUMN descuento NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN detalle_ventas.descuento IS 'Descuento aplicado al producto (en porcentaje o monto)';
    END IF;
END $$;

-- Agregar columna sync_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'detalle_ventas' AND column_name = 'sync_id'
    ) THEN
        ALTER TABLE detalle_ventas ADD COLUMN sync_id UUID DEFAULT gen_random_uuid();
        COMMENT ON COLUMN detalle_ventas.sync_id IS 'ID para sincronización';
    END IF;
END $$;

-- =========================================================
-- CREAR TABLA PAGOS_VENTAS
-- =========================================================
CREATE TABLE IF NOT EXISTS pagos_ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID NOT NULL DEFAULT gen_random_uuid(),
    venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
    forma_pago TEXT NOT NULL DEFAULT 'efectivo', -- efectivo, transferencia, QR, debito, credito, cheque, otro
    monto NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_pago TIMESTAMPTZ DEFAULT NOW(),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_ventas_venta ON pagos_ventas(venta_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Habilitar RLS para ventas si no está habilitado
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_ventas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ventas
DROP POLICY IF EXISTS "Los usuarios solo pueden ver ventas de su comercio" ON ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar ventas en su comercio" ON ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar ventas de su comercio" ON ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar ventas de su comercio" ON ventas;

CREATE POLICY "Los usuarios solo pueden ver ventas de su comercio"
    ON ventas FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar ventas en su comercio"
    ON ventas FOR INSERT
    WITH CHECK (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar ventas de su comercio"
    ON ventas FOR UPDATE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar ventas de su comercio"
    ON ventas FOR DELETE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas RLS para detalle_ventas
DROP POLICY IF EXISTS "Los usuarios solo pueden ver detalle_ventas de su comercio" ON detalle_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar detalle_ventas en su comercio" ON detalle_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar detalle_ventas de su comercio" ON detalle_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar detalle_ventas de su comercio" ON detalle_ventas;

CREATE POLICY "Los usuarios solo pueden ver detalle_ventas de su comercio"
    ON detalle_ventas FOR SELECT
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar detalle_ventas en su comercio"
    ON detalle_ventas FOR INSERT
    WITH CHECK (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar detalle_ventas de su comercio"
    ON detalle_ventas FOR UPDATE
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar detalle_ventas de su comercio"
    ON detalle_ventas FOR DELETE
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Políticas RLS para pagos_ventas
DROP POLICY IF EXISTS "Los usuarios solo pueden ver pagos_ventas de su comercio" ON pagos_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar pagos_ventas en su comercio" ON pagos_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar pagos_ventas de su comercio" ON pagos_ventas;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar pagos_ventas de su comercio" ON pagos_ventas;

CREATE POLICY "Los usuarios solo pueden ver pagos_ventas de su comercio"
    ON pagos_ventas FOR SELECT
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar pagos_ventas en su comercio"
    ON pagos_ventas FOR INSERT
    WITH CHECK (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar pagos_ventas de su comercio"
    ON pagos_ventas FOR UPDATE
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar pagos_ventas de su comercio"
    ON pagos_ventas FOR DELETE
    USING (
        venta_id IN (
            SELECT id FROM ventas
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

