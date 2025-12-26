-- ========================================
-- SCRIPT: Crear tabla CONFIGURACIONES
-- Sistema de Gestión de Kioscos
-- ========================================
-- Ejecutar en Supabase SQL Editor
-- ========================================

-- ========================================
-- 1. CREAR TABLA CONFIGURACIONES
-- ========================================

CREATE TABLE IF NOT EXISTS configuraciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL, -- 'ventas', 'stock', 'impresion', 'aplicacion'
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Restricción única: una sola configuración por comercio/categoria/clave
    UNIQUE(comercio_id, categoria, clave)
);

-- Comentarios
COMMENT ON TABLE configuraciones IS 'Configuraciones del sistema por comercio';
COMMENT ON COLUMN configuraciones.categoria IS 'Categoría: ventas, stock, impresion, aplicacion';
COMMENT ON COLUMN configuraciones.tipo IS 'Tipo de dato: string, number, boolean, json';

-- ========================================
-- 2. ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_config_comercio ON configuraciones(comercio_id);
CREATE INDEX IF NOT EXISTS idx_config_categoria ON configuraciones(comercio_id, categoria);

-- ========================================
-- 3. TRIGGER PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_config_updated_at ON configuraciones;
CREATE TRIGGER trigger_config_updated_at
    BEFORE UPDATE ON configuraciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- ========================================
-- 4. NUEVOS PERMISOS PARA CONFIGURACIÓN
-- ========================================

-- Insertar nuevos permisos (ignorar si ya existen)
-- Usar INSERT ... ON CONFLICT para evitar duplicados
INSERT INTO permisos (codigo, descripcion, modulo) VALUES
    ('CONFIG_VER', 'Ver pantalla de configuración', 'configuracion'),
    ('CONFIG_EDITAR', 'Editar cualquier configuración', 'configuracion'),
    ('CONFIG_COMERCIO', 'Editar datos del comercio', 'configuracion'),
    ('CONFIG_VENTAS', 'Editar configuración de ventas', 'configuracion'),
    ('CONFIG_STOCK', 'Editar configuración de stock', 'configuracion'),
    ('CONFIG_IMPRESION', 'Editar configuración de impresión', 'configuracion')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que los permisos se crearon correctamente
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM permisos WHERE modulo = 'configuracion';
    IF v_count < 6 THEN
        RAISE WARNING 'Solo se encontraron % permisos de configuración. Esperado: 6', v_count;
    ELSE
        RAISE NOTICE '✅ Todos los permisos de configuración creados correctamente (total: %)', v_count;
    END IF;
END $$;

-- ========================================
-- 5. ASIGNAR PERMISOS A ROLES
-- ========================================

-- Asegurarse de que los permisos existan antes de asignarlos
DO $$
DECLARE
    v_config_ver UUID;
    v_config_editar UUID;
    v_config_comercio UUID;
    v_config_ventas UUID;
    v_config_stock UUID;
    v_config_impresion UUID;
BEGIN
    -- Verificar y obtener IDs de permisos (deben existir después del INSERT anterior)
    SELECT id INTO v_config_ver FROM permisos WHERE codigo = 'CONFIG_VER';
    SELECT id INTO v_config_editar FROM permisos WHERE codigo = 'CONFIG_EDITAR';
    SELECT id INTO v_config_comercio FROM permisos WHERE codigo = 'CONFIG_COMERCIO';
    SELECT id INTO v_config_ventas FROM permisos WHERE codigo = 'CONFIG_VENTAS';
    SELECT id INTO v_config_stock FROM permisos WHERE codigo = 'CONFIG_STOCK';
    SELECT id INTO v_config_impresion FROM permisos WHERE codigo = 'CONFIG_IMPRESION';
    
    -- Debug: mostrar qué permisos se encontraron
    RAISE NOTICE '🔍 Verificando permisos...';
    RAISE NOTICE '  CONFIG_VER: %', COALESCE(v_config_ver::TEXT, 'NULL');
    RAISE NOTICE '  CONFIG_EDITAR: %', COALESCE(v_config_editar::TEXT, 'NULL');
    RAISE NOTICE '  CONFIG_COMERCIO: %', COALESCE(v_config_comercio::TEXT, 'NULL');
    RAISE NOTICE '  CONFIG_VENTAS: %', COALESCE(v_config_ventas::TEXT, 'NULL');
    RAISE NOTICE '  CONFIG_STOCK: %', COALESCE(v_config_stock::TEXT, 'NULL');
    RAISE NOTICE '  CONFIG_IMPRESION: %', COALESCE(v_config_impresion::TEXT, 'NULL');
    
    -- Si algún permiso no existe, lanzar error con información útil
    IF v_config_ver IS NULL OR v_config_editar IS NULL OR v_config_comercio IS NULL 
       OR v_config_ventas IS NULL OR v_config_stock IS NULL OR v_config_impresion IS NULL THEN
        RAISE EXCEPTION '❌ Algunos permisos no se encontraron. Verifica que el INSERT de permisos (línea 63-70) se ejecutó correctamente. Ejecuta: SELECT * FROM permisos WHERE modulo = ''configuracion'';';
    END IF;
    
    RAISE NOTICE '✅ Todos los permisos encontrados correctamente';
