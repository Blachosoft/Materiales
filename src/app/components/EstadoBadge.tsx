import { EstadoSolicitud } from "../data/store";
import { Badge } from "./ui/badge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Truck,
  PackageCheck,
  Wrench,
} from "lucide-react";

const MAP: Record<
  EstadoSolicitud,
  { cls: string; icon: React.ElementType }
> = {
  Pendiente: { cls: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  Aprobada: { cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  Rechazada: { cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  CitaAgendada: { cls: "bg-violet-100 text-violet-800 border-violet-200", icon: CalendarClock },
  Despachada: { cls: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck },
  Recogida: { cls: "bg-teal-100 text-teal-800 border-teal-200", icon: PackageCheck },
  Cerrada: { cls: "bg-primary/10 text-primary border-primary/20", icon: Wrench },
};

export function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  const { cls, icon: Icon } = MAP[estado];
  return (
    <Badge variant="outline" className={`gap-1 ${cls}`}>
      <Icon className="size-3.5" />
      {estado}
    </Badge>
  );
}

export function PrioridadBadge({ prioridad }: { prioridad: "Alta" | "Media" | "Baja" }) {
  const cls =
    prioridad === "Alta"
      ? "bg-red-50 text-red-700 border-red-200"
      : prioridad === "Media"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <Badge variant="outline" className={cls}>
      {prioridad}
    </Badge>
  );
}
