-- =========================================================
-- CREAR TABLA PROVEEDORES
-- =========================================================
-- Tabla para gestionar proveedores con indicadores de deudas
-- =========================================================

-- Crear tabla proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id UUID DEFAULT gen_random_uuid(),
    comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    razon_social TEXT,
    cuit VARCHAR(13),
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    contacto_nombre TEXT,
    saldo_pendiente NUMERIC(12,2) DEFAULT 0,
    especificaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responsable_nombre TEXT
);

-- Agregar constraint único para nombre por comercio
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'proveedores_nombre_comercio_unique'
    ) THEN
        ALTER TABLE proveedores 
        ADD CONSTRAINT proveedores_nombre_comercio_unique 
        UNIQUE (comercio_id, nombre);
    END IF;
END $$;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_proveedores_comercio ON proveedores(comercio_id);
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(comercio_id, nombre);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(comercio_id, activo);

-- Comentarios
COMMENT ON TABLE proveedores IS 'Tabla de proveedores del sistema';
COMMENT ON COLUMN proveedores.saldo_pendiente IS 'Saldo pendiente de pago al proveedor (deuda)';
COMMENT ON COLUMN proveedores.especificaciones IS 'Información adicional sobre el proveedor (opcional)';
COMMENT ON COLUMN proveedores.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';

-- Habilitar RLS (Row Level Security)
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver proveedores de su comercio
CREATE POLICY "Los usuarios solo pueden ver proveedores de su comercio"
    ON proveedores
    FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden insertar proveedores en su comercio
CREATE POLICY "Los usuarios solo pueden insertar proveedores en su comercio"
    ON proveedores
    FOR INSERT
    WITH CHECK (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden actualizar proveedores de su comercio
CREATE POLICY "Los usuarios solo pueden actualizar proveedores de su comercio"
    ON proveedores
    FOR UPDATE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Política RLS: Los usuarios solo pueden eliminar proveedores de su comercio
CREATE POLICY "Los usuarios solo pueden eliminar proveedores de su comercio"
    ON proveedores
    FOR DELETE
    USING (
        comercio_id IN (
            SELECT comercio_id 
            FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

