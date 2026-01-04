# Alternativa: Usar Table Editor de Supabase

Si las consultas SQL siguen dando timeout, puedes usar el **Table Editor** de Supabase que es más visual y no requiere consultas complejas.

## Pasos usando Table Editor

1. **Ir a Table Editor** en el menú lateral de Supabase
2. **Para cada tabla**, hacer clic en su nombre
3. **Ver la estructura** en la pestaña "Columns" o "Estructura"
4. **Tomar capturas de pantalla** o copiar manualmente:
   - Nombre de cada columna
   - Tipo de dato
   - Si permite NULL
   - Valor por defecto
   - Si es Primary Key
   - Si es Foreign Key

## Tablas principales a verificar

Basándome en el proyecto, estas son las tablas que deberían existir:

1. **comercios**
2. **usuarios**
3. **roles**
4. **permisos**
5. **roles_permisos**
6. **categorias**
7. **marcas**
8. **proveedores**
9. **productos**
10. **clientes**
11. **stock**
12. **configuraciones**
13. **compras**
14. **detalle_compras**
15. **pagos_compras**
16. **ventas**
17. **detalle_ventas**
18. **pagos_ventas**
19. **cajas**
20. **movimientos_stock**

## Información mínima necesaria

Para cada tabla, necesito saber:

- ✅ **Nombre de la tabla**
- ✅ **Columnas** (nombre y tipo)
- ✅ **Primary Key** (qué columna)
- ✅ **Foreign Keys** (qué columnas y a qué tablas referencian)
- ✅ **Si tiene**: `sync_id`, `created_at`, `updated_at`, `comercio_id`

## Formato para compartir

Puedes compartir la información así:

```
TABLA: comercios
- id (uuid, PK)
- razon_social (text)
- email (text)
- sync_id (uuid)
- created_at (timestamptz)
- updated_at (timestamptz)
```

O simplemente tomar capturas de pantalla del Table Editor.

