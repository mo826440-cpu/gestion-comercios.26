# Instrucciones: Verificar Estructura de Tablas

## Pasos para Ejecutar el Script

### 1. Abrir SQL Editor en Supabase

1. Ir a tu proyecto en Supabase
2. Hacer clic en **"SQL Editor"** en el menú lateral
3. Crear una nueva consulta o usar una existente

### 2. Ejecutar las Consultas

**Archivo a usar:** `SCRIPT_VERIFICAR_ESTRUCTURA_COMPLETA.sql`

**Importante:** Ejecutar **cada consulta por separado** (hay 7 consultas en total)

#### Consulta 1: Lista de Tablas
- Seleccionar desde `-- CONSULTA 1` hasta antes de `-- CONSULTA 2`
- Ejecutar (Run o `Ctrl + Enter`)
- **Copiar los resultados**

#### Consulta 2: Columnas de Todas las Tablas
- Seleccionar desde `-- CONSULTA 2` hasta antes de `-- CONSULTA 3`
- Ejecutar
- **Copiar los resultados**

#### Consulta 3: Primary Keys
- Seleccionar desde `-- CONSULTA 3` hasta antes de `-- CONSULTA 4`
- Ejecutar
- **Copiar los resultados**

#### Consulta 4: Foreign Keys
- Seleccionar desde `-- CONSULTA 4` hasta antes de `-- CONSULTA 5`
- Ejecutar
- **Copiar los resultados**

#### Consulta 5: Unique Constraints
- Seleccionar desde `-- CONSULTA 5` hasta antes de `-- CONSULTA 6`
- Ejecutar
- **Copiar los resultados**

#### Consulta 6: Índices
- Seleccionar desde `-- CONSULTA 6` hasta antes de `-- CONSULTA 7`
- Ejecutar
- **Copiar los resultados**

#### Consulta 7: Verificación de Campos Específicos
- Seleccionar desde `-- CONSULTA 7` hasta el final
- Ejecutar
- **Copiar los resultados**

### 3. Compartir los Resultados

Pegar todos los resultados aquí en el chat, identificando cada consulta:

```
=== CONSULTA 1: Lista de Tablas ===
[paste resultados aquí]

=== CONSULTA 2: Columnas ===
[paste resultados aquí]

=== CONSULTA 3: Primary Keys ===
[paste resultados aquí]

=== CONSULTA 4: Foreign Keys ===
[paste resultados aquí]

=== CONSULTA 5: Unique Constraints ===
[paste resultados aquí]

=== CONSULTA 6: Índices ===
[paste resultados aquí]

=== CONSULTA 7: Verificación de Campos ===
[paste resultados aquí]
```

## Qué Voy a Verificar

Basándome en el código del proyecto y los scripts SQL que creamos, voy a verificar:

1. ✅ **Que todas las tablas necesarias existan**
2. ✅ **Que tengan las columnas correctas** (nombre, tipo, nullable, default)
3. ✅ **Que tengan Primary Keys** correctos
4. ✅ **Que tengan Foreign Keys** correctas
5. ✅ **Que tengan Unique Constraints** donde corresponde
6. ✅ **Que tengan Índices** necesarios
7. ✅ **Que tengan campos especiales**: `sync_id`, `created_at`, `updated_at`, `comercio_id`, `responsable_nombre`

## Tablas Esperadas

Según el proyecto, deberían existir estas tablas:

1. comercios
2. usuarios
3. roles
4. permisos
5. roles_permisos
6. categorias
7. marcas
8. proveedores
9. productos
10. clientes
11. stock
12. configuraciones
13. compras
14. detalle_compras
15. pagos_compras
16. ventas
17. detalle_ventas
18. pagos_ventas
19. cajas
20. movimientos_stock

## Nota

Si alguna consulta da timeout, ejecutarla tabla por tabla usando el script `scriptVerificarEstructuraTablas_UNA_TABLA.sql`.

