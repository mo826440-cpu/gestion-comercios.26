-- =========================================================
-- AGREGAR CAMPOS FALTANTES A CATEGORIAS
-- =========================================================
-- Agrega los campos necesarios según promptVentanas.md:
-- - especificaciones (opcional)
-- - created_at (ya existe, pero lo verificamos)
-- - responsable_id o responsable_nombre (para auditoría)
-- =========================================================

-- Verificar si la columna especificaciones existe, si no, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categorias' AND column_name = 'especificaciones'
    ) THEN
        ALTER TABLE categorias ADD COLUMN especificaciones TEXT;
        COMMENT ON COLUMN categorias.especificaciones IS 'Especificaciones adicionales de la categoría (opcional)';
    END IF;
END $$;

-- Verificar si la columna created_at existe, si no, agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categorias' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE categorias ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Agregar columna para responsable (nombre del usuario que creó/modificó)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categorias' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE categorias ADD COLUMN responsable_nombre TEXT;
        COMMENT ON COLUMN categorias.responsable_nombre IS 'Nombre del usuario responsable del registro o última modificación';
    END IF;
END $$;

-- Agregar índice para búsquedas por nombre (si no existe)
CREATE INDEX IF NOT EXISTS idx_categorias_nombre ON categorias(comercio_id, nombre);

-- Agregar constraint único para nombre por comercio (evitar duplicados)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'categorias_nombre_comercio_unique'
    ) THEN
        ALTER TABLE categorias 
        ADD CONSTRAINT categorias_nombre_comercio_unique 
        UNIQUE (comercio_id, nombre);
    END IF;
END $$;

