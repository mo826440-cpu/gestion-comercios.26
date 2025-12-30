PARA CREAR CADA VENTANA:

VENTANA CATEGORIAS

- Parte superior: Indicadores de Cantidad de categorias cargadas
- Parte media: Botón de cargar nueva categoria.
- Panel para cargar nueva categoria: 
  * Campo de Nombre de categoria (obligtorio)
  * Campo de especificaciones (opcional)
  * Boton de guardar (se supone que se debe gurdar como activa por defecto)
  * Botón de cancelar
- Parte inferior: Tabla de registros
  1º Columna Id de categoria
  2º Columna Nombre de categoría (debe contener una flecha para filtrar, tipo filtro de excel)
  3º Columna Estado de categoria (Activa - Inactiva)
  4º Columna Fecha de registro o última modificación
  5º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  6º Columna Acciones (editar)

VENTANA MARCAS

- Parte superior: Indicadores de Cantidad de marcas cargadas
- Parte media: Botón de cargar nueva marca.
- Panel para cargar nueva marca: 
  * Campo de Nombre de marca (obligatorio)
  * Campo de especificaciones (opcional)
  * Boton de guardar (se supone que se debe gurdar como activa por defecto)
  * Botón de cancelar
- Parte inferior: Tabla de registros
  1º Columna Id de marca
  2º Columna Nombre de marca (debe contener una flecha para filtrar, tipo filtro de excel)
  3º Columna Estado de marca (Activa - Inactiva)
  4º Columna Fecha de registro o última modificación
  5º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  6º Columna Acciones (editar)

VENTANA DE PROVEEDORES

- Parte superior: 
* Indicadores de Cantidad de proveedores cargados.
* Indicador de cantidad de proveedores que les debo.
* Indicador del Monto total que debo a los proveedores en pesos argentinos, usar formato ejemplo $1.000.000,00.
- Parte media: Botón de cargar nuevo proveedor.
- Panel para cargar nuevo proveedor: 
  * Campo de Nombre del proveedor (obligatorio)
  * Campo de contacto (opcional)
  * Campo de especificaciones (opcional)
  * Boton de guardar (se supone que se debe gurdar como activo por defecto)
  * Botón de cancelar
- Parte inferior: Tabla de registros
  1º Columna Id de proveedor
  2º Columna Nombre del proveedor (debe contener una flecha para filtrar, tipo filtro de excel, me debe permitir filtrar buscando por nombre, ejemplo pongo 3 letras y ya me debe tirar una lista con los nombres que coincidan, y a la vez puedo ir buscando entre la lista con las flechas del teclado, o sea, que se deben ir marcando en otro color el nombre seleccionado y al nombre que le doy enter es el que me debe filtar)
  3º Columna de contacto del proveedor
  4º Columna de especificaciones
  5º Columna Estado del proveedor (Activa - Inactiva)
  6º Columna Fecha de registro o última modificación
  7º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  8º Columna Acciones (editar)

VENTANA DE CLIENTES

- Parte superior: 
* Indicadores de Cantidad de clientes cargados.
* Indicador de cantidad de clientes que me deben.
* Indicador del Monto total que los clientes me deben, en pesos argentinos, usar formato ejemplo $1.000.000,00.
- Parte media: Botón de cargar nuevo cliente.
- Panel para cargar nuevo cliente: 
  * Campo de Nombre del cliente (obligatorio)
  * Campo de contacto (opcional)
  * Campo de especificaciones (opcional)
  * Boton de guardar (se supone que se debe gurdar como activo por defecto)
  * Botón de cancelar
- Parte inferior: Tabla de registros
  1º Columna Id de cliente
  2º Columna Nombre del cliente (debe contener una flecha para filtrar, tipo filtro de excel, me debe permitir filtrar buscando por nombre, ejemplo pongo 3 letras y ya me debe tirar una lista con los nombres que coincidan, y a la vez puedo ir buscando entre la lista con las flechas del teclado, o sea, que se deben ir marcando en otro color el nombre seleccionado y al nombre que le doy enter es el que me debe filtar)
  3º Columna de contacto del cliente
  4º Columna de especificaciones
  5º Columna Estado del cliente (Activa - Inactiva)
  6º Columna Fecha de registro o última modificación
  7º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  8º Columna Acciones (editar)

