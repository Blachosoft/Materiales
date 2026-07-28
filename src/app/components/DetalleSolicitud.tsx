import { useState } from "react";
import { useStore, proyectoDe, fmtCOP, totalSolicitud } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { EstadoBadge, PrioridadBadge } from "./EstadoBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./ui/dialog";
import {
  ArrowLeft, CheckCircle2, XCircle, Truck, MapPin, FileDown, AlertTriangle,
} from "lucide-react";
import { exportarPDF, tablaHTML } from "../lib/exportar";

export function DetalleSolicitud() {
  const { params, solicitudes, navigate, role, aprobarSolicitud, rechazarSolicitud } = useStore();
  const s = solicitudes.find((x) => x.id === params.id);
  if (!s) return <div className="p-8">Solicitud no encontrada. <Button variant="link" onClick={() => navigate("solicitudes")}>Volver</Button></div>;
  const p = proyectoDe(s.proyectoId);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => navigate("solicitudes")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver al listado
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{s.id}</h2>
          <EstadoBadge estado={s.estado} />
          <PrioridadBadge prioridad={s.prioridad} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              exportarPDF(
                `Solicitud ${s.id}`,
                `<p><b>Proyecto:</b> ${p?.nombre ?? "—"} (${p?.ot ?? ""}) · <b>Empresa:</b> ${s.empresa} · <b>Estado:</b> ${s.estado}</p>` +
                  tablaHTML(
                    ["Código", "Descripción", "Solicitado", "Despachado", "Instalado", "Ubicación"],
                    s.lineas.map((l) => [l.codigo, l.nombre, l.cantidadSolicitada, l.cantidadDespachada, l.cantidadInstalada, l.ubicacion ?? "—"])
                  )
              )
            }
          >
            <FileDown className="size-4" /> Exportar PDF
          </Button>
          {role === "almacenista" && s.estado === "Pendiente" && (
            <>
              <RechazarDialog onConfirm={(m) => { rechazarSolicitud(s.id, m); }} />
              <Button className="gap-2" onClick={() => aprobarSolicitud(s.id)}>
                <CheckCircle2 className="size-4" /> Aprobar
              </Button>
            </>
          )}
          {role === "almacenista" && s.estado === "Aprobada" && <DespacharDialog id={s.id} />}
          {role === "contratista" && s.estado === "Despachada" && (
            <Button className="gap-2" onClick={() => navigate("instalacion", { id: s.id })}>
              <MapPin className="size-4" /> Reportar instalación
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <Card className="grid gap-y-4 gap-x-6 p-6 sm:grid-cols-3">
        <Meta label="Proyecto" value={p?.nombre ?? "—"} />
        <Meta label="Orden de trabajo" value={p?.ot ?? "—"} />
        <Meta label="Tipo de intervención" value={s.tipo} />
        <Meta label="Empresa contratista" value={s.empresa} />
        <Meta label="Solicitante" value={s.contratista} />
        <Meta label="Bodega" value={s.bodega} />
        <Meta label="Fecha creación" value={s.fechaCreacion} />
        <Meta label="Última actualización" value={s.fechaActualizacion} />
        <Meta label="Valor solicitado" value={fmtCOP(totalSolicitud(s))} />
        {s.observacion && (
          <div className="sm:col-span-3">
            <div className="text-xs text-muted-foreground">Observación</div>
            <div className="text-sm">{s.observacion}</div>
          </div>
        )}
      </Card>

      {/* Materiales */}
      <Card className="overflow-hidden">
        <div className="border-b px-5 py-4 font-medium">Detalle de materiales</div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Solicitado</TableHead>
              <TableHead className="text-right">Despachado</TableHead>
              <TableHead className="text-right">Instalado</TableHead>
              <TableHead className="hidden md:table-cell">Ubicación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.lineas.map((l) => {
              const desvio = l.cantidadInstalada > 0 && l.cantidadInstalada < l.cantidadDespachada;
              return (
                <TableRow key={l.materialId}>
                  <TableCell className="font-medium">{l.codigo}</TableCell>
                  <TableCell>{l.nombre}</TableCell>
                  <TableCell className="text-right">{l.cantidadSolicitada} {l.unidad}</TableCell>
                  <TableCell className="text-right">{l.cantidadDespachada || "—"}</TableCell>
                  <TableCell className="text-right">
                    <span className={desvio ? "font-medium text-red-600" : ""}>
                      {l.cantidadInstalada || "—"}
                      {desvio && <AlertTriangle className="ml-1 inline size-3.5" />}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{l.ubicacion ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <div className="mb-4 font-medium">Trazabilidad</div>
        <ol className="relative space-y-5 border-l pl-6">
          {s.historial.map((h, i) => (
            <li key={i}>
              <span className="absolute -left-[7px] mt-1 size-3.5 rounded-full border-2 border-background bg-primary" />
              <div className="text-sm font-medium">{h.evento}</div>
              <div className="text-xs text-muted-foreground">{h.fecha} · {h.usuario}</div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function RechazarDialog({ onConfirm }: { onConfirm: (m: string) => void }) {
  const [motivo, setMotivo] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700"><XCircle className="size-4" /> Rechazar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rechazar solicitud</DialogTitle></DialogHeader>
        <Textarea placeholder="Motivo del rechazo (ej. sin stock, reprogramar)…" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="bg-red-600 hover:bg-red-700" disabled={!motivo.trim()} onClick={() => { onConfirm(motivo); setOpen(false); }}>
            Confirmar rechazo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DespacharDialog({ id }: { id: string }) {
  const { solicitudes, despacharSolicitud, materiales } = useStore();
  const s = solicitudes.find((x) => x.id === id)!;
  const [open, setOpen] = useState(false);
  const [cant, setCant] = useState<Record<string, number>>(
    Object.fromEntries(s.lineas.map((l) => [l.materialId, l.cantidadSolicitada]))
  );

  const totalSol = s.lineas.reduce((a, l) => a + l.cantidadSolicitada, 0);
  const totalDes = Object.values(cant).reduce((a, b) => a + (b || 0), 0);
  const pct = Math.round((totalDes / totalSol) * 100);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Truck className="size-4" /> Despachar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Despacho de {s.id}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Reporta la cantidad entregada por material. El inventario se descuenta al finalizar.</p>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">Progreso del despacho</span>
            <span className="text-muted-foreground">{totalDes} de {totalSol} uds</span>
          </div>
          <Progress value={pct} />
        </div>

        <div className="max-h-72 space-y-3 overflow-auto">
          {s.lineas.map((l) => {
            const stock = materiales.find((m) => m.id === l.materialId)?.stock ?? 0;
            const excede = (cant[l.materialId] || 0) > stock;
            return (
              <div key={l.materialId} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{l.codigo} · {l.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    Solicitado {l.cantidadSolicitada} · Stock {stock} {l.unidad}
                    {excede && <span className="text-red-600"> · excede stock</span>}
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={Math.min(l.cantidadSolicitada, stock)}
                  value={cant[l.materialId]}
                  onChange={(e) => setCant((c) => ({ ...c, [l.materialId]: Number(e.target.value) }))}
                  className="w-24"
                />
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            className="gap-2"
            onClick={() => { despacharSolicitud(id, cant); setOpen(false); }}
          >
            <CheckCircle2 className="size-4" /> Finalizar despacho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
