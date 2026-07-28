import { useState } from "react";
import { useStore, proyectoDe } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { EstadoBadge } from "./EstadoBadge";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Link2, CheckCircle2, PackageCheck } from "lucide-react";

export function CierreSolicitud() {
  const { params, usuario, solicitudes, navigate } = useStore();

  // Solicitudes recogidas por el contratista, listas para reportar el uso y cerrar.
  const recogidas = solicitudes.filter(
    (s) => s.contratista === usuario.nombre && s.estado === "Recogida"
  );

  const seleccionada = params.id
    ? solicitudes.find((s) => s.id === params.id)
    : recogidas[0];

  if (!seleccionada || seleccionada.estado !== "Recogida") {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <h2 className="text-2xl font-semibold tracking-tight">Recoger y cerrar solicitud</h2>
        <p className="text-muted-foreground">
          Cuando confirmes la recogida de un despacho, aparecerá aquí para reportar el uso del material y anexar la evidencia.
        </p>
        {recogidas.length === 0 ? (
          <Card className="p-12 text-center">
            <PackageCheck className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">No tienes materiales recogidos pendientes de cierre.</p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recogidas.map((s) => {
              const p = proyectoDe(s.proyectoId);
              return (
                <Card key={s.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="font-medium">{s.id}</div>
                    <div className="text-sm text-muted-foreground">{p?.nombre} · {s.lineas.length} materiales</div>
                  </div>
                  <EstadoBadge estado={s.estado} />
                  <Button onClick={() => navigate("cierre", { id: s.id })}>Reportar cierre</Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return <FormularioCierre id={seleccionada.id} />;
}

function FormularioCierre({ id }: { id: string }) {
  const { solicitudes, navigate, cerrarSolicitud } = useStore();
  const s = solicitudes.find((x) => x.id === id)!;
  const p = proyectoDe(s.proyectoId);
  const [evidenciaUrl, setEvidenciaUrl] = useState("");
  const [usoTotalConfirmado, setUsoTotalConfirmado] = useState(true);
  const [lineas, setLineas] = useState<Record<string, { cantidad: number; ubicacion: string }>>(
    Object.fromEntries(s.lineas.map((l) => [l.materialId, { cantidad: l.cantidadDespachada, ubicacion: "" }]))
  );

  const totalDesp = s.lineas.reduce((a, l) => a + l.cantidadDespachada, 0);
  const totalUsado = Object.values(lineas).reduce((a, d) => a + (d.cantidad || 0), 0);
  const validas =
    s.lineas.every((l) => (lineas[l.materialId]?.ubicacion ?? "").trim() !== "") &&
    evidenciaUrl.trim() !== "";

  const [enviando, setEnviando] = useState(false);
  const enviar = async () => {
    setEnviando(true);
    try {
      await cerrarSolicitud(id, { lineas, evidenciaUrl: evidenciaUrl.trim(), usoTotalConfirmado });
      toast.success("Solicitud cerrada", { description: `${id} quedó registrada con su evidencia.` });
      navigate("detalle", { id });
    } catch (e) {
      toast.error("No se pudo cerrar la solicitud", { description: String(e) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button onClick={() => navigate("cierre")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver
      </button>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reportar uso y cerrar · {s.id}</h2>
        <p className="text-muted-foreground">{p?.nombre} · {p?.ot}</p>
      </div>

      <Card className="space-y-4 p-6">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5"><Link2 className="size-4" /> Enlace a la evidencia (PDF del checklist de uso)</Label>
          <Input
            placeholder="https://…"
            value={evidenciaUrl}
            onChange={(e) => setEvidenciaUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Pega el enlace del documento (SAC, SharePoint, Drive, etc.). No se sube el archivo al módulo, para no sobrecargar su base de datos.
          </p>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={usoTotalConfirmado} onCheckedChange={(v) => setUsoTotalConfirmado(Boolean(v))} className="mt-0.5" />
          Confirmo que se usó/instaló la totalidad del material entregado. Si no, ajusta las cantidades por línea abajo.
        </label>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="font-medium">Materiales usados</span>
          <span className="text-sm text-muted-foreground">{totalUsado} de {totalDesp} despachados</span>
        </div>
        <div className="divide-y">
          {s.lineas.map((l) => (
            <div key={l.materialId} className="grid gap-3 p-5 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-5">
                <div className="text-sm font-medium">{l.codigo} · {l.nombre}</div>
                <div className="text-xs text-muted-foreground">Despachado: {l.cantidadDespachada} {l.unidad}</div>
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label className="text-xs">Cantidad usada</Label>
                <Input
                  type="number" min={0} max={l.cantidadDespachada}
                  value={lineas[l.materialId].cantidad}
                  onChange={(e) => setLineas((d) => ({ ...d, [l.materialId]: { ...d[l.materialId], cantidad: Number(e.target.value) } }))}
                />
              </div>
              <div className="sm:col-span-4 space-y-1.5">
                <Label className="flex items-center gap-1 text-xs"><MapPin className="size-3.5" /> Ubicación (NIC / transformador / circuito)</Label>
                <Input
                  placeholder="Ej. NIC 884512 · Circuito 3"
                  value={lineas[l.materialId].ubicacion}
                  onChange={(e) => setLineas((d) => ({ ...d, [l.materialId]: { ...d[l.materialId], ubicacion: e.target.value } }))}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("detalle", { id })}>Cancelar</Button>
        <Button className="gap-2" disabled={!validas || enviando} onClick={enviar}>
          <CheckCircle2 className="size-4" /> {enviando ? "Cerrando…" : "Cerrar solicitud"}
        </Button>
      </div>
      {!validas && <p className="text-right text-xs text-muted-foreground">Ingresa la ubicación de cada material y el enlace de evidencia para continuar.</p>}
    </div>
  );
}
