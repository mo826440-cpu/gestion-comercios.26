# 📁 Organización de Íconos PWA

## ✅ Estructura Correcta

Para que el `manifest.json` funcione, necesitás los íconos en **dos lugares**:

### 1. En la raíz de `assets/icons/` (para manifest.json)
```
assets/icons/
  ├── icon-72x72.png
  ├── icon-96x96.png
  ├── icon-128x128.png
  ├── icon-144x144.png
  ├── icon-152x152.png
  ├── icon-192x192.png
  ├── icon-384x384.png
  └── icon-512x512.png
```

### 2. En carpetas organizadas (opcional, para organización)
```
assets/icons/
  ├── android/          (íconos específicos de Android)
  ├── ios/              (íconos específicos de iOS)
  ├── windows11/        (íconos específicos de Windows)
  └── icon-*.png        (íconos para manifest.json)
```

## 🔄 Cómo Copiar los Íconos

### Opción 1: Manual (Recomendado)

1. **Copiá estos archivos de `android/` a la raíz de `icons/`:**

   - `android-launchericon-72-72.png` → `icon-72x72.png`
   - `android-launchericon-96-96.png` → `icon-96x96.png`
   - `android-launchericon-128-128.png` → `icon-128x128.png` (si existe, o usá el de 144)
   - `android-launchericon-144-144.png` → `icon-144x144.png`
   - `android-launchericon-152-152.png` → `icon-152x152.png` (si no existe, usá el de 144)
   - `android-launchericon-192-192.png` → `icon-192x192.png`
   - `android-launchericon-512-512.png` → `icon-512x512.png`
   - `android-launchericon-512-512.png` → `icon-384x384.png` (mismo archivo, o redimensionar)

### Opción 2: Usar PowerShell (Automático)

Ejecutá estos comandos en PowerShell desde la carpeta del proyecto:

```powershell
cd "C:\Sistema_Gestión_Kioscos.05\assets\icons"

# Copiar y renombrar íconos de Android
Copy-Item "android\android-launchericon-72-72.png" "icon-72x72.png"
Copy-Item "android\android-launchericon-96-96.png" "icon-96x96.png"
Copy-Item "android\android-launchericon-144-144.png" "icon-144x144.png"
Copy-Item "android\android-launchericon-192-192.png" "icon-192x192.png"
Copy-Item "android\android-launchericon-512-512.png" "icon-512x512.png"
Copy-Item "android\android-launchericon-512-512.png" "icon-384x384.png"

# Para los que faltan, usar el más cercano
Copy-Item "android\android-launchericon-144-144.png" "icon-128x128.png"
Copy-Item "android\android-launchericon-144-144.png" "icon-152x152.png"
```

## 📋 Verificación

Después de copiar, verificá que tengas estos archivos en `assets/icons/`:

- ✅ `icon-72x72.png`
- ✅ `icon-96x96.png`
- ✅ `icon-128x128.png`
- ✅ `icon-144x144.png`
- ✅ `icon-152x152.png`
- ✅ `icon-192x192.png`
- ✅ `icon-384x384.png`
- ✅ `icon-512x512.png`

## 💡 Nota

**Podés mantener ambas estructuras:**
- Las carpetas organizadas (`android/`, `ios/`, `windows11/`) para organización
- Los íconos en la raíz (`icon-*.png`) para el manifest.json

Esto te permite:
- ✅ Mantener todo organizado
- ✅ Que el manifest.json funcione correctamente
- ✅ Usar íconos específicos por plataforma en el futuro si querés

