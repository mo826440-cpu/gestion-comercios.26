# Diagnóstico: Base de Datos Clavada o Borrada

## Pasos de Diagnóstico

### 1. Verificar si es un Problema de Interfaz (más probable)

Los errores que veo sugieren un problema de carga de la interfaz web, no necesariamente de la base de datos.

**Pasos:**
1. **Cerrar completamente el navegador** (todas las ventanas)
2. **Abrir el navegador en modo incógnito** (`Ctrl + Shift + N`)
3. **Ir a Supabase** e iniciar sesión
4. **Intentar acceder al SQL Editor** (no al Table Editor)
5. **Ejecutar esta consulta simple:**
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

Si esta consulta funciona, la base de datos **NO está borrada**, solo hay un problema con la interfaz.

### 2. Verificar Estado del Proyecto

1. **Ir a Settings → General** en Supabase
2. **Verificar:**
   - ¿El proyecto está "Active" o "Paused"?
   - ¿Hay algún mensaje de suspensión?
   - ¿El plan está activo?

### 3. Intentar Acceso Directo vía SQL Editor

Si el Table Editor no funciona, el SQL Editor puede funcionar:

1. **Ir a SQL Editor** (menú lateral)
2. **Crear una nueva consulta**
3. **Ejecutar:**
   ```sql
   -- Verificar si las tablas existen
   SELECT table_name 
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

### 4. Verificar desde la API de Supabase

Si tienes acceso, puedes verificar desde el código:

1. **Abrir la consola del navegador** en tu aplicación
2. **Intentar ejecutar:**
   ```javascript
   // Verificar conexión
   const { data, error } = await supabase
     .from('comercios')
     .select('count')
     .limit(1);
   
   console.log('Conexión:', error ? 'ERROR' : 'OK');
   console.log('Error:', error);
   ```

### 5. Verificar Logs de Supabase

1. **Ir a Logs** en el menú lateral
2. **Revisar logs recientes:**
   - ¿Hay errores relacionados con la base de datos?
   - ¿Hay queries fallidas?

## Soluciones según el Problema

### Si es Problema de Interfaz (chunks no cargan):

1. **Limpiar caché del navegador:**
   - `Ctrl + Shift + Delete`
   - Seleccionar "Cached images and files"
   - Limpiar

2. **Desactivar extensiones del navegador:**
   - Modo incógnito (desactiva extensiones automáticamente)
   - O desactivar manualmente extensiones que puedan interferir

3. **Probar otro navegador:**
   - Chrome, Firefox, Edge

4. **Usar SQL Editor directamente:**
   - Evitar el Table Editor que parece tener problemas
   - Usar solo SQL Editor para verificar

### Si el Proyecto está Pausado:

1. **Ir a Settings → General**
2. **Hacer clic en "Resume" o "Activate"**
3. **Esperar unos minutos** para que se reactive

### Si Realmente se Borró la Base de Datos:

**Opción 1: Restaurar desde Backup (si existe)**
1. Ir a **Database → Backups**
2. Buscar un backup reciente
3. Restaurarlo

**Opción 2: Recrear desde Scripts SQL**
1. Usar los scripts de creación en `db/docs/`
2. Ejecutar en orden:
   - `scriptCrearBaseDatosEnSupabase_LIMPIO.sql` (crea todo desde cero)

## Verificación Rápida

Ejecuta esta consulta en SQL Editor para verificar rápidamente:

```sql
-- Verificar existencia de tablas principales
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comercios') 
         THEN '✓ comercios existe' 
         ELSE '✗ comercios NO existe' END as comercios,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') 
         THEN '✓ usuarios existe' 
         ELSE '✗ usuarios NO existe' END as usuarios,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos') 
         THEN '✓ productos existe' 
         ELSE '✗ productos NO existe' END as productos,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ventas') 
         THEN '✓ ventas existe' 
         ELSE '✗ ventas NO existe' END as ventas;
```

## Próximos Pasos

1. **Primero**: Intentar acceso desde modo incógnito + SQL Editor
2. **Segundo**: Verificar estado del proyecto en Settings
3. **Tercero**: Ejecutar la consulta de verificación rápida
4. **Si nada funciona**: Contactar soporte de Supabase

## Contacto con Soporte

Si el problema persiste:
1. Ir a: https://supabase.com/support
2. Explicar: "Base de datos no responde, errores de chunks en consola"
3. Proporcionar: ID del proyecto (`jnplnwpofxzfqchkvgpv`)

