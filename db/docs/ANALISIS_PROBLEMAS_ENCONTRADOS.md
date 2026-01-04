# Análisis de Problemas en la Estructura de la Base de Datos

Basándome en la comparación con el código del proyecto y los scripts SQL, he identificado los siguientes problemas:

## 🔴 Problemas Críticos

### 1. **detalle_ventas** - Campos de descuento incorrectos

**Problema Actual:**
- Tiene `descuento` (numeric(12,2))

**Debería Tener:**
- `descuento_porcentaje` (numeric(5,2), DEFAULT 0)
- `descuento_monto` (numeric(12,2), DEFAULT 0)

**Evidencia:** 
- En `js/indexeddb.js` versión 10: `descuento_porcentaje, descuento_monto`
- En `js/ventas.js` se usan ambos campos por separado
- En `db/docs/scriptActualizarTablaVentas.sql` se definen ambos campos

### 2. **ventas** - Campo innecesario que puede causar confusión

**Problema Actual:**
- Tiene `metodo_pago` (text, DEFAULT 'efectivo')

**Debería:**
- **ELIMINAR** este campo

**Razón:** Los métodos de pago se manejan correctamente en la tabla `pagos_ventas`. Este campo es redundante y puede causar inconsistencias.

### 3. **stock** - Falta sync_id

**Problema Actual:**
- No tiene `sync_id`

**Debería Tener:**
- `sync_id` (uuid, DEFAULT gen_random_uuid())

**Evidencia:**
- En `js/indexeddb.js`: `stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at'`
- Necesario para sincronización offline-first

### 4. **configuraciones** - Falta sync_id

**Problema Actual:**
- No tiene `sync_id`

**Debería Tener:**
- `sync_id` (uuid, DEFAULT gen_random_uuid())

**Evidencia:**
- En `js/indexeddb.js`: `configuraciones: 'id, comercio_id, categoria, clave, valor, tipo, sync_id, updated_at'`
- Necesario para sincronización

### 5. **usuarios** - Falta responsable_nombre

**Problema Actual:**
- No tiene `responsable_nombre`

**Debería Tener:**
- `responsable_nombre` (text, nullable)

**Evidencia:**
- En `js/usuarios.js` se usa `responsable_nombre` al crear/editar usuarios
- En `js/indexeddb.js` versión 10: `usuario: '..., responsable_nombre, ...'`

## ⚠️ Problemas Menores

### 6. **detalle_ventas** - sync_id debería tener default

**Problema Actual:**
- `sync_id` permite NULL (sin default)

**Recomendación:**
- Agregar `DEFAULT gen_random_uuid()`

### 7. **cajas** - Campos adicionales que están bien

**Observación:**
- Tiene `usuario_cierre_id`, `monto_inicial`, `monto_cierre`, `observaciones` que no están en IndexedDB
- Esto está bien, son campos adicionales que pueden ser útiles

## ✅ Lo que está Correcto

- ✅ Todas las tablas principales existen
- ✅ La mayoría de campos están correctos
- ✅ `sync_id`, `created_at`, `updated_at` presentes en la mayoría de tablas
- ✅ Foreign Keys parecen estar correctas (necesito verificar consulta 4)

## 📋 Resumen de Cambios Necesarios

1. **Agregar campos faltantes:**
   - `stock.sync_id`
   - `configuraciones.sync_id`
   - `usuarios.responsable_nombre`
   - `detalle_ventas.descuento_porcentaje`
   - `detalle_ventas.descuento_monto`

2. **Modificar campos:**
   - Cambiar `detalle_ventas.descuento` por `descuento_porcentaje` y `descuento_monto`

3. **Eliminar campos:**
   - `ventas.metodo_pago` (redundante)

4. **Mejorar defaults:**
   - `detalle_ventas.sync_id` debería tener DEFAULT

## ⏳ Pendiente de Verificar

Necesito los resultados de las consultas 3-7 para verificar:
- Primary Keys (consulta 3)
- Foreign Keys (consulta 4)
- Unique Constraints (consulta 5)
- Índices (consulta 6)
- Verificación de campos específicos (consulta 7)

