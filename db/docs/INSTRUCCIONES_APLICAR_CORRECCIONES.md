# Instrucciones para Aplicar las Correcciones

## Pasos para Corregir la Base de Datos

### 1. Hacer Backup (RECOMENDADO)

Antes de ejecutar cualquier script de modificación:
1. Ir a **Database → Backups** en Supabase
2. Crear un backup manual si es posible
3. O al menos anotar la fecha/hora actual para poder restaurar si es necesario

### 2. Ejecutar el Script de Corrección

1. **Ir a SQL Editor** en Supabase
2. **Abrir** el archivo `scriptCorregirEstructuraBaseDatos.sql`
3. **Copiar TODO el contenido** del script
4. **Pegarlo** en el SQL Editor
5. **Ejecutar** (botón "Run" o `Ctrl + Enter`)

### 3. Verificar los Cambios

Después de ejecutar el script, verificar que los cambios se aplicaron correctamente:

```sql
-- Verificar que detalle_ventas tiene los campos correctos
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'detalle_ventas' 
AND column_name IN ('descuento_porcentaje', 'descuento_monto', 'descuento')
ORDER BY column_name;

-- Verificar que ventas NO tiene metodo_pago
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'ventas' 
AND column_name = 'metodo_pago';

-- Verificar que stock tiene sync_id
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stock' 
AND column_name = 'sync_id';

-- Verificar que configuraciones tiene sync_id
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'configuraciones' 
AND column_name = 'sync_id';

-- Verificar que usuarios tiene responsable_nombre
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usuarios' 
AND column_name = 'responsable_nombre';
```

### 4. Qué Hace el Script

El script realiza las siguientes correcciones:

1. ✅ **detalle_ventas**: Elimina `descuento` y agrega `descuento_porcentaje` y `descuento_monto`
2. ✅ **ventas**: Elimina el campo `metodo_pago` (redundante)
3. ✅ **stock**: Agrega `sync_id` con default
4. ✅ **configuraciones**: Agrega `sync_id` con default
5. ✅ **usuarios**: Agrega `responsable_nombre`

### 5. Notas Importantes

- ⚠️ **El script es seguro**: Usa `IF EXISTS` / `IF NOT EXISTS` para evitar errores
- ⚠️ **No borra datos**: Solo agrega/elimina columnas, no afecta registros existentes
- ⚠️ **Para `detalle_ventas`**: Si tenías registros con descuentos, esos valores se perderán al eliminar la columna `descuento`. Los nuevos descuentos se guardarán en `descuento_porcentaje` y `descuento_monto`.

### 6. Si Hay Errores

Si el script da algún error:
1. Copiar el mensaje de error completo
2. Verificar qué cambio falló
3. Ejecutar solo esa sección del script manualmente
4. O contactarme con el error para que lo corrija

## Después de Aplicar las Correcciones

Una vez aplicadas las correcciones, la estructura de la base de datos debería coincidir perfectamente con:
- El código de IndexedDB (versión 10)
- Los scripts SQL de creación/actualización
- El código JavaScript del proyecto

