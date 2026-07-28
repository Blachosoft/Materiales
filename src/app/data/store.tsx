import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { api, supabase, setAccessToken } from "../lib/api";

// ===== Roles y usuarios =====
export type RoleId = "contratista" | "almacenista" | "admin";

export interface Usuario {
  role: RoleId;
  nombre: string;
  cargo: string;
  email: string;
  empresa: string;
  iniciales: string;
}

export const USUARIOS: Record<RoleId, Usuario> = {
  contratista: {
    role: "contratista",
    nombre: "Carlos Pérez",
    cargo: "Contratista",
    email: "carlos.perez@electrocontratos.co",
    empresa: "Electrocontratos SAS",
    iniciales: "CP",
  },
  almacenista: {
    role: "almacenista",
    nombre: "María Gómez",
    cargo: "Almacenista",
    email: "maria.gomez@cens.com.co",
    empresa: "CENS · Bodega Central",
    iniciales: "MG",
  },
  admin: {
    role: "admin",
    nombre: "Ana García",
    cargo: "Líder de Pérdidas / Admin",
    email: "ana.garcia@cens.com.co",
    empresa: "CENS · Grupo EPM",
    iniciales: "AG",
  },
};

// Directorio de usuarios de la plataforma (administración)
export interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  rol: "Contratista" | "Almacenista" | "Líder de Pérdidas" | "Administrador" | "Auditor";
  empresa: string;
  estado: "Activo" | "Inactivo";
  ultimoAcceso: string;
}

