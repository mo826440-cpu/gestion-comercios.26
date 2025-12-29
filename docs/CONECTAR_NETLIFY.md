# 🔗 Conectar Netlify con GitHub - Paso a Paso

Tu repositorio: `mo826440-cpu/sistema_kioscos`

---

## 📋 OPCIÓN 1: Si ya tenés un sitio en Netlify (Reconectar)

Si ya tenías Netlify conectado con el repo viejo, necesitás reconectarlo:

### Paso 1: Ir a tu sitio en Netlify

1. Andá a: https://app.netlify.com
2. Iniciá sesión
3. Buscá tu sitio (probablemente se llama `sistema-kiosco-pwa` o similar)

### Paso 2: Verificar/Reconectar el repositorio

1. Hacé clic en tu sitio
2. Andá a **Site settings** → **Build & deploy** → **Continuous Deployment**
3. En la sección **"Connected repository"**, deberías ver tu repo

**Si NO está conectado o está conectado a otro repo:**

1. Hacé clic en **"Link to Git provider"** o **"Change repository"**
2. Seleccioná **GitHub** (si no está conectado)
3. Autorizá el acceso si te lo pide
4. Buscá y seleccioná: `mo826440-cpu/sistema_kioscos`
5. Seleccioná la branch: `main`
6. Hacé clic en **"Save"**

### Paso 3: Configurar Build Settings

En la misma página (**Build & deploy** → **Build settings**):

- **Build command:** (dejá vacío o poné `echo "No build needed"`)
- **Publish directory:** `.` (un punto, significa la raíz)

Hacé clic en **"Save"**

### Paso 4: Trigger un nuevo deploy

1. Andá a la pestaña **"Deploys"**
2. Hacé clic en **"Trigger deploy"** → **"Deploy site"**
3. O simplemente esperá unos segundos, Netlify debería detectar el cambio automáticamente

**¡Listo!** Tu sitio debería actualizarse con el nuevo contenido.

---

## 📋 OPCIÓN 2: Crear un sitio nuevo en Netlify

Si preferís crear un sitio completamente nuevo:

### Paso 1: Ir a Netlify

1. Andá a: https://app.netlify.com
2. Iniciá sesión

### Paso 2: Importar proyecto desde GitHub

1. Hacé clic en **"Add new site"** → **"Import an existing project"**
2. Seleccioná **"GitHub"**

### Paso 3: Autorizar GitHub (si es la primera vez)

Si es la primera vez que conectás GitHub con Netlify:

1. Netlify te va a pedir autorización
2. Hacé clic en **"Authorize Netlify"**
3. Autorizá el acceso (podés elegir todos los repos o solo algunos)
4. Volvé a Netlify

### Paso 4: Seleccionar tu repositorio

1. En la lista de repositorios, buscá: **`sistema_kioscos`**
2. Hacé clic en el repositorio

### Paso 5: Configurar el Build

Netlify te muestra una página de configuración:

- **Branch to deploy:** `main` (debería estar seleccionado por defecto)
- **Build command:** (dejá vacío o poné `echo "No build needed"`)
- **Publish directory:** `.` (un punto, significa la raíz del proyecto)

### Paso 6: Deploy!

1. Hacé clic en **"Deploy site"**
2. Netlify va a empezar a hacer el deploy
3. Esperá unos segundos (generalmente menos de 1 minuto)

### Paso 7: Ver tu sitio

Cuando termine, Netlify te da una URL tipo:

```
https://random-name-12345.netlify.app
```

O podés cambiar el nombre en **Site settings** → **General** → **Change site name**

---

## ✅ Verificación

Después del deploy:

1. **Andá a la URL de tu sitio**
2. Deberías ver **"GestiónKiosco v1.0.0"** en el header y footer
3. El sitio debería funcionar correctamente

---

## 🔄 Actualizaciones Automáticas

Una vez conectado, cada vez que hagas cambios:

1. **Hacé tus cambios** en los archivos
2. **Commit y push a GitHub:**
   ```powershell
   cd "C:\Sistema_Gestión_Kioscos.05"
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
3. **Netlify automáticamente** detecta el cambio y hace un nuevo deploy (en 1-2 minutos)

No necesitás hacer nada más, es automático. 🎉

---

## 🔧 Cambiar el nombre del sitio

Si querés cambiar la URL de tu sitio:

1. **Site settings** → **General** → **Site details**
2. Hacé clic en **"Change site name"**
3. Elegí un nombre (debe ser único)
4. Tu nueva URL: `https://tu-nombre-elegido.netlify.app`

---

## ❓ Solución de Problemas

### El sitio no se actualiza después del push
- Verificá en Netlify → **Deploys** que el último deploy se haya completado
- Revisá los logs del deploy por errores
- Probá hacer un deploy manual: **Deploys** → **Trigger deploy**

### Error al conectar con GitHub
- Verificá que hayas autorizado Netlify en GitHub
- Andá a: https://github.com/settings/applications
- Verificá que "Netlify" esté en la lista de aplicaciones autorizadas

### El sitio carga pero muestra errores
- Revisá la consola del navegador (F12)
- Verificá que las rutas de los archivos sean correctas
- Asegurate de que el "Publish directory" sea `.` (punto)

---

¿Necesitás ayuda con algún paso específico? Decime y te guío más en detalle.

