# Solución para Problemas de Timeout en Supabase

## Diagnóstico del Problema

Si incluso el Table Editor da timeout, puede ser por:

1. **Proyecto pausado o suspendido** (muy común en planes gratuitos)
2. **Base de datos sobrecargada** (demasiadas tablas/datos)
3. **Problema temporal de Supabase** (servidor sobrecargado)
4. **Problema de red/conexión**
5. **Base de datos con problemas** (bloqueos, transacciones largas)

## Soluciones a Probar

### 1. Verificar Estado del Proyecto

1. **Ir a Settings → General** en Supabase
2. **Verificar el estado del proyecto**:
   - ¿Está "Active" o "Paused"?
   - Si está pausado, hacer clic en "Resume" o "Activate"
3. **Verificar el plan**:
   - Plan gratuito puede tener limitaciones
   - Verificar si hay cuotas excedidas

### 2. Refrescar y Reconectar

1. **Cerrar todas las pestañas de Supabase**
2. **Limpiar caché del navegador**:
   - `Ctrl + Shift + Delete`
   - Seleccionar "Cached images and files"
   - Limpiar
3. **Abrir Supabase en modo incógnito** (`Ctrl + Shift + N`)
4. **Reintentar acceder al Table Editor**

### 3. Verificar Logs y Estado

1. **Ir a Logs** en el menú lateral de Supabase
2. **Revisar los logs recientes**:
   - ¿Hay errores?
   - ¿Hay queries que estén bloqueando?
3. **Ir a Database → Settings**:
   - Verificar conexiones activas
   - Verificar si hay procesos bloqueados

### 4. Usar SQL Editor Directo (Alternativa)

Si el Table Editor no funciona, intentar:

1. **Ir a SQL Editor**
2. **Ejecutar esta consulta MUY simple**:

```sql
SELECT 1;
```

Si esto también da timeout, el problema es más serio.

### 5. Verificar desde psql (Si tienes acceso)

Si tienes acceso a `psql` o a la conexión directa:

```bash
psql "postgresql://[tu-connection-string]"
```

Luego ejecutar:

```sql
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
LIMIT 5;
```

### 6. Contactar Soporte de Supabase

Si nada funciona:

1. **Hacer clic en "Contactar con soporte técnico"** (botón en el error)
2. **O ir a**: https://supabase.com/support
3. **Explicar el problema**: timeout incluso en Table Editor

## Solución Temporal: Usar los Scripts SQL Existentes

Mientras se resuelve el problema, puedes:

1. **Revisar los scripts SQL que ya creamos** en `db/docs/`
2. **Usar la estructura esperada** según el código del proyecto
3. **Verificar manualmente** comparando con los scripts de creación de tablas

## Verificación Manual Basada en el Código

Basándome en el código del proyecto, estas son las tablas que **deberían** existir:

### Tablas Principales:
- `comercios`
- `usuarios`
- `roles`
- `permisos`
- `roles_permisos`
- `categorias`
- `marcas`
- `proveedores`
- `productos`
- `clientes`
- `stock`
- `configuraciones`
- `compras`
- `detalle_compras`
- `pagos_compras`
- `ventas`
- `detalle_ventas`
- `pagos_ventas`
- `cajas`
- `movimientos_stock`

### Estructura Esperada (según código):

Puedo crear un documento con la estructura esperada de cada tabla basándome en:
- Los scripts SQL de creación (`db/docs/scriptCrear*.sql`)
- El código de IndexedDB (`js/indexeddb.js`)
- El código de sincronización (`js/sync.js`)

## Próximos Pasos

1. **Probar las soluciones 1-4 primero**
2. **Si persiste, contactar soporte de Supabase**
3. **Mientras tanto, puedo crear un documento con la estructura esperada** basándome en el código del proyecto

¿Quieres que cree un documento con la estructura esperada de todas las tablas basándome en el código del proyecto? Así podemos verificar si la estructura actual coincide con lo esperado.

