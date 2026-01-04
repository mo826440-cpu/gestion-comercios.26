# Guía Paso a Paso: Usar Table Editor de Supabase

Dado que las consultas SQL están dando timeout, vamos a usar el **Table Editor** que es más confiable.

## Pasos Detallados

### 1. Ir al Table Editor
- En el menú lateral de Supabase, hacer clic en **"Table Editor"** (ícono de tabla/grid)

### 2. Ver la lista de tablas
- Verás todas las tablas en el panel izquierdo
- Anotar o tomar captura de pantalla de la lista completa

### 3. Para cada tabla, obtener la estructura

**Método A: Ver estructura directamente**
1. Hacer clic en el nombre de la tabla
2. Ir a la pestaña **"Columns"** o **"Estructura"** (si está disponible)
3. Ver la lista de columnas con sus tipos

**Método B: Ver desde el editor**
1. Hacer clic en el nombre de la tabla
2. En la parte superior, buscar el ícono de **"Settings"** o **"⚙️"**
3. O hacer clic derecho en la tabla y seleccionar **"View Structure"** o similar

**Método C: Desde SQL (una tabla a la vez)**
Si el Table Editor no muestra la estructura directamente, puedes ejecutar esto **UNA VEZ POR TABLA**:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'comercios'  -- Cambiar por cada tabla
ORDER BY ordinal_position;
```

## Tablas a verificar (en orden de prioridad)

### Prioridad Alta (verificar primero):
1. **comercios**
2. **usuarios**
3. **categorias**
4. **marcas**
5. **productos**
6. **clientes**
7. **proveedores**
8. **ventas**
9. **compras**

### Prioridad Media:
10. **detalle_ventas**
11. **detalle_compras**
12. **pagos_ventas**
13. **pagos_compras**
14. **stock**
15. **configuraciones**

### Prioridad Baja (tablas maestras):
16. **roles**
17. **permisos**
18. **roles_permisos**
19. **cajas**
20. **movimientos_stock**

## Información mínima necesaria por tabla

Para cada tabla, necesito:

```
TABLA: nombre_de_la_tabla
COLUMNAS:
- columna1 (tipo)
- columna2 (tipo)
- etc.

PRIMARY KEY: nombre_columna
FOREIGN KEYS:
- columna_fk -> tabla_referenciada.columna_referenciada

CAMPOS ESPECIALES:
- sync_id: Sí/No
- created_at: Sí/No
- updated_at: Sí/No
- comercio_id: Sí/No
```

## Formato para compartir

Puedes compartir la información así:

```
=== TABLA: comercios ===
Columnas:
- id (uuid)
- razon_social (text)
- email (text)
- sync_id (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)

Primary Key: id
Foreign Keys: ninguna

Campos especiales:
- sync_id: Sí
- created_at: Sí
- updated_at: Sí
- comercio_id: No (esta tabla no tiene comercio_id porque es la tabla de comercios)
```

## Alternativa: Capturas de pantalla

Si es más fácil, puedes tomar capturas de pantalla del Table Editor mostrando:
1. La lista de tablas
2. La estructura de cada tabla (columnas)

## Consejo

Empieza con las **5-10 tablas principales** (comercios, usuarios, categorias, marcas, productos, clientes, proveedores, ventas, compras). Con esa información puedo hacer una verificación inicial y luego podemos completar el resto.

