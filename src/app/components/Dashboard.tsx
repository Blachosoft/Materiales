import { useStore, proyectoDe } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Kpi } from "./Kpi";
import { EstadoBadge, PrioridadBadge } from "./EstadoBadge";
import {
  ShoppingCart,
  FileSearch,
  Wrench,
  BarChart3,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  AlertTriangle,
  ChevronRight,
  Users,
  ClipboardList,
  ArrowRight,
} from "lucide-react";

export function Dashboard() {
  const { role } = useStore();
  if (role === "contratista") return <DashContratista />;
  if (role === "almacenista") return <DashAlmacenista />;
  return <DashAdmin />;
}

/* ---------- Contratista ---------- */
function DashContratista() {
  const { usuario, solicitudes, navigate } = useStore();
  const mias = solicitudes.filter((s) => s.contratista === usuario?.nombre);
  const acciones = [
    { icon: ShoppingCart, title: "Iniciar solicitud", desc: "Crea y envía una nueva petición de materiales.", go: () => navigate("crear-solicitud") },
    { icon: FileSearch, title: "Ver solicitudes", desc: "Revisa el estado y el historial de tus solicitudes.", go: () => navigate("solicitudes") },
    { icon: Wrench, title: "Reportar instalación", desc: "Registra el material instalado en terreno.", go: () => navigate("instalacion") },
    { icon: BarChart3, title: "Reportes", desc: "Visualiza informes y consumo de materiales.", go: () => navigate("reportes") },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">¿Qué te gustaría hacer hoy?</h2>
        <p className="text-muted-foreground">Bienvenido, {usuario?.nombre} · {usuario?.empresa}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {acciones.map((a) => (
          <button key={a.title} onClick={a.go} className="group text-left">
            <Card className="h-full p-5 transition hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <a.icon className="size-5" />
              </div>
              <div className="flex items-center gap-1 font-medium">{a.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-sm text-primary opacity-0 transition group-hover:opacity-100">
                Continuar <ArrowRight className="size-3.5" />
              </div>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Total solicitudes" value={mias.length} icon={ClipboardList} tone="slate" />
        <Kpi label="Pendientes" value={mias.filter((s) => s.estado === "Pendiente").length} icon={Clock} tone="amber" />
        <Kpi label="Despachadas" value={mias.filter((s) => s.estado === "Despachada").length} icon={Truck} tone="blue" />
        <Kpi label="Instaladas" value={mias.filter((s) => s.estado === "Instalada").length} icon={PackageCheck} tone="primary" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-medium">Solicitudes recientes</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("solicitudes")} className="gap-1">
            Ver todas <ChevronRight className="size-4" />
          </Button>
        </div>
        <SolicitudMiniLista lista={mias.slice(0, 4)} />
      </Card>
    </div>
  );
}

/* ---------- Almacenista ---------- */
function DashAlmacenista() {
  const { solicitudes, materiales, navigate } = useStore();
  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente");
  const porDespachar = solicitudes.filter((s) => s.estado === "Aprobada");
  const criticos = materiales.filter((m) => m.stock <= m.stockMin);

  const cola = [...pendientes, ...porDespachar];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Panel de despacho</h2>
        <p className="text-muted-foreground">Solicitudes por revisar, aprobar y despachar desde bodega.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Por aprobar" value={pendientes.length} icon={Clock} tone="amber" />
        <Kpi label="Por despachar" value={porDespachar.length} icon={CheckCircle2} tone="primary" />
        <Kpi label="Despachadas hoy" value={solicitudes.filter((s) => s.estado === "Despachada").length} icon={Truck} tone="blue" />
        <Kpi label="Materiales críticos" value={criticos.length} icon={AlertTriangle} tone="red" hint="Bajo stock mínimo" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-medium">Cola de trabajo</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("solicitudes")} className="gap-1">
            Ver todas <ChevronRight className="size-4" />
          </Button>
        </div>
        {cola.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Sin solicitudes en cola. ✅</div>
        ) : (
          <SolicitudMiniLista lista={cola.slice(0, 6)} />
        )}
      </Card>

      {criticos.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 p-5">
          <div className="mb-3 flex items-center gap-2 font-medium text-red-800">
            <AlertTriangle className="size-4.5" /> Materiales bajo stock mínimo
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {criticos.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                <span>{m.codigo} · {m.nombre}</span>
                <span className="font-medium text-red-700">{m.stock}/{m.stockMin} {m.unidad}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------- Admin / Líder ---------- */
function DashAdmin() {
  const { solicitudes, navigate } = useStore();
  const conDesvio = solicitudes.filter(
    (s) => s.estado === "Instalada" && s.lineas.some((l) => l.cantidadInstalada < l.cantidadDespachada)
  );
  const accesos = [
    { icon: ClipboardList, title: "Ver solicitudes", desc: "Revisa, aprueba y gestiona todas las solicitudes del sistema.", go: () => navigate("solicitudes") },
    { icon: BarChart3, title: "Reportes de gestión", desc: "Métricas de uso de materiales y costos asociados.", go: () => navigate("reportes") },
    { icon: Users, title: "Trazabilidad", desc: "Historial completo por proyecto, contratista y material.", go: () => navigate("trazabilidad") },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Bienvenido, Ana</h2>
        <p className="text-muted-foreground">Panel de administración · Área de Pérdidas CENS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Solicitudes totales" value={solicitudes.length} icon={ClipboardList} tone="slate" />
        <Kpi label="En proceso" value={solicitudes.filter((s) => ["Pendiente", "Aprobada", "Despachada"].includes(s.estado)).length} icon={Truck} tone="blue" />
        <Kpi label="Instaladas" value={solicitudes.filter((s) => s.estado === "Instalada").length} icon={PackageCheck} tone="primary" />
        <Kpi label="Con desviación" value={conDesvio.length} icon={AlertTriangle} tone="red" hint="Instalado < despachado" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {accesos.map((a) => (
          <button key={a.title} onClick={a.go} className="group text-left">
            <Card className="h-full p-6 transition hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <a.icon className="size-6" />
              </div>
              <div className="font-medium">{a.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-medium">Actividad reciente</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("solicitudes")} className="gap-1">
            Ver todas <ChevronRight className="size-4" />
          </Button>
        </div>
        <SolicitudMiniLista lista={solicitudes.slice(0, 6)} />
      </Card>
    </div>
  );
}

/* ---------- Lista compacta compartida ---------- */
function SolicitudMiniLista({ lista }: { lista: ReturnType<typeof useStore>["solicitudes"] }) {
  const { navigate } = useStore();
  if (lista.length === 0)
    return <div className="p-10 text-center text-sm text-muted-foreground">Aún no hay solicitudes.</div>;
  return (
    <div className="divide-y">
      {lista.map((s) => {
        const p = proyectoDe(s.proyectoId);
        return (
          <button
            key={s.id}
            onClick={() => navigate("detalle", { id: s.id })}
            className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-accent/40"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.id}</span>
                <PrioridadBadge prioridad={s.prioridad} />
              </div>
              <div className="truncate text-sm text-muted-foreground">
                {p?.nombre} · {s.empresa} · {s.lineas.length} ítems
              </div>
            </div>
            <div className="hidden text-xs text-muted-foreground sm:block">{s.fechaCreacion}</div>
            <EstadoBadge estado={s.estado} />
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}
