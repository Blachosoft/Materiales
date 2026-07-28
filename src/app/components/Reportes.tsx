import { useStore, PROYECTOS, SERIE_MENSUAL, fmtCOP, totalSolicitud, totalInstalado } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Kpi } from "./Kpi";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { FileDown, DollarSign, PackageCheck, TrendingDown, Boxes } from "lucide-react";
import { exportarCSV } from "../lib/exportar";

const VERDE = "#0a6b3d";
const VERDE_CLARO = "#9cd3b4";
const PALETA = ["#0a6b3d", "#1d4ed8", "#f59e0b", "#14b8a6", "#7c3aed"];

export function Reportes() {
  const { solicitudes } = useStore();

  const totalSol = solicitudes.reduce((a, s) => a + totalSolicitud(s), 0);
  const totalInst = solicitudes.reduce((a, s) => a + totalInstalado(s), 0);
  const desviacion = totalSol > 0 ? Math.round(((totalSol - totalInst) / totalSol) * 100) : 0;

  // Ejecución por proyecto (instalado/solicitado)
  const porProyecto = PROYECTOS.map((p) => {
    const sols = solicitudes.filter((s) => s.proyectoId === p.id);
    const sol = sols.reduce((a, s) => a + totalSolicitud(s), 0);
    const inst = sols.reduce((a, s) => a + totalInstalado(s), 0);
    return { nombre: p.nombre.split(" ").slice(0, 2).join(" "), pct: sol > 0 ? Math.round((inst / sol) * 100) : 0 };
  });

  // Consumo por categoría
  const porCategoria: Record<string, number> = {};
  solicitudes.forEach((s) =>
    s.lineas.forEach((l) => {
      const cat = l.codigo.split("-")[0];
      porCategoria[cat] = (porCategoria[cat] ?? 0) + l.costo * l.cantidadInstalada;
    })
  );
  const pieData = Object.entries(porCategoria)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Reportes de gestión</h2>
          <p className="text-muted-foreground">Métricas clave sobre uso de materiales y costos asociados.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() =>
            exportarCSV(
              "reporte_gestion_materiales",
              solicitudes.map((s) => ({
                Solicitud: s.id, Estado: s.estado, Empresa: s.empresa, Tipo: s.tipo,
                "Costo solicitado": totalSolicitud(s), "Costo instalado": totalInstalado(s),
              }))
            )
          }
        >
          <FileDown className="size-4" /> Exportar reporte
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Costo solicitado" value={fmtCOP(totalSol)} icon={DollarSign} tone="slate" />
        <Kpi label="Costo instalado" value={fmtCOP(totalInst)} icon={PackageCheck} tone="primary" />
        <Kpi label="Desviación" value={`${desviacion}%`} icon={TrendingDown} tone="amber" hint="Solicitado vs instalado" />
        <Kpi label="Proyectos activos" value={PROYECTOS.length} icon={Boxes} tone="blue" />
      </div>

      {/* Comparativa mensual */}
      <Card className="p-6">
        <div className="mb-1 font-medium">Comparativa: solicitado vs. instalado</div>
        <div className="mb-4 text-sm text-muted-foreground">Evolución mensual (millones COP)</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SERIE_MENSUAL}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip cursor={{ fill: "rgba(10,107,61,0.06)" }} />
              <Legend />
              <Bar dataKey="solicitado" name="Solicitado" fill={VERDE_CLARO} radius={[4, 4, 0, 0]} />
              <Bar dataKey="instalado" name="Instalado" fill={VERDE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ejecución por proyecto */}
        <Card className="p-6">
          <div className="mb-4 font-medium">Material ejecutado por proyecto</div>
          <div className="space-y-4">
            {porProyecto.map((p) => (
              <div key={p.nombre}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{p.nombre}</span>
                  <span className="font-medium text-primary">{p.pct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Consumo por categoría */}
        <Card className="p-6">
          <div className="mb-4 font-medium">Consumo instalado por categoría</div>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Sin instalaciones registradas.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={PALETA[i % PALETA.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCOP(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
