Objetivo: Crear un sistema de gestión completo con ventanas para Categorías, Marcas, Proveedores, Clientes, Productos, Compras, Ventas, Usuarios, Configuración, Mantenimiento y Dashboard.

Consideraciones generales:

Se debe verificar la base de datos existente en Supabase, evaluar su estructura y realizar las modificaciones necesarias para adaptarla a todas las funcionalidades descritas en este prompt.

Todas las tablas deben soportar paginación (ver X registros por página y pasar a la siguiente).

Todos los precios deben mostrarse en pesos argentinos, ejemplo: $1.000.000,00.

Validación de campos obligatorios antes de guardar o finalizar registros.

Filtros tipo Excel en todas las columnas que lo requieran, con búsqueda dinámica por nombre (ejemplo: escribir 3 letras muestra coincidencias, navegación con flechas, Enter selecciona).


1. Ventana Categorías

Parte superior: Indicadores de cantidad de categorías cargadas.

Parte media: Botón “Cargar nueva categoría”.

Panel de carga de categoría:

Campo “Nombre de categoría” (obligatorio).

Campo “Especificaciones” (opcional).

Botón “Guardar” (guarda como activa por defecto).

Botón “Cancelar”.

Tabla inferior:

Id de categoría

Nombre de categoría (filtro tipo Excel)

Estado (Activa/Inactiva)

Fecha de registro o última modificación

Responsable de registro

Acciones (Editar)

2. Ventana Marcas

Igual estructura que Categorías, reemplazando “categoría” por “marca”.

3. Ventana Proveedores

Parte superior:

Cantidad de proveedores cargados

Cantidad de proveedores a los que se les debe

Monto total que se les debe ($1.000.000,00)

Parte media: Botón “Cargar nuevo proveedor”.

Panel de carga de proveedor:

Nombre (obligatorio)

Contacto (opcional)

Especificaciones (opcional)

Botón Guardar (activo por defecto)

Botón Cancelar

Tabla inferior:

Id

Nombre (filtro Excel con búsqueda dinámica y selección con flechas + enter)

Contacto

Especificaciones

Estado (Activa/Inactiva)

Fecha de registro o modificación

Responsable de registro

Acciones (Editar)

4. Ventana Clientes

Igual que Proveedores, reemplazando “proveedor” por “cliente”, y mostrando monto que deben los clientes.

5. Ventana Productos

Parte superior: Cantidad de productos registrados, cantidad activos.

Parte media: Botón “Cargar nuevo producto”.

Panel de carga:

Código de barras (scanner/cámara, único, obligatorio)

Nombre (único, obligatorio)

Categoría (lista desplegable filtrable; default: No Aplica)

Marca (lista desplegable filtrable; default: No Aplica)

Precio (pesos argentinos, obligatorio, mensaje “precio de venta, NO DE COMPRA”)

Stock disponible y mínimo (obligatorios)

Unidad de medida (default “Un.”)

Especificaciones (opcional)

Botón Guardar (activo por defecto)

Botón Cancelar

Tabla inferior:

Id

Código de barras (filtrable)

Nombre (filtro Excel con búsqueda dinámica)

Precio

Stock (rojo si 0, amarillo si bajo stock mínimo)

Estado (Activa/Inactiva)

Fecha de registro/modificación

Responsable

Acciones (Ver detalle / Editar)

6. Ventana Compras

Parte superior: Cantidad de compras del mes, monto total ($).

Parte media: Botón “Cargar nueva compra” (F2 como atajo).

Panel de carga:

Facturación (default “No Aplica”)

Proveedor (default “No Aplica”, filtrable según proveedores)

Agregar producto:

Código de barras (manual/scanner/cámara, obligatorio)

Nombre (manual/lista filtrable, obligatorio)

Unidades (obligatorio)

Precio (manual, $)

Enter carga el producto en tabla interna y abre nuevo producto

Tabla interna muestra monto total por producto y total de compra

Permite editar/eliminar productos antes de finalizar

Agregar pago:

Forma de pago (default efectivo, opciones: transferencia, QR, débito, crédito, cheque, otro)

Monto a pagar (default total a pagar, editable)

Enter carga el pago, habilita “Finalizar compra”

Indicadores: monto total pagado y monto restante

Botón Cancelar

Botón Finalizar (habilitado solo con campos obligatorios)

Tabla inferior:

Id

Facturación (filtrable)

Proveedor (filtro Excel con búsqueda dinámica)

Cantidad total de productos

Monto total de compra ($)

Monto total abonado ($)

Estado (Pagado/Deuda, rojo si deuda)

Fecha de registro/modificación

Responsable

Acciones (Ver detalle / Editar / Eliminar / Imprimir POS 80)

7. Ventana Ventas

Igual que Compras, reemplazando “Proveedor” por “Cliente”, con campo de Descuento (%) y precio cargado automáticamente desde Productos (editable).

8. Ventana Usuarios

Parte superior: Cantidad de usuarios y activos.

Parte media: Botón “Cargar nuevo usuario” (adaptar a login, roles y permisos existentes).

Tabla inferior: Adaptada a los campos de usuarios del sistema.

9. Ventanas Configuración y Mantenimiento

Por ahora lista, sin cambios.

10. Ventana Dashboard

Gráficos:

Barras laterales: clientes con deudas (scrollable)

Barras verticales: ventas (monto y cantidad)

Torta: X productos más vendidos (X definido por usuario)

Barras laterales: proveedores a los que se debe

Torta: formas de pago de clientes (ej: efectivo $150.000, QR $40.000, etc.)

