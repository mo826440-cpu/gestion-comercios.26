# Instrucciones para Verificar la Estructura (Versión Rápida)

## Opción 1: Script Rápido (Recomendado)

1. **Abrir** `scriptVerificarEstructuraTablas_RAPIDO.sql`
2. **Ejecutar cada consulta por separado** (hay 5 consultas)
3. **Copiar todos los resultados**

Este script tiene consultas optimizadas que deberían ejecutarse rápidamente.

## Opción 2: Tabla por Tabla

Si el script rápido sigue dando timeout:

1. **Ejecutar primero** la CONSULTA 1 del script rápido para obtener la lista de tablas
2. **Abrir** `scriptVerificarEstructuraTablas_TABLA_POR_TABLA.sql`
3. **Para cada tabla** de la lista:
   - Reemplazar `'NOMBRE_TABLA'` con el nombre real de la tabla
   - Ejecutar las 6 consultas (2.1 a 2.6)
   - Copiar los resultados

## Tablas principales a verificar

Basándome en el proyecto, estas son las tablas principales:

- comercios
- usuarios
- roles
- permisos
- roles_permisos
- categorias
- marcas
- proveedores
- productos
- clientes
- stock
- configuraciones
- compras
- detalle_compras
- pagos_compras
- ventas
- detalle_ventas
- pagos_ventas
- cajas
- movimientos_stock

## Consejo

Si sigue habiendo problemas de timeout, ejecuta solo la **CONSULTA 1** y la **CONSULTA 5** del script rápido. Esas dos son las más importantes y deberían ejecutarse sin problemas.

