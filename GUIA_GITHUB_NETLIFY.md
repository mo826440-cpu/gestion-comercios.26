# 🚀 Guía Completa: Subir Proyecto a GitHub y Conectar con Netlify

Esta guía te explica paso a paso cómo subir tu proyecto GestiónKiosco a GitHub y conectarlo con Netlify para que se actualice automáticamente.

---

## 📋 PARTE 1: Crear Repositorio en GitHub

### Paso 1: Crear cuenta o iniciar sesión en GitHub

1. Andá a **https://github.com**
2. Si no tenés cuenta, creá una (es gratis)
3. Si ya tenés cuenta, iniciá sesión

### Paso 2: Crear un nuevo repositorio

1. Hacé clic en el icono **"+"** (arriba a la derecha) → **"New repository"**
   - O andá directo a: **https://github.com/new**

2. Configurá el repositorio:
   - **Repository name:** `gestion-kiosco` (o el nombre que prefieras)
   - **Description:** (Opcional) "Sistema de gestión para kioscos y comercios"
   - **Visibility:** Elegí **Public** o **Private** (recomiendo Private si es un proyecto personal)
   - ⚠️ **IMPORTANTE:** NO marques ninguna de estas opciones:
     - ❌ No marques "Add a README file"
     - ❌ No marques "Add .gitignore"
     - ❌ No marques "Choose a license"
   - (Ya tenemos estos archivos en el proyecto local)

3. Hacé clic en **"Create repository"**

### Paso 3: Copiar la URL del repositorio

Después de crear el repo, GitHub te muestra una página con instrucciones. Necesitás la **URL del repositorio**. Debería ser algo como:

```
https://github.com/TU_USUARIO/gestion-kiosco.git
```

**¡Guarda esta URL!** La vas a necesitar en el siguiente paso.

---

## 📋 PARTE 2: Conectar tu Proyecto Local con GitHub

### Paso 4: Abrir la terminal en tu proyecto

1. Abrí la terminal (PowerShell o CMD)
2. Navegá a la carpeta del proyecto:
   ```powershell
   cd "C:\Sistema_Gestión_Kioscos.05"
   ```

### Paso 5: Verificar que Git esté inicializado

Ejecutá:
```powershell
git status
```

Si ves un mensaje de error diciendo que no es un repositorio Git, ejecutá:
```powershell
git init
```

### Paso 6: Agregar el repositorio remoto de GitHub

Ejecutá este comando (reemplazá `TU_USUARIO` y `gestion-kiosco` con tus datos reales):

```powershell
git remote add origin https://github.com/TU_USUARIO/gestion-kiosco.git
```

**Ejemplo real:**
```powershell
git remote add origin https://github.com/juanperez/gestion-kiosco.git
```

### Paso 7: Cambiar el nombre de la branch a "main"

Netlify usa "main" por defecto, así que ejecutá:

```powershell
git branch -M main
```

### Paso 8: Verificar que los cambios estén commitados

Ejecutá:
```powershell
git status
```

Si ves archivos en "Changes not staged" o "Untracked files", ejecutá:

```powershell
git add .
git commit -m "Subir proyecto completo a GitHub"
```

### Paso 9: Subir el código a GitHub

Ejecutá:

```powershell
git push -u origin main
```

**Importante:** La primera vez, GitHub te va a pedir que te autentiques. Podés:

- **Opción A:** Usar tu usuario y contraseña de GitHub (si tenés habilitada la autenticación por contraseña)
- **Opción B:** Crear un **Personal Access Token** (más seguro):
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token → Dale todos los permisos de "repo"
  3. Copiá el token y usalo como contraseña

Después de autenticarte, el código se va a subir a GitHub. Vas a ver algo como:

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/TU_USUARIO/gestion-kiosco.git
 * [new branch]      main -> main
