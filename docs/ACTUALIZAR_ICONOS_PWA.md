# 🎨 Actualizar Íconos PWA con el Nuevo Logo

## 📋 Pasos para Reemplazar los Íconos

Tenés `IconoAG.png` y `LogoGeneralAG.png` en `assets/icons/`. Para que funcionen como íconos PWA, necesitás crear versiones en diferentes tamaños.

### Opción 1: Usar un Generador Online (Recomendado)

1. **Andá a:** https://www.pwabuilder.com/imageGenerator
2. **Subí tu logo:** `IconoAG.png` o `LogoGeneralAG.png`
3. **Descargá todos los tamaños**
4. **Reemplazá los archivos** en `assets/icons/`:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### Opción 2: Redimensionar Manualmente

Si tenés Photoshop, GIMP, o cualquier editor de imágenes:

1. Abrí `IconoAG.png` o `LogoGeneralAG.png`
2. Exportá en estos tamaños:
   - 72x72px → `icon-72x72.png`
   - 96x96px → `icon-96x96.png`
   - 128x128px → `icon-128x128.png`
   - 144x144px → `icon-144x144.png`
   - 152x152px → `icon-152x152.png`
   - 192x192px → `icon-192x192.png`
   - 384x384px → `icon-384x384.png`
   - 512x512px → `icon-512x512.png`
3. Guardalos en `assets/icons/` reemplazando los existentes

### Opción 3: Usar el Generador HTML (Temporal)

Podés modificar `assets/icons/icon-generator.html` para que use tu logo en lugar del emoji, pero es más complejo.

---

## ✅ Después de Actualizar los Íconos

Una vez que reemplazaste los íconos:

1. **Hacé commit y push** de los cambios
2. **Esperá 1-2 minutos** a que GitHub Pages actualice
3. **Recargá la app** con `Ctrl + Shift + R`
4. **Los nuevos íconos** deberían aparecer

---

## 📝 Nota

El `manifest.json` ya está configurado para usar estos íconos. Solo necesitás reemplazar los archivos PNG.