VENTANA DE PRODUCTOS

- Parte superior: 
* Indicadores de Cantidad registrados.
* Indicador de cantidad activos.
- Parte media: Botón de cargar nuevo producto.
- Panel para cargar nuevo producto: 
  * Campo de Codigo de barras, se debe poder cargar con scanner o cámara del celular y no se debe repetir nunca (obligatorio)
  * Campo de Nombre, no se debe repetir nunca (obligatorio)
  * Campo de categoria (por defecto debe aparecer No Aplica, sino se debe poder agregar según las categorías cargadas en ventana de categorias, debe mostrar las opciones en lista desplegable con opción de filtrar por nombre)
  * Campo de marca (por defecto debe aparecer No Aplica, sino se debe poder agregar según las marcas cargadas en ventana de marcas, debe mostrar las opciones en lista desplegable con opción de filtrar por nombre)
  * Campo de precio, con formato pesos argentinos, ejemplo $1.000.000,00, debe contener un mensaje que diga que acá va el precio de venta, NO DE COMPRA (obligatorio)
  * Campo de stock disponible (obligatorio)
  * Campo de stock minimo (obligatorio)
  * Campo de unidad de medida, con opciones que sugieras, pero por defecto debe aparecer "Un."
  * Campo de especificaciones (opcional)
  * Boton de guardar (se supone que se debe gurdar como activo por defecto)
  * Botón de cancelar
- Parte inferior: Tabla de registros
  1º Columna Id
  2º Columna con código de barras (se debe poder filtrar colocando el código de barras)
  3º Columna Nombre (debe contener una flecha para filtrar, tipo filtro de excel, me debe permitir filtrar buscando por nombre, ejemplo pongo 3 letras y ya me debe tirar una lista con los nombres que coincidan, y a la vez puedo ir buscando entre la lista con las flechas del teclado, o sea, que se deben ir marcando en otro color el nombre seleccionado y al nombre que le doy enter es el que me debe filtar)
  4º Columna de precio
  5º Columna de stock (se debe pintar con color rojo si esta en cero y de amarillo si esta por debajo del límite)
  6º Columna Estado (Activa - Inactiva)
  7º Columna Fecha de registro o última modificación
  8º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  9º Columna Acciones (ver detalle (para ver los demás detalles ejemplo ctegori, marca, etc.) - editar).

VENTANA DE COMPRAS

- Parte superior: 
* Indicadores de Cantidad registradas en el mes actual.
* Indicador del monto total de compras en el mes actual, en pesos argentinos con formato ejemplo $1.000.000,00.
- Parte media: Botón de cargar nueva compra (que se pueda abrir con F2 o algún otro atajo recomendable).
- Panel para cargar nueva compra:
  * Campo de Facturación (debe aparecer por defecto No Aplica)
  * Campo de Proveedor, debe aparecer por defecto No Aplica, sino, se debe poder buscar por nombre según los proveedores cargados en ventana de proveedores.
  * Botón de agregar producto, me debe abrir los siguientes campos:
    - codigo de barras (que se pueda cargar manual, con scanner, con camara del celular o se debe cargar automaticamente según el nombre del producto que elija) (obligatorio).
    - nombre del producto (se puede agregar manualmente el nombre completo, se puede agregar mediante una lista de opciones que me va tirando al poner letras o se debe cargar automaticamente según el código de barras cargado). (obligatorio).
    - unidades (se debe cargar manualmente), (obligatorio).
    - Precio (se debe cargar manualmente, con formato pesos argentinos, ejemplo $1.000.000,00).
    - Al dar Enter o Intro, me debe cargar, en mismo panel de cargar nueva compra, e formato tabla, los datos del producto cargado anteriormente y automaticamente se debe abrir nueva opción de cargar otro producto con foco en campo codigo de barras.
    - Al irse cargando los productos, la tabla me debe mostrar el monto total por propducto y el monto total de la compra. 
    - Los productos que se vayan cargando deben tener la posibilidad de eliminarse y/o editarse antes de finalizar la compra.
   * Botón de agregar pago, me debe abrir los siguientes campos:
    - Forma de pago (ejemplo, efectivo (debe aparecer por defecto), transferencia, QR, Debito, Credito, Cheque, Otro).
    - Monto a pagar, me debe aparecer por defecto el monto que debo pagar o el resto que queda por pagar, con posibilidad de modifical manualmente. se debe mostrar en pesos argentinos, ejemplo $1.000.000,00.
    - Dar enter, me debe cargar la especificación de pago y con posibilidad de agregar nuevo tipo de pago. Y se debe habilitar el botón de finalizar compra.
    - Etiqueta de monto total pagado, indicador del monto total pagado. (en pesos argentinos, ejemplo $1.000.000,00)
    - Etiqueta de onto total de deuda, indicador del monto que quedo debiendo (en pesos argentinos, ejemplo $1.000.000,00)
    * Botón de cancelar compra
    * Botón de finalizar compra, se debe habilitar cuando todos los campos obligatorios esten cargados, al hacer click me debe cargar los registros en la tabla de registros en parte inferior de la ventana.

