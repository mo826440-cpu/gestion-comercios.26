-- =========================================================
-- ACTUALIZAR TABLA PRODUCTOS
-- =========================================================
-- Agregar campos faltantes para gestión completa de productos
-- con código de barras, stock, categorías y marcas
-- =========================================================

-- Agregar columna especificaciones
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'especificaciones'
    ) THEN
        ALTER TABLE productos ADD COLUMN especificaciones TEXT;
        COMMENT ON COLUMN productos.especificaciones IS 'Información adicional sobre el producto (opcional)';
    END IF;
END $$;

-- Agregar columna responsable_nombre
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE productos ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN productos.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';
    END IF;
END $$;

-- Verificar que precio_costo existe (agregar si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'precio_costo'
    ) THEN
        ALTER TABLE productos ADD COLUMN precio_costo NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN productos.precio_costo IS 'Precio de costo del producto';
    END IF;
END $$;

-- Verificar que descripcion existe (agregar si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'descripcion'
    ) THEN
        ALTER TABLE productos ADD COLUMN descripcion TEXT;
        COMMENT ON COLUMN productos.descripcion IS 'Descripción detallada del producto';
    END IF;
END $$;

-- Agregar índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(comercio_id, nombre);

-- Agregar constraint único para código de barras por comercio (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'productos_codigo_barra_comercio_unique'
    ) THEN
        -- Solo crear el constraint si no hay códigos de barras duplicados
        IF NOT EXISTS (
            SELECT 1 FROM productos 
            WHERE codigo_barra IS NOT NULL 
            GROUP BY comercio_id, codigo_barra 
            HAVING COUNT(*) > 1
        ) THEN
            ALTER TABLE productos 
            ADD CONSTRAINT productos_codigo_barra_comercio_unique 
            UNIQUE (comercio_id, codigo_barra);
        END IF;
    END IF;
END $$;

-- Agregar constraint único para nombre por comercio (opcional, si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'productos_nombre_comercio_unique'
    ) THEN
        -- Solo crear el constraint si no hay nombres duplicados
        IF NOT EXISTS (
            SELECT 1 FROM productos 
            GROUP BY comercio_id, nombre 
            HAVING COUNT(*) > 1
        ) THEN
            ALTER TABLE productos 
            ADD CONSTRAINT productos_nombre_comercio_unique 
            UNIQUE (comercio_id, nombre);
        END IF;
    END IF;
END $$;

-- Verificar que RLS está habilitado
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS existentes si las hay (para recrearlas correctamente)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver productos de su comercio" ON productos;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar productos en su comercio" ON productos;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar productos de su comercio" ON productos;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar productos de su comercio" ON productos;

-- Política RLS: Los usuarios solo pueden ver productos de su comercio
CREATE POLICY "Los usuarios solo pueden ver productos de su comercio"
    ON productos
    FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden insertar productos en su comercio
CREATE POLICY "Los usuarios solo pueden insertar productos en su comercio"
    ON productos
    FOR INSERT
    WITH CHECK (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden actualizar productos de su comercio
CREATE POLICY "Los usuarios solo pueden actualizar productos de su comercio"
    ON productos
    FOR UPDATE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden eliminar productos de su comercio
CREATE POLICY "Los usuarios solo pueden eliminar productos de su comercio"
    ON productos
    FOR DELETE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

