import { useState } from "react";
import { useStore, proyectoDe } from "../data/store";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { EstadoBadge } from "./EstadoBadge";
import { Search, Route, AlertTriangle } from "lucide-react";

export function Trazabilidad() {
  const { solicitudes } = useStore();
  const [q, setQ] = useState("");

  // Aplanar a movimientos por material
  const filas = solicitudes.flatMap((s) =>
    s.lineas.map((l) => ({
      solicitud: s.id,
      estado: s.estado,
      proyecto: proyectoDe(s.proyectoId)?.nombre ?? "—",
      empresa: s.empresa,
      codigo: l.codigo,
      nombre: l.nombre,
      solicitado: l.cantidadSolicitada,
      despachado: l.cantidadDespachada,
      instalado: l.cantidadInstalada,
      ubicacion: l.ubicacion,
      desvio: l.cantidadInstalada > 0 && l.cantidadInstalada < l.cantidadDespachada,
    }))
  );

  const lista = q.trim()
    ? filas.filter((f) => {
        const t = q.toLowerCase();
        return (
          f.solicitud.toLowerCase().includes(t) ||
          f.codigo.toLowerCase().includes(t) ||
          f.nombre.toLowerCase().includes(t) ||
          f.empresa.toLowerCase().includes(t) ||
          f.proyecto.toLowerCase().includes(t)
        );
      })
    : filas;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Route className="size-6 text-primary" /> Trazabilidad de materiales
        </h2>
        <p className="text-muted-foreground">Movimiento completo: solicitado → despachado → instalado, por proyecto y contratista.</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por material, proyecto, contratista o solicitud…" className="pl-9" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Solicitud</TableHead>
              <TableHead>Material</TableHead>
              <TableHead className="hidden lg:table-cell">Proyecto</TableHead>
              <TableHead className="hidden md:table-cell">Contratista</TableHead>
              <TableHead className="text-right">Sol.</TableHead>
              <TableHead className="text-right">Desp.</TableHead>
              <TableHead className="text-right">Inst.</TableHead>
              <TableHead className="hidden xl:table-cell">Ubicación</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((f, i) => (
              <TableRow key={i} className={f.desvio ? "bg-red-50/40" : ""}>
                <TableCell className="font-medium">{f.solicitud}</TableCell>
                <TableCell>
                  <div className="text-sm">{f.codigo}</div>
                  <div className="text-xs text-muted-foreground">{f.nombre}</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{f.proyecto}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{f.empresa}</TableCell>
                <TableCell className="text-right">{f.solicitado}</TableCell>
                <TableCell className="text-right">{f.despachado || "—"}</TableCell>
                <TableCell className="text-right">
                  <span className={f.desvio ? "font-medium text-red-600" : ""}>
                    {f.instalado || "—"}
                    {f.desvio && <AlertTriangle className="ml-1 inline size-3.5" />}
                  </span>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">{f.ubicacion ?? "—"}</TableCell>
                <TableCell><EstadoBadge estado={f.estado} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
