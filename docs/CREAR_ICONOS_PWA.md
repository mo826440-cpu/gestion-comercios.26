# 🎨 Cómo Crear los Íconos de la PWA

Los íconos son necesarios para que la app se vea bien cuando se instala. Por ahora, el sistema funcionará sin ellos, pero es mejor tenerlos.

## Opción 1: Usar un Generador Online (Recomendado)

1. Andá a: https://www.pwabuilder.com/imageGenerator
2. Subí una imagen cuadrada (mínimo 512x512px)
3. Descargá todos los tamaños
4. Guardalos en `assets/icons/` con estos nombres:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

## Opción 2: Crear Manualmente

Podés usar cualquier editor de imágenes (Photoshop, GIMP, Canva, etc.):

1. Creá una imagen cuadrada de 512x512px
2. Usá el emoji 🏪 o un logo de kiosco
3. Fondo azul (#2563eb) con texto blanco
4. Exportá en diferentes tamaños según la lista de arriba

## Opción 3: Usar el Generador HTML (Temporal)

1. Abrí `assets/icons/icon-generator.html` en el navegador
2. Se descargarán automáticamente los íconos
3. Movelos a `assets/icons/` si no se guardaron ahí

## Verificación

Después de crear los íconos, verificá que:
- ✅ Todos los archivos estén en `assets/icons/`
- ✅ Los nombres sean exactos (ej: `icon-192x192.png`)
- ✅ Todos sean imágenes PNG

## Nota

Si no tenés los íconos, la PWA igual funcionará, pero:
- ⚠️ No se verá el ícono en la pantalla de inicio
- ⚠️ Puede mostrar un ícono genérico del navegador

