-- =========================================================
-- SISTEMA DE GESTION DE KIOSCOS
-- SCRIPT LIMPIO - ELIMINA TODO Y CREA DESDE CERO
-- =========================================================
-- INSTRUCCIONES:
-- 1. Copiar TODO este script
-- 2. Ir a Supabase > SQL Editor
-- 3. Pegar y ejecutar (boton RUN)
-- =========================================================

-- =========================================================
-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- =========================================================
-- Eliminamos todas las tablas del esquema anterior y nuevo

DROP TABLE IF EXISTS logs_sistema CASCADE;
DROP TABLE IF EXISTS movimientos_stock CASCADE;
DROP TABLE IF EXISTS movimientos_caja CASCADE;
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS detalle_compras CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS cajas CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS existencias CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS marcas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS "categorías" CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS roles_permisos CASCADE;
DROP TABLE IF EXISTS permisos CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS comercios CASCADE;
DROP TABLE IF EXISTS "sistema de registros" CASCADE;
DROP TABLE IF EXISTS "acciones de los aficionados" CASCADE;

-- =========================================================
-- PASO 2: EXTENSION NECESARIA
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- PASO 3: CREAR TABLAS NUEVAS
-- =========================================================

-- ---------------------------------------------------------
-- COMERCIOS (TENANTS)
-- ---------------------------------------------------------
CREATE TABLE comercios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social TEXT NOT NULL,
  nombre_responsable TEXT,
  email TEXT UNIQUE,
  cuit VARCHAR(13),
  telefono VARCHAR(20),
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comercios_email ON comercios(email);

-- ---------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------
-- PERMISOS
-- ---------------------------------------------------------
CREATE TABLE permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  modulo TEXT
);

-- ---------------------------------------------------------
-- ROLES_PERMISOS (relacion muchos a muchos)
-- ---------------------------------------------------------
CREATE TABLE roles_permisos (
  rol_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permiso_id UUID REFERENCES permisos(id) ON DELETE CASCADE,
  PRIMARY KEY (rol_id, permiso_id)
);

