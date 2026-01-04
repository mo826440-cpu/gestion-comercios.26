# Estructura Esperada de Tablas - AdminisGo

Este documento describe la estructura esperada de todas las tablas del proyecto, basándome en los scripts SQL y el código del proyecto.

**NOTA:** Si Supabase está dando timeout, puedes usar este documento como referencia para verificar manualmente o esperar a que se resuelva el problema.

---

## Tabla: comercios

**Descripción:** Almacena información de los comercios (multi-tenant)

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `razon_social` (TEXT, NOT NULL)
- `nombre_responsable` (TEXT, nullable)
- `email` (TEXT, UNIQUE, nullable)
- `cuit` (VARCHAR(13), nullable)
- `telefono` (VARCHAR(20), nullable)
- `direccion` (TEXT, nullable)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_comercios_email` en `email`

**RLS:** Debe estar habilitado

---

## Tabla: roles

**Descripción:** Roles del sistema (Administrador, Encargado, Vendedor, Programador)

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `nombre` (TEXT, NOT NULL, UNIQUE)
- `descripcion` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**RLS:** No aplica (tabla maestra)

---

## Tabla: permisos

**Descripción:** Permisos del sistema (CONFIG_VER, CONFIG_EDITAR, etc.)

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `codigo` (TEXT, NOT NULL, UNIQUE)
- `descripcion` (TEXT, nullable)
- `modulo` (TEXT, nullable)

**RLS:** No aplica (tabla maestra)

---

## Tabla: roles_permisos

**Descripción:** Relación muchos a muchos entre roles y permisos

**Columnas:**
- `rol_id` (UUID, PRIMARY KEY, REFERENCES roles(id) ON DELETE CASCADE)
- `permiso_id` (UUID, PRIMARY KEY, REFERENCES permisos(id) ON DELETE CASCADE)

**RLS:** No aplica (tabla maestra)

---

## Tabla: usuarios

**Descripción:** Usuarios del sistema vinculados a comercios

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `auth_user_id` (UUID, NOT NULL) - ID en Supabase Auth
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE)
- `rol_id` (UUID, REFERENCES roles(id), nullable)
- `nombre` (TEXT, nullable)
- `email` (TEXT, nullable)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `es_propietario` (BOOLEAN, DEFAULT FALSE)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, nullable)

**Índices:**
- `idx_usuarios_comercio` en `comercio_id`
- `idx_usuarios_email` en `email`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: categorias

**Descripción:** Categorías de productos

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `nombre` (TEXT, NOT NULL)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `especificaciones` (TEXT, nullable)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_categorias_comercio` en `comercio_id`
- Unique constraint en `(comercio_id, nombre)`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: marcas

**Descripción:** Marcas de productos

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `nombre` (TEXT, NOT NULL)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `especificaciones` (TEXT, nullable)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_marcas_comercio` en `comercio_id`
- Unique constraint en `(comercio_id, nombre)`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: proveedores

**Descripción:** Proveedores del comercio

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `nombre` (TEXT, NOT NULL)
- `razon_social` (TEXT, nullable)
- `cuit` (TEXT, nullable)
- `telefono` (TEXT, nullable)
- `email` (TEXT, nullable)
- `direccion` (TEXT, nullable)
- `contacto_nombre` (TEXT, nullable)
- `saldo_pendiente` (NUMERIC(12,2), DEFAULT 0)
- `especificaciones` (TEXT, nullable)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_proveedores_comercio` en `comercio_id`
- Unique constraint en `(comercio_id, nombre)`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: productos

**Descripción:** Productos del comercio

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `nombre` (TEXT, NOT NULL)
- `descripcion` (TEXT, nullable)
- `categoria_id` (UUID, REFERENCES categorias(id) ON DELETE SET NULL, nullable)
- `marca_id` (UUID, REFERENCES marcas(id) ON DELETE SET NULL, nullable)
- `codigo_barra` (TEXT, nullable)
- `precio_costo` (NUMERIC(12,2), DEFAULT 0)
- `precio_venta` (NUMERIC(12,2), NOT NULL)
- `especificaciones` (TEXT, nullable)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_productos_comercio` en `comercio_id`
- `idx_productos_codigo` en `codigo_barra`
- Unique constraint en `(comercio_id, nombre)`
- Unique constraint en `(comercio_id, codigo_barra)` donde codigo_barra IS NOT NULL

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: clientes

**Descripción:** Clientes del comercio

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `nombre` (TEXT, NOT NULL)
- `documento` (TEXT, nullable)
- `telefono` (TEXT, nullable)
- `email` (TEXT, nullable)
- `direccion` (TEXT, nullable)
- `saldo_pendiente` (NUMERIC(12,2), DEFAULT 0)
- `especificaciones` (TEXT, nullable)
- `activo` (BOOLEAN, DEFAULT TRUE)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_clientes_comercio` en `comercio_id`
- Unique constraint en `(comercio_id, nombre)`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: stock

