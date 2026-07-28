import { createContext, useContext, useMemo, useState, ReactNode } from "react";

// ===== Roles y usuarios =====
// El módulo no gestiona autenticación: el usuario y su rol los entrega la
// aplicación anfitriona vía la prop `usuarioActual` de <MaterialesApp />.
// En desarrollo standalone (import.meta.env.DEV) se ofrece un selector de
// rol para poder demostrar el ciclo completo crear → aprobar → despachar.
export type RoleId = "contratista" | "interventor" | "almacenista" | "admin";

export interface Usuario {
  role: RoleId;
  nombre: string;
  cargo: string;
  email: string;
  empresa: string;
  iniciales: string;
}

// Identidades de referencia, usadas únicamente por el selector de rol en modo desarrollo.
export const USUARIOS: Record<RoleId, Usuario> = {
  contratista: {
    role: "contratista",
    nombre: "Carlos Pérez",
    cargo: "Contratista",
    email: "carlos.perez@electrocontratos.co",
    empresa: "Electrocontratos SAS",
    iniciales: "CP",
  },
  interventor: {
    role: "interventor",
    nombre: "Jorge Martínez",
    cargo: "Interventor de contrato",
    email: "jorge.martinez@cens.com.co",
    empresa: "CENS · Interventoría",
    iniciales: "JM",
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
  rol: "Contratista" | "Interventor" | "Almacenista" | "Líder de Pérdidas" | "Administrador" | "Auditor";
  empresa: string;
  estado: "Activo" | "Inactivo";
  ultimoAcceso: string;
}

export const DIRECTORIO_SEED: UsuarioSistema[] = [
  { id: "u1", nombre: "Carlos Pérez", email: "carlos.perez@electrocontratos.co", rol: "Contratista", empresa: "Electrocontratos SAS", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u2", nombre: "Laura Ramírez", email: "laura.ramirez@redesnorte.co", rol: "Contratista", empresa: "Redes del Norte Ltda", estado: "Activo", ultimoAcceso: "2025-11-27" },
  { id: "u3", nombre: "Jorge Martínez", email: "jorge.martinez@cens.com.co", rol: "Interventor", empresa: "CENS · Interventoría", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u4", nombre: "María Gómez", email: "maria.gomez@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Central", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u5", nombre: "Jorge Peña", email: "jorge.pena@cens.com.co", rol: "Almacenista", empresa: "CENS · Bodega Ocaña", estado: "Activo", ultimoAcceso: "2025-11-26" },
  { id: "u6", nombre: "Ana García", email: "ana.garcia@cens.com.co", rol: "Líder de Pérdidas", empresa: "CENS · Grupo EPM", estado: "Activo", ultimoAcceso: "2025-11-28" },
  { id: "u7", nombre: "Diego Torres", email: "diego.torres@cens.com.co", rol: "Auditor", empresa: "CENS · Control Interno", estado: "Inactivo", ultimoAcceso: "2025-10-30" },
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

// Ciclo de vida de la solicitud, alineado al diagrama de flujo:
// Contratista pide -> Interventor aprueba -> Almacenista agenda cita ->
// Almacenista despacha -> Contratista recoge -> Contratista usa y cierra.
export type EstadoSolicitud =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "CitaAgendada"
  | "Despachada"
  | "Recogida"
  | "Cerrada";

export interface Cita {
  fecha: string;
  hora: string;
  lugar: string;
  creadaPor: string;
  notificada: boolean;
}

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
  cita?: Cita;
  evidenciaUrl?: string;
  usoTotalConfirmado?: boolean;
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
    estado: "Cerrada",
    prioridad: "Alta",
    tipo: "Normalización",
    fechaCreacion: "2025-11-18",
    fechaActualizacion: "2025-11-25",
    lineas: [
      L(mat("m1"), 40, 40, 38, "NIC 884512 · Circuito 3"),
      L(mat("m7"), 40, 40, 38, "NIC 884512 · Circuito 3"),
    ],
    cita: { fecha: "2025-11-20", hora: "09:00", lugar: "Bodega Central Cúcuta", creadaPor: "María Gómez", notificada: true },
    evidenciaUrl: "https://sac.cens.com.co/actas/SOL-2025-0001.pdf",
    usoTotalConfirmado: false,
    historial: [
      { fecha: "2025-11-18", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-19", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-19", evento: "Cita generada para recoger material", usuario: "María Gómez" },
      { fecha: "2025-11-20", evento: "Despachada desde bodega", usuario: "María Gómez" },
      { fecha: "2025-11-20", evento: "Material recogido por el contratista", usuario: "Carlos Pérez" },
      { fecha: "2025-11-25", evento: "Cierre reportado con evidencia", usuario: "Carlos Pérez" },
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
    cita: { fecha: "2025-11-24", hora: "14:00", lugar: "Bodega Ocaña", creadaPor: "Jorge Peña", notificada: true },
    historial: [
      { fecha: "2025-11-22", evento: "Solicitud creada", usuario: "Redes del Norte Ltda" },
      { fecha: "2025-11-23", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-23", evento: "Cita generada para recoger material", usuario: "Jorge Peña" },
      { fecha: "2025-11-24", evento: "Despachada desde bodega", usuario: "Jorge Peña" },
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
      { fecha: "2025-11-27", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
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
      { fecha: "2025-11-16", evento: "Rechazada: Sin stock suficiente, reprogramar", usuario: "Jorge Martínez" },
    ],
  },
  {
    id: "SOL-2025-0006",
    contratista: "Carlos Pérez",
    empresa: "Electrocontratos SAS",
    proyectoId: "p1",
    bodega: "Bodega Central Cúcuta",
    estado: "Recogida",
    prioridad: "Media",
    tipo: "Cambio de medidor",
    fechaCreacion: "2025-11-20",
    fechaActualizacion: "2025-11-23",
    lineas: [L(mat("m1"), 20, 20, 0)],
    cita: { fecha: "2025-11-22", hora: "10:30", lugar: "Bodega Central Cúcuta", creadaPor: "María Gómez", notificada: true },
    historial: [
      { fecha: "2025-11-20", evento: "Solicitud creada", usuario: "Carlos Pérez" },
      { fecha: "2025-11-20", evento: "Aprobada por interventoría", usuario: "Jorge Martínez" },
      { fecha: "2025-11-21", evento: "Cita generada para recoger material", usuario: "María Gómez" },
      { fecha: "2025-11-22", evento: "Despachada desde bodega", usuario: "María Gómez" },
      { fecha: "2025-11-23", evento: "Material recogido por el contratista", usuario: "Carlos Pérez" },
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
const esDev = () => Boolean((import.meta as any).env?.DEV);

// ===== Contexto =====
interface StoreCtx {
  usuario: Usuario;
  role: RoleId;
  /** Solo disponible en modo desarrollo (sin usuarioActual inyectado por el host). */
  puedeCambiarRol: boolean;
  cambiarRolDemo: (role: RoleId) => void;

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
  generarCita: (id: string, cita: { fecha: string; hora: string; lugar: string }) => Promise<void>;
  despacharSolicitud: (id: string, despachos: Record<string, number>) => Promise<void>;
  confirmarRecogida: (id: string) => Promise<void>;
  cerrarSolicitud: (
    id: string,
    datos: {
      lineas: Record<string, { cantidad: number; ubicacion: string }>;
      evidenciaUrl: string;
      usoTotalConfirmado: boolean;
    }
  ) => Promise<void>;
  cargando: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

/**
 * El módulo persiste su estado en memoria (React state) durante la sesión del
 * navegador: no depende de ningún backend propio. Esto es intencional para un
 * componente embebible — la app anfitriona ya tiene su propia API/base de
 * datos. Cuando el equipo host quiera persistencia real entre sesiones, estas
 * funciones son el único punto de integración a reemplazar por llamadas a su
 * backend (o al backend de referencia incluido en supabase/functions/server).
 */
let seq = 7;
const nuevoIdSolicitud = () => `SOL-2025-${String(seq++).padStart(4, "0")}`;

export function StoreProvider({
  children,
  usuarioActual,
}: {
  children: ReactNode;
  /** Identidad y rol inyectados por la aplicación anfitriona. Si se omite, solo en
   *  modo desarrollo se habilita un selector de rol para poder probar el módulo aislado. */
  usuarioActual?: Usuario;
}) {
  const [rolDemo, setRolDemo] = useState<RoleId>("contratista");
  const usuario = usuarioActual ?? USUARIOS[rolDemo];
  const puedeCambiarRol = !usuarioActual && esDev();

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

  const cambiarRolDemo = (role: RoleId) => {
    setRolDemo(role);
    navigate("dashboard");
  };

  const quien = () => usuario.nombre;

  // Aplica una transición de estado a una solicitud existente.
  const actualizar = (id: string, fn: (s: Solicitud) => Solicitud) =>
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? fn(s) : s)));

  const crearSolicitud: StoreCtx["crearSolicitud"] = async (data) => {
    setCargando(true);
    try {
      const lineas: LineaSolicitud[] = data.lineas.map(({ materialId, cantidad }) => {
        const m = materiales.find((x) => x.id === materialId)!;
        return L(m, cantidad);
      });
      const id = nuevoIdSolicitud();
      const nueva: Solicitud = {
        id,
        contratista: usuario.nombre,
        empresa: usuario.empresa,
        proyectoId: data.proyectoId,
        bodega: data.bodega,
        estado: "Pendiente",
        prioridad: data.prioridad,
        tipo: data.tipo,
        fechaCreacion: hoy(),
        fechaActualizacion: hoy(),
        observacion: data.observacion,
        lineas,
        historial: [{ fecha: hoy(), evento: "Solicitud creada", usuario: usuario.nombre }],
      };
      setSolicitudes((prev) => [nueva, ...prev]);
      return id;
    } finally {
      setCargando(false);
    }
  };

  const aprobarSolicitud: StoreCtx["aprobarSolicitud"] = async (id) => {
    actualizar(id, (s) => ({
      ...s,
      estado: "Aprobada",
      fechaActualizacion: hoy(),
      historial: [...s.historial, { fecha: hoy(), evento: "Aprobada por interventoría", usuario: quien() }],
    }));
  };

  const rechazarSolicitud: StoreCtx["rechazarSolicitud"] = async (id, motivo) => {
    actualizar(id, (s) => ({
      ...s,
      estado: "Rechazada",
      fechaActualizacion: hoy(),
      historial: [...s.historial, { fecha: hoy(), evento: `Rechazada: ${motivo}`, usuario: quien() }],
    }));
  };

  const generarCita: StoreCtx["generarCita"] = async (id, cita) => {
    actualizar(id, (s) => ({
      ...s,
      estado: "CitaAgendada",
      fechaActualizacion: hoy(),
      cita: { ...cita, creadaPor: quien(), notificada: true },
      historial: [
        ...s.historial,
        { fecha: hoy(), evento: `Cita generada para recoger material: ${cita.fecha} ${cita.hora} · ${cita.lugar}`, usuario: quien() },
        { fecha: hoy(), evento: "Contratista notificado de la cita", usuario: "Sistema" },
      ],
    }));
  };

  const despacharSolicitud: StoreCtx["despacharSolicitud"] = async (id, despachos) => {
    setMateriales((prev) =>
      prev.map((m) => (despachos[m.id] != null ? { ...m, stock: Math.max(0, m.stock - despachos[m.id]) } : m))
    );
    actualizar(id, (s) => ({
      ...s,
      estado: "Despachada",
      fechaActualizacion: hoy(),
      lineas: s.lineas.map((l) => ({ ...l, cantidadDespachada: despachos[l.materialId] ?? l.cantidadDespachada })),
      historial: [...s.historial, { fecha: hoy(), evento: "Despachada desde bodega (checklist verificado)", usuario: quien() }],
    }));
  };

  const confirmarRecogida: StoreCtx["confirmarRecogida"] = async (id) => {
    actualizar(id, (s) => ({
      ...s,
      estado: "Recogida",
      fechaActualizacion: hoy(),
      historial: [...s.historial, { fecha: hoy(), evento: "Material recogido por el contratista", usuario: quien() }],
    }));
  };

  const cerrarSolicitud: StoreCtx["cerrarSolicitud"] = async (id, datos) => {
    actualizar(id, (s) => ({
      ...s,
      estado: "Cerrada",
      fechaActualizacion: hoy(),
      evidenciaUrl: datos.evidenciaUrl,
      usoTotalConfirmado: datos.usoTotalConfirmado,
      lineas: s.lineas.map((l) => ({
        ...l,
        cantidadInstalada: datos.lineas[l.materialId]?.cantidad ?? l.cantidadInstalada,
        ubicacion: datos.lineas[l.materialId]?.ubicacion ?? l.ubicacion,
      })),
      historial: [...s.historial, { fecha: hoy(), evento: "Cierre reportado con evidencia", usuario: quien() }],
    }));
  };

  const guardarUsuario: StoreCtx["guardarUsuario"] = async (u) => {
    setDirectorio((prev) => (prev.some((x) => x.id === u.id) ? prev.map((x) => (x.id === u.id ? u : x)) : [...prev, u]));
  };
  const toggleUsuario: StoreCtx["toggleUsuario"] = async (id) => {
    setDirectorio((prev) => prev.map((x) => (x.id === id ? { ...x, estado: x.estado === "Activo" ? "Inactivo" : "Activo" } : x)));
  };

  const value = useMemo<StoreCtx>(
    () => ({
      usuario,
      role: usuario.role,
      puedeCambiarRol,
      cambiarRolDemo,
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
      generarCita,
      despacharSolicitud,
      confirmarRecogida,
      cerrarSolicitud,
      cargando,
    }),
    [usuario, puedeCambiarRol, view, params, materiales, solicitudes, directorio, cargando]
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
    .filter((s) => s.estado === "Cerrada")
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
