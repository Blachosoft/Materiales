import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();
app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

const PREFIX = "/make-server-dca001ee";

const hoy = () => new Date().toISOString().slice(0, 10);

// ---------- Datos semilla ----------
const SEED_MATERIALES = [
  { id: "m1", codigo: "MED-001", nombre: "Medidor monofásico prepago", categoria: "Medición", unidad: "und", stock: 320, stockMin: 80, bodega: "Bodega Central Cúcuta", costo: 185000 },
  { id: "m2", codigo: "MED-002", nombre: "Medidor trifásico inteligente", categoria: "Medición", unidad: "und", stock: 54, stockMin: 60, bodega: "Bodega Central Cúcuta", costo: 640000 },
  { id: "m3", codigo: "CAB-101", nombre: "Cable ACSR 1/0 AWG", categoria: "Conductores", unidad: "m", stock: 4200, stockMin: 1500, bodega: "Bodega Ocaña", costo: 8900 },
  { id: "m4", codigo: "CAB-102", nombre: "Cable concéntrico 2x8", categoria: "Conductores", unidad: "m", stock: 980, stockMin: 1000, bodega: "Bodega Central Cúcuta", costo: 6200 },
  { id: "m5", codigo: "AIS-201", nombre: "Aislador polimérico 15kV", categoria: "Aisladores", unidad: "und", stock: 640, stockMin: 200, bodega: "Bodega Pamplona", costo: 42000 },
  { id: "m6", codigo: "TRF-301", nombre: "Transformador 25 kVA", categoria: "Transformadores", unidad: "und", stock: 12, stockMin: 8, bodega: "Bodega Central Cúcuta", costo: 4850000 },
  { id: "m7", codigo: "CAJ-401", nombre: "Caja antifraude tipo S", categoria: "Protección", unidad: "und", stock: 210, stockMin: 100, bodega: "Bodega Ocaña", costo: 95000 },
  { id: "m8", codigo: "BRK-501", nombre: "Breaker 2x40A", categoria: "Protección", unidad: "und", stock: 470, stockMin: 150, bodega: "Bodega Pamplona", costo: 38000 },
];

