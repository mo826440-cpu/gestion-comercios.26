# 🔧 Cómo Limpiar Caché en Netlify - Guía Visual

## Método 1: Deploy Manual (Más Simple)

Como ya actualizamos el `netlify.toml` con caché reducido, simplemente:

1. **Andá a la pestaña "Deploys" en Netlify**
2. **Arriba a la derecha, hacé clic en "Trigger deploy"** → **"Deploy site"**
3. O simplemente **arrastrá tu carpeta completa del proyecto** a la zona de deploy

Con el `netlify.toml` actualizado, el nuevo deploy va a tener caché reducido automáticamente.

---

## Método 2: Limpiar Caché desde la Interfaz

La opción puede estar en diferentes lugares según la versión de Netlify:

### Ubicación A: Menú "Trigger deploy"
1. **Pestaña "Deploys"**
2. Botón **"Trigger deploy"** (arriba a la derecha)
3. Click → Buscá **"Clear cache and deploy site"**

### Ubicación B: Settings del Sitio
1. **Site settings** → **Build & deploy**
2. **Post processing** → Buscá opción de limpiar caché

### Ubicación C: Desde un Deploy Específico
1. Click en un deploy específico (para ver detalles)
2. Botón **"Options"** (tres puntos)
3. Buscá opción de limpiar caché

---

## Método 3: Forzar Actualización (Si nada funciona)

Si no encontrás la opción, podés:

1. **Hacer un pequeño cambio en cualquier archivo HTML** (por ejemplo, agregar un comentario)
2. **Hacer un nuevo deploy manual**
3. Esto fuerza a Netlify a regenerar todo

---

## ⚠️ Importante: También limpiá el caché del navegador

Después de hacer el deploy, en tu navegador:

- **Windows/Linux:** `Ctrl + Shift + R` o `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`
- O abrí una **ventana de incógnito** y probá la URL

---

## ✅ Verificación

Después del deploy, verificá que veas:
- **"GestiónKiosco v1.0.0"** en el header y footer
- Si lo ves, estás viendo la versión nueva
- Si no, probá en modo incógnito

