-- =========================================================
-- CREAR TABLAS DE COMPRAS
-- =========================================================
-- Tablas para gestionar compras a proveedores
-- con detalle de productos y pagos
-- =========================================================

-- =========================================================
-- COMPRAS
-- =========================================================
CREATE TABLE IF NOT EXISTS compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID NOT NULL DEFAULT gen_random_uuid(),
    comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    facturacion TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW(),
    subtotal NUMERIC(12,2) DEFAULT 0,
    descuento NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_pagado NUMERIC(12,2) DEFAULT 0,
    monto_deuda NUMERIC(12,2) DEFAULT 0,
    estado TEXT DEFAULT 'pendiente', -- pendiente, pagada, parcial
    observaciones TEXT,
    responsable_nombre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_comercio ON compras(comercio_id);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);

-- =========================================================
-- DETALLE_COMPRAS
-- =========================================================
CREATE TABLE IF NOT EXISTS detalle_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID NOT NULL DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES compras(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    codigo_barra TEXT,
    nombre_producto TEXT NOT NULL,
    cantidad NUMERIC(12,2) NOT NULL DEFAULT 0,
    precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX IF NOT EXISTS idx_detalle_compras_producto ON detalle_compras(producto_id);

-- =========================================================
-- PAGOS_COMPRAS
-- =========================================================
CREATE TABLE IF NOT EXISTS pagos_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID NOT NULL DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES compras(id) ON DELETE CASCADE,
    forma_pago TEXT NOT NULL DEFAULT 'efectivo', -- efectivo, transferencia, QR, debito, credito, cheque, otro
    monto NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_pago TIMESTAMPTZ DEFAULT NOW(),
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagos_compras_compra ON pagos_compras(compra_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================

-- Habilitar RLS
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_compras ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para compras
DROP POLICY IF EXISTS "Los usuarios solo pueden ver compras de su comercio" ON compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar compras en su comercio" ON compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar compras de su comercio" ON compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar compras de su comercio" ON compras;

CREATE POLICY "Los usuarios solo pueden ver compras de su comercio"
    ON compras FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar compras en su comercio"
    ON compras FOR INSERT
    WITH CHECK (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar compras de su comercio"
    ON compras FOR UPDATE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar compras de su comercio"
    ON compras FOR DELETE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Políticas RLS para detalle_compras (heredan del comercio a través de compras)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver detalle_compras de su comercio" ON detalle_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar detalle_compras en su comercio" ON detalle_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar detalle_compras de su comercio" ON detalle_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar detalle_compras de su comercio" ON detalle_compras;

CREATE POLICY "Los usuarios solo pueden ver detalle_compras de su comercio"
    ON detalle_compras FOR SELECT
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar detalle_compras en su comercio"
    ON detalle_compras FOR INSERT
    WITH CHECK (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar detalle_compras de su comercio"
    ON detalle_compras FOR UPDATE
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar detalle_compras de su comercio"
    ON detalle_compras FOR DELETE
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Políticas RLS para pagos_compras (heredan del comercio a través de compras)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver pagos_compras de su comercio" ON pagos_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar pagos_compras en su comercio" ON pagos_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar pagos_compras de su comercio" ON pagos_compras;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar pagos_compras de su comercio" ON pagos_compras;

CREATE POLICY "Los usuarios solo pueden ver pagos_compras de su comercio"
    ON pagos_compras FOR SELECT
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden insertar pagos_compras en su comercio"
    ON pagos_compras FOR INSERT
    WITH CHECK (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden actualizar pagos_compras de su comercio"
    ON pagos_compras FOR UPDATE
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Los usuarios solo pueden eliminar pagos_compras de su comercio"
    ON pagos_compras FOR DELETE
    USING (
        compra_id IN (
            SELECT id FROM compras
            WHERE comercio_id IN (
                SELECT comercio_id 
                FROM usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