const SEED_USUARIOS = [
  { id: "u1", nombre: "Carlos Pérez", email: "carlos.perez@electrocontratos.co", rol: "Contratista", empresa: "Electrocontratos SAS", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u2", nombre: "Laura Ramírez", email: "laura.ramirez@redesnorte.co", rol: "Contratista", empresa: "Redes del Norte Ltda", estado: "Activo", ultimoAcceso: "2025-11-27" },
  { id: "u3", nombre: "Jorge Martínez", email: "jorge.martinez@cens.com.co", rol: "Interventor", empresa: "CENS · Interventoría", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u4", nombre: "María Gómez", email: "maria.gomez@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Central", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u5", nombre: "Jorge Peña", email: "jorge.pena@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Ocaña", estado: "Activo", ultimoAcceso: "2025-11-26" },
  { id: "u6", nombre: "Ana García", email: "ana.garcia@cens.com.co", rol: "Líder de Pérdidas", empresa: "CENS · Grupo EPM", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u7", nombre: "Diego Torres", email: "diego.torres@cens.com.co", rol: "Auditor", empresa: "CENS · Control Interno", estado: "Inactivo", ultimoAcceso: "2025-10-30" },
];

const L = (m: any, sol: number, desp = 0, inst = 0, ubic?: string) => ({
  materialId: m.id, codigo: m.codigo, nombre: m.nombre, unidad: m.unidad, costo: m.costo,
  cantidadSolicitada: sol, cantidadDespachada: desp, cantidadInstalada: inst, ubicacion: ubic,
});
const M = (id: string) => SEED_MATERIALES.find((m) => m.id === id)!;

const SEED_SOLICITUDES = [
  { id: "SOL-2025-0001", contratista: "Carlos Pérez", empresa: "Electrocontratos SAS", proyectoId: "p1", bodega: "Bodega Central Cúcuta", estado: "Cerrada", prioridad: "Alta", tipo: "Normalización", fechaCreacion: "2025-11-18", fechaActualizacion: "2025-11-25",
    lineas: [L(M("m1"), 40, 40, 38, "NIC 884512 · Circuito 3"), L(M("m7"), 40, 40, 38, "NIC 884512 · Circuito 3")],
    cita: { fecha: "2025-11-20", hora: "09:00", lugar: "Bodega Central Cúcuta", creadaPor: "María Gómez", notificada: true },
    evidenciaUrl: "https://sac.cens.com.co/actas/SOL-2025-0001.pdf", usoTotalConfirmado: false,
    historial: [
      { fecha: "2025-11-18", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-19", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-19", evento: "Cita generada para recoger material", usuario: "María Gómez" },
      { fecha: "2025-11-20", evento: "Despachada desde bodega", usuario: "María Gómez" },
      { fecha: "2025-11-20", evento: "Material recogido por el contratista", usuario: "Carlos Pérez" },
      { fecha: "2025-11-25", evento: "Cierre reportado con evidencia", usuario: "Carlos Pérez" },
    ] },
  { id: "SOL-2025-0002", contratista: "Redes del Norte Ltda", empresa: "Redes del Norte Ltda", proyectoId: "p2", bodega: "Bodega Ocaña", estado: "Despachada", prioridad: "Media", tipo: "Recuperación", fechaCreacion: "2025-11-22", fechaActualizacion: "2025-11-24",
    lineas: [L(M("m3"), 600, 600, 0)],
    cita: { fecha: "2025-11-24", hora: "14:00", lugar: "Bodega Ocaña", creadaPor: "Jorge Peña", notificada: true },
    historial: [
      { fecha: "2025-11-22", evento: "Solicitud creada", usuario: "Redes del Norte Ltda" },
      { fecha: "2025-11-23", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-23", evento: "Cita generada para recoger material", usuario: "Jorge Peña" },
      { fecha: "2025-11-24", evento: "Despachada desde bodega", usuario: "Jorge Peña" },
    ] },
  { id: "SOL-2025-0003", contratista: "Carlos Pérez", empresa: "Electrocontratos SAS", proyectoId: "p4", bodega: "Bodega Central Cúcuta", estado: "Pendiente", prioridad: "Alta", tipo: "Blindaje", fechaCreacion: "2025-11-28", fechaActualizacion: "2025-11-28", observacion: "Requerido para intervención de fin de semana.",
    lineas: [L(M("m2"), 15), L(M("m8"), 30)],
    historial: [{ fecha: "2025-11-28", evento: "Solicitud creada", usuario: "Carlos Pérez" }] },
  { id: "SOL-2025-0004", contratista: "Redes del Norte Ltda", empresa: "Redes del Norte Ltda", proyectoId: "p3", bodega: "Bodega Pamplona", estado: "Aprobada", prioridad: "Baja", tipo: "Macromedición", fechaCreacion: "2025-11-27", fechaActualizacion: "2025-11-27",
    lineas: [L(M("m5"), 120)],
    historial: [{ fecha: "2025-11-27", evento: "Solicitud creada", usuario: "Redes del Norte Ltda" }, { fecha: "2025-11-27", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" }] },
  { id: "SOL-2025-0005", contratista: "Carlos Pérez", empresa: "Electrocontratos SAS", proyectoId: "p1", bodega: "Bodega Central Cúcuta", estado: "Rechazada", prioridad: "Media", tipo: "Normalización", fechaCreacion: "2025-11-15", fechaActualizacion: "2025-11-16",
    lineas: [L(M("m6"), 4)],
    historial: [{ fecha: "2025-11-15", evento: "Solicitud creada", usuario: "Carlos Pérez" }, { fecha: "2025-11-16", evento: "Rechazada: Sin stock suficiente, reprogramar", usuario: "Jorge Martínez" }] },
  { id: "SOL-2025-0006", contratista: "Carlos Pérez", empresa: "Electrocontratos SAS", proyectoId: "p1", bodega: "Bodega Central Cúcuta", estado: "Recogida", prioridad: "Media", tipo: "Cambio de medidor", fechaCreacion: "2025-11-20", fechaActualizacion: "2025-11-23",
    lineas: [L(M("m1"), 20, 20, 0)],
    cita: { fecha: "2025-11-22", hora: "10:30", lugar: "Bodega Central Cúcuta", creadaPor: "María Gómez", notificada: true },
    historial: [
      { fecha: "2025-11-20", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-20", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-21", evento: "Cita generada para recoger material", usuario: "María Gómez" },
      { fecha: "2025-11-22", evento: "Despachada desde bodega", usuario: "María Gómez" },
      { fecha: "2025-11-23", evento: "Material recogido por el contratista", usuario: "Carlos Pérez" },
    ] },
];

// ---------- Seed idempotente ----------
async function ensureSeed() {
  const seeded = await kv.get("seeded");
  if (seeded) return;
  await kv.mset(SEED_MATERIALES.map((m) => `mat:${m.id}`), SEED_MATERIALES);
  await kv.mset(SEED_USUARIOS.map((u) => `usr:${u.id}`), SEED_USUARIOS);
  await kv.mset(SEED_SOLICITUDES.map((s) => `sol:${s.id}`), SEED_SOLICITUDES);
  await kv.set("seq", 7);
  await kv.set("seeded", true);
}

const getSolicitudes = async () => (await kv.getByPrefix("sol:")) ?? [];
const getMateriales = async () => (await kv.getByPrefix("mat:")) ?? [];
const getUsuarios = async () => (await kv.getByPrefix("usr:")) ?? [];
const ordenar = (a: any[]) => a.sort((x, y) => (x.id < y.id ? 1 : -1));

app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// Bootstrap: siembra y devuelve todo el estado
app.get(`${PREFIX}/bootstrap`, async (c) => {
  try {
    await ensureSeed();
    const [solicitudes, materiales, directorio] = await Promise.all([
      getSolicitudes(), getMateriales(), getUsuarios(),
    ]);
    return c.json({
      solicitudes: ordenar(solicitudes),
      materiales: materiales.sort((a: any, b: any) => a.codigo.localeCompare(b.codigo)),
      directorio,
    });
  } catch (e) {
    console.log(`Error en bootstrap: ${e}`);
    return c.json({ error: `Error al inicializar datos: ${e}` }, 500);
  }
});

// Crear solicitud
app.post(`${PREFIX}/solicitudes`, async (c) => {
  try {
    const body = await c.req.json();
    const materiales = await getMateriales();
    const seq = (await kv.get("seq")) ?? 7;
    const id = `SOL-2025-${String(seq).padStart(4, "0")}`;
    const lineas = (body.lineas ?? []).map((l: any) => {
      const m = materiales.find((x: any) => x.id === l.materialId);
      return L(m, l.cantidad);
    });
    const nueva = {
      id, contratista: body.contratista ?? "Contratista", empresa: body.empresa ?? "",
      proyectoId: body.proyectoId, bodega: body.bodega, estado: "Pendiente",
      prioridad: body.prioridad, tipo: body.tipo, fechaCreacion: hoy(), fechaActualizacion: hoy(),
      observacion: body.observacion, lineas,
      historial: [{ fecha: hoy(), evento: "Solicitud creada", usuario: body.contratista ?? "Contratista" }],
    };
    await kv.set(`sol:${id}`, nueva);
    await kv.set("seq", seq + 1);
    return c.json(nueva);
  } catch (e) {
    console.log(`Error al crear solicitud: ${e}`);
    return c.json({ error: `Error al crear solicitud: ${e}` }, 500);
  }
});

async function transicion(c: any, id: string, fn: (s: any, body: any) => Promise<any> | any) {
  try {
    const s = await kv.get(`sol:${id}`);
    if (!s) return c.json({ error: "Solicitud no encontrada" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const actualizada = await fn(s, body);
    await kv.set(`sol:${id}`, actualizada);
    return c.json(actualizada);
  } catch (e) {
    console.log(`Error en transición de ${id}: ${e}`);
    return c.json({ error: `Error al actualizar solicitud: ${e}` }, 500);
  }
}

// Interventor aprueba/rechaza la solicitud
app.post(`${PREFIX}/solicitudes/:id/aprobar`, (c) =>
  transicion(c, c.req.param("id"), (s, b) => ({
    ...s, estado: "Aprobada", fechaActualizacion: hoy(),
    historial: [...s.historial, { fecha: hoy(), evento: "Aprobada por interventoría", usuario: b.usuario ?? "Interventor" }],
  }))
);

app.post(`${PREFIX}/solicitudes/:id/rechazar`, (c) =>
  transicion(c, c.req.param("id"), (s, b) => ({
    ...s, estado: "Rechazada", fechaActualizacion: hoy(),
    historial: [...s.historial, { fecha: hoy(), evento: `Rechazada: ${b.motivo ?? ""}`, usuario: b.usuario ?? "Interventor" }],
  }))
);

// Almacenista genera la cita para recoger el material y se notifica al contratista
app.post(`${PREFIX}/solicitudes/:id/generar-cita`, (c) =>
  transicion(c, c.req.param("id"), (s, b) => ({
    ...s, estado: "CitaAgendada", fechaActualizacion: hoy(),
    cita: { fecha: b.fecha, hora: b.hora, lugar: b.lugar, creadaPor: b.usuario ?? "Almacén", notificada: true },
    historial: [
      ...s.historial,
      { fecha: hoy(), evento: `Cita generada para recoger material: ${b.fecha} ${b.hora} · ${b.lugar}`, usuario: b.usuario ?? "Almacén" },
      { fecha: hoy(), evento: "Contratista notificado de la cita", usuario: "Sistema" },
    ],
  }))
);

// Almacenista despacha el material (con checklist de cantidades verificadas)
app.post(`${PREFIX}/solicitudes/:id/despachar`, (c) =>
  transicion(c, c.req.param("id"), async (s, b) => {
    const despachos: Record<string, number> = b.despachos ?? {};
    for (const [mid, cant] of Object.entries(despachos)) {
      const m = await kv.get(`mat:${mid}`);
      if (m) await kv.set(`mat:${mid}`, { ...m, stock: Math.max(0, m.stock - (cant as number)) });
    }
    return {
      ...s, estado: "Despachada", fechaActualizacion: hoy(),
      lineas: s.lineas.map((l: any) => ({ ...l, cantidadDespachada: despachos[l.materialId] ?? l.cantidadDespachada })),
      historial: [...s.historial, { fecha: hoy(), evento: "Despachada desde bodega (checklist verificado)", usuario: b.usuario ?? "Almacén" }],
    };
  })
);

// Contratista confirma que recogió el material en bodega
app.post(`${PREFIX}/solicitudes/:id/confirmar-recogida`, (c) =>
  transicion(c, c.req.param("id"), (s, b) => ({
    ...s, estado: "Recogida", fechaActualizacion: hoy(),
    historial: [...s.historial, { fecha: hoy(), evento: "Material recogido por el contratista", usuario: b.usuario ?? "Contratista" }],
  }))
);

// Contratista cierra la solicitud: reporta uso del material y anexa evidencia (enlace)
app.post(`${PREFIX}/solicitudes/:id/cerrar`, (c) =>
  transicion(c, c.req.param("id"), (s, b) => {
    const lineas: Record<string, { cantidad: number; ubicacion: string }> = b.lineas ?? {};
    return {
      ...s, estado: "Cerrada", fechaActualizacion: hoy(),
      evidenciaUrl: b.evidenciaUrl ?? s.evidenciaUrl,
      usoTotalConfirmado: Boolean(b.usoTotalConfirmado),
      lineas: s.lineas.map((l: any) => ({
        ...l,
        cantidadInstalada: lineas[l.materialId]?.cantidad ?? l.cantidadInstalada,
        ubicacion: lineas[l.materialId]?.ubicacion ?? l.ubicacion,
      })),
      historial: [...s.historial, { fecha: hoy(), evento: "Cierre reportado con evidencia", usuario: b.usuario ?? "Contratista" }],
    };
  })
);

// Usuarios (upsert / toggle)
app.post(`${PREFIX}/usuarios`, async (c) => {
  try {
    const u = await c.req.json();
    await kv.set(`usr:${u.id}`, u);
    return c.json(u);
  } catch (e) {
    console.log(`Error al guardar usuario: ${e}`);
    return c.json({ error: `Error al guardar usuario: ${e}` }, 500);
  }
});

app.post(`${PREFIX}/usuarios/:id/toggle`, async (c) => {
  try {
    const id = c.req.param("id");
    const u = await kv.get(`usr:${id}`);
    if (!u) return c.json({ error: "Usuario no encontrado" }, 404);
    const actualizado = { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" };
    await kv.set(`usr:${id}`, actualizado);
    return c.json(actualizado);
  } catch (e) {
    console.log(`Error al cambiar estado de usuario: ${e}`);
    return c.json({ error: `Error al cambiar estado: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);
