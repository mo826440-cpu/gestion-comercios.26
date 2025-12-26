# 🛒 GestiónKiosco - Sistema de Gestión Comercial

> **Versión:** 1.0.0  
> **Estado:** Etapa 1 Completada ✅  
> **Última actualización:** 21 de diciembre de 2025

---

## 📌 Descripción

**GestiónKiosco** es una aplicación de gestión comercial diseñada para kioscos, almacenes y pequeños comercios. El sistema permite:

- Gestionar ventas, productos y stock
- Operar **sin conexión a internet** (Offline First)
- Sincronizar automáticamente cuando hay conexión
- Manejar **múltiples comercios** y **múltiples usuarios**
- Funcionar en celulares, tablets y PCs

---

## 🎯 Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Offline First** | Funciona sin internet, sincroniza cuando puede |
| **Multi-comercio** | Un sistema para 1 o 100 locales |
| **Multi-usuario** | Roles y permisos por usuario |
| **Multi-dispositivo** | Celular, tablet, PC |
| **Sincronización automática** | Sin intervención del usuario |

---

## 🧠 Arquitectura Técnica

### Bases de Datos

| Base | Propósito |
|------|-----------|
| **IndexedDB** (local) | Operación diaria sin internet |
| **Supabase** (nube) | Sincronización, respaldo, multi-dispositivo |

### Flujo de Datos

```
Usuario → IndexedDB (inmediato) → Cola de sync → Supabase (cuando hay internet)
```

El usuario **nunca depende de internet** para operar.

---

## 🖥️ Pantallas del Sistema

### Etapa 1 - Completada ✅

| Pantalla | Archivo | Estado |
|----------|---------|--------|
| Landing Page | `index.html` | ✅ Funcional |
| Registro | `registro.html` | ✅ Con Supabase |
| Login | `login.html` | ✅ Autenticación real |
| Dashboard | `inicio.html` | ✅ Funcional |
| **Mantenimiento** | `mantenimiento.html` | ✅ Solo programador |

### Etapa 2 - En desarrollo

- [x] Pantalla de Mantenimiento (técnica)
- [ ] Pantalla de Configuración
- [ ] Pantalla de Usuarios
- [ ] Módulo de Referencias (Categorías, Marcas, etc.)
- [ ] Módulo de Productos
- [ ] Módulo de Compras
- [ ] Módulo de Ventas

---

## 📂 Estructura del Proyecto

```
Sistema_Gestión_Kioscos.05/
│
├── index.html              # Landing Page
├── registro.html           # Registro de comercio/usuario
├── login.html              # Inicio de sesión
├── inicio.html             # Dashboard principal
│
├── mantenimiento.html      # Panel técnico (solo programador)
│
├── css/
│   ├── global.css          # Estilos globales y variables
│   ├── landing.css         # Estilos de landing
│   ├── registro.css        # Estilos de registro
│   ├── login.css           # Estilos de login
│   ├── inicio.css          # Estilos de dashboard
│   └── mantenimiento.css   # Estilos panel técnico
│
├── js/
│   ├── config.js           # Configuración global
│   ├── supabase.js         # Cliente de Supabase
│   ├── indexeddb.js        # Base de datos local
│   ├── sync.js             # Sincronización
│   ├── landing.js          # Lógica de landing
│   ├── mantenimiento.js    # Lógica panel técnico
│   ├── registro.js         # Lógica de registro
│   ├── login.js            # Lógica de login
│   └── inicio.js           # Lógica de dashboard
│
├── db/
│   └── docs/               # Scripts SQL y documentación DB
│
├── docs/                   # Documentación del proyecto
│
├── assets/
│   ├── icons/              # Íconos del sistema
│   └── fonts/              # Tipografías
│
└── img/
    ├── placeholders/       # Imágenes por defecto
    └── uploads/            # Imágenes subidas por usuarios
```

---

## 👥 Roles y Permisos

### Roles Base

| Rol | Descripción |
|-----|-------------|
| **Administrador** | Control total del comercio |
| **Encargado** | Operativo + reportes |
| **Vendedor** | Solo ventas |

Ver documento completo: `docs/LISTA_REAL_DE_PERMISOS.md`

---

## 🔄 Sincronización

El sistema utiliza un modelo de **sincronización eventual**:

1. Los cambios se guardan primero en IndexedDB
2. Se agregan a una cola de sincronización
3. Cuando hay internet, se envían a Supabase
4. Los conflictos se resuelven por timestamp

Ver detalles técnicos: `docs/FLUJO_EXACTO_DE_SINCRONIZACIÓN.md`

---

## 🛠️ Tecnologías

- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Base Local:** IndexedDB (Dexie.js)
- **Base Remota:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Desarrollo:** Cursor AI

---

## 🚀 Estado del Proyecto

| Etapa | Descripción | Estado |
|-------|-------------|--------|
| **Etapa 1** | Pantallas base + autenticación | ✅ Completada |
| **Etapa 2** | Mantenimiento + Configuración | 🔄 En desarrollo |
| **Etapa 3** | Referencias (Categorías, Productos, etc.) | ⏳ Pendiente |
| **Etapa 4** | Compras y Ventas | ⏳ Pendiente |
| **Etapa 5** | Reportes y Dashboard | ⏳ Pendiente |

---

## 🔧 Panel de Mantenimiento

El sistema incluye un **Panel de Mantenimiento** exclusivo para usuarios técnicos.

### Características
- Estado de memoria (Supabase e IndexedDB)
- Estadísticas del sistema
- Estructura de bases de datos
- Sincronización manual forzada
- Enlaces a herramientas externas

### ⚠️ Seguridad

| Regla | Descripción |
|-------|-------------|
| Acceso exclusivo | Solo usuarios con rol `programador` |
| Creación manual | El usuario programador NO se puede crear desde la app |
| Sin sincronización | El programador NO se sincroniza con IndexedDB |
| Solo online | No puede iniciar sesión en modo offline |

Para crear un usuario programador, usar el script: `db/docs/scriptCrearUsuarioProgramador.sql`

---

## 📎 Notas Importantes

- El sistema prioriza **robustez antes que estética**
- Diseñado para ser **simple de usar y difícil de romper**
- Pensado para el usuario final (kioskero) sin conocimientos técnicos
- Escalable sin necesidad de rediseñar la base de datos

---

> 💡 *"Un sistema que funciona sin internet es un sistema que nunca te deja tirado."*
