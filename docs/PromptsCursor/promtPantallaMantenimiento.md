Actuá como programador senior full-stack, con experiencia en Supabase, IndexedDB, seguridad, roles y aplicaciones offline-first.

Contexto del proyecto:
Estoy desarrollando un sistema de gestión de kioscos con:
- Frontend web (HTML, CSS, JS)
- Base local en IndexedDB
- Backend en Supabase
- Sincronización offline / online
- Sistema de roles y permisos

Necesito que implementes una nueva pantalla llamada "Mantenimiento", destinada EXCLUSIVAMENTE a un usuario especial llamado "programador".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 REGLAS DE SEGURIDAD (CRÍTICAS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. El usuario "programador":
   - NO puede crearse desde el registro del sistema
   - NO puede crearse desde la app
   - SOLO existe si fue creado manualmente en Supabase
   - NO debe sincronizarse nunca con IndexedDB ni con ninguna base local
   - No debe poder iniciar sesión offline

2. Acceso a la pantalla Mantenimiento:
   - Solo visible y accesible si el usuario autenticado tiene rol === "programador"
   - Si otro usuario intenta acceder:
     - Redirigir a inicio.html
     - Registrar intento no autorizado en consola (opcional)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧱 IMPLEMENTACIÓN GENERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Crear archivo:
  - mantenimiento.html
  - mantenimiento.css
  - mantenimiento.js
- Integrar la pantalla al sistema de navegación SOLO para programador
- UI clara, tipo dashboard técnico
- Toda la información debe cargarse mediante funciones JS reutilizables
- Cada bloque debe tener su propio botón de actualización

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 INDICADORES A MOSTRAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 1️⃣ ESTADO DE MEMORIA

Mostrar:

- Uso de memoria general de Supabase
  - Estimado mediante conteo de registros y tamaño aproximado
- Uso de memoria total de IndexedDB
  - Usar indexedDB.databases() y estimaciones de storage
- Uso de memoria por comercio en Supabase
  - Agrupar por comercio_id

Botón:
- "Actualizar estado de memoria"
  - Recalcula y refresca los datos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 2️⃣ ESTADÍSTICAS DE USO DEL SISTEMA

Mostrar:

- Cantidad total de locales registrados
- Cantidad total de usuarios registrados
- Cantidad de usuarios por local
- Cantidad de registros por local (ventas, productos, etc.)

Botón:
- "Actualizar estadísticas"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 3️⃣ ESTRUCTURA DE BASES DE DATOS

Mostrar:

#### Supabase
- Cantidad total de tablas
- Por cada tabla:
  - Nombre
  - Cantidad de columnas
  - Cantidad total de registros
  - Cantidad de registros por columna (si aplica)

#### IndexedDB
- Cantidad de object stores
- Por cada store:
  - Nombre
  - Cantidad de registros
  - Estructura de claves

Botón:
- "Actualizar estructura de bases"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 4️⃣ SINCRONIZACIÓN MANUAL

Botón:
- "Forzar sincronización Supabase ⇄ IndexedDB"
  - Ejecuta el flujo completo de sincronización
  - Mostrar estado:
    - Iniciando
    - En progreso
    - Finalizado
    - Error (con mensaje técnico)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 5️⃣ ENLACES EXTERNOS

Agregar botones visibles:

- "Abrir proyecto en Supabase"
  - Abre el dashboard del proyecto en nueva pestaña
- "Abrir proyecto en Netlify"
  - Abre el deploy en nueva pestaña

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 CONSIDERACIONES TÉCNICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- No hardcodear datos sensibles
- Centralizar funciones de consulta
- Manejar errores con try/catch y logs claros
- Usar comentarios explicativos en código clave
- El código debe ser mantenible y escalable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 DOCUMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Al finalizar:
- Documentar brevemente en README.md:
  - Qué es la pantalla Mantenimiento
  - Para qué sirve
  - Por qué solo existe el rol programador
  - Advertencias de seguridad

Implementar todo respetando la arquitectura existente del proyecto.
No eliminar ni romper funcionalidades actuales.
