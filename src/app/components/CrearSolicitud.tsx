import { useState } from "react";
import { useStore, PROYECTOS, BODEGAS, fmtCOP } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, Trash2, ShoppingCart } from "lucide-react";

export function CrearSolicitud() {
  const { materiales, crearSolicitud, navigate } = useStore();
  const [proyectoId, setProyectoId] = useState("");
  const [bodega, setBodega] = useState("");
  const [prioridad, setPrioridad] = useState<"Alta" | "Media" | "Baja">("Media");
  const [tipo, setTipo] = useState("Normalización");
  const [obs, setObs] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<{ materialId: string; cantidad: number }[]>([]);

  const filtrados = materiales.filter(
    (m) => m.codigo.toLowerCase().includes(q.toLowerCase()) || m.nombre.toLowerCase().includes(q.toLowerCase())
  );
  const add = (id: string) => {
    if (items.some((i) => i.materialId === id)) return;
    setItems((v) => [...v, { materialId: id, cantidad: 1 }]);
  };
  const setCant = (id: string, c: number) =>
    setItems((v) => v.map((i) => (i.materialId === id ? { ...i, cantidad: Math.max(1, c) } : i)));
  const remove = (id: string) => setItems((v) => v.filter((i) => i.materialId !== id));

  const total = items.reduce((a, i) => {
    const m = materiales.find((x) => x.id === i.materialId)!;
    return a + m.costo * i.cantidad;
  }, 0);

  const [enviando, setEnviando] = useState(false);
  const puede = proyectoId && bodega && items.length > 0 && !enviando;
  const enviar = async () => {
    setEnviando(true);
    try {
      const id = await crearSolicitud({ proyectoId, bodega, prioridad, tipo, observacion: obs, lineas: items });
      toast.success("Solicitud creada", { description: `${id} enviada para aprobación.` });
      navigate("detalle", { id });
    } catch (e) {
      toast.error("No se pudo crear la solicitud", { description: String(e) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <button onClick={() => navigate("solicitudes")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Volver
      </button>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Nueva solicitud de material</h2>
        <p className="text-muted-foreground">Selecciona el proyecto y los materiales requeridos del catálogo controlado.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Info base */}
          <Card className="space-y-4 p-6">
            <div className="font-medium">Información base</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Proyecto / Orden de trabajo</Label>
                <Select value={proyectoId} onValueChange={setProyectoId}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
                  <SelectContent>
                    {PROYECTOS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.ot} · {p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Bodega</Label>
                <Select value={bodega} onValueChange={setBodega}>
                  <SelectTrigger><SelectValue placeholder="Selecciona bodega" /></SelectTrigger>
                  <SelectContent>
                    {BODEGAS.map((b) => <SelectItem key={b.id} value={b.nombre}>{b.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de intervención</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Normalización", "Recuperación", "Macromedición", "Blindaje", "Cambio de medidor"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={prioridad} onValueChange={(v) => setPrioridad(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Alta", "Media", "Baja"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observación</Label>
              <Textarea placeholder="Notas adicionales, propósito de la solicitud…" value={obs} onChange={(e) => setObs(e.target.value)} />
            </div>
          </Card>

          {/* Catálogo */}
          <Card className="p-6">
            <div className="mb-3 font-medium">Seleccionar materiales</div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código o descripción…" className="pl-9" />
            </div>
            <div className="max-h-72 space-y-2 overflow-auto">
              {filtrados.map((m) => {
                const added = items.some((i) => i.materialId === m.id);
                const low = m.stock <= m.stockMin;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{m.codigo} · {m.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.categoria} · {m.bodega} ·{" "}
                        <span className={low ? "text-red-600" : ""}>Stock {m.stock} {m.unidad}</span>
                      </div>
                    </div>
                    <Button size="sm" variant={added ? "secondary" : "default"} disabled={added} onClick={() => add(m.id)} className="gap-1">
                      <Plus className="size-3.5" /> {added ? "Añadido" : "Añadir"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <div className="mb-3 flex items-center gap-2 font-medium">
              <ShoppingCart className="size-4.5 text-primary" /> Resumen ({items.length})
            </div>
            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aún no has añadido materiales.</p>
            ) : (
              <div className="space-y-3">
                {items.map((i) => {
                  const m = materiales.find((x) => x.id === i.materialId)!;
                  return (
                    <div key={i.materialId} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">{m.codigo}</div>
                        <button onClick={() => remove(i.materialId)} className="text-muted-foreground hover:text-red-600">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mb-2 text-xs text-muted-foreground">{m.nombre}</div>
                      <div className="flex items-center gap-2">
                        <Input type="number" min={1} value={i.cantidad} onChange={(e) => setCant(i.materialId, Number(e.target.value))} className="h-8 w-20" />
                        <span className="text-xs text-muted-foreground">{m.unidad}</span>
                        <span className="ml-auto text-xs font-medium">{fmtCOP(m.costo * i.cantidad)}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between border-t pt-3 font-medium">
                  <span>Total estimado</span>
                  <span>{fmtCOP(total)}</span>
                </div>
              </div>
            )}
            <Button className="mt-4 w-full" disabled={!puede} onClick={enviar}>
              {enviando ? "Creando…" : "Crear solicitud"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
