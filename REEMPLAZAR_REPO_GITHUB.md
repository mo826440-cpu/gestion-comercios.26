# 🔄 Reemplazar Repositorio Existente en GitHub

Tu usuario de GitHub es: **mo826440-cpu**  
Tu repositorio existente es: **sistema_kioscos**

Tienes **2 opciones** para reemplazarlo:

---

## 📋 OPCIÓN 1: Reemplazar el contenido (Recomendado)

Esta opción mantiene el repositorio pero reemplaza todo su contenido con el nuevo proyecto.

### Paso 1: Conectar con tu repositorio existente

Ejecutá estos comandos en la terminal (desde la carpeta del proyecto):

```powershell
cd "C:\Sistema_Gestión_Kioscos.05"

# Conectá con tu repositorio existente
git remote add origin https://github.com/mo826440-cpu/sistema_kioscos.git

# Si ya tenías un remote, primero eliminarlo:
# git remote remove origin
# git remote add origin https://github.com/mo826440-cpu/sistema_kioscos.git

# Cambiar branch a main
git branch -M main

# Hacer commit de todos los cambios si no lo hiciste
git add .
git commit -m "Reemplazar proyecto completo - GestiónKiosco v1.0.0"
```

### Paso 2: Forzar el push (esto reemplaza TODO el contenido)

⚠️ **ADVERTENCIA:** Esto va a eliminar todo el contenido anterior del repositorio y reemplazarlo con este proyecto.

```powershell
git push -u origin main --force
```

**¿Qué hace `--force`?**
- Elimina todo el historial y archivos anteriores
- Reemplaza con tu nuevo proyecto
- Es como si borraras el repo y crearas uno nuevo, pero manteniendo el mismo nombre

### Paso 3: Verificar

1. Andá a: https://github.com/mo826440-cpu/sistema_kioscos
2. Deberías ver tu nuevo proyecto con todos los archivos actuales

---

## 📋 OPCIÓN 2: Eliminar y crear nuevo (Más limpio)

Si preferís empezar completamente desde cero:

### Paso 1: Eliminar el repositorio viejo en GitHub

1. Andá a: https://github.com/mo826440-cpu/sistema_kioscos
2. **Settings** → Scroll hasta abajo → **"Danger Zone"**
3. Hacé clic en **"Delete this repository"**
4. Escribí `mo826440-cpu/sistema_kioscos` para confirmar
5. Hacé clic en **"I understand the consequences, delete this repository"**

### Paso 2: Crear nuevo repositorio

1. Andá a: https://github.com/new
2. **Repository name:** `sistema_kioscos` (o el nombre que prefieras)
3. **Visibility:** Public o Private
4. ⚠️ **NO marques** README, .gitignore, ni license
5. Hacé clic en **"Create repository"**

### Paso 3: Conectar y subir

```powershell
cd "C:\Sistema_Gestión_Kioscos.05"

git remote add origin https://github.com/mo826440-cpu/sistema_kioscos.git
git branch -M main
git push -u origin main
```

---

## ✅ ¿Cuál opción elegir?

### Usá OPCIÓN 1 si:
- ✅ Querés mantener el mismo nombre de repositorio
- ✅ No te importa perder el historial anterior
- ✅ Querés hacerlo rápido (menos pasos)

### Usá OPCIÓN 2 si:
- ✅ Querés empezar completamente limpio
- ✅ Preferís eliminar y crear uno nuevo
- ✅ No tenés problema en cambiar el nombre del repo si querés

---

## 🔗 Después de reemplazar: Conectar con Netlify

Si ya tenías Netlify conectado con el repo viejo:

1. **Netlify automáticamente** debería detectar el cambio y hacer un nuevo deploy
2. Si no, andá a **Site settings** → **Build & deploy** → **Continuous Deployment**
3. Verificá que esté conectado a `mo826440-cpu/sistema_kioscos`
4. Si no está, reconectalo

---

## ❓ Preguntas Frecuentes

### ¿Pierdo los issues/PRs/comentarios del repo viejo?
- Con **Opción 1 (force push):** Sí, se pierden (a menos que los hayas guardado)
- Con **Opción 2 (eliminar):** Sí, se pierden todo

### ¿Qué pasa con las URLs de Netlify si uso Opción 1?
- Nada, las URLs siguen funcionando igual
- Netlify va a detectar el cambio y hacer un nuevo deploy automáticamente

### ¿Puedo hacer backup del repo viejo antes?
Sí, podés:
1. Clonar el repo viejo: `git clone https://github.com/mo826440-cpu/sistema_kioscos.git sistema_kioscos-backup`
2. O descargar como ZIP desde GitHub antes de reemplazarlo

---

## 🚀 Comandos rápidos (Opción 1 - Recomendada)

Si querés hacerlo rápido, ejecutá estos comandos en orden:

```powershell
cd "C:\Sistema_Gestión_Kioscos.05"

# Eliminar remote si existe
git remote remove origin

# Agregar tu repo existente
git remote add origin https://github.com/mo826440-cpu/sistema_kioscos.git

# Asegurarse de estar en main
git branch -M main

# Hacer commit si hay cambios pendientes
git add .
git commit -m "Reemplazar proyecto completo - GestiónKiosco v1.0.0"

# Forzar push (reemplaza todo)
git push -u origin main --force
```

**¡Listo!** Tu repositorio va a tener el nuevo contenido.