END $$;

-- Ahora asignar permisos a roles
DO $$
DECLARE
    v_admin_id UUID;
    v_gerente_id UUID;
    v_programador_id UUID;
    v_config_ver UUID;
    v_config_editar UUID;
    v_config_comercio UUID;
    v_config_ventas UUID;
    v_config_stock UUID;
    v_config_impresion UUID;
BEGIN
    -- Obtener IDs de roles (pueden ser NULL si no existen)
    SELECT id INTO v_admin_id FROM roles WHERE nombre = 'administrador';
    SELECT id INTO v_gerente_id FROM roles WHERE nombre = 'encargado'; -- En tu BD se llama 'encargado', no 'gerente'
    SELECT id INTO v_programador_id FROM roles WHERE nombre = 'programador';
    
    -- Obtener IDs de permisos (ya validados en el bloque anterior)
    SELECT id INTO v_config_ver FROM permisos WHERE codigo = 'CONFIG_VER';
    SELECT id INTO v_config_editar FROM permisos WHERE codigo = 'CONFIG_EDITAR';
    SELECT id INTO v_config_comercio FROM permisos WHERE codigo = 'CONFIG_COMERCIO';
    SELECT id INTO v_config_ventas FROM permisos WHERE codigo = 'CONFIG_VENTAS';
    SELECT id INTO v_config_stock FROM permisos WHERE codigo = 'CONFIG_STOCK';
    SELECT id INTO v_config_impresion FROM permisos WHERE codigo = 'CONFIG_IMPRESION';
    
    -- ADMINISTRADOR: Todos los permisos de configuración
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
            (v_admin_id, v_config_ver),
            (v_admin_id, v_config_editar),
            (v_admin_id, v_config_comercio),
            (v_admin_id, v_config_ventas),
            (v_admin_id, v_config_stock),
            (v_admin_id, v_config_impresion)
        ON CONFLICT (rol_id, permiso_id) DO NOTHING;
        RAISE NOTICE '✅ Permisos asignados a administrador';
    ELSE
        RAISE NOTICE '⚠️ Rol administrador no encontrado - saltando';
    END IF;
    
    -- ENCARGADO: Ver + Ventas + Stock (limitado)
    IF v_gerente_id IS NOT NULL THEN
        INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
            (v_gerente_id, v_config_ver),
            (v_gerente_id, v_config_ventas),
            (v_gerente_id, v_config_stock)
        ON CONFLICT (rol_id, permiso_id) DO NOTHING;
        RAISE NOTICE '✅ Permisos asignados a encargado';
    ELSE
        RAISE NOTICE '⚠️ Rol encargado no encontrado - saltando';
    END IF;
    
    -- PROGRAMADOR: Todos los permisos (para debugging)
    IF v_programador_id IS NOT NULL THEN
        INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
            (v_programador_id, v_config_ver),
            (v_programador_id, v_config_editar),
            (v_programador_id, v_config_comercio),
            (v_programador_id, v_config_ventas),
            (v_programador_id, v_config_stock),
            (v_programador_id, v_config_impresion)
        ON CONFLICT (rol_id, permiso_id) DO NOTHING;
        RAISE NOTICE '✅ Permisos asignados a programador';
    ELSE
        RAISE NOTICE '⚠️ Rol programador no encontrado - saltando';
    END IF;
    
    RAISE NOTICE 'Proceso de asignación de permisos completado';
END $$;

-- ========================================
-- 6. FUNCIÓN PARA CREAR CONFIGURACIONES POR DEFECTO
-- ========================================

