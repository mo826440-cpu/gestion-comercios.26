# Instrucciones para Verificar la Estructura de Tablas (Versión Simple)

## Pasos para ejecutar el script

1. **Abrir Supabase Dashboard**
   - Ir a tu proyecto en Supabase
   - Navegar a "SQL Editor" en el menú lateral

2. **Ejecutar las consultas UNA POR UNA**
   - Abrir el archivo `scriptVerificarEstructuraTablas_SIMPLE.sql`
   - **IMPORTANTE**: Ejecutar cada consulta por separado
   - Seleccionar solo UNA consulta a la vez (desde `-- CONSULTA X` hasta el siguiente `-- CONSULTA X`)
   - Hacer clic en "Run" o presionar `Ctrl + Enter`
   - Copiar los resultados
   - Repetir con la siguiente consulta

3. **Copiar TODOS los resultados**
   - Copiar los resultados de cada una de las 8 consultas
   - Incluir el número de consulta para identificarlas
   - Ejemplo: "CONSULTA 1: [resultados]", "CONSULTA 2: [resultados]", etc.

4. **Enviar los resultados**
   - Pegar todos los resultados en el chat
   - Incluir cualquier mensaje de error si los hay

## Consultas a ejecutar

1. **CONSULTA 1**: Lista de tablas
2. **CONSULTA 2**: Columnas de todas las tablas
3. **CONSULTA 3**: Primary Keys
4. **CONSULTA 4**: Foreign Keys
5. **CONSULTA 5**: Unique Constraints
6. **CONSULTA 6**: Índices
7. **CONSULTA 7**: RLS Policies
8. **CONSULTA 8**: Verificación de campos específicos

## Consejo

Si alguna consulta sigue dando timeout, puedes ejecutarla filtrando por una tabla específica. Por ejemplo, para la CONSULTA 2, puedes agregar:

```sql
WHERE table_schema = 'public'
    AND table_name = 'nombre_de_la_tabla'  -- Agregar esta línea
```

Y ejecutarla tabla por tabla.

