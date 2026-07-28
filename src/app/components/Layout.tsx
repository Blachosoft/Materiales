import { ReactNode } from "react";
import { useStore, USUARIOS, RoleId } from "../data/store";
import { BrandMark } from "./BrandLogo";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  LayoutDashboard,
  FileText,
  PackageSearch,
  Truck,
  Wrench,
  BarChart3,
  Route,
  ShieldAlert,
  Users,
  ClipboardCheck,
  Bell,
  HelpCircle,
  FlaskConical,
} from "lucide-react";

interface NavItem {
  view: string;
  label: string;
  icon: React.ElementType;
}

const NAV: Record<RoleId, NavItem[]> = {
  contratista: [
    { view: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { view: "solicitudes", label: "Mis solicitudes", icon: FileText },
    { view: "cierre", label: "Recoger y cerrar", icon: Wrench },
    { view: "inventario", label: "Catálogo", icon: PackageSearch },
    { view: "reportes", label: "Reportes", icon: BarChart3 },
  ],
  interventor: [
    { view: "dashboard", label: "Bandeja de aprobación", icon: ClipboardCheck },
    { view: "solicitudes", label: "Solicitudes", icon: FileText },
    { view: "reportes", label: "Reportes", icon: BarChart3 },
  ],
  almacenista: [
    { view: "dashboard", label: "Panel de despacho", icon: Truck },
    { view: "solicitudes", label: "Solicitudes", icon: FileText },
    { view: "inventario", label: "Inventario", icon: PackageSearch },
    { view: "reportes", label: "Reportes", icon: BarChart3 },
  ],
  admin: [
    { view: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { view: "solicitudes", label: "Solicitudes", icon: FileText },
    { view: "reportes", label: "Reportes de gestión", icon: BarChart3 },
    { view: "trazabilidad", label: "Trazabilidad", icon: Route },
    { view: "alertas", label: "Alertas", icon: ShieldAlert },
    { view: "inventario", label: "Inventario", icon: PackageSearch },
    { view: "usuarios", label: "Usuarios", icon: Users },
  ],
};

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, role, view, navigate } = useStore();
  const items = NAV[role];
  const activo = items.find((i) => i.view === view) ?? items[0];

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <BrandMark className="size-8 text-sidebar-primary" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Gestión Materiales</div>
            <div className="text-[11px] text-sidebar-foreground/60">CENS · Pérdidas</div>
          </div>
        </div>

        <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Menú
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ view: v, label, icon: Icon }) => {
            const active = v === view;
            return (
              <button
                key={v}
                onClick={() => navigate(v)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Icon className="size-4.5" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar className="size-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {usuario.iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium text-white">{usuario.nombre}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">{usuario.cargo}</div>
            </div>
          </div>
          <RoleSwitcherDemo />
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 px-5 py-3 backdrop-blur">
          <BrandMark className="size-7 text-primary lg:hidden" />
          <div className="flex-1">
            <h1 className="font-semibold tracking-tight">{activo.label}</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="size-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="size-4.5" />
          </Button>
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">{usuario.iniciales}</AvatarFallback>
          </Avatar>
        </header>

        {/* Nav móvil */}
        <div className="flex gap-1 overflow-x-auto border-b bg-background px-3 py-2 lg:hidden">
          {items.map(({ view: v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => navigate(v)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                v === view ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Selector de rol visible SOLO en modo desarrollo (el módulo no tiene login
 * propio). Permite simular distintos usuarios para demostrar el ciclo
 * crear → aprobar → agendar cita → despachar → recoger → cerrar sin salir
 * de la aplicación. En producción, embebida en el host, esto no se renderiza:
 * el usuario y su rol llegan siempre por la prop `usuarioActual`.
 */
function RoleSwitcherDemo() {
  const { puedeCambiarRol, role, cambiarRolDemo } = useStore();
  if (!puedeCambiarRol) return null;

  return (
    <div className="mt-1 space-y-1 rounded-lg bg-sidebar-accent/40 p-2">
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-amber-300">
        <FlaskConical className="size-3.5" /> Modo demo · cambiar rol
      </div>
      <Select value={role} onValueChange={(v) => cambiarRolDemo(v as RoleId)}>
        <SelectTrigger className="h-8 border-white/10 bg-white/5 text-xs text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(USUARIOS) as RoleId[]).map((r) => (
            <SelectItem key={r} value={r}>{USUARIOS[r].nombre} · {USUARIOS[r].cargo}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
