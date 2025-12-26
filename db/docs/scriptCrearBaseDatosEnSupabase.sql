-- =========================================================
-- SISTEMA DE GESTIÓN DE KIOSCOS
-- BASE CENTRAL - SUPABASE
-- =========================================================
-- OFFLINE FIRST / MULTI-COMERCIO / MULTI-DISPOSITIVO
-- =========================================================

-- EXTENSIONES
create extension if not exists "pgcrypto";

-- =========================================================
-- COMERCIOS (TENANTS)
-- =========================================================
create table comercios (
  id uuid primary key default gen_random_uuid(),
  razon_social text not null,
  cuit varchar(13),
  activo boolean default true,
  created_at timestamptz default now()
);

-- =========================================================
-- ROLES
-- =========================================================
create table roles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, -- admin, encargado, vendedor, etc
  descripcion text,
  created_at timestamptz default now()
);

-- =========================================================
-- PERMISOS
-- =========================================================
create table permisos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  descripcion text
);

-- =========================================================
-- RELACIÓN ROLES ↔ PERMISOS
-- =========================================================
create table roles_permisos (
  rol_id uuid references roles(id) on delete cascade,
  permiso_id uuid references permisos(id) on delete cascade,
  primary key (rol_id, permiso_id)
);

-- =========================================================
-- USUARIOS (PERFIL DE NEGOCIO)
-- =========================================================
create table usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  comercio_id uuid references comercios(id),
  rol_id uuid references roles(id),
  activo boolean default true,
  created_at timestamptz default now()
);

-- =========================================================
-- TABLAS MAESTRAS (CACHEABLES)
-- =========================================================
create table categorias (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  nombre text not null,
  updated_at timestamptz default now()
);

create table marcas (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  nombre text not null,
  updated_at timestamptz default now()
);

create table productos (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  nombre text not null,
  categoria_id uuid references categorias(id),
  marca_id uuid references marcas(id),
  codigo_barra text,
  precio_venta numeric(12,2) not null,
  activo boolean default true,
  updated_at timestamptz default now()
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  nombre text not null,
  documento text,
  updated_at timestamptz default now()
);

-- =========================================================
-- CAJA Y VENTAS
-- =========================================================
create table cajas (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  usuario_apertura_id uuid references usuarios(id),
  fecha_apertura timestamptz default now(),
  fecha_cierre timestamptz,
  estado text default 'abierta'
);

create table ventas (
  id uuid primary key default gen_random_uuid(),
  sync_id uuid not null,
  comercio_id uuid references comercios(id),
  caja_id uuid references cajas(id),
  usuario_id uuid references usuarios(id),
  cliente_id uuid references clientes(id),
  fecha timestamptz default now(),
  total numeric(12,2) not null,
  estado text default 'completada'
);

create table detalle_ventas (
  id uuid primary key default gen_random_uuid(),
  venta_id uuid references ventas(id),
  producto_id uuid references productos(id),
  cantidad numeric(10,2),
  precio numeric(12,2)
);

-- =========================================================
-- STOCK
-- =========================================================
create table stock (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id),
  comercio_id uuid references comercios(id),
  cantidad numeric(12,2) default 0,
  updated_at timestamptz default now()
);

-- =========================================================
-- LOGS TÉCNICOS
-- =========================================================
create table logs_sistema (
  id uuid primary key default gen_random_uuid(),
  comercio_id uuid,
  tipo text,
  mensaje text,
  fecha timestamptz default now()
);