- Parte inferior: Tabla de registros
  1º Columna Id
  2º Columna con facturación (se debe poder filtrar colocando la facturación)
  3º Columna proveedor (debe contener una flecha para filtrar, tipo filtro de excel, me debe permitir filtrar buscando por nombre, ejemplo pongo 3 letras y ya me debe tirar una lista con los nombres que coincidan, y a la vez puedo ir buscando entre la lista con las flechas del teclado, o sea, que se deben ir marcando en otro color el nombre seleccionado y al nombre que le doy enter es el que me debe filtar)
  4º Columna de cantidad de productos comprada (ejemplo, compre 10 unidad del producto A y 5 del B, me debe mostrar 15 Unidades).
  5º Columna de Monto total de la compra (en pesos argentinos, ejemplo $1.000.000,00).
  6º Columna de Monto total abonado (en pesos argentinos, ejemplo $1.000.000,00).
  7º Columna de estado (Pagado - Deuda (debe aparecer en rojo si esta en deuda)).
  8º Columna Fecha de registro o última modificación
  9º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  10º Columna Acciones (ver detalle (para ver todos los detalles de la compra) - editar (ejemplo para agregar un nuevo pago), eliminar (para eliminar una compra), imprimir detalle (en formato tipo POS 80)).

  VENTANA DE VENTAS

- Parte superior: 
* Indicadores de Cantidad registradas en el mes actual.
* Indicador del monto total de ventas en el mes actual, en pesos argentinos con formato ejemplo $1.000.000,00.
- Parte media: Botón de cargar nueva venta (que se pueda abrir con F2 o algún otro atajo recomendable).
- Panel para cargar nueva venta:
  * Campo de Facturación (debe aparecer por defecto No Aplica)
  * Campo de cliente, debe aparecer por defecto No Aplica, sino, se debe poder buscar por nombre según los clientes cargados en ventana de clientes.
  * Botón de agregar producto, me debe abrir los siguientes campos:
    - codigo de barras (que se pueda cargar manual, con scanner, con camara del celular o se debe cargar automaticamente según el nombre del producto que elija) (obligatorio).
    - nombre del producto (se puede agregar manualmente el nombre completo, se puede agregar mediante una lista de opciones que me va tirando al poner letras o se debe cargar automaticamente según el código de barras cargado). (obligatorio).
    - Cantidad de unidades (se debe cargar manualmente), (obligatorio).
    - Precio (se debe cargar automaticamente, con posibilidad de modificar manualmente, con formato pesos argentinos, ejemplo $1.000.000,00).
    - Descuento, se debe apicar manualmente un % de descuento, debe aparecer en cero % por defecto.
    - Al dar Enter o Intro, me debe cargar, en mismo panel de cargar nueva venta, e formato tabla, los datos del producto cargado anteriormente y automaticamente se debe abrir nueva opción de cargar otro producto con foco en campo codigo de barras.
    - Al irse cargando los productos, la tabla me debe mostrar el monto total por propducto y el monto total de la compra. con formato pesos argentinos, ejemplo $1.000.000,00.
    - Los productos que se vayan cargando deben tener la posibilidad de eliminarse y/o editarse antes de finalizar la compra.
   * Botón de agregar pago, me debe abrir los siguientes campos:
    - Forma de pago (ejemplo, efectivo (debe aparecer por defecto), transferencia, QR, Debito, Credito, Cheque, Otro).
    - Monto a pagar, me debe aparecer por defecto el monto que me deben pagar o el resto que queda por pagar, con posibilidad de modifical manualmente. se debe mostrar en pesos argentinos, ejemplo $1.000.000,00.
    - Dar enter, me debe cargar la especificación de pago y con posibilidad de agregar nuevo tipo de pago. Y se debe habilitar el botón de finalizar venta.
    - Etiqueta de monto total pagado, indicador del monto total pagado. (en pesos argentinos, ejemplo $1.000.000,00)
    - Etiqueta de monto total de deuda, indicador del monto que quedo debiendo (en pesos argentinos, ejemplo $1.000.000,00)
    * Botón de cancelar venta (con mensaje de verificación).
    * Botón de finalizar venta, se debe habilitar cuando todos los campos obligatorios esten cargados, al hacer click me debe cargar los registros en la tabla de registros en parte inferior de la ventana.

