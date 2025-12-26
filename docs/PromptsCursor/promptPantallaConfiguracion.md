# Prompt: Pantalla de Configuración

## 📋 Descripción General

Crear la **Pantalla de Configuración** del sistema de gestión de kioscos. Esta pantalla permite a los usuarios autorizados ver y modificar las configuraciones del comercio y del sistema.

---

## 🔐 Reglas de Seguridad y Acceso

### Roles y Permisos

| Rol | Puede Acceder | Puede Ver | Puede Editar |
|-----|---------------|-----------|--------------|
| **Programador** | ✅ | Todo | Todo (solo debugging) |
| **Administrador** | ✅ | Todo | Todo |
| **Gerente** | ✅ | Parcial | Limitado (solo operativo) |
| **Vendedor** | ❌ | Nada | Nada |

### Permisos Requeridos

```
CONFIG_VER          → Puede ver la pantalla de configuración
CONFIG_EDITAR       → Puede modificar cualquier configuración
CONFIG_COMERCIO     → Puede editar datos del comercio
CONFIG_VENTAS       → Puede editar configuración de ventas
CONFIG_STOCK        → Puede editar configuración de stock
CONFIG_IMPRESION    → Puede editar configuración de impresión
```

### Asignación Sugerida por Rol

| Permiso | Administrador | Gerente | Vendedor |
|---------|---------------|---------|----------|
| `CONFIG_VER` | ✅ | ✅ | ❌ |
| `CONFIG_EDITAR` | ✅ | ❌ | ❌ |
| `CONFIG_COMERCIO` | ✅ | ❌ | ❌ |
| `CONFIG_VENTAS` | ✅ | ✅ | ❌ |
| `CONFIG_STOCK` | ✅ | ✅ | ❌ |
| `CONFIG_IMPRESION` | ✅ | ❌ | ❌ |

### Comportamiento de Seguridad

1. **Al cargar la página:**
   - Verificar que el usuario tenga permiso `CONFIG_VER`
   - Si no tiene permiso → Redirigir a `inicio.html` con mensaje de error
   - Registrar intento no autorizado en consola

2. **Campos de solo lectura:**
   - Si el usuario puede VER pero no EDITAR una sección, mostrar los campos deshabilitados
   - Ocultar botones de guardar en secciones no editables

3. **El Vendedor:**
   - NO debe ver el acceso a Configuración en el menú de inicio
   - Si intenta acceder por URL directa → Redirigir

---

## 🎨 Estructura de la Interfaz

### Header
- Título: "Configuración"
- Icono: ⚙️
- Breadcrumb: Inicio > Configuración
- Botón: "← Volver al Inicio"
- Indicador de usuario y rol actual

### Layout Principal
- **Navegación lateral (sidebar)** con las secciones
- **Área de contenido** que muestra la sección activa
- Diseño responsive: sidebar se convierte en tabs en móvil

### Secciones (Tabs/Sidebar)

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ CONFIGURACIÓN                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Sidebar]              │  [Contenido]                  │
│  ─────────              │  ────────────                 │
│  🏪 Comercio            │                               │
│  💰 Ventas              │  Formulario de la sección     │
│  📦 Stock               │  activa con campos            │
│  🖨️ Impresión           │  editables o de solo lectura  │
│  🎨 Aplicación          │                               │
│                         │  [Guardar Cambios]            │
│                         │                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Secciones y Campos

### 1. 🏪 Datos del Comercio
**Permiso requerido para editar:** `CONFIG_COMERCIO`

| Campo | Tipo | Validación | Obligatorio |
|-------|------|------------|-------------|
| Razón Social | text | max 100 chars | ✅ |
| Nombre Fantasía | text | max 50 chars | ❌ |
| CUIT/CUIL | text | formato XX-XXXXXXXX-X | ✅ |
| Condición IVA | select | Responsable Inscripto, Monotributo, Exento | ✅ |
| Dirección | text | max 200 chars | ❌ |
| Ciudad | text | max 50 chars | ❌ |
| Provincia | select | Lista de provincias argentinas | ❌ |
| Código Postal | text | max 10 chars | ❌ |
| Teléfono | text | formato telefónico | ❌ |
| Email de contacto | email | formato email válido | ❌ |
| Sitio Web | url | formato URL válido | ❌ |
| Logo | file/image | max 2MB, jpg/png | ❌ |

**Nota:** El Logo se guarda en Supabase Storage o como base64 en la tabla `comercios`.

---

### 2. 💰 Configuración de Ventas
**Permiso requerido para editar:** `CONFIG_VENTAS`

