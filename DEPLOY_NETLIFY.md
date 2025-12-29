# 🚀 Guía de Deploy en Netlify - GestiónKiosco

Esta guía te ayudará a subir tu proyecto a Netlify y reemplazar tu proyecto existente.

---

## 📋 Opción 1: Reemplazar proyecto existente (Recomendado)

### Paso 1: Crear repositorio en GitHub/GitLab

1. Andá a **GitHub.com** (o GitLab/Bitbucket)
2. Creá un **nuevo repositorio** (por ejemplo: `gestion-kiosco`)
3. **NO** inicialices con README, .gitignore, ni licencia (ya los tenés)
4. Copiá la URL del repositorio (ejemplo: `https://github.com/tuusuario/gestion-kiosco.git`)

### Paso 2: Conectar tu proyecto local con GitHub

Ejecutá estos comandos en la terminal (desde la carpeta del proyecto):

```bash
# Conectar con tu repositorio remoto
git remote add origin https://github.com/tuusuario/gestion-kiosco.git

# Cambiar nombre de branch a 'main' (Netlify usa 'main' por defecto)
git branch -M main

# Subir tu código
git push -u origin main
```

### Paso 3: Conectar Netlify con GitHub

1. Andá a **Netlify.com** e iniciá sesión
2. Entrá a tu **proyecto existente** que querés reemplazar
3. Andá a **Site settings** → **Build & deploy** → **Continuous Deployment**
4. Hacé clic en **Link to Git provider**
5. Si no tenés conectado GitHub, conectalo primero
6. Seleccioná tu nuevo repositorio: `gestion-kiosco`
7. Seleccioná la branch: `main`

### Paso 4: Configurar Build Settings

En la misma sección de **Build & deploy**:

- **Build command:** (dejá vacío o poné `echo "No build needed"`)
- **Publish directory:** `.` (un punto, significa la raíz)
- **Base directory:** (dejá vacío)

Guardá los cambios. Netlify va a hacer el deploy automáticamente.

---

## 📋 Opción 2: Deploy Manual (Rápido, sin Git)

Si no querés usar Git por ahora, podés hacer un deploy manual:

1. Andá a tu proyecto en **Netlify.com**
2. Andá a la pestaña **Deploys**
3. Arrastrá la carpeta completa del proyecto (`C:\Sistema_Gestión_Kioscos.05`) a la zona de deploy
4. Listo, se va a reemplazar automáticamente

**Nota:** Con este método, cada cambio lo tenés que subir manualmente.

---

## 📋 Opción 3: Crear nuevo sitio (si preferís mantener el viejo)

Si preferís crear un sitio nuevo en lugar de reemplazar:

1. En Netlify, andá a **Add new site** → **Import an existing project**
2. Seleccioná **GitHub** y tu repositorio
3. Configurá igual que en la Opción 1, Paso 4
4. Listo, tenés un sitio nuevo

---

## ✅ Verificación Post-Deploy

Después del deploy, verificá:

1. **El sitio carga correctamente:** Abrí la URL que te da Netlify
2. **Las rutas funcionan:** Probá navegar entre páginas (index.html, login.html, etc.)
3. **La consola no tiene errores:** Abrí F12 y revisá que no haya errores relacionados con rutas
4. **Supabase funciona:** Probá hacer login y verificar que se conecta a Supabase

---

## 🔧 Configuración del archivo `netlify.toml`

Ya creamos un archivo `netlify.toml` con la configuración optimizada:

- ✅ Headers de seguridad
- ✅ Cache para archivos estáticos
- ✅ Redirects para routing (por si lo necesitás después)

No necesitás cambiar nada, pero podés editarlo si querés ajustar algo.

---

## 🐛 Solución de Problemas

### El sitio no carga
- Verificá que el `Publish directory` sea `.` (punto)
- Revisá los logs de deploy en Netlify

### Errores 404 en las páginas
- El `netlify.toml` tiene redirects configurados, debería funcionar
- Si sigue fallando, asegurate de que las rutas en tu HTML sean relativas (ej: `login.html`, no `/login.html`)

### Variables de entorno (si las necesitás)
Si en el futuro necesitás variables de entorno (como claves de Supabase):
1. **Site settings** → **Environment variables**
2. Agregá las variables necesarias
3. En `netlify.toml` podés referenciarlas (ya está comentado un ejemplo)

---

## 📝 Próximos Pasos

Una vez que esté funcionando:

1. **Actualizar Supabase CORS:** Si usás Supabase, agregá la URL de Netlify a la lista de URLs permitidas en Supabase
2. **Dominio personalizado:** Podés configurar un dominio propio en Netlify
3. **SSL:** Netlify lo activa automáticamente, no necesitás hacer nada

---

¿Necesitás ayuda? Revisá los logs de deploy en Netlify o consultame.

