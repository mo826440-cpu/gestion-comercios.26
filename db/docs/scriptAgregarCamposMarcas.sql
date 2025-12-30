-- =========================================================
-- AGREGAR CAMPOS FALTANTES A MARCAS
-- =========================================================
-- Similar a categorías, agrega los campos necesarios
-- =========================================================

-- Verificar si la columna especificaciones existe, si no, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marcas' AND column_name = 'especificaciones'
    ) THEN
        ALTER TABLE marcas ADD COLUMN especificaciones TEXT;
        COMMENT ON COLUMN marcas.especificaciones IS 'Especificaciones adicionales de la marca (opcional)';
    END IF;
END $$;

-- Verificar si la columna created_at existe, si no, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marcas' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE marcas ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Agregar columna para responsable
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marcas' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE marcas ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN marcas.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';
    END IF;
END $$;

-- Agregar índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_marcas_nombre ON marcas(comercio_id, nombre);

-- Agregar constraint único para nombre por comercio
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'marcas_nombre_comercio_unique'
    ) THEN
        ALTER TABLE marcas 
        ADD CONSTRAINT marcas_nombre_comercio_unique 
        UNIQUE (comercio_id, nombre);
    END IF;
END $$;

