🧪 FLUJO EXACTO DE SINCRONIZACIÓN (OFFLINE FIRST REAL)

Te lo explico paso a paso, como si fuera un diagrama mental.

🧠 CONCEPTO CLAVE

IndexedDB manda en tiempo real
Supabase consolida cuando puede

🧩 PIEZAS

IndexedDB

Tabla sync_queue

Campo sync_id

API Supabase

Worker de sincronización

1️⃣ CREACIÓN DE REGISTRO (OFFLINE O ONLINE)

Ejemplo: venta

En el dispositivo:
1. Usuario confirma venta
2. Se genera:
   - id local (UUID)
   - sync_id (UUID)
3. Se guarda en IndexedDB:
   - ventas
   - detalle_ventas
4. Se agrega a sync_queue:
   - table = ventas
   - operation = INSERT
   - payload = JSON completo


📌 No se consulta Supabase
📌 No se bloquea la UI

2️⃣ SI HAY INTERNET → SYNC AUTOMÁTICO

Worker corre cada X segundos:

Para cada registro en sync_queue:
  1. POST a Supabase
  2. Si OK:
     - marcar como synced
     - borrar de sync_queue
  3. Si falla:
     - reintentar luego

3️⃣ SI NO HAY INTERNET

👉 Nada se rompe.

Ventas siguen

Caja sigue

Stock local sigue

IndexedDB es la verdad temporal

4️⃣ CONFLICTOS (EL CASO REAL)
¿Qué pasa si 2 dispositivos venden el mismo producto offline?

❌ NO se sincroniza stock directamente

✔️ Se sincronizan:

ventas

movimientos_stock

Supabase:

1. Recibe movimientos
2. Recalcula stock
3. El último estado gana


📌 Nunca sincronizás “cantidad final”
📌 Siempre sincronizás “eventos”

5️⃣ BAJADA DE DATOS DESDE SUPABASE

Cuando hay internet:

1. Consultar Supabase:
   WHERE updated_at > last_sync
2. Actualizar IndexedDB
3. Actualizar last_sync


Esto sirve para:

nuevos productos

cambios de precios

nuevos clientes

6️⃣ VENTAS LOCALES vs TOTALES (LO QUE VOS QUERÍAS)

✔️ Ventas locales

SELECT * FROM ventas
WHERE dispositivo_id = actual


✔️ Ventas totales

SELECT * FROM Supabase.ventas
WHERE comercio_id = X

7️⃣ QUÉ PASA SI UN REGISTRO YA EXISTE

Se usa:

sync_id + comercio_id


si existe → UPDATE

si no existe → INSERT

📌 Nunca duplicás

🔥 RESUMEN CORTITO

✔ Permisos claros
✔ Roles configurables
✔ Offline real
✔ Multi-dispositivo
✔ Multi-comercio
✔ Sincronización robusta
✔ Escalable