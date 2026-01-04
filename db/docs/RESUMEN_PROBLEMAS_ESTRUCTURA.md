# Resumen de Problemas en la Estructura de Base de Datos

## 🔴 Problemas Críticos que DEBEN Corregirse

### 1. **detalle_ventas** - Campos de descuento incorrectos

**Estado Actual:**
- ✅ Tiene: `descuento` (numeric(12,2), DEFAULT 0)

**Problema:**
El código del proyecto (`js/ventas.js` y `js/indexeddb.js` versión 10) usa:
- `descuento_porcentaje` (numeric(5,2))
- `descuento_monto` (numeric(12,2))

**Solución:**
1. Renombrar `descuento` a `descuento_monto`
2. Agregar `descuento_porcentaje` (numeric(5,2), DEFAULT 0)

O mejor: Eliminar `descuento` y agregar ambos campos nuevos.

### 2. **ventas** - Campo redundante que debe eliminarse

**Estado Actual:**
- ✅ Tiene: `metodo_pago` (text, DEFAULT 'efectivo')

**Problema:**
Los métodos de pago se manejan correctamente en la tabla `pagos_ventas`. Este campo es redundante y puede causar inconsistencias.

**Solución:**
- Eliminar el campo `metodo_pago`

### 3. **stock** - Falta sync_id

**Estado Actual:**
- ❌ No tiene: `sync_id`

**Debería Tener:**
- `sync_id` (uuid, DEFAULT gen_random_uuid())

**Evidencia:**
- En `js/indexeddb.js`: `stock: 'id, producto_id, comercio_id, cantidad, sync_id, updated_at'`
- Necesario para sincronización offline-first

### 4. **configuraciones** - Falta sync_id

**Estado Actual:**
- ❌ No tiene: `sync_id`

**Debería Tener:**
- `sync_id` (uuid, DEFAULT gen_random_uuid())

**Evidencia:**
- En `js/indexeddb.js`: `configuraciones: 'id, comercio_id, categoria, clave, valor, tipo, sync_id, updated_at'`
- Necesario para sincronización

### 5. **usuarios** - Falta responsable_nombre

**Estado Actual:**
- ❌ No tiene: `responsable_nombre`

**Debería Tener:**
- `responsable_nombre` (text, nullable)

**Evidencia:**
- En `js/usuarios.js` se usa `responsable_nombre` al crear/editar usuarios
- En `js/indexeddb.js` versión 10: `usuario: '..., responsable_nombre, ...'`

## ⚠️ Problemas Menores

### 6. **detalle_ventas.sync_id** - Debería tener default explícito

**Estado Actual:**
- ✅ Tiene: `sync_id` (uuid, nullable, DEFAULT gen_random_uuid())

**Observación:**
Ya tiene default, está bien. No requiere cambio.

## ✅ Lo que está Correcto

- ✅ Todas las tablas principales existen
- ✅ La mayoría de campos están correctos
- ✅ `sync_id`, `created_at`, `updated_at` presentes en la mayoría de tablas que lo requieren
- ✅ Foreign Keys parecen estar correctas (verificar con consulta 4)
- ✅ Estructura general está bien

## 📋 Script de Corrección

Voy a crear un script SQL completo para corregir todos estos problemas.

