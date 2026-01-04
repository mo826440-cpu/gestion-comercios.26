# Instrucciones para Verificar la Estructura de Tablas

## Pasos para ejecutar el script

1. **Abrir Supabase Dashboard**
   - Ir a tu proyecto en Supabase
   - Navegar a "SQL Editor" en el menú lateral

2. **Ejecutar el script**
   - Abrir el archivo `scriptVerificarEstructuraTablas.sql`
   - Copiar todo el contenido
   - Pegarlo en el SQL Editor de Supabase
   - Hacer clic en "Run" o presionar `Ctrl + Enter`

3. **Copiar los resultados**
   - El script genera múltiples consultas
   - Copiar TODOS los resultados de cada consulta
   - Incluir:
     - Lista de tablas
     - Resumen por tabla
     - Detalle de columnas
     - Foreign keys
     - Índices
     - RLS Policies
     - Verificación de campos específicos

4. **Enviar los resultados**
   - Pegar todos los resultados en el chat
   - Incluir cualquier mensaje de error si los hay

## Qué verifica el script

El script verifica:

- ✅ **Estructura de tablas**: Columnas, tipos de datos, valores por defecto
- ✅ **Constraints**: Primary keys, foreign keys, unique constraints
- ✅ **Índices**: Todos los índices creados
- ✅ **RLS Policies**: Políticas de Row Level Security
- ✅ **Campos específicos**: `sync_id`, `created_at`, `updated_at`, `comercio_id`

## Nota importante

Si alguna consulta genera un error, copiar también el mensaje de error para poder diagnosticarlo.

