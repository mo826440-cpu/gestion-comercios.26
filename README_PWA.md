# 📱 GestiónKiosco - Progressive Web App (PWA)

## ✅ ¿Qué se Implementó?

Se configuró GestiónKiosco como una **Progressive Web App (PWA)** para que se pueda instalar como app nativa en:

- ✅ **Android** (Chrome, Edge, Opera)
- ✅ **iPhone/iPad** (Safari)
- ✅ **Windows** (Edge, Chrome)

## 🎯 Características

### Funcionalidades PWA:
- ✅ **Instalable** como app nativa
- ✅ **Funciona offline** (usa Service Worker)
- ✅ **Cache inteligente** de archivos estáticos
- ✅ **Actualización automática** cuando hay cambios
- ✅ **Ícono en pantalla de inicio**
- ✅ **Se abre como app** (sin barra del navegador)

### Archivos Creados:
1. **`manifest.json`** - Configuración de la PWA
2. **`service-worker.js`** - Cache offline y actualizaciones
3. **`js/pwa-install.js`** - Lógica de instalación
4. **Sección de descarga** en `index.html`
5. **Estilos CSS** para la sección de instalación

## 📋 Cómo Funciona

### Para el Usuario:

1. **Visita** `https://mo826440-cpu.github.io/sistema_kioscos`
2. **Ve la sección** "📱 Descargá GestiónKiosco como App"
3. **Hace clic** en el botón según su dispositivo
4. **Sigue las instrucciones** (si es necesario)
5. **La app se instala** en su dispositivo

### Detección Automática:

- El sistema **detecta automáticamente** el dispositivo
- Muestra el botón **apropiado** (Android, iOS, Windows)
- Si ya está instalada, **oculta** la sección

## 🔧 Instalación por Dispositivo

### Android (Chrome/Edge):
1. Menú (3 puntos) → "Instalar app"
2. Confirmar instalación
3. La app aparece en la pantalla de inicio

### iPhone/iPad (Safari):
1. Botón compartir (cuadrado con flecha)
2. "Agregar a pantalla de inicio"
3. Personalizar nombre (opcional)
4. "Agregar"

### Windows (Edge/Chrome):
1. Ícono de instalación en la barra de direcciones
2. O Menú → "Aplicaciones" → "Instalar esta aplicación"
3. Confirmar instalación
4. La app aparece en el menú de inicio

## 📦 Próximos Pasos

### 1. Crear los Íconos (Opcional pero Recomendado)

Ver archivo: `CREAR_ICONOS_PWA.md`

Los íconos hacen que la app se vea profesional. Sin ellos, funcionará pero con ícono genérico.

### 2. Probar la Instalación

1. Hacé `git push` para subir los cambios
2. Esperá 1-2 minutos a que GitHub Pages actualice
3. Visitá el sitio desde un dispositivo móvil
4. Probá instalar la app

### 3. Verificar el Service Worker

1. Abrí DevTools (F12)
2. Pestaña "Application" → "Service Workers"
3. Deberías ver el service worker registrado
4. Verificá que el cache esté funcionando

## 🐛 Solución de Problemas

### El botón de instalación no aparece:
- Verificá que estés en HTTPS (GitHub Pages lo tiene)
- Verificá que el manifest.json esté accesible
- Revisá la consola por errores

### La app no se instala:
- Verificá que el service worker esté registrado
- Asegurate de estar en un navegador compatible
- Revisá las instrucciones específicas del dispositivo

### Los íconos no se ven:
- Verificá que los archivos estén en `assets/icons/`
- Verificá que los nombres sean exactos
- Revisá la consola por errores 404

## ✅ Estado Actual

- ✅ Manifest.json configurado
- ✅ Service Worker implementado
- ✅ Lógica de instalación lista
- ✅ UI de descarga agregada
- ⏳ Íconos pendientes (opcional)

**La PWA está lista para usar. Solo falta crear los íconos (opcional).**