Torta: ventas por usuario ($ por usuario)

Todos los gráficos filtrables por fecha individualmente.

Notas generales:

Todas las tablas deben soportar paginación.

Todos los precios deben estar en formato argentino $1.000.000,00.

Todos los filtros tipo Excel con búsqueda dinámica deben permitir navegación con flechas y selección con Enter.

Campos obligatorios deben validarse antes de guardar o finalizar registros.


Notas adicionales:

Verificar que la estructura de tablas y relaciones en Supabase soporte los campos y funcionalidades solicitadas, agregando o modificando columnas, relaciones o índices si es necesario.

Mantener integridad de datos y claves únicas, especialmente para códigos de barras y nombres únicos de productos, categorías y marcas.

Todos los filtros y búsquedas deben poder manejar grandes volúmenes de registros sin afectar rendimiento.


OTRO PROMT SIMILAR (elegi el que mejor te quede):

Objetivo:
Crear un sistema de gestión completo con ventanas para Categorías, Marcas, Proveedores, Clientes, Productos, Compras, Ventas, Usuarios, Configuración, Mantenimiento y Dashboard.

Consideraciones generales:

Verificar la base de datos existente en Supabase y, si es necesario, realizar modificaciones para adaptarla a las funcionalidades solicitadas.

Todas las tablas deben tener paginación (ver X registros por página y pasar a la siguiente).

Todos los precios deben mostrarse en pesos argentinos, ejemplo: $1.000.000,00.

Validar campos obligatorios antes de guardar o finalizar registros.

Filtros tipo Excel en columnas que lo requieran, con búsqueda dinámica por nombre, navegación con flechas y selección con Enter.

Mantener integridad de datos y claves únicas, especialmente para códigos de barras y nombres únicos de productos, categorías y marcas.

1. Ventana Categorías

Parte superior: Indicador de cantidad de categorías cargadas.

Parte media: Botón “Cargar nueva categoría”.

Panel de carga:

Nombre de categoría (obligatorio)

Especificaciones (opcional)

Botón Guardar (activo por defecto)

Botón Cancelar

Tabla inferior:

Id de categoría

Nombre de categoría (filtro tipo Excel)

Estado (Activa/Inactiva)

Fecha de registro o modificación

Responsable

Acciones (Editar)

2. Ventana Marcas

Igual que Categorías, reemplazando “categoría” por “marca”.

3. Ventana Proveedores

Parte superior:

Cantidad de proveedores cargados

Cantidad de proveedores a los que se les debe

Monto total que se les debe ($1.000.000,00)

Panel de carga:

Nombre (obligatorio)

Contacto (opcional)

Especificaciones (opcional)

Guardar (activo por defecto)

Cancelar

Tabla inferior:

Id, Nombre (filtro Excel con búsqueda dinámica), Contacto, Especificaciones, Estado, Fecha, Responsable, Acciones

4. Ventana Clientes

Igual que Proveedores, mostrando monto que deben los clientes.

5. Ventana Productos

Parte superior: Cantidad registrados, cantidad activos

Panel de carga:

Código de barras (scanner/cámara, único, obligatorio)

Nombre (único, obligatorio)

Categoría (lista filtrable, default “No Aplica”)

Marca (lista filtrable, default “No Aplica”)

Precio (pesos argentinos, obligatorio, mensaje “precio de venta, NO DE COMPRA”)

Stock disponible y mínimo (obligatorios)

Unidad de medida (default “Un.”)

Especificaciones (opcional)

Guardar (activo por defecto)

Cancelar

Tabla inferior:

Id, Código de barras, Nombre (filtro Excel), Precio, Stock (rojo si 0, amarillo si bajo límite), Estado, Fecha, Responsable, Acciones (Ver detalle / Editar)

6. Ventana Compras

Indicadores: Cantidad compras mes, monto total ($)

Panel de carga:

Facturación (default “No Aplica”)

Proveedor (default “No Aplica”, filtrable)

Agregar producto: Código de barras, Nombre, Unidades, Precio, tabla interna con total, edición/eliminación antes de finalizar

Agregar pago: Forma de pago (default efectivo), Monto a pagar (editable), total pagado y deuda, habilita “Finalizar compra”

Cancelar y Finalizar (habilitado solo si todos los campos obligatorios completados)

Tabla inferior: Id, Facturación, Proveedor (filtro Excel), Cantidad productos, Monto total, Monto abonado, Estado (Pagado/Deuda), Fecha, Responsable, Acciones (Ver / Editar / Eliminar / Imprimir POS 80)

7. Ventana Ventas

Igual que Compras, adaptado a clientes y descuento (%), precio cargado automáticamente desde Productos (editable).

8. Ventana Usuarios

Parte superior: Cantidad de usuarios y activos

Panel de carga: Adaptar a login, roles y permisos existentes

Tabla: Adaptada a campos de usuarios del sistema

9. Ventanas Configuración y Mantenimiento

Por ahora lista, sin cambios

10. Ventana Dashboard

Gráficos filtrables por fecha:

Barras laterales: clientes con deudas

Barras verticales: ventas (monto y cantidad)

Torta: X productos más vendidos

Barras laterales: proveedores a los que se debe

Torta: formas de pago de clientes

Torta: ventas por usuario

Notas finales:

Verificar y ajustar la estructura de Supabase: tablas, relaciones, columnas, índices, claves únicas.

Validar integridad de datos y rendimiento para grandes volúmenes de registros.

Filtros tipo Excel, paginación y precios en formato argentino aplicables en todas las ventanas donde corresponda.