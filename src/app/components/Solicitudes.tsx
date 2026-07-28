import { useState } from "react";
import { useStore, proyectoDe, EstadoSolicitud } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { EstadoBadge, PrioridadBadge } from "./EstadoBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Search, ChevronRight } from "lucide-react";

const ESTADOS: (EstadoSolicitud | "Todos")[] = [
  "Todos",
  "Pendiente",
  "Aprobada",
  "CitaAgendada",
  "Despachada",
  "Recogida",
  "Cerrada",
  "Rechazada",
];

export function Solicitudes() {
  const { role, usuario, solicitudes, navigate } = useStore();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<EstadoSolicitud | "Todos">("Todos");

  let lista = solicitudes;
  if (role === "contratista") lista = lista.filter((s) => s.contratista === usuario?.nombre);
  if (filtro !== "Todos") lista = lista.filter((s) => s.estado === filtro);
  if (q.trim()) {
    const t = q.toLowerCase();
    lista = lista.filter(
      (s) =>
        s.id.toLowerCase().includes(t) ||
        s.empresa.toLowerCase().includes(t) ||
        (proyectoDe(s.proyectoId)?.nombre.toLowerCase().includes(t) ?? false)
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {role === "contratista" ? "Mis solicitudes de material" : "Solicitudes de material"}
          </h2>
          <p className="text-muted-foreground">Gestiona y revisa el estado de todas las solicitudes.</p>
        </div>
        {role === "contratista" && (
          <Button onClick={() => navigate("crear-solicitud")} className="gap-2">
            <Plus className="size-4" /> Nueva solicitud
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por ID, empresa o proyecto…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ESTADOS.map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  filtro === e ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>ID</TableHead>
              <TableHead>Proyecto / OT</TableHead>
              <TableHead className="hidden md:table-cell">Empresa</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No se encontraron solicitudes.
                </TableCell>
              </TableRow>
            ) : (
              lista.map((s) => {
                const p = proyectoDe(s.proyectoId);
                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => navigate("detalle", { id: s.id })}
                  >
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>
                      <div className="max-w-56 truncate">{p?.nombre}</div>
                      <div className="text-xs text-muted-foreground">{p?.ot}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{s.empresa}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{s.fechaCreacion}</TableCell>
                    <TableCell><PrioridadBadge prioridad={s.prioridad} /></TableCell>
                    <TableCell><EstadoBadge estado={s.estado} /></TableCell>
                    <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