| Campo | Tipo | Opciones/Validación | Default |
|-------|------|---------------------|---------|
| IVA por defecto | select | 21%, 10.5%, 0% (Exento) | 21% |
| Incluir IVA en precios | toggle | Sí/No | Sí |
| Permitir ventas sin stock | toggle | Sí/No | No |
| Permitir precios personalizados | toggle | Sí/No | No |
| Descuento máximo sin autorización | number | 0-100 (%) | 10 |
| Redondeo de precios | select | Sin redondeo, $0.10, $1.00, $5.00 | Sin redondeo |
| Métodos de pago activos | checkbox múltiple | Efectivo, Débito, Crédito, QR, Transferencia, Cuenta Corriente | Efectivo, Débito |
| Requiere cliente en venta | toggle | Sí/No | No |
| Permitir ventas a crédito | toggle | Sí/No | No |

---

### 3. 📦 Configuración de Stock
**Permiso requerido para editar:** `CONFIG_STOCK`

| Campo | Tipo | Opciones/Validación | Default |
|-------|------|---------------------|---------|
| Control de stock activo | toggle | Sí/No | Sí |
| Permitir stock negativo | toggle | Sí/No | No |
| Alerta de stock bajo | number | cantidad mínima | 5 |
| Notificar stock bajo por email | toggle | Sí/No | No |
| Email para notificaciones | email | formato email | (vacío) |
| Actualización automática de stock | toggle | Sí/No | Sí |
| Mostrar productos sin stock | toggle | Sí/No | Sí |

---

### 4. 🖨️ Configuración de Impresión/Tickets
**Permiso requerido para editar:** `CONFIG_IMPRESION`

| Campo | Tipo | Opciones/Validación | Default |
|-------|------|---------------------|---------|
| Ancho del ticket | select | 58mm, 80mm | 80mm |
| Mostrar logo en ticket | toggle | Sí/No | Sí |
| Encabezado personalizado | textarea | max 200 chars | (vacío) |
| Pie de ticket | textarea | max 200 chars | "¡Gracias por su compra!" |
| Mostrar detalle de IVA | toggle | Sí/No | Sí |
| Imprimir automáticamente | toggle | Sí/No | No |
| Cantidad de copias | number | 1-5 | 1 |
| Mostrar código de barras | toggle | Sí/No | No |

**Vista previa:** Incluir una vista previa del ticket con los datos actuales.

---

### 5. 🎨 Configuración de la Aplicación
**Permiso requerido para editar:** `CONFIG_EDITAR` (solo Admin)

| Campo | Tipo | Opciones/Validación | Default |
|-------|------|---------------------|---------|
| Tema | select | Claro, Oscuro, Sistema | Sistema |
| Color principal | color picker | código hex | #3498db |
| Idioma | select | Español (Argentina) | es-AR |
| Zona horaria | select | America/Argentina/... | Buenos_Aires |
| Formato de fecha | select | DD/MM/YYYY, MM/DD/YYYY | DD/MM/YYYY |
| Formato de hora | select | 12h, 24h | 24h |
| Tiempo de inactividad (sesión) | number | 5-120 minutos | 30 |
| Sonidos de notificación | toggle | Sí/No | Sí |
| Animaciones | toggle | Sí/No | Sí |

---

## 💾 Almacenamiento de Configuración

### Estructura de Datos

Las configuraciones se guardan en dos lugares:

#### 1. Tabla `comercios` (Supabase) - Datos del comercio
```sql
-- Campos existentes en la tabla comercios
razon_social, email, telefono, direccion, ciudad, provincia, 
codigo_postal, cuit, condicion_iva, logo_url, sitio_web, activo
```

#### 2. Nueva tabla `configuraciones` (Supabase) - Configuraciones del sistema
```sql
CREATE TABLE configuraciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comercio_id UUID NOT NULL REFERENCES comercios(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL, -- 'ventas', 'stock', 'impresion', 'aplicacion'
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(comercio_id, categoria, clave)
);

-- Índices
CREATE INDEX idx_config_comercio ON configuraciones(comercio_id);
CREATE INDEX idx_config_categoria ON configuraciones(comercio_id, categoria);
```

#### 3. IndexedDB (Local) - Cache de configuraciones
```javascript
// En indexeddb.js agregar:
configuraciones: 'id, comercio_id, categoria, clave, valor, sync_id'
```

### Valores por Defecto

Cuando un comercio se registra, crear las configuraciones por defecto:

```javascript
const CONFIG_DEFAULTS = {
    ventas: {
        iva_defecto: '21',
        iva_incluido: true,
        ventas_sin_stock: false,
        precios_personalizados: false,
        descuento_max: 10,
        redondeo: 'none',
        metodos_pago: ['efectivo', 'debito'],
        requiere_cliente: false,
        ventas_credito: false
    },
    stock: {
        control_activo: true,
        stock_negativo: false,
        alerta_stock_bajo: 5,
        notificar_email: false,
        email_notificaciones: '',
        actualizacion_automatica: true,
        mostrar_sin_stock: true
    },
    impresion: {
        ancho_ticket: '80mm',
        mostrar_logo: true,
        encabezado: '',
        pie_ticket: '¡Gracias por su compra!',
        mostrar_iva: true,
        imprimir_auto: false,
        copias: 1,
        codigo_barras: false
    },
    aplicacion: {
        tema: 'system',
        color_principal: '#3498db',
        idioma: 'es-AR',
        zona_horaria: 'America/Argentina/Buenos_Aires',
        formato_fecha: 'DD/MM/YYYY',
        formato_hora: '24h',
        tiempo_inactividad: 30,
        sonidos: true,
        animaciones: true
    }
};
```