```

**¡Listo!** Tu código ya está en GitHub. Podés verificarlo yendo a tu repositorio en GitHub.

---

## 📋 PARTE 3: Conectar Netlify con GitHub

### Paso 10: Ir a Netlify

1. Andá a **https://app.netlify.com**
2. Iniciá sesión con tu cuenta

### Paso 11: Conectar Netlify con GitHub (primera vez)

Si es la primera vez que conectás GitHub con Netlify:

1. Hacé clic en **"Add new site"** → **"Import an existing project"**
2. Seleccioná **"GitHub"**
3. Netlify te va a pedir autorización. Hacé clic en **"Authorize Netlify"**
4. Autorizá el acceso a tu cuenta de GitHub (podés elegir todos los repos o solo algunos)

### Paso 12: Seleccionar tu repositorio

1. En la lista de repositorios, buscá **`gestion-kiosco`** (o el nombre que hayas elegido)
2. Hacé clic en el repositorio

### Paso 13: Configurar el Build

Netlify te va a mostrar una página de configuración. Configurá:

- **Branch to deploy:** `main` (debería estar seleccionado por defecto)
- **Build command:** (dejá vacío o poné `echo "No build needed"`)
- **Publish directory:** `.` (un punto, significa la raíz del proyecto)

### Paso 14: Deploy!

1. Hacé clic en **"Deploy site"**
2. Netlify va a empezar a hacer el deploy. Vas a ver el progreso en tiempo real.
3. Esperá unos segundos (generalmente menos de 1 minuto para sitios estáticos)

### Paso 15: Ver tu sitio

Cuando termine el deploy, Netlify te va a dar una URL temporal tipo:

```
https://random-name-12345.netlify.app
```

Hacé clic en esa URL o en **"Open production deploy"** para ver tu sitio funcionando.

**¡Listo!** Tu sitio ya está en línea.

---

## 🔄 Actualizaciones Futuras (Automatizado)

Ahora que está conectado, cada vez que hagas cambios:

1. **Hacé tus cambios** en los archivos locales
2. **Commit y push a GitHub:**
   ```powershell
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
3. **Netlify automáticamente** va a detectar el cambio en GitHub y va a hacer un nuevo deploy (generalmente en menos de 2 minutos)

No necesitás hacer nada más, es automático. 🎉

---

## 🔧 Configuración Opcional: Cambiar el nombre del sitio

Si querés cambiar la URL de tu sitio en Netlify:

1. Andá a **Site settings** → **General** → **Site details**
2. Hacé clic en **"Change site name"**
3. Elegí un nombre (debe ser único)
4. Tu nueva URL va a ser: `https://tu-nombre-elegido.netlify.app`

---

## 🔧 Configuración Opcional: Dominio personalizado

Si querés usar tu propio dominio (ej: `www.tucomercio.com`):

1. **Site settings** → **Domain management**
2. Hacé clic en **"Add custom domain"**
3. Seguí las instrucciones para configurar DNS

---

## ❓ Solución de Problemas

### Error: "remote origin already exists"
Si ya tenés un remote configurado:
```powershell
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/gestion-kiosco.git
```

### Error al hacer push
Si te da error de autenticación:
- Verificá que tu token/usuario/contraseña sea correcto
- Probá crear un nuevo Personal Access Token en GitHub

### El sitio no carga después del deploy
- Revisá los logs de deploy en Netlify (pestaña "Deploys" → click en el deploy → "Deploy log")
- Verificá que el "Publish directory" sea `.` (punto)

### Los cambios no se actualizan
- Verificá que hayas hecho `git push` correctamente
- Revisá en Netlify que el último deploy se haya completado
- Probá limpiar el caché del navegador (`Ctrl + Shift + R`)

---

## ✅ Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub (`git push`)
- [ ] Netlify conectado con GitHub
- [ ] Deploy completado exitosamente
- [ ] Sitio visible y funcionando en la URL de Netlify

---

¿Necesitás ayuda con algún paso específico? Decime y te guío más en detalle.

