-- =========================================================
-- ACTUALIZAR TABLA CLIENTES
-- =========================================================
-- Agregar campos faltantes para gestión completa de clientes
-- con indicadores de deudas
-- =========================================================

-- Agregar columna saldo_pendiente (deuda del cliente)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'saldo_pendiente'
    ) THEN
        ALTER TABLE clientes ADD COLUMN saldo_pendiente NUMERIC(12,2) DEFAULT 0;
        COMMENT ON COLUMN clientes.saldo_pendiente IS 'Saldo pendiente de cobro al cliente (deuda a favor del comercio)';
    END IF;
END $$;

-- Agregar columna especificaciones
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'especificaciones'
    ) THEN
        ALTER TABLE clientes ADD COLUMN especificaciones TEXT;
        COMMENT ON COLUMN clientes.especificaciones IS 'Información adicional sobre el cliente (opcional)';
    END IF;
END $$;

-- Agregar columna responsable_nombre
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE clientes ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN clientes.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';
    END IF;
END $$;

-- Verificar que created_at existe (ya debería existir según los scripts)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE clientes ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Agregar índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(comercio_id, nombre);

-- Agregar constraint único para nombre por comercio (opcional, si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'clientes_nombre_comercio_unique'
    ) THEN
        ALTER TABLE clientes 
        ADD CONSTRAINT clientes_nombre_comercio_unique 
        UNIQUE (comercio_id, nombre);
    END IF;
END $$;

-- Verificar que RLS está habilitado
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas RLS existentes si las hay (para recrearlas correctamente)
DROP POLICY IF EXISTS "Los usuarios solo pueden ver clientes de su comercio" ON clientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden insertar clientes en su comercio" ON clientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden actualizar clientes de su comercio" ON clientes;
DROP POLICY IF EXISTS "Los usuarios solo pueden eliminar clientes de su comercio" ON clientes;

-- Política RLS: Los usuarios solo pueden ver clientes de su comercio
CREATE POLICY "Los usuarios solo pueden ver clientes de su comercio"
    ON clientes
    FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden insertar clientes en su comercio
CREATE POLICY "Los usuarios solo pueden insertar clientes en su comercio"
    ON clientes
    FOR INSERT
    WITH CHECK (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden actualizar clientes de su comercio
CREATE POLICY "Los usuarios solo pueden actualizar clientes de su comercio"
    ON clientes
    FOR UPDATE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden eliminar clientes de su comercio
CREATE POLICY "Los usuarios solo pueden eliminar clientes de su comercio"
    ON clientes
    FOR DELETE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

