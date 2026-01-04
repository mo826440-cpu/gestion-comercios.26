/**
 * ========================================================
 * INDEXEDDB - BASE LOCAL POR DISPOSITIVO
 * ========================================================
 * OFFLINE FIRST
 * Cada dispositivo tiene su propia base
 * ========================================================
 */

const db = new Dexie("SistemaGestionKioscos");

db.version(1).stores({

  // --------- METADATA ----------
  sync_queue: `
    ++id,
    table,
    record_id,
    operation,
    payload,
    created_at
  `,

  // --------- USUARIO LOGUEADO ----------
  session: `
    id,
    usuario_id,
    rol_id,
    permisos
  `,

  // --------- ROLES Y PERMISOS ----------
  roles: `
    id,
    nombre
  `,

  permisos: `
    id,
    codigo
  `,

  roles_permisos: `
    [rol_id+permiso_id]
  `,

  // --------- REFERENCIAS ----------
  categorias: `
    id,
    sync_id,
    nombre,
    updated_at
  `,

  marcas: `
    id,
    sync_id,
    nombre,
    updated_at
  `,

  productos: `
    id,
    sync_id,
    nombre,
    codigo_barra,
    precio_venta,
    activo,
    updated_at
  `,

  clientes: `
    id,
    sync_id,
    nombre,
    documento,
    updated_at
  `,

  // --------- CAJA Y VENTAS ----------
  cajas: `
    id,
    sync_id,
    estado,
    fecha_apertura,
    fecha_cierre
  `,

  ventas: `
    id,
    sync_id,
    caja_id,
    fecha,
    total,
    estado
  `,

  detalle_ventas: `
    id,
    venta_id,
    producto_id
  `,

  // --------- STOCK ----------
  stock: `
    producto_id,
    cantidad,
    updated_at
  `
});

export default db;