---

## 🔄 Sincronización

1. **Al cargar la pantalla:**
   - Intentar cargar desde Supabase
   - Si falla (offline) → Cargar desde IndexedDB
   - Mostrar indicador de "modo offline" si corresponde

2. **Al guardar cambios:**
   - Guardar en IndexedDB inmediatamente
   - Agregar a cola de sincronización
   - Intentar sincronizar con Supabase
   - Mostrar feedback al usuario

3. **Conflictos:**
   - Supabase siempre gana (última versión del servidor)
   - Notificar si hay diferencias

---

## 🎨 Diseño Visual

### Estilo General
- Seguir el diseño existente del sistema (global.css)
- Colores consistentes con el resto de la aplicación
- Formularios claros y bien espaciados

### Componentes UI Necesarios
- Toggle switches para booleanos
- Select dropdowns para opciones
- Input numéricos con validación
- Color picker para color principal
- File upload para logo
- Vista previa de ticket

### Estados de los Campos
```css
/* Campo editable */
.config-input { }

/* Campo de solo lectura */
.config-input:disabled {
    background: var(--color-gris-claro);
    cursor: not-allowed;
    opacity: 0.7;
}

/* Campo con error */
.config-input.error {
    border-color: var(--color-error);
}

/* Campo guardado exitosamente */
.config-input.success {
    border-color: var(--color-exito);
}
```

### Feedback al Usuario
- ✅ "Configuración guardada correctamente"
- ⚠️ "Cambios pendientes de sincronizar"
- ❌ "Error al guardar. Intente nuevamente"
- 🔄 "Guardando..." (spinner)

---

## 📁 Archivos a Crear/Modificar

### Archivos Nuevos
```
configuracion.html      → Página principal
css/configuracion.css   → Estilos específicos
js/configuracion.js     → Lógica de la pantalla
```

### Archivos a Modificar
```
js/indexeddb.js         → Agregar tabla 'configuraciones'
js/sync.js              → Agregar sincronización de configuraciones
js/inicio.js            → Agregar acceso condicional a Configuración
inicio.html             → Agregar tarjeta de acceso a Configuración
db/docs/*.sql           → Script para crear tabla configuraciones
```

---

## ✅ Checklist de Implementación

### Fase 1: Base
- [ ] Crear script SQL para tabla `configuraciones`
- [ ] Actualizar IndexedDB con nueva tabla
- [ ] Crear configuracion.html con estructura básica
- [ ] Crear configuracion.css con estilos
- [ ] Crear configuracion.js con verificación de permisos

### Fase 2: Secciones
- [ ] Implementar sección "Datos del Comercio"
- [ ] Implementar sección "Configuración de Ventas"
- [ ] Implementar sección "Configuración de Stock"
- [ ] Implementar sección "Configuración de Impresión"
- [ ] Implementar sección "Configuración de Aplicación"

### Fase 3: Funcionalidad
- [ ] Cargar configuraciones desde Supabase/IndexedDB
- [ ] Guardar cambios con validación
- [ ] Sincronización offline/online
- [ ] Vista previa de ticket
- [ ] Upload de logo

### Fase 4: Permisos y Acceso
- [ ] Verificar permisos por sección
- [ ] Ocultar/deshabilitar según rol
- [ ] Agregar acceso desde inicio.html
- [ ] Agregar nuevos permisos a la base de datos

### Fase 5: Testing
- [ ] Probar con rol Administrador
- [ ] Probar con rol Gerente (acceso limitado)
- [ ] Probar con rol Vendedor (sin acceso)
- [ ] Probar modo offline
- [ ] Probar sincronización

---

## 🚨 Consideraciones Técnicas

1. **Performance:**
   - Cargar solo la sección activa
   - Lazy loading de imágenes (logo)
   - Debounce en campos de texto

2. **Seguridad:**
   - Validar permisos en backend (RLS de Supabase)
   - No confiar solo en validación frontend
   - Sanitizar inputs

3. **UX:**
   - Guardar automáticamente (con debounce)
   - Indicar cambios sin guardar
   - Confirmar antes de salir con cambios pendientes

4. **Responsive:**
   - Sidebar se convierte en tabs en móvil
   - Formularios de una columna en pantallas pequeñas

---

## 📌 Notas Adicionales

- Esta pantalla es crítica para el funcionamiento del sistema
- Los valores de configuración afectan múltiples módulos
- Considerar agregar "Restaurar valores por defecto" por sección
- El logo podría guardarse en Supabase Storage para mejor rendimiento


