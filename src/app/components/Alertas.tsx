import { useStore, detectarAlertas } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Kpi } from "./Kpi";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { exportarCSV } from "../lib/exportar";
import { AlertTriangle, ShieldAlert, TrendingDown, Download, CheckCircle2, ChevronRight } from "lucide-react";

export function Alertas() {
  const { solicitudes, navigate } = useStore();
  const alertas = detectarAlertas(solicitudes);
  const altas = alertas.filter((a) => a.severidad === "Alta").length;

  const exportar = () =>
    exportarCSV(
      "alertas_anomalias",
      alertas.map((a) => ({
        Solicitud: a.solicitudId, Contratista: a.contratista, Proyecto: a.proyecto, Material: a.material,
        Despachado: a.despachado, Instalado: a.instalado, "Desviación %": a.desviacionPct, Severidad: a.severidad,
      }))
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ShieldAlert className="size-6 text-primary" /> Alertas de anomalías
          </h2>
          <p className="text-muted-foreground">Detección por reglas de desviaciones entre material despachado e instalado.</p>
        </div>
        {alertas.length > 0 && (
          <Button variant="outline" className="gap-2" onClick={exportar}><Download className="size-4" /> Exportar</Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Alertas activas" value={alertas.length} icon={AlertTriangle} tone="amber" />
        <Kpi label="Severidad alta" value={altas} icon={ShieldAlert} tone="red" hint="Desviación ≥ 15%" />
        <Kpi label="Desviación máx." value={alertas[0] ? `${alertas[0].desviacionPct}%` : "0%"} icon={TrendingDown} tone="blue" />
      </div>

      {alertas.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 size-10 text-primary/60" />
          <p className="text-muted-foreground">Sin anomalías detectadas. Todo el material instalado coincide con lo despachado. ✅</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Severidad</TableHead>
                <TableHead>Solicitud</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="hidden md:table-cell">Contratista</TableHead>
                <TableHead className="text-right">Desp.</TableHead>
                <TableHead className="text-right">Inst.</TableHead>
                <TableHead className="text-right">Desviación</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.map((a, i) => (
                <TableRow key={i} className="cursor-pointer" onClick={() => navigate("detalle", { id: a.solicitudId })}>
                  <TableCell>
                    <Badge variant="outline" className={a.severidad === "Alta" ? "gap-1 border-red-200 bg-red-50 text-red-700" : "gap-1 border-amber-200 bg-amber-50 text-amber-700"}>
                      <AlertTriangle className="size-3.5" /> {a.severidad}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{a.solicitudId}</TableCell>
                  <TableCell>{a.material}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{a.contratista}</TableCell>
                  <TableCell className="text-right">{a.despachado}</TableCell>
                  <TableCell className="text-right">{a.instalado}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">-{a.desviacionPct}%</TableCell>
                  <TableCell><ChevronRight className="size-4 text-muted-foreground" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