CREATE OR REPLACE FUNCTION crear_configuraciones_defecto(p_comercio_id UUID)
RETURNS void AS $$
BEGIN
    -- VENTAS
    INSERT INTO configuraciones (comercio_id, categoria, clave, valor, tipo) VALUES
        (p_comercio_id, 'ventas', 'iva_defecto', '21', 'number'),
        (p_comercio_id, 'ventas', 'iva_incluido', 'true', 'boolean'),
        (p_comercio_id, 'ventas', 'ventas_sin_stock', 'false', 'boolean'),
        (p_comercio_id, 'ventas', 'precios_personalizados', 'false', 'boolean'),
        (p_comercio_id, 'ventas', 'descuento_max', '10', 'number'),
        (p_comercio_id, 'ventas', 'redondeo', 'none', 'string'),
        (p_comercio_id, 'ventas', 'metodos_pago', '["efectivo","debito"]', 'json'),
        (p_comercio_id, 'ventas', 'requiere_cliente', 'false', 'boolean'),
        (p_comercio_id, 'ventas', 'ventas_credito', 'false', 'boolean')
    ON CONFLICT (comercio_id, categoria, clave) DO NOTHING;
    
    -- STOCK
    INSERT INTO configuraciones (comercio_id, categoria, clave, valor, tipo) VALUES
        (p_comercio_id, 'stock', 'control_activo', 'true', 'boolean'),
        (p_comercio_id, 'stock', 'stock_negativo', 'false', 'boolean'),
        (p_comercio_id, 'stock', 'alerta_stock_bajo', '5', 'number'),
        (p_comercio_id, 'stock', 'notificar_email', 'false', 'boolean'),
        (p_comercio_id, 'stock', 'email_notificaciones', '', 'string'),
        (p_comercio_id, 'stock', 'actualizacion_automatica', 'true', 'boolean'),
        (p_comercio_id, 'stock', 'mostrar_sin_stock', 'true', 'boolean')
    ON CONFLICT (comercio_id, categoria, clave) DO NOTHING;
    
    -- IMPRESION
    INSERT INTO configuraciones (comercio_id, categoria, clave, valor, tipo) VALUES
        (p_comercio_id, 'impresion', 'ancho_ticket', '80mm', 'string'),
        (p_comercio_id, 'impresion', 'mostrar_logo', 'true', 'boolean'),
        (p_comercio_id, 'impresion', 'encabezado', '', 'string'),
        (p_comercio_id, 'impresion', 'pie_ticket', '¡Gracias por su compra!', 'string'),
        (p_comercio_id, 'impresion', 'mostrar_iva', 'true', 'boolean'),
        (p_comercio_id, 'impresion', 'imprimir_auto', 'false', 'boolean'),
        (p_comercio_id, 'impresion', 'copias', '1', 'number'),
        (p_comercio_id, 'impresion', 'codigo_barras', 'false', 'boolean')
    ON CONFLICT (comercio_id, categoria, clave) DO NOTHING;
    
    -- APLICACION
    INSERT INTO configuraciones (comercio_id, categoria, clave, valor, tipo) VALUES
        (p_comercio_id, 'aplicacion', 'tema', 'system', 'string'),
        (p_comercio_id, 'aplicacion', 'color_principal', '#3498db', 'string'),
        (p_comercio_id, 'aplicacion', 'idioma', 'es-AR', 'string'),
        (p_comercio_id, 'aplicacion', 'zona_horaria', 'America/Argentina/Buenos_Aires', 'string'),
        (p_comercio_id, 'aplicacion', 'formato_fecha', 'DD/MM/YYYY', 'string'),
        (p_comercio_id, 'aplicacion', 'formato_hora', '24h', 'string'),
        (p_comercio_id, 'aplicacion', 'tiempo_inactividad', '30', 'number'),
        (p_comercio_id, 'aplicacion', 'sonidos', 'true', 'boolean'),
        (p_comercio_id, 'aplicacion', 'animaciones', 'true', 'boolean')
    ON CONFLICT (comercio_id, categoria, clave) DO NOTHING;
    
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. CREAR CONFIGURACIONES PARA COMERCIOS EXISTENTES
-- ========================================

DO $$
DECLARE
    v_comercio RECORD;
BEGIN
    FOR v_comercio IN SELECT id FROM comercios LOOP
        PERFORM crear_configuraciones_defecto(v_comercio.id);
        RAISE NOTICE 'Configuraciones creadas para comercio: %', v_comercio.id;
    END LOOP;
END $$;

-- ========================================
-- 8. RLS (Row Level Security)
-- ========================================

ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar configuraciones de su comercio
CREATE POLICY "Usuarios ven config de su comercio" ON configuraciones
    FOR SELECT
    USING (
        comercio_id IN (
            SELECT comercio_id FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Usuarios editan config de su comercio" ON configuraciones
    FOR ALL
    USING (
        comercio_id IN (
            SELECT comercio_id FROM usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- ========================================
-- 9. VERIFICACIÓN
-- ========================================

SELECT 'Tabla configuraciones creada' AS resultado;
SELECT COUNT(*) AS total_configuraciones FROM configuraciones;
SELECT COUNT(*) AS permisos_config FROM permisos WHERE modulo = 'configuracion';

