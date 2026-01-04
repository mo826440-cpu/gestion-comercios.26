# 📋 Instrucciones para Actualizar las Bases de Datos

## ⚠️ IMPORTANTE

Antes de usar la ventana de Categorías, necesitás actualizar tanto **Supabase** como **IndexedDB** (local).

---

## 1️⃣ Actualizar Supabase (Base de Datos Remota)

### Paso 1: Ejecutar Script SQL

1. Andá a tu proyecto en Supabase: `https://supabase.com/dashboard`
2. Hacé clic en **"SQL Editor"** (Editor SQL)
3. Hacé clic en **"New query"** (Nueva consulta)
4. Copiá y pegá el contenido completo del archivo:
   ```
   db/docs/scriptAgregarCamposCategorias.sql
   ```
5. Hacé clic en **"Run"** (Ejecutar) o presioná `Ctrl + Enter`

### Paso 2: Verificar que se ejecutó correctamente

Deberías ver un mensaje de éxito. Si hay algún error, puede ser que algunos campos ya existan (está bien, el script verifica antes de agregar).

---

## 2️⃣ Actualizar IndexedDB (Base de Datos Local)

### ✅ Automático

La actualización de IndexedDB es **automática**. Cuando abras la aplicación:

1. El sistema detectará que la versión cambió de 3 a 4
2. Ejecutará automáticamente la migración
3. Actualizará todos los registros existentes de categorías y marcas con:
   - `especificaciones`: null (si no existe)
   - `created_at`: fecha de `updated_at` o fecha actual (si no existe)
   - `responsable_nombre`: null (si no existe)

### Verificar la migración

1. Abrí la aplicación en el navegador
2. Abrí la consola del navegador (F12)
3. Buscá el mensaje: `🔄 Migrando a versión 4: Agregando campos a categorias y marcas...`
4. Deberías ver: `✅ Migración a versión 4 completada`

---

## 3️⃣ Verificar que Todo Funciona

### En Supabase:

1. Andá a **"Table Editor"** → **"categorias"**
2. Verificá que las columnas existan:
   - ✅ `especificaciones` (TEXT, nullable)
   - ✅ `created_at` (TIMESTAMPTZ)
   - ✅ `responsable_nombre` (TEXT, nullable)

### En la Aplicación:

1. Abrí la ventana de **Categorías**
2. Intentá crear una nueva categoría
3. Verificá que se guarde correctamente
4. Verificá que aparezca en la tabla

---

## 4️⃣ Si Hay Problemas

### Error: "Column does not exist" en Supabase

- Ejecutá el script SQL nuevamente
- Verificá que estés en el proyecto correcto de Supabase

### Error: "Migration failed" en IndexedDB

- Limpiá el caché del navegador
- Recargá la página con `Ctrl + Shift + R`
- Si persiste, podés eliminar IndexedDB manualmente desde DevTools:
  1. F12 → **Application** → **IndexedDB**
  2. Click derecho en la base de datos → **Delete**
  3. Recargá la página

### Los datos no se sincronizan

- Verificá que hayas ejecutado el script SQL en Supabase
- Verificá que los campos nuevos existan en Supabase
- Revisá la consola del navegador para ver errores de sincronización

---

## 📝 Nota

- **Supabase**: Necesitás ejecutar el script SQL manualmente (una sola vez)
- **IndexedDB**: Se actualiza automáticamente cuando abrís la app (migración automática)
- Los registros existentes se actualizan automáticamente con valores por defecto

