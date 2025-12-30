# 🌐 Dominio Personalizado para GestiónKiosco

## ✅ Respuesta Rápida

**SÍ, podés usar dominios personalizados** y **NO tiene costo extra** (GitHub Pages lo permite gratis).

---

## 💰 Costos

### Lo que SÍ pagás:
- **Dominio `.com`**: ~$10-15 USD/año (ej: `admigo.com`)
- **Dominio `.app`**: ~$15-20 USD/año (ej: `admigo.app`)

**Total aproximado:** $25-35 USD/año para ambos dominios

### Lo que NO pagás (es GRATIS):
- ✅ Hosting (GitHub Pages sigue siendo gratis)
- ✅ SSL/HTTPS (GitHub Pages lo incluye gratis)
- ✅ Configuración de dominio personalizado
- ✅ Certificados de seguridad

---

## 🎯 Opciones de Estructura

### Opción 1: Dos Dominios Separados (Lo que proponés)

**Estructura:**
- `admigo.com` → Landing page (index.html)
- `admigo.app` → Aplicación completa (todo el sistema)

**Ventajas:**
- ✅ Separación clara entre marketing y aplicación
- ✅ Dominio `.app` suena más moderno para apps
- ✅ Fácil de entender

**Desventajas:**
- ⚠️ Pagás dos dominios (~$25-35/año)
- ⚠️ Dos configuraciones separadas
- ⚠️ Más complejo de mantener

---

### Opción 2: Un Solo Dominio con Subdominios (Recomendado)

**Estructura:**
- `admigo.com` → Landing page
- `app.admigo.com` → Aplicación completa

**Ventajas:**
- ✅ Más económico (solo pagás un dominio ~$10-15/año)
- ✅ Más simple de configurar
- ✅ Todo bajo un mismo dominio
- ✅ Más profesional
- ✅ Fácil de recordar

**Desventajas:**
- ❌ No tenés el dominio `.app` (que es más caro igual)

---

### Opción 3: Solo Dominio `.com` (Más Económico)

**Estructura:**
- `admigo.com` → Todo (landing + app)

**Ventajas:**
- ✅ Más económico (un solo dominio)
- ✅ Más simple
- ✅ Suficiente para la mayoría de casos

**Desventajas:**
- ❌ No hay separación entre landing y app
- ❌ Menos "premium" que tener separado

---

## 🏆 Recomendación

### Opción Recomendada: **Opción 2 (Subdominios)**

**Usar:**
- `admigo.com` → Landing page
- `app.admigo.com` → Aplicación completa

**¿Por qué?**
1. ✅ **Más económico**: Pagás solo ~$10-15/año en lugar de $25-35
2. ✅ **Más simple**: Un solo dominio para configurar
3. ✅ **Más profesional**: Estructura estándar en la industria
4. ✅ **Más fácil de mantener**: Un solo proveedor, una sola factura
5. ✅ **Escalable**: Podés agregar más subdominios después (ej: `api.admigo.com`)

**Ejemplos de empresas que usan esta estructura:**
- `github.com` y `app.github.com`
- `notion.so` y `www.notion.so`
- `slack.com` y `app.slack.com`

---

## 🔧 Cómo Configurarlo

### Paso 1: Comprar el Dominio

**Donde comprar:**
- **Namecheap**: ~$10-12/año (.com)
- **Google Domains**: ~$12/año (.com)
- **GoDaddy**: ~$12-15/año (.com) (pero más caro para renovación)
- **Cloudflare**: ~$8-10/año (.com) - Más económico

**Recomendación:** Cloudflare o Namecheap (buenos precios y servicio)

### Paso 2: Configurar en GitHub Pages

**Para `admigo.com`:**
1. En GitHub: Settings → Pages → Custom domain
2. Agregar: `admigo.com`
3. GitHub genera registros DNS

**Para `app.admigo.com`:**
1. Opción A: Configurar como subdominio en el mismo repo
2. Opción B: Crear repositorio separado para la app
3. Configurar DNS en tu proveedor de dominio

### Paso 3: Configurar DNS

En tu proveedor de dominio (Namecheap, Cloudflare, etc.):

**Para `admigo.com`:**
```
Tipo: A
Nombre: @
Valor: 185.199.108.153 (y otros IPs de GitHub)
```

**Para `app.admigo.com`:**
```
Tipo: CNAME
Nombre: app
Valor: mo826440-cpu.github.io
```

---

## 📋 Comparación de Costos Anuales

| Opción | Dominio | Costo/año | Recomendación |
|--------|---------|-----------|---------------|
| **Opción 1** | admigo.com + admigo.app | $25-35 | ⚠️ Más caro |
| **Opción 2** | admigo.com (con subdominios) | $10-15 | ✅ **Recomendado** |
| **Opción 3** | Solo admigo.com | $10-15 | ✅ También bueno |

---

## ❓ Preguntas Frecuentes

### ¿GitHub Pages cobra por dominio personalizado?
**NO, es completamente gratis.** Solo pagás el dominio en sí.

### ¿Necesito comprar ambos dominios?
**NO es necesario.** Podés usar solo `admigo.com` con subdominios y te ahorrás ~$15-20/año.

### ¿Puedo cambiar después?
**SÍ**, podés cambiar la configuración cuando quieras, pero perdés el dominio viejo si no lo renovás.

### ¿Cuál es mejor: .com o .app?
- **`.com`**: Más reconocido, más barato, mejor para SEO
- **`.app`**: Más moderno, más caro, suena más a "aplicación"

**Recomendación:** `.com` es mejor para negocios (más confiable, más barato).

### ¿Puedo usar solo el dominio .app?
**SÍ**, pero `.app` es más caro y menos reconocido que `.com`. La mayoría de apps usan `.com` con subdominios.

---

## ✅ Mi Recomendación Final

**Compra solo `admigo.com`** y usá:

- `admigo.com` → Landing page
- `app.admigo.com` → Aplicación completa

**Ahorrás $15-20/año** y es la estructura más común y profesional en la industria.

Si en el futuro querés agregar `admigo.app`, podés hacerlo, pero realmente no es necesario.

---

## 🚀 Pasos Siguientes

1. **Decidir qué opción querés** (recomiendo subdominios)
2. **Comprar el dominio** en Namecheap, Cloudflare, o Google Domains
3. **Configurar en GitHub Pages** (Settings → Pages → Custom domain)
4. **Configurar DNS** en tu proveedor de dominio
5. **Esperar propagación** (puede tardar hasta 24 horas, generalmente 1-2 horas)

¿Te ayudo a configurarlo cuando tengas el dominio comprado?

