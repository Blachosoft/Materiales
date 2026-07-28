import { useState } from "react";
import { useStore, fmtCOP } from "../data/store";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { Search, AlertTriangle } from "lucide-react";

export function Inventario() {
  const { materiales } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");

  const cats = ["Todas", ...Array.from(new Set(materiales.map((m) => m.categoria)))];
  let lista = materiales;
  if (cat !== "Todas") lista = lista.filter((m) => m.categoria === cat);
  if (q.trim()) {
    const t = q.toLowerCase();
    lista = lista.filter((m) => m.codigo.toLowerCase().includes(t) || m.nombre.toLowerCase().includes(t));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Catálogo e inventario</h2>
        <p className="text-muted-foreground">Disponibilidad de materiales por bodega (sincronizado con ERP).</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código o descripción…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden lg:table-cell">Bodega</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Costo unit.</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((m) => {
              const low = m.stock <= m.stockMin;
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.codigo}</TableCell>
                  <TableCell>{m.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{m.categoria}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{m.bodega}</TableCell>
                  <TableCell className="text-right">{m.stock} {m.unidad}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right text-muted-foreground">{fmtCOP(m.costo)}</TableCell>
                  <TableCell>
                    {low ? (
                      <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700">
                        <AlertTriangle className="size-3.5" /> Crítico
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Disponible</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
