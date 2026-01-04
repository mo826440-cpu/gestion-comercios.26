# Análisis Inicial de Estructura de Base de Datos

## ✅ Tablas Existentes (21 tablas)

Todas las tablas esperadas están presentes:
- ✅ comercios
- ✅ usuarios
- ✅ roles
- ✅ permisos
- ✅ roles_permisos
- ✅ categorias
- ✅ marcas
- ✅ proveedores
- ✅ productos
- ✅ clientes
- ✅ stock
- ✅ configuraciones
- ✅ compras
- ✅ detalle_compras
- ✅ pagos_compras
- ✅ ventas
- ✅ detalle_ventas
- ✅ pagos_ventas
- ✅ cajas
- ✅ movimientos_stock
- ✅ logs_sistema (adicional, está bien)

## 🔍 Problemas Identificados (Preliminar)

Basándome en la estructura de columnas, veo estos problemas:

### 1. **detalle_ventas** - Campos de descuento incorrectos

**Problema:** Tiene `descuento` (numeric(12,2)) pero debería tener:
- `descuento_porcentaje` (numeric(5,2))
- `descuento_monto` (numeric(12,2))

**Evidencia:** En `js/ventas.js` y `js/indexeddb.js` se usan ambos campos por separado.

### 2. **ventas** - Campo innecesario

**Problema:** Tiene `metodo_pago` (text) que NO debería existir.

**Razón:** Los métodos de pago se manejan en la tabla `pagos_ventas`. Este campo es redundante y puede causar confusión.

### 3. **stock** - Falta sync_id

**Problema:** No tiene `sync_id` (uuid).

**Razón:** Todas las tablas de datos del comercio deben tener `sync_id` para sincronización offline-first.

### 4. **configuraciones** - Falta sync_id

**Problema:** No tiene `sync_id` (uuid).

**Razón:** Debe tenerlo para sincronización.

### 5. **usuarios** - Falta responsable_nombre

**Problema:** No tiene `responsable_nombre` (text).

**Evidencia:** En `js/usuarios.js` se usa `responsable_nombre` al crear/editar usuarios.

### 6. **detalle_ventas** - sync_id es nullable

**Problema:** `sync_id` permite NULL, pero debería tener default.

**Recomendación:** Agregar `DEFAULT gen_random_uuid()`

## ⚠️ Pendiente de Verificar

Necesito los resultados de las consultas 3-7 para verificar:
- Primary Keys correctos
- Foreign Keys correctas
- Unique Constraints
- Índices necesarios

## 📝 Próximos Pasos

1. Ejecutar consultas 3-7 del script
2. Completar análisis completo
3. Crear scripts SQL de corrección