- Parte inferior: Tabla de registros
  1º Columna Id
  2º Columna con facturación (se debe poder filtrar colocando la facturación)
  3º Columna cliente (debe contener una flecha para filtrar, tipo filtro de excel, me debe permitir filtrar buscando por nombre, ejemplo pongo 3 letras y ya me debe tirar una lista con los nombres que coincidan, y a la vez puedo ir buscando entre la lista con las flechas del teclado, o sea, que se deben ir marcando en otro color el nombre seleccionado y al nombre que le doy enter es el que me debe filtar)
  4º Columna de cantidad de productos vendida (ejemplo, vendi 10 unidad del producto A y 5 del B, me debe mostrar 15 Unidades).
  5º Columna de Monto total de la venta (en pesos argentinos, ejemplo $1.000.000,00).
  6º Columna de Monto total abonado (en pesos argentinos, ejemplo $1.000.000,00).
  7º Columna de estado (Pagado - Deuda (debe aparecer en rojo si esta en deuda)).
  8º Columna Fecha de registro o última modificación
  9º Columna responsable de registro (según quien haya estado logueado al momento de registrar y/o actulizar)
  10º Columna Acciones (ver detalle (para ver todos los detalles de la compra) - editar (ejemplo para agregar un nuevo pago), eliminar (para eliminar una venta), imprimir detalle (en formato tipo POS 80)).

VENTANA DE USUARIOS

- Parte superior: 
* Indicadores de Cantidad de USUARIOS cargados.
* Indicador de cantidad de USUARIOS ACTIVOS.
- Parte media: Botón de cargar nuevo usuario.
- Panel para cargar nuevo usuario: 
  * Esto se debe adaptar a lo que ya tenemos armado para login e ingreso al sistema, con roles y permisos.
- Parte inferior: Tabla de registros
  * También la tabla se debe adaptar a los detalles de lo ya armado.

VENTANA CONFIGURACION

* Por ahora esta lista

VENTANA DE MANTENIMIENTO

* Por ahora esta lista

VENTANA DE DASHBOARD

* Me debe mostrar los siguientes gráficos:

- Grafico de barras laterales con los clientes con deudas (con barra de desplazamiento)

- Grafico de barras verticales de ventas (montos total y numero de ventas)

- Grafico de torta de los (x) productos más vendidos, la x determinara la cantidad de productos que quiero ver.

- Grafico de Barras laterales con los proveedores que les debo. (con barra de desplazamiento)

- Grafico de formas de pago de los clientes (ejemplo efectivo, $150.000,00, QR, $40.000,00, etc)

- Grafico de torta de las ventas registradas por usuarios, ejemplo, Usuari A, $180.000,00, Usuario B $120.000,00, etc.

- Todos los graficos deben tener posibilidad de filtar por fecha, de forma indibidual.




NOTA: En todas las páginas que sea recomendable, debo tener la opción de ver hasta ciertos registros de la tabla y luego pasar a siguiente página de registros, ejemplo, tabla de ventas, tengo 2000 registros cargados, en página 1 puedo ver los últimos 100, en pagina 2 los anteriores 100 y asi sucesivamente.

NOTA: en todos los casos que se aplique un precio, debe ser en formato argentino, ejemplo $1.000.000,00. 