Actuá como un desarrollador full-stack senior especializado en sistemas de gestión comerciales (kioscos, minimercados) con soporte online/offline.

CONTEXTO DEL PROYECTO
Dentro de mi ordenador existe un proyecto llamado:

C:\Sistema_Gestión_Kioscos.05

Este proyecto contiene:
- Código fuente del sistema
- Una carpeta de documentación en:
  C:\Sistema_Gestión_Kioscos.05\db\docs

En esa carpeta hay:
- Archivos .md con definiciones funcionales, conceptos generales, flujos y permisos
- Scripts .sql que definen la estructura de bases de datos (IndexedDB local y Supabase remoto)
- Un README.md ya actualizado con la descripción general del sistema

INSTRUCCIONES INICIALES (MUY IMPORTANTE)
1. Antes de escribir cualquier código:
   - Leé TODO el contenido del proyecto
   - Analizá especialmente los archivos dentro de db\docs
   - Respetá los conceptos, flujos, nombres y decisiones ya documentadas
   - Si algo no está definido, usá criterios simples y coherentes (sin sobre-ingeniería)

2. NO agregues funcionalidades que no hayan sido pedidas.
3. NO implementes lógica avanzada todavía (sync, permisos complejos, roles, etc.).
4. El objetivo es construir una base visual y funcional mínima pero ordenada.

OBJETIVO DE ESTA TAREA
Crear ÚNICAMENTE las primeras 4 pantallas del sistema:

1️⃣ Landing Page  
2️⃣ Pantalla de Registro de Usuario  
3️⃣ Pantalla de Ingreso (Login)  
4️⃣ Pantalla Inicial (Home / Dashboard básica)

REQUERIMIENTOS GENERALES DE LAS PANTALLAS
- Diseño simple, claro y limpio
- Pensadas para kioscos y pequeños comercios
- Responsive (celular, tablet y PC)
- Textos en español
- Estilo profesional, no genérico
- Navegación funcional entre pantallas

DETALLE DE CADA PANTALLA

🔹 1. LANDING PAGE
Debe incluir:
- Nombre del sistema
- Breve descripción (qué es y para quién está pensado)
- Beneficios claros (gestión simple, funciona offline, pensado para kioscos)
- Botones visibles:
  - “Registrarse”
  - “Ingresar”
- No requiere lógica compleja

🔹 2. REGISTRO
Formulario con:
- Nombre del comercio
- Nombre del responsable
- Email
- Contraseña
- Confirmar contraseña

Notas:
- Validaciones básicas (campos obligatorios, contraseñas iguales)
- Sin conexión real a base de datos todavía (estructura preparada)
- Al registrar, redirigir al Login

🔹 3. INGRESO (LOGIN)
Formulario con:
- Email
- Contraseña
- Botón “Ingresar”

Notas:
- Validación simple
- Simular autenticación (placeholder)
- Al ingresar correctamente, ir a Pantalla Inicial

🔹 4. PANTALLA INICIAL (HOME)
Debe mostrar:
- Nombre del comercio (simulado)
- Mensaje de bienvenida
- Accesos visuales (no funcionales aún) a:
  - Ventas
  - Productos
  - Stock
  - Configuración

IMPORTANTE SOBRE EL CÓDIGO
- Crear una estructura clara de carpetas (pages, components, services, etc.)
- Comentar el código donde sea necesario
- Usar nombres claros y consistentes
- Dejar TODO preparado para luego conectar bases de datos y lógica real

FORMA DE TRABAJO
- Generá el código necesario directamente en el proyecto
- Explicá brevemente qué archivos creaste y para qué sirve cada uno
- No continúes con más pantallas ni funcionalidades luego de estas 4

Este es el primer bloque funcional del sistema. Luego de probarlo, seguiremos avanzando.
