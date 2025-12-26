# 🚀 PRÓXIMOS PASOS - Sistema GestiónKiosco

> Guía de desarrollo para continuar el proyecto después de la Etapa 1  
> Última actualización: 21 de diciembre de 2025

---

## 📊 Estado Actual

✅ **Etapa 1 Completada:**
- 4 pantallas base funcionando (Landing, Registro, Login, Inicio)
- Autenticación con Supabase
- Base de datos local (IndexedDB)
- Sincronización básica
- Sistema multi-comercio preparado

---

## 📋 ORDEN DE DESARROLLO

### Etapa 2: Herramientas y Configuración

| # | Pantalla | Descripción | Estado |
|---|----------|-------------|--------|
| 1 | **Mantenimiento** | Herramientas de desarrollo y mantenimiento | ✅ |
| 2 | **Configuración** | Datos del comercio, preferencias del sistema | ⏳ |
| 3 | **Usuarios** | CRUD de usuarios, asignación de roles | ⏳ |

### Etapa 3: Referencias (Datos Maestros)

| # | Pantalla | Descripción | Estado |
|---|----------|-------------|--------|
| 4 | **Referencias** | Pantalla contenedora de datos maestros | ⏳ |
| 5 | ↳ Categorías | CRUD de categorías de productos | ⏳ |
| 6 | ↳ Marcas | CRUD de marcas | ⏳ |
| 7 | ↳ Proveedores | CRUD de proveedores | ⏳ |
| 8 | ↳ Clientes | CRUD de clientes | ⏳ |
| 9 | ↳ Productos | CRUD de productos | ⏳ |

### Etapa 4: Operaciones Comerciales

| # | Pantalla | Descripción | Estado |
|---|----------|-------------|--------|
| 10 | **Compras** | Registro de compras a proveedores | ⏳ |
| 11 | **Ventas** | POS - Punto de venta | ⏳ |

### Etapa 5: Reportes y Dashboard

| # | Pantalla | Descripción | Estado |
|---|----------|-------------|--------|
| 12 | **Reportes** | Reportes de ventas, compras, stock | ⏳ |
| 13 | **Datos de prueba** | Cargar registros para testing | ⏳ |
| 14 | **Dashboard** | Panel principal con métricas | ⏳ |

### Etapa 6: Validación y Comercialización

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 15 | **Verificación general** | Testing completo del sistema | ⏳ |
| 16 | **Comercialización** | Preparar el sistema para venta/distribución | ⏳ |

### Etapa 7: Mejora Continua

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 17 | **Auditoría** | Implementar logs y seguimiento de acciones | ⏳ |
| 18 | **Mejora continua** | Sistema de feedback y actualizaciones | ⏳ |

---

## 📝 DETALLE POR ETAPA

### 1️⃣ Mantenimiento (`mantenimiento.html`) ✅ COMPLETADO

**Descripción:**
Panel técnico exclusivo para usuarios con rol "programador". Permite monitorear y mantener el sistema.

**Funcionalidades implementadas:**
- ✅ Verificación de acceso (solo rol programador)
- ✅ Estado de memoria (Supabase e IndexedDB)
- ✅ Uso de memoria por comercio
- ✅ Estadísticas del sistema (comercios, usuarios, productos, ventas)
- ✅ Detalle por comercio
- ✅ Estructura de bases de datos (tablas y registros)
- ✅ Sincronización manual forzada
- ✅ Enlaces externos (Supabase, Netlify, GitHub)

**Archivos creados:**
- `mantenimiento.html`
- `css/mantenimiento.css`
- `js/mantenimiento.js`
- `db/docs/scriptCrearUsuarioProgramador.sql`

**Seguridad:**
- ⚠️ Solo accesible con rol === "programador"
- ⚠️ Usuario programador NO se puede crear desde la app
- ⚠️ Solo existe si fue creado manualmente en Supabase
- ⚠️ NO se sincroniza con IndexedDB

---

### 2️⃣ Configuración (`configuracion.html`)

**Funcionalidades:**
- Editar datos del comercio (nombre, dirección, teléfono, logo)
- Configurar preferencias (moneda, zona horaria, formato de fecha)
- Configurar impuestos (IVA, otros)
- Configurar métodos de pago aceptados
- Backup/Restauración de datos

**Archivos a crear:**
- `configuracion.html`
- `css/configuracion.css`
- `js/configuracion.js`

---

### 3️⃣ Usuarios (`usuarios.html`)

**Funcionalidades:**
- Listar usuarios del comercio
- Crear nuevo usuario
- Editar usuario existente
- Activar/Desactivar usuario
- Asignar rol y permisos
- Resetear contraseña

**Archivos a crear:**
- `usuarios.html`
- `usuario-form.html`
- `css/usuarios.css`
- `js/usuarios.js`

---

### 4️⃣ Referencias (`referencias.html`)

**Descripción:**
Pantalla contenedora que permite acceder a todas las sub-pantallas de datos maestros.

**Sub-pantallas:**

#### 5️⃣ Categorías
- CRUD completo
- Ordenar categorías
- Activar/Desactivar

#### 6️⃣ Marcas
- CRUD completo
- Logo de marca (opcional)