**Descripción:** Stock de productos por comercio

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `producto_id` (UUID, REFERENCES productos(id) ON DELETE CASCADE, NOT NULL)
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `cantidad` (NUMERIC(12,2), DEFAULT 0)
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, nullable)

**Índices:**
- `idx_stock_producto` en `producto_id`
- `idx_stock_comercio` en `comercio_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: configuraciones

**Descripción:** Configuraciones del comercio (tema, preferencias, etc.)

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `categoria` (TEXT, NOT NULL) - Ej: 'tema', 'ventas', 'stock'
- `clave` (TEXT, NOT NULL) - Ej: 'tema_oscuro', 'mostrar_stock_minimo'
- `valor` (TEXT, nullable) - Valor serializado como JSON o texto
- `tipo` (TEXT, nullable) - 'string', 'number', 'boolean', 'json'
- `sync_id` (UUID, nullable)
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- Composite unique constraint en `(comercio_id, categoria, clave)`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: compras

**Descripción:** Compras realizadas a proveedores

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `proveedor_id` (UUID, REFERENCES proveedores(id) ON DELETE SET NULL, nullable)
- `facturacion` (TEXT, nullable) - Ej: 'A', 'B', 'C', 'No Aplica'
- `fecha` (TIMESTAMPTZ, DEFAULT NOW())
- `subtotal` (NUMERIC(12,2), DEFAULT 0)
- `descuento` (NUMERIC(12,2), DEFAULT 0)
- `total` (NUMERIC(12,2), DEFAULT 0)
- `monto_pagado` (NUMERIC(12,2), DEFAULT 0)
- `monto_deuda` (NUMERIC(12,2), DEFAULT 0)
- `estado` (TEXT, DEFAULT 'completada') - 'completada', 'cancelada'
- `observaciones` (TEXT, nullable)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_compras_comercio` en `comercio_id`
- `idx_compras_proveedor` en `proveedor_id`
- `idx_compras_fecha` en `fecha`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: detalle_compras

**Descripción:** Detalle de productos en cada compra

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `compra_id` (UUID, REFERENCES compras(id) ON DELETE CASCADE, NOT NULL)
- `producto_id` (UUID, REFERENCES productos(id) ON DELETE SET NULL, nullable)
- `codigo_barra` (TEXT, nullable)
- `nombre_producto` (TEXT, nullable)
- `cantidad` (NUMERIC(12,2), NOT NULL)
- `precio_unitario` (NUMERIC(12,2), NOT NULL)
- `subtotal` (NUMERIC(12,2), NOT NULL)
- `sync_id` (UUID, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_detalle_compras_compra` en `compra_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id a través de compra)

---

## Tabla: pagos_compras

**Descripción:** Pagos realizados para compras

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `compra_id` (UUID, REFERENCES compras(id) ON DELETE CASCADE, NOT NULL)
- `forma_pago` (TEXT, NOT NULL) - 'efectivo', 'transferencia', 'QR', 'debito', 'credito', 'cheque', 'otro'
- `monto` (NUMERIC(12,2), NOT NULL)
- `fecha_pago` (TIMESTAMPTZ, DEFAULT NOW())
- `observaciones` (TEXT, nullable)
- `sync_id` (UUID, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_pagos_compras_compra` en `compra_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id a través de compra)

---

## Tabla: ventas

**Descripción:** Ventas realizadas a clientes

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `caja_id` (UUID, REFERENCES cajas(id) ON DELETE SET NULL, nullable)
- `usuario_id` (UUID, REFERENCES usuarios(id) ON DELETE SET NULL, nullable)
- `cliente_id` (UUID, REFERENCES clientes(id) ON DELETE SET NULL, nullable)
- `facturacion` (TEXT, DEFAULT 'No Aplica') - 'A', 'B', 'C', 'No Aplica'
- `fecha` (TIMESTAMPTZ, DEFAULT NOW())
- `subtotal` (NUMERIC(12,2), DEFAULT 0)
- `descuento` (NUMERIC(12,2), DEFAULT 0)
- `total` (NUMERIC(12,2), DEFAULT 0)
- `monto_pagado` (NUMERIC(12,2), DEFAULT 0)
- `monto_deuda` (NUMERIC(12,2), DEFAULT 0)
- `estado` (TEXT, DEFAULT 'completada') - 'completada', 'cancelada'
- `observaciones` (TEXT, nullable)
- `responsable_nombre` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())
- `sync_id` (UUID, DEFAULT gen_random_uuid())