export const DIRECTORIO_SEED: UsuarioSistema[] = [
  { id: "u1", nombre: "Carlos Pérez", email: "carlos.perez@electrocontratos.co", rol: "Contratista", empresa: "Electrocontratos SAS", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u2", nombre: "Laura Ramírez", email: "laura.ramirez@redesnorte.co", rol: "Contratista", empresa: "Redes del Norte Ltda", estado: "Activo", ultimoAcceso: "2025-11-27" },
  { id: "u3", nombre: "María Gómez", email: "maria.gomez@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Central", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u4", nombre: "Jorge Peña", email: "jorge.pena@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Ocaña", estado: "Activo", ultimoAcceso: "2025-11-26" },
  { id: "u5", nombre: "Ana García", email: "ana.garcia@cens.com.co", rol: "Líder de Pérdidas", empresa: "CENS · Grupo EPM", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u6", nombre: "Diego Torres", email: "diego.torres@cens.com.co", rol: "Auditor", empresa: "CENS · Control Interno", estado: "Inactivo", ultimoAcceso: "2025-10-30" },
];

// ===== Tipos de dominio =====
export interface Material {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stock: number;
  stockMin: number;
  bodega: string;
  costo: number;
}

export interface Bodega {
  id: string;
  nombre: string;
  zona: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  ot: string;
  zona: string;
  tipo: string;
}

export type EstadoSolicitud =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Despachada"
  | "Instalada";

export interface LineaSolicitud {
  materialId: string;
  codigo: string;
  nombre: string;
  unidad: string;
  costo: number;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadInstalada: number;
  ubicacion?: string; // NIC / transformador / circuito
}

export interface Solicitud {
  id: string;
  contratista: string;
  empresa: string;
  proyectoId: string;
  bodega: string;
  estado: EstadoSolicitud;
  prioridad: "Alta" | "Media" | "Baja";
  tipo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  observacion?: string;
  lineas: LineaSolicitud[];
  historial: { fecha: string; evento: string; usuario: string }[];
}

// ===== Datos semilla =====
export const BODEGAS: Bodega[] = [
  { id: "b1", nombre: "Bodega Central Cúcuta", zona: "Norte de Santander" },
  { id: "b2", nombre: "Bodega Ocaña", zona: "Occidente" },
  { id: "b3", nombre: "Bodega Pamplona", zona: "Sur" },
];

export const PROYECTOS: Proyecto[] = [
  { id: "p1", nombre: "Normalización Barrio La Libertad", ot: "OT-10432", zona: "Norte de Santander", tipo: "Normalización" },
  { id: "p2", nombre: "Recuperación de pérdidas Sector 7", ot: "OT-10488", zona: "Occidente", tipo: "Recuperación" },
  { id: "p3", nombre: "Macromedición Circuito 3", ot: "OT-10521", zona: "Sur", tipo: "Macromedición" },
  { id: "p4", nombre: "Blindaje de red Comuna 4", ot: "OT-10560", zona: "Norte de Santander", tipo: "Blindaje" },
];

export const MATERIALES: Material[] = [
  { id: "m1", codigo: "MED-001", nombre: "Medidor monofásico prepago", categoria: "Medición", unidad: "und", stock: 320, stockMin: 80, bodega: "Bodega Central Cúcuta", costo: 185000 },
  { id: "m2", codigo: "MED-002", nombre: "Medidor trifásico inteligente", categoria: "Medición", unidad: "und", stock: 54, stockMin: 60, bodega: "Bodega Central Cúcuta", costo: 640000 },
  { id: "m3", codigo: "CAB-101", nombre: "Cable ACSR 1/0 AWG", categoria: "Conductores", unidad: "m", stock: 4200, stockMin: 1500, bodega: "Bodega Ocaña", costo: 8900 },
  { id: "m4", codigo: "CAB-102", nombre: "Cable concéntrico 2x8", categoria: "Conductores", unidad: "m", stock: 980, stockMin: 1000, bodega: "Bodega Central Cúcuta", costo: 6200 },
  { id: "m5", codigo: "AIS-201", nombre: "Aislador polimérico 15kV", categoria: "Aisladores", unidad: "und", stock: 640, stockMin: 200, bodega: "Bodega Pamplona", costo: 42000 },
  { id: "m6", codigo: "TRF-301", nombre: "Transformador 25 kVA", categoria: "Transformadores", unidad: "und", stock: 12, stockMin: 8, bodega: "Bodega Central Cúcuta", costo: 4850000 },
  { id: "m7", codigo: "CAJ-401", nombre: "Caja antifraude tipo S", categoria: "Protección", unidad: "und", stock: 210, stockMin: 100, bodega: "Bodega Ocaña", costo: 95000 },
  { id: "m8", codigo: "BRK-501", nombre: "Breaker 2x40A", categoria: "Protección", unidad: "und", stock: 470, stockMin: 150, bodega: "Bodega Pamplona", costo: 38000 },
];

const L = (
  m: Material,
  solicitada: number,
  despachada = 0,
  instalada = 0,
  ubicacion?: string
): LineaSolicitud => ({
  materialId: m.id,
  codigo: m.codigo,
  nombre: m.nombre,
  unidad: m.unidad,
  costo: m.costo,
  cantidadSolicitada: solicitada,
  cantidadDespachada: despachada,
  cantidadInstalada: instalada,
  ubicacion,
});

const mat = (id: string) => MATERIALES.find((m) => m.id === id)!;

const seedSolicitudes: Solicitud[] = [
  {
    id: "SOL-2025-0001",
    contratista: "Carlos Pérez",
    empresa: "Electrocontratos SAS",
    proyectoId: "p1",
    bodega: "Bodega Central Cúcuta",
    estado: "Instalada",
    prioridad: "Alta",
    tipo: "Normalización",
    fechaCreacion: "2025-11-18",
    fechaActualizacion: "2025-11-25",
    lineas: [
      L(mat("m1"), 40, 40, 38, "NIC 884512 · Circuito 3"),
      L(mat("m7"), 40, 40, 38, "NIC 884512 · Circuito 3"),
    ],
    historial: [
      { fecha: "2025-11-18", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-19", evento: "Aprobada por almacén", usuario: "María Gómez" },
      { fecha: "2025-11-20", evento: "Despachada", usuario: "María Gómez" },
      { fecha: "2025-11-25", evento: "Instalación reportada", usuario: "Carlos Pérez" },
    ],
  },
  {
    id: "SOL-2025-0002",
    contratista: "Redes del Norte Ltda",
    empresa: "Redes del Norte Ltda",
    proyectoId: "p2",
    bodega: "Bodega Ocaña",
    estado: "Despachada",
    prioridad: "Media",
    tipo: "Recuperación",
    fechaCreacion: "2025-11-22",
    fechaActualizacion: "2025-11-24",
    lineas: [L(mat("m3"), 600, 600, 0)],
    historial: [
      { fecha: "2025-11-22", evento: "Solicitud creada", usuario: "Redes del Norte Ltda" },
      { fecha: "2025-11-23", evento: "Aprobada por almacén", usuario: "María Gómez" },
      { fecha: "2025-11-24", evento: "Despachada", usuario: "María Gómez" },
    ],
  },
  {
    id: "SOL-2025-0003",
    contratista: "Carlos Pérez",
    empresa: "Electrocontratos SAS",
    proyectoId: "p4",
    bodega: "Bodega Central Cúcuta",
    estado: "Pendiente",
    prioridad: "Alta",
    tipo: "Blindaje",
    fechaCreacion: "2025-11-28",
    fechaActualizacion: "2025-11-28",
    observacion: "Requerido para intervención de fin de semana.",
    lineas: [L(mat("m2"), 15), L(mat("m8"), 30)],
    historial: [{ fecha: "2025-11-28", evento: "Solicitud creada", usuario: "Carlos Pérez" }],
  },
  {
    id: "SOL-2025-0004",
    contratista: "Redes del Norte Ltda",
    empresa: "Redes del Norte Ltda",
    proyectoId: "p3",
    bodega: "Bodega Pamplona",
    estado: "Aprobada",
    prioridad: "Baja",
    tipo: "Macromedición",
    fechaCreacion: "2025-11-27",
    fechaActualizacion: "2025-11-27",
    lineas: [L(mat("m5"), 120)],
    historial: [
      { fecha: "2025-11-27", evento: "Solicitud creada", usuario: "Redes del Norte Ltda" },
      { fecha: "2025-11-27", evento: "Aprobada por almacén", usuario: "María Gómez" },
    ],
  },
  {
    id: "SOL-2025-0005",
    contratista: "Carlos Pérez",
    empresa: "Electrocontratos SAS",
    proyectoId: "p1",
    bodega: "Bodega Central Cúcuta",
    estado: "Rechazada",
    prioridad: "Media",
    tipo: "Normalización",
    fechaCreacion: "2025-11-15",
    fechaActualizacion: "2025-11-16",
    lineas: [L(mat("m6"), 4)],
    historial: [
      { fecha: "2025-11-15", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-16", evento: "Rechazada: Sin stock suficiente, reprogramar", usuario: "María Gómez" },
    ],
  },
];

// Serie mensual para el tablero (solicitado vs instalado, en millones COP)
export const SERIE_MENSUAL = [
  { mes: "Ene", solicitado: 42, instalado: 33 },
  { mes: "Feb", solicitado: 48, instalado: 40 },
  { mes: "Mar", solicitado: 39, instalado: 30 },
  { mes: "Abr", solicitado: 55, instalado: 49 },
  { mes: "May", solicitado: 61, instalado: 56 },
  { mes: "Jun", solicitado: 64, instalado: 58 },
  { mes: "Jul", solicitado: 47, instalado: 44 },
  { mes: "Ago", solicitado: 72, instalado: 66 },
  { mes: "Sep", solicitado: 78, instalado: 72 },
  { mes: "Oct", solicitado: 68, instalado: 61 },
  { mes: "Nov", solicitado: 63, instalado: 55 },
  { mes: "Dic", solicitado: 80, instalado: 71 },
];

const hoy = () => new Date().toISOString().slice(0, 10);

// ===== Contexto =====
interface StoreCtx {
  usuario: Usuario | null;
  login: (role: RoleId) => Promise<void>;
  logout: () => Promise<void>;
  role: RoleId | null;

  view: string;
  params: Record<string, string>;
  navigate: (view: string, params?: Record<string, string>) => void;

  materiales: Material[];
  solicitudes: Solicitud[];
  directorio: UsuarioSistema[];
  guardarUsuario: (u: UsuarioSistema) => Promise<void>;
  toggleUsuario: (id: string) => Promise<void>;
  crearSolicitud: (data: {
    proyectoId: string;
    bodega: string;
    prioridad: Solicitud["prioridad"];
    tipo: string;
    observacion?: string;
    lineas: { materialId: string; cantidad: number }[];
  }) => Promise<string>;
  aprobarSolicitud: (id: string) => Promise<void>;
  rechazarSolicitud: (id: string, motivo: string) => Promise<void>;
  despacharSolicitud: (id: string, despachos: Record<string, number>) => Promise<void>;
  reportarInstalacion: (
    id: string,
    datos: Record<string, { cantidad: number; ubicacion: string }>
  ) => Promise<void>;
  cargando: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [view, setView] = useState("dashboard");
  const [params, setParams] = useState<Record<string, string>>({});
  const [materiales, setMateriales] = useState<Material[]>(MATERIALES);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(seedSolicitudes);
  const [directorio, setDirectorio] = useState<UsuarioSistema[]>(DIRECTORIO_SEED);
  const [cargando, setCargando] = useState(false);

  const navigate = (v: string, p: Record<string, string> = {}) => {
    setView(v);
    setParams(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const refrescar = async () => {
    const data = await api.bootstrap();
    if (data?.solicitudes) setSolicitudes(data.solicitudes);
    if (data?.materiales) setMateriales(data.materiales);
    if (data?.directorio) setDirectorio(data.directorio);
  };

  const login = async (role: RoleId) => {
    const u = USUARIOS[role];
    setCargando(true);
    try {
      // 1) Bootstrap: siembra datos y usuarios de auth (idempotente) y carga estado
      await refrescar();
      // 2) Autenticación real (perfiles demo sembrados en el backend)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: u.email,
        password: "demo1234",
      });
      if (error) console.warn(`Sesión anónima (auth no disponible): ${error.message}`);
      setAccessToken(data?.session?.access_token ?? null);
      setUsuario(u);
      navigate("dashboard");
    } catch (e) {
      console.error(`Error en login: ${e}`);
      // Entrar de todos modos con los datos disponibles (fallback en memoria)
      setUsuario(u);
      navigate("dashboard");
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(`Error al cerrar sesión: ${e}`); }
    setAccessToken(null);
    setUsuario(null);
    navigate("dashboard");
  };

  const quien = () => usuario?.nombre ?? "Sistema";
  const upsertSolicitud = (s: Solicitud) =>
    setSolicitudes((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [s, ...prev]));

  const crearSolicitud: StoreCtx["crearSolicitud"] = async (data) => {
    const nueva = await api.crearSolicitud({
      contratista: usuario?.nombre ?? "Contratista",
      empresa: usuario?.empresa ?? "",
      proyectoId: data.proyectoId,
      bodega: data.bodega,
      prioridad: data.prioridad,
      tipo: data.tipo,
      observacion: data.observacion,
      lineas: data.lineas,
    });
    upsertSolicitud(nueva);
    return nueva.id as string;
  };

  const aprobarSolicitud: StoreCtx["aprobarSolicitud"] = async (id) => {
    upsertSolicitud(await api.aprobar(id, quien()));
  };
  const rechazarSolicitud: StoreCtx["rechazarSolicitud"] = async (id, motivo) => {
    upsertSolicitud(await api.rechazar(id, quien(), motivo));
  };
  const despacharSolicitud: StoreCtx["despacharSolicitud"] = async (id, despachos) => {
    upsertSolicitud(await api.despachar(id, quien(), despachos));
    // Refrescar inventario (el stock cambió en el servidor)
    try { await refrescar(); } catch (e) { console.error(`Error al refrescar inventario: ${e}`); }
  };
  const reportarInstalacion: StoreCtx["reportarInstalacion"] = async (id, datos) => {
    upsertSolicitud(await api.instalar(id, quien(), datos));
  };

  const guardarUsuario: StoreCtx["guardarUsuario"] = async (u) => {
    const guardado = await api.guardarUsuario(u);
    setDirectorio((prev) => (prev.some((x) => x.id === guardado.id) ? prev.map((x) => (x.id === guardado.id ? guardado : x)) : [...prev, guardado]));
  };
  const toggleUsuario: StoreCtx["toggleUsuario"] = async (id) => {
    const actualizado = await api.toggleUsuario(id);
    setDirectorio((prev) => prev.map((x) => (x.id === id ? actualizado : x)));
  };

  const value = useMemo<StoreCtx>(
    () => ({
      usuario,
      login,
      logout,
      role: usuario?.role ?? null,
      view,
      params,
      navigate,
      materiales,
      solicitudes,
      directorio,
      guardarUsuario,
      toggleUsuario,
      crearSolicitud,
      aprobarSolicitud,
      rechazarSolicitud,
      despacharSolicitud,
      reportarInstalacion,
      cargando,
    }),
    [usuario, view, params, materiales, solicitudes, directorio, cargando]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore debe usarse dentro de StoreProvider");
  return c;
}

// ===== Helpers =====
export const proyectoDe = (id: string) => PROYECTOS.find((p) => p.id === id);

// Alertas de anomalías basadas en reglas (sin IA): desviación despachado vs instalado
export interface Alerta {
  solicitudId: string;
  contratista: string;
  proyecto: string;
  material: string;
  despachado: number;
  instalado: number;
  desviacionPct: number;
  severidad: "Alta" | "Media";
}
export const detectarAlertas = (solicitudes: Solicitud[]): Alerta[] => {
  const out: Alerta[] = [];
  solicitudes
    .filter((s) => s.estado === "Instalada")
    .forEach((s) =>
      s.lineas.forEach((l) => {
        if (l.cantidadDespachada > 0 && l.cantidadInstalada < l.cantidadDespachada) {
          const dif = l.cantidadDespachada - l.cantidadInstalada;
          const pct = Math.round((dif / l.cantidadDespachada) * 100);
          if (pct >= 5)
            out.push({
              solicitudId: s.id,
              contratista: s.empresa,
              proyecto: proyectoDe(s.proyectoId)?.nombre ?? "—",
              material: `${l.codigo} · ${l.nombre}`,
              despachado: l.cantidadDespachada,
              instalado: l.cantidadInstalada,
              desviacionPct: pct,
              severidad: pct >= 15 ? "Alta" : "Media",
            });
        }
      })
    );
  return out.sort((a, b) => b.desviacionPct - a.desviacionPct);
};
export const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
export const totalSolicitud = (s: Solicitud) =>
  s.lineas.reduce((a, l) => a + l.costo * l.cantidadSolicitada, 0);
export const totalInstalado = (s: Solicitud) =>
  s.lineas.reduce((a, l) => a + l.costo * l.cantidadInstalada, 0);