-- ---------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID,
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  rol_id UUID REFERENCES roles(id),
  nombre TEXT,
  email TEXT,
  activo BOOLEAN DEFAULT TRUE,
  es_propietario BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usuarios_comercio ON usuarios(comercio_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ---------------------------------------------------------
-- CATEGORIAS
-- ---------------------------------------------------------
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categorias_comercio ON categorias(comercio_id);

-- ---------------------------------------------------------
-- MARCAS
-- ---------------------------------------------------------
CREATE TABLE marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marcas_comercio ON marcas(comercio_id);

-- ---------------------------------------------------------
-- PRODUCTOS
-- ---------------------------------------------------------
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
  codigo_barra TEXT,
  precio_costo NUMERIC(12,2) DEFAULT 0,
  precio_venta NUMERIC(12,2) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_productos_comercio ON productos(comercio_id);
CREATE INDEX idx_productos_codigo ON productos(codigo_barra);

-- ---------------------------------------------------------
-- CLIENTES
-- ---------------------------------------------------------
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  documento TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clientes_comercio ON clientes(comercio_id);

-- ---------------------------------------------------------
-- STOCK
-- ---------------------------------------------------------
CREATE TABLE stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  cantidad NUMERIC(12,2) DEFAULT 0,
  stock_minimo NUMERIC(12,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_producto ON stock(producto_id);
CREATE INDEX idx_stock_comercio ON stock(comercio_id);

-- ---------------------------------------------------------
-- CAJAS
-- ---------------------------------------------------------
CREATE TABLE cajas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  usuario_apertura_id UUID REFERENCES usuarios(id),
  usuario_cierre_id UUID REFERENCES usuarios(id),
  monto_inicial NUMERIC(12,2) DEFAULT 0,
  monto_cierre NUMERIC(12,2),
  fecha_apertura TIMESTAMPTZ DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  estado TEXT DEFAULT 'abierta',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cajas_comercio ON cajas(comercio_id);

-- ---------------------------------------------------------
-- VENTAS
-- ---------------------------------------------------------
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  caja_id UUID REFERENCES cajas(id),
  usuario_id UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES clientes(id),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  subtotal NUMERIC(12,2) DEFAULT 0,
  descuento NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  metodo_pago TEXT DEFAULT 'efectivo',
  estado TEXT DEFAULT 'completada',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ventas_comercio ON ventas(comercio_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);

-- ---------------------------------------------------------
-- DETALLE_VENTAS
-- ---------------------------------------------------------
CREATE TABLE detalle_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  nombre_producto TEXT,
  cantidad NUMERIC(10,2) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_detalle_venta ON detalle_ventas(venta_id);

-- ---------------------------------------------------------
-- MOVIMIENTOS_STOCK
-- ---------------------------------------------------------
CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT NOT NULL,
  cantidad NUMERIC(12,2) NOT NULL,
  cantidad_anterior NUMERIC(12,2),
  cantidad_nueva NUMERIC(12,2),
  motivo TEXT,
  referencia_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_movimientos_producto ON movimientos_stock(producto_id);

-- ---------------------------------------------------------
-- LOGS_SISTEMA
-- ---------------------------------------------------------
CREATE TABLE logs_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comercio_id UUID REFERENCES comercios(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id),
  tipo TEXT,
  accion TEXT,
  mensaje TEXT,
  datos JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_comercio ON logs_sistema(comercio_id);
CREATE INDEX idx_logs_fecha ON logs_sistema(created_at);

-- =========================================================
-- PASO 4: INSERTAR DATOS INICIALES
-- =========================================================

-- Roles basicos
INSERT INTO roles (nombre, descripcion) VALUES
  ('administrador', 'Acceso total al sistema'),
  ('encargado', 'Gestion de ventas, productos y reportes'),
  ('vendedor', 'Solo puede realizar ventas');

-- Permisos del sistema
INSERT INTO permisos (codigo, descripcion, modulo) VALUES
  ('vender', 'Realizar ventas', 'ventas'),
  ('anular_venta', 'Anular ventas', 'ventas'),
  ('ver_ventas', 'Ver historial de ventas', 'ventas'),
  ('crear_producto', 'Crear productos', 'productos'),
  ('editar_producto', 'Editar productos', 'productos'),
  ('eliminar_producto', 'Eliminar productos', 'productos'),
  ('ver_productos', 'Ver catalogo de productos', 'productos'),
  ('ver_stock', 'Ver stock', 'stock'),
  ('ajustar_stock', 'Ajustar stock manualmente', 'stock'),
  ('abrir_caja', 'Abrir caja', 'caja'),
  ('cerrar_caja', 'Cerrar caja', 'caja'),
  ('ver_caja', 'Ver estado de caja', 'caja'),
  ('ver_reportes', 'Ver reportes', 'reportes'),
  ('exportar_reportes', 'Exportar reportes', 'reportes'),
  ('configurar_comercio', 'Configurar datos del comercio', 'configuracion'),
  ('gestionar_usuarios', 'Gestionar usuarios del comercio', 'configuracion'),
  ('gestionar_roles', 'Gestionar roles y permisos', 'configuracion');

-- Asignar TODOS los permisos al administrador
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'administrador';

-- Asignar permisos al encargado (sin configuracion)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'encargado' 
  AND p.modulo IN ('ventas', 'productos', 'stock', 'caja', 'reportes');

-- Asignar permisos al vendedor (solo basicos)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'vendedor' 
  AND p.codigo IN ('vender', 'ver_productos', 'ver_stock', 'ver_caja');

-- =========================================================
-- PASO 5: VERIFICACION FINAL
-- =========================================================

SELECT 'TABLAS CREADAS: ' || count(*)::text as resultado
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- =========================================================
-- FIN DEL SCRIPT
-- =========================================================
-- Resultado esperado: TABLAS CREADAS: 15
-- 
-- Tablas creadas:
-- 1. comercios
-- 2. roles
-- 3. permisos
-- 4. roles_permisos
-- 5. usuarios
-- 6. categorias
-- 7. marcas
-- 8. productos
-- 9. clientes
-- 10. stock
-- 11. cajas
-- 12. ventas
-- 13. detalle_ventas
-- 14. movimientos_stock
-- 15. logs_sistema
-- =========================================================