**Índices:**
- `idx_ventas_comercio` en `comercio_id`
- `idx_ventas_cliente` en `cliente_id`
- `idx_ventas_fecha` en `fecha`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: detalle_ventas

**Descripción:** Detalle de productos en cada venta

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `venta_id` (UUID, REFERENCES ventas(id) ON DELETE CASCADE, NOT NULL)
- `producto_id` (UUID, REFERENCES productos(id) ON DELETE SET NULL, nullable)
- `codigo_barra` (TEXT, nullable)
- `nombre_producto` (TEXT, nullable)
- `cantidad` (NUMERIC(12,2), NOT NULL)
- `precio_unitario` (NUMERIC(12,2), NOT NULL)
- `subtotal` (NUMERIC(12,2), NOT NULL)
- `descuento_porcentaje` (NUMERIC(5,2), DEFAULT 0)
- `descuento_monto` (NUMERIC(12,2), DEFAULT 0)
- `sync_id` (UUID, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_detalle_ventas_venta` en `venta_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id a través de venta)

---

## Tabla: pagos_ventas

**Descripción:** Pagos recibidos por ventas

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `venta_id` (UUID, REFERENCES ventas(id) ON DELETE CASCADE, NOT NULL)
- `forma_pago` (TEXT, NOT NULL) - 'efectivo', 'transferencia', 'QR', 'debito', 'credito', 'cheque', 'otro'
- `monto` (NUMERIC(12,2), NOT NULL)
- `fecha_pago` (TIMESTAMPTZ, DEFAULT NOW())
- `observaciones` (TEXT, nullable)
- `sync_id` (UUID, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_pagos_ventas_venta` en `venta_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id a través de venta)

---

## Tabla: cajas

**Descripción:** Cajas de venta del comercio

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `estado` (TEXT, DEFAULT 'abierta') - 'abierta', 'cerrada'
- `fecha_apertura` (TIMESTAMPTZ, DEFAULT NOW())
- `fecha_cierre` (TIMESTAMPTZ, nullable)
- `sync_id` (UUID, nullable)

**Índices:**
- `idx_cajas_comercio` en `comercio_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Tabla: movimientos_stock

**Descripción:** Historial de movimientos de stock

**Columnas:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `producto_id` (UUID, REFERENCES productos(id) ON DELETE CASCADE, NOT NULL)
- `comercio_id` (UUID, REFERENCES comercios(id) ON DELETE CASCADE, NOT NULL)
- `tipo` (TEXT, NOT NULL) - 'entrada', 'salida', 'ajuste'
- `cantidad` (NUMERIC(12,2), NOT NULL)
- `motivo` (TEXT, nullable)
- `sync_id` (UUID, nullable)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**Índices:**
- `idx_movimientos_stock_producto` en `producto_id`
- `idx_movimientos_stock_comercio` en `comercio_id`

**RLS:** Debe estar habilitado (filtrar por comercio_id)

---

## Resumen de Campos Especiales

### Campos que DEBEN tener todas las tablas (excepto maestras):
- ✅ `sync_id` (UUID) - Para sincronización offline-first
- ✅ `created_at` (TIMESTAMPTZ) - Fecha de creación
- ✅ `updated_at` (TIMESTAMPTZ) - Fecha de última actualización

### Campos que DEBEN tener tablas de datos del comercio:
- ✅ `comercio_id` (UUID) - Para multi-tenant

### Tablas que NO tienen `comercio_id`:
- `roles` (tabla maestra)
- `permisos` (tabla maestra)
- `roles_permisos` (tabla maestra)
- `comercios` (es la tabla de comercios)

---

## Verificación Rápida

Para verificar rápidamente si una tabla está correcta, verificar:

1. ✅ Tiene Primary Key
2. ✅ Tiene `sync_id` (si no es tabla maestra)
3. ✅ Tiene `created_at` y `updated_at` (si no es tabla maestra)
4. ✅ Tiene `comercio_id` (si es tabla de datos del comercio)
5. ✅ Tiene Foreign Keys correctas
6. ✅ Tiene índices en `comercio_id` (si aplica)
7. ✅ Tiene RLS habilitado (si es tabla de datos del comercio)

---

**Última actualización:** Basado en scripts SQL del proyecto y código de IndexedDB (versión 10)

