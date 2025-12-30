# 🌐 Configurar Dominio Personalizado en GitHub Pages

## 🎯 Recomendación de Dominios

**Dominio Principal:** `adminisgo.com`
- Usar para todo (landing + app)
- Más reconocido y profesional

**Dominios Opcionales (para el futuro):**
- `adminisgo.com.ar` → Para mercado argentino (redirect o subdominio)
- `adminisgo.online` → Como alternativa (redirect)
- `adminisgo.store` → Para tienda/landing específica (opcional)

---

## 📋 Paso 1: Configurar DNS en DonWeb

1. **Loguéate en DonWeb** (https://www.donweb.com)
2. **Mis Dominios** → Buscá `adminisgo.com` → Hacé clic
3. **Zona DNS** o **DNS Management** (gestión de DNS)
4. **Agregá estos registros:**

### Registros A (4 registros):

```
Tipo: A
Nombre/Host: @ (o vacío, o el dominio raíz)
Valor/Dirección IP: 185.199.108.153
TTL: 3600 (o el valor por defecto)

Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.111.153
TTL: 3600

Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.109.153
TTL: 3600

Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.110.153
TTL: 3600
```

### Registro CNAME (para www):

```
Tipo: CNAME
Nombre/Host: www
Valor/Canonical: mo826440-cpu.github.io
TTL: 3600
```

**Nota:** En DonWeb, el campo "Nombre/Host" puede llamarse diferente. Si no podés poner `@`, dejalo vacío o poné solo el dominio sin `www`.

**Esperá 5-30 minutos** para que los DNS se propaguen (a veces más rápido).

---

## 📋 Paso 2: Configurar en GitHub Pages

1. **Andá a tu repositorio:** https://github.com/mo826440-cpu/sistema_kioscos
2. **Settings** → **Pages**
3. En **"Custom domain"**, escribí: `adminisgo.com`
4. Hacé clic en **"Save"**
5. GitHub va a verificar el dominio (puede tardar unos minutos)

---

## 📋 Paso 3: Verificar SSL

1. Después de configurar el dominio, GitHub Pages genera un certificado SSL automáticamente
2. Puede tardar **hasta 24 horas**, generalmente **1-2 horas**
3. Verificá que esté activado: **Settings** → **Pages** → Deberías ver un checkbox "Enforce HTTPS"

---

## ✅ Verificación

Después de configurar:

1. **Esperá 1-2 horas** para que DNS y SSL se configuren
2. **Visitá:** `https://adminisgo.com`
3. Deberías ver tu sitio funcionando

---

## 🔄 Si Tenés Problemas

### El dominio no funciona:
- Verificá que los registros DNS estén correctos
- Usá https://www.whatsmydns.net para verificar propagación
- Esperá más tiempo (hasta 24 horas)

### SSL no funciona:
- Esperá hasta 24 horas
- Verificá en Settings → Pages que el dominio esté verificado
- Asegurate de tener los registros A correctos

### Error 404:
- Verificá que el repositorio esté en GitHub Pages
- Verificá que la branch sea `main`
- Verificá que los archivos estén en la raíz del repo

---

## 📝 Notas Importantes

- **GitHub Pages es GRATIS** - No pagás hosting
- **SSL es GRATIS** - GitHub lo incluye automáticamente
- **Solo pagás el dominio** (~$10-15/año)
- Los cambios se actualizan automáticamente cuando hacés `git push`

---

¿Necesitás ayuda con algún paso específico?

