import { useState } from "react";
import { useStore, UsuarioSistema } from "../data/store";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "./ui/dialog";
import { exportarCSV } from "../lib/exportar";
import { toast } from "sonner";
import { Search, UserPlus, Download, Power, Pencil } from "lucide-react";

const ROLES: UsuarioSistema["rol"][] = ["Contratista", "Almacenista", "Líder de Pérdidas", "Administrador", "Auditor"];

const inic = (n: string) => n.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase();

export function Usuarios() {
  const { directorio, toggleUsuario, guardarUsuario } = useStore();
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("Todos");

  let lista = directorio;
  if (rol !== "Todos") lista = lista.filter((u) => u.rol === rol);
  if (q.trim()) {
    const t = q.toLowerCase();
    lista = lista.filter((u) => u.nombre.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.empresa.toLowerCase().includes(t));
  }

  const exportar = () =>
    exportarCSV(
      "usuarios_plataforma",
      directorio.map((u) => ({
        Nombre: u.nombre, Email: u.email, Rol: u.rol, Empresa: u.empresa, Estado: u.estado, "Último acceso": u.ultimoAcceso,
      }))
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Administración de usuarios</h2>
          <p className="text-muted-foreground">Gestiona usuarios, roles y permisos de acceso a la plataforma.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportar}><Download className="size-4" /> Exportar</Button>
          <UsuarioDialog onSave={guardarUsuario} />
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, email o empresa…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Todos", ...ROLES].map((r) => (
              <button
                key={r}
                onClick={() => setRol(r)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  rol === r ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Rol</TableHead>
              <TableHead className="hidden lg:table-cell">Empresa</TableHead>
              <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">{inic(u.nombre)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{u.nombre}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{u.rol}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{u.empresa}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{u.ultimoAcceso}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={u.estado === "Activo" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}>
                    {u.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <UsuarioDialog usuario={u} onSave={guardarUsuario} trigger={<Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>} />
                    <Button variant="ghost" size="icon" onClick={() => { toggleUsuario(u.id); toast.success(`Usuario ${u.estado === "Activo" ? "desactivado" : "activado"}`); }}>
                      <Power className={`size-4 ${u.estado === "Activo" ? "text-red-500" : "text-emerald-600"}`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function UsuarioDialog({
  usuario,
  onSave,
  trigger,
}: {
  usuario?: UsuarioSistema;
  onSave: (u: UsuarioSistema) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UsuarioSistema>(
    usuario ?? {
      id: `u${Date.now()}`, nombre: "", email: "", rol: "Contratista", empresa: "", estado: "Activo",
      ultimoAcceso: new Date().toISOString().slice(0, 10),
    }
  );
  const puede = form.nombre.trim() && form.email.trim() && form.empresa.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button className="gap-2"><UserPlus className="size-4" /> Nuevo usuario</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{usuario ? "Editar usuario" : "Nuevo usuario"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nombre completo</Label>
            <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v as UsuarioSistema["rol"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as UsuarioSistema["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Activo", "Inactivo"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Empresa / Área</Label>
            <Input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button disabled={!puede} onClick={() => { onSave(form); setOpen(false); toast.success(usuario ? "Usuario actualizado" : "Usuario creado"); }}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
