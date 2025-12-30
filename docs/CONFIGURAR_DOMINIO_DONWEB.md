# 🌐 Configurar Dominio de DonWeb en GitHub Pages

## ✅ No Afecta Nada

Comprar el dominio en **DonWeb** en lugar de Namecheap **NO afecta en nada**. Solo cambia dónde configurás los DNS. El proceso es el mismo.

---

## 📋 Paso 1: Configurar DNS en DonWeb

### 1. Acceder a la Zona DNS

1. **Loguéate en DonWeb:** https://www.donweb.com
2. **Panel de Control** → **Mis Dominios**
3. Buscá y hacé clic en **`adminisgo.com`**
4. Buscá la sección **"Zona DNS"** o **"DNS Management"** o **"Gestión DNS"**

### 2. Agregar Registros A (4 registros)

Necesitás crear **4 registros de tipo A** apuntando a las IPs de GitHub Pages:

**Registro 1:**
```
Tipo: A
Nombre/Host: @ (o vacío, o adminisgo.com)
Valor/Dirección IP: 185.199.108.153
TTL: 3600 (o por defecto)
```

**Registro 2:**
```
Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.111.153
TTL: 3600
```

**Registro 3:**
```
Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.109.153
TTL: 3600
```

**Registro 4:**
```
Tipo: A
Nombre/Host: @
Valor/Dirección IP: 185.199.110.153
TTL: 3600
```

### 3. Agregar Registro CNAME (para www)

**Registro CNAME:**
```
Tipo: CNAME
Nombre/Host: www
Valor/Canonical: mo826440-cpu.github.io
TTL: 3600
```

**Nota importante:** En DonWeb, el campo puede llamarse:
- "Nombre" o "Host" → Poné `@` o dejalo vacío para el dominio raíz
- "Valor" o "Dirección IP" → Poné las IPs de GitHub
- "TTL" → 3600 es estándar, podés usar el valor por defecto

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

## 🔍 Si No Encontrás la Sección DNS en DonWeb

DonWeb puede tener diferentes interfaces. Buscá estas opciones:
- **Zona DNS**
- **DNS Management**
- **Gestión DNS**
- **DNS Records**
- **Configuración DNS**

Si no encontrás la opción, contactá al soporte de DonWeb y pediles que te ayuden a configurar los registros DNS para GitHub Pages.

---

## ❓ Preguntas Frecuentes

### ¿DonWeb cobra extra por configurar DNS?
**NO**, la configuración de DNS es gratuita. Solo pagaste el dominio.

### ¿Puedo usar los otros dominios también?
**SÍ**, podés configurar `adminisgo.com.ar`, `adminisgo.online`, y `adminisgo.store` de la misma forma. Cada uno necesita sus propios registros DNS.

### ¿Cuánto tarda?
- **DNS:** 5-30 minutos (a veces más rápido)
- **SSL:** Hasta 24 horas (generalmente 1-2 horas)

---

## 🆘 Si Tenés Problemas

### El dominio no funciona:
- Verificá que los registros DNS estén correctos
- Usá https://www.whatsmydns.net para verificar propagación
- Esperá más tiempo (hasta 24 horas)

### SSL no funciona:
- Esperá hasta 24 horas
- Verificá en GitHub Settings → Pages que el dominio esté verificado
- Asegurate de tener los 4 registros A correctos

### No encontrás dónde configurar DNS:
- Contactá al soporte de DonWeb
- Deciles que necesitás configurar DNS para GitHub Pages
- Mostrales las IPs de GitHub: 185.199.108.153, 185.199.111.153, 185.199.109.153, 185.199.110.153

---

¿Necesitás ayuda con algún paso específico de DonWeb?

