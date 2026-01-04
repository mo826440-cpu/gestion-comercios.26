-- ========================================
-- SCRIPT: Crear Usuario Programador
-- ========================================
-- Este script crea el rol y usuario "programador"
-- que tiene acceso exclusivo al panel de mantenimiento.
--
-- ⚠️ IMPORTANTE:
-- - El usuario programador NO se puede crear desde la app
-- - Solo existe si fue creado manualmente con este script
-- - NO se sincroniza con IndexedDB
-- - Tiene acceso total al sistema
-- ========================================

-- ========================================
-- PASO 1: Crear el rol "programador" si no existe
-- ========================================
INSERT INTO roles (nombre, descripcion, activo)
SELECT 'programador', 'Acceso técnico y de mantenimiento del sistema', true
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'programador'
);

-- ========================================
-- PASO 2: Asignar TODOS los permisos al rol programador
-- ========================================
-- Primero obtener el ID del rol programador
DO $$
DECLARE
    rol_prog_id UUID;
BEGIN
    -- Obtener ID del rol programador
    SELECT id INTO rol_prog_id FROM roles WHERE nombre = 'programador';
    
    -- Insertar todos los permisos para el programador
    INSERT INTO roles_permisos (rol_id, permiso_id)
    SELECT rol_prog_id, p.id
    FROM permisos p
    WHERE NOT EXISTS (
        SELECT 1 FROM roles_permisos rp 
        WHERE rp.rol_id = rol_prog_id AND rp.permiso_id = p.id
    );
    
    RAISE NOTICE 'Permisos asignados al rol programador';
END $$;

-- ========================================
-- PASO 3: Crear usuario programador en auth.users
-- ========================================
-- ⚠️ ESTE PASO SE HACE DESDE SUPABASE DASHBOARD:
-- 1. Ir a Authentication > Users
-- 2. Click en "Add user"
-- 3. Ingresar email y contraseña del programador
-- 4. El usuario se creará automáticamente
-- 5. Copiar el UUID del usuario creado

-- ========================================
-- PASO 4: Vincular usuario programador a la tabla usuarios
-- ========================================
-- Reemplazar los valores según corresponda:
-- - AUTH_USER_ID: UUID del usuario creado en auth.users
-- - EMAIL: Email del programador

/*
INSERT INTO usuarios (
    auth_user_id,
    comercio_id,
    rol_id,
    nombre,
    email,
    es_propietario,
    activo
)
SELECT 
    'AUTH_USER_ID_AQUI'::uuid,
    NULL,  -- El programador no pertenece a ningún comercio específico
    (SELECT id FROM roles WHERE nombre = 'programador'),
    'Programador Sistema',
    'EMAIL_AQUI',
    false,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'EMAIL_AQUI'
);
*/

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Verificar que el rol existe
SELECT 'ROL PROGRAMADOR:' as info, id, nombre, descripcion FROM roles WHERE nombre = 'programador';

-- Verificar permisos asignados
SELECT 'PERMISOS DEL PROGRAMADOR:' as info, COUNT(*) as total_permisos 
FROM roles_permisos rp
JOIN roles r ON r.id = rp.rol_id
WHERE r.nombre = 'programador';

-- ========================================
-- NOTAS DE SEGURIDAD
-- ========================================
-- 1. El email y contraseña del programador deben ser seguros
-- 2. No compartir las credenciales
-- 3. El programador tiene acceso total al sistema
-- 4. Considerar usar autenticación de 2 factores
-- 5. Rotar las credenciales periódicamente


