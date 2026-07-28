import { useState } from "react";
import { useStore, proyectoDe } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { EstadoBadge } from "./EstadoBadge";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Calendar, Upload, CheckCircle2, Wrench } from "lucide-react";

export function Instalacion() {
  const { params, usuario, solicitudes, navigate, reportarInstalacion } = useStore();

  // Solicitudes despachadas del contratista, listas para reportar instalación
  const despachadas = solicitudes.filter(
    (s) => s.contratista === usuario?.nombre && s.estado === "Despachada"
  );

  const seleccionada = params.id
    ? solicitudes.find((s) => s.id === params.id)
    : despachadas[0];

  if (!seleccionada || seleccionada.estado !== "Despachada") {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">Reportar instalación</h2>
        <p className="text-muted-foreground">
          Registra el material efectivamente instalado en terreno por proyecto, fecha y ubicación.
        </p>
        {despachadas.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No tienes despachos pendientes de reportar instalación.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {despachadas.map((s) => {
              const p = proyectoDe(s.proyectoId);
              return (
                <Card key={s.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="font-medium">{s.id}</div>
                    <div className="text-sm text-muted-foreground">{p?.nombre} · {s.lineas.length} materiales</div>
                  </div>
                  <EstadoBadge estado={s.estado} />
                  <Button onClick={() => navigate("instalacion", { id: s.id })}>Reportar</Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return <FormularioInstalacion id={seleccionada.id} />;
}

function FormularioInstalacion({ id }: { id: string }) {
  const { solicitudes, navigate, reportarInstalacion } = useStore();
  const s = solicitudes.find((x) => x.id === id)!;
  const p = proyectoDe(s.proyectoId);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [datos, setDatos] = useState<Record<string, { cantidad: number; ubicacion: string }>>(
    Object.fromEntries(s.lineas.map((l) => [l.materialId, { cantidad: l.cantidadDespachada, ubicacion: "" }]))
  );

  const totalDesp = s.lineas.reduce((a, l) => a + l.cantidadDespachada, 0);
  const totalInst = Object.values(datos).reduce((a, d) => a + (d.cantidad || 0), 0);
  const validas = s.lineas.every((l) => (datos[l.materialId]?.ubicacion ?? "").trim() !== "");

  const [enviando, setEnviando] = useState(false);
  const enviar = async () => {
    setEnviando(true);
    try {
      await reportarInstalacion(id, datos);
      toast.success("Instalación reportada", { description: `${id} registrada en terreno.` });
      navigate("detalle", { id });
    } catch (e) {
      toast.error("No se pudo registrar la instalación", { description: String(e) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button onClick={() => navigate("instalacion")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver
      </button>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reporte de instalación · {s.id}</h2>
        <p className="text-muted-foreground">{p?.nombre} · {p?.ot}</p>
      </div>

      <Card className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Calendar className="size-4" /> Fecha de instalación</Label>
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Upload className="size-4" /> Soporte / acta de entrega</Label>
          <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground">
            <Upload className="size-4" /> Cargar archivo (opcional)
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="font-medium">Materiales instalados</span>
          <span className="text-sm text-muted-foreground">{totalInst} de {totalDesp} despachados</span>
        </div>
        <div className="divide-y">
          {s.lineas.map((l) => (
            <div key={l.materialId} className="grid gap-3 p-5 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5">
                <div className="text-sm font-medium">{l.codigo} · {l.nombre}</div>
                <div className="text-xs text-muted-foreground">Despachado: {l.cantidadDespachada} {l.unidad}</div>
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label className="text-xs">Cantidad instalada</Label>
                <Input
                  type="number" min={0} max={l.cantidadDespachada}
                  value={datos[l.materialId].cantidad}
                  onChange={(e) => setDatos((d) => ({ ...d, [l.materialId]: { ...d[l.materialId], cantidad: Number(e.target.value) } }))}
                />
              </div>
              <div className="sm:col-span-4 space-y-1.5">
                <Label className="flex items-center gap-1 text-xs"><MapPin className="size-3.5" /> Ubicación (NIC / transformador / circuito)</Label>
                <Input
                  placeholder="Ej. NIC 884512 · Circuito 3"
                  value={datos[l.materialId].ubicacion}
                  onChange={(e) => setDatos((d) => ({ ...d, [l.materialId]: { ...d[l.materialId], ubicacion: e.target.value } }))}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("detalle", { id })}>Cancelar</Button>
        <Button className="gap-2" disabled={!validas || enviando} onClick={enviar}>
          <CheckCircle2 className="size-4" /> {enviando ? "Registrando…" : "Registrar instalación"}
        </Button>
      </div>
      {!validas && <p className="text-right text-xs text-muted-foreground">Ingresa la ubicación de cada material para continuar.</p>}
    </div>
  );
}
