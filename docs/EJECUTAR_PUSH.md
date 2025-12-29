# 🚀 Cómo Ejecutar el Push a GitHub

## 📍 Paso 1: Abrir la Terminal

Tienes varias opciones:

### Opción A: Desde Cursor/VS Code (Más fácil)

1. Si tenés el proyecto abierto en Cursor
2. Presioná `` Ctrl + ` `` (Control + backtick, está arriba del Tab)
3. Se abre la terminal integrada abajo
4. Ya estás en la carpeta correcta ✅

### Opción B: Desde el Explorador de Windows

1. Andá a: `C:\Sistema_Gestión_Kioscos.05`
2. En la barra de direcciones (arriba donde dice la ruta), escribí: `powershell`
3. Presioná Enter
4. Se abre PowerShell en esa carpeta ✅

### Opción C: Abrir PowerShell manualmente

1. Presioná `Windows + X`
2. Seleccioná "Windows PowerShell" o "Terminal"
3. Ejecutá:
   ```powershell
   cd "C:\Sistema_Gestión_Kioscos.05"
   ```

---

## ✅ Paso 2: Verificar que estás en la carpeta correcta

Ejecutá:
```powershell
pwd
```

Deberías ver: `C:\Sistema_Gestión_Kioscos.05`

Si no, ejecutá:
```powershell
cd "C:\Sistema_Gestión_Kioscos.05"
```

---

## 🚀 Paso 3: Ejecutar el Push

Ejecutá este comando:

```powershell
git push -u origin main --force
```

---

## 🔐 Paso 4: Autenticación

GitHub te va a pedir que te autentiques. Podés:

### Opción A: Usuario y Token (Recomendado)

1. **Username:** Tu usuario de GitHub (`mo826440-cpu`)
2. **Password:** Un **Personal Access Token** (NO tu contraseña normal)

**Cómo crear un Token:**
1. Andá a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Dale un nombre (ej: "Netlify Deploy")
4. Seleccioná el scope: **`repo`** (marca todos los permisos)
5. Click en **"Generate token"**
6. **¡IMPORTANTE!** Copiá el token inmediatamente (solo se muestra una vez)
7. Usá ese token como contraseña

### Opción B: GitHub CLI (si lo tenés instalado)

Si tenés GitHub CLI instalado, podés autenticarte con:
```powershell
gh auth login
```

---

## ✅ Paso 5: Verificar

Después del push, deberías ver algo como:

```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Delta compression using up to X threads
Compressing objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), XXX.XX KiB | XXX.XX MiB/s, done.
Total XX (delta X), reused X (delta X), pack-reused X
To https://github.com/mo826440-cpu/sistema_kioscos.git
 + [branch]      main -> main (forced update)
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🌐 Paso 6: Ver tu repositorio actualizado

1. Andá a: https://github.com/mo826440-cpu/sistema_kioscos
2. Deberías ver todos los archivos del nuevo proyecto ✅

---

## ❓ Si tenés problemas

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/mo826440-cpu/sistema_kioscos.git
git push -u origin main --force
```

### Error de autenticación
- Verificá que estés usando un **Personal Access Token** (no tu contraseña)
- Asegurate que el token tenga permisos de `repo`

### Error: "fatal: not a git repository"
```powershell
cd "C:\Sistema_Gestión_Kioscos.05"
git init
```

---

¡Listo! Una vez que hagas el push, tu repositorio va a estar actualizado con el nuevo proyecto.