#### 7️⃣ Proveedores
- Datos de contacto
- Historial de compras
- Saldo pendiente

#### 8️⃣ Clientes
- Datos de contacto
- Historial de compras
- Cuenta corriente (fiado)

#### 9️⃣ Productos
- Código, nombre, descripción
- Categoría, marca
- Precio compra, precio venta
- Stock actual, stock mínimo
- Código de barras
- Imagen del producto

**Archivos a crear:**
- `referencias.html` (contenedor)
- `categorias.html`, `js/categorias.js`
- `marcas.html`, `js/marcas.js`
- `proveedores.html`, `js/proveedores.js`
- `clientes.html`, `js/clientes.js`
- `productos.html`, `js/productos.js`
- `css/referencias.css` (estilos compartidos)

---

### 🔟 Compras (`compras.html`)

**Funcionalidades:**
- Registrar compra a proveedor
- Seleccionar productos y cantidades
- Actualizar stock automáticamente
- Historial de compras
- Cuenta corriente con proveedores

**Archivos a crear:**
- `compras.html`
- `compra-nueva.html`
- `css/compras.css`
- `js/compras.js`

---

### 1️⃣1️⃣ Ventas (`ventas.html`)

**Funcionalidades:**
- Punto de venta (POS)
- Búsqueda rápida de productos
- Carrito de compras
- Múltiples formas de pago
- Ticket/Recibo
- Historial de ventas
- Anulación de ventas (con permisos)
- Devoluciones

**Archivos a crear:**
- `ventas.html` (POS)
- `historial-ventas.html`
- `venta-detalle.html`
- `css/ventas.css`
- `js/ventas.js`

---

### 1️⃣2️⃣ Reportes (`reportes.html`)

**Funcionalidades:**
- Reporte de ventas (diario, semanal, mensual)
- Reporte de compras
- Reporte de stock
- Reporte de productos más vendidos
- Reporte de clientes
- Exportar a PDF/Excel

**Archivos a crear:**
- `reportes.html`
- `css/reportes.css`
- `js/reportes.js`

---

### 1️⃣3️⃣ Datos de Prueba

**Tareas:**
- Crear script para cargar datos de ejemplo
- Categorías de ejemplo (Bebidas, Golosinas, Cigarrillos, etc.)
- Productos de ejemplo
- Clientes de prueba
- Ventas simuladas

---

### 1️⃣4️⃣ Dashboard (`inicio.html` - Mejorado)

**Funcionalidades:**
- Resumen de ventas del día
- Productos con stock bajo
- Gráfico de ventas (últimos 7 días)
- Accesos rápidos a funciones principales
- Alertas y notificaciones

---

### 1️⃣5️⃣ Verificación General

**Checklist:**
- [ ] Probar cada pantalla en móvil
- [ ] Probar cada pantalla en tablet
- [ ] Probar cada pantalla en PC
- [ ] Probar modo offline
- [ ] Probar sincronización
- [ ] Probar con múltiples usuarios
- [ ] Probar con múltiples comercios
- [ ] Verificar rendimiento
- [ ] Corregir errores encontrados

---

### 1️⃣6️⃣ Comercialización

**Tareas:**
- Definir modelo de negocio (licencia, suscripción, etc.)
- Crear landing page de venta
- Documentación para usuarios
- Video tutorial
- Soporte técnico
- Términos y condiciones
- Política de privacidad

---

### 1️⃣7️⃣ Auditoría del Sistema

**Funcionalidades:**
- Log de todas las acciones de usuarios
- Registro de cambios en datos críticos
- Alertas de actividad sospechosa
- Exportar logs
- Dashboard de auditoría

---

### 1️⃣8️⃣ Mejora Continua

**Procesos:**
- Sistema de feedback de usuarios
- Registro de bugs y sugerencias
- Versionado del sistema
- Changelog público
- Actualizaciones automáticas
- Métricas de uso

---

## 🎯 RESUMEN VISUAL

```
ETAPA 2: Herramientas y Configuración
├── 1. Mantenimiento
├── 2. Configuración
└── 3. Usuarios

ETAPA 3: Datos Maestros
├── 4. Referencias (contenedor)
│   ├── 5. Categorías
│   ├── 6. Marcas
│   ├── 7. Proveedores
│   ├── 8. Clientes
│   └── 9. Productos

ETAPA 4: Operaciones
├── 10. Compras
└── 11. Ventas

ETAPA 5: Análisis
├── 12. Reportes
├── 13. Datos de prueba
└── 14. Dashboard

ETAPA 6: Lanzamiento
├── 15. Verificación general
└── 16. Comercialización

ETAPA 7: Mantenimiento
├── 17. Auditoría
└── 18. Mejora continua
```

---

## 💡 Notas Importantes

1. **Cada pantalla debe funcionar offline** - Guardar primero en IndexedDB
2. **Mantener consistencia visual** - Usar estilos de `global.css`
3. **Código comentado** - Para facilitar mantenimiento
4. **Permisos** - Verificar permisos del usuario en cada acción
5. **Sincronización** - Cada operación debe agregarse a la cola de sync

---

> 📌 **Siguiente paso:** Comenzar con la **Pantalla de Mantenimiento**
