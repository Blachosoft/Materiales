import { useState } from "react";
import { useStore, RoleId, USUARIOS } from "../data/store";
import { BrandMark } from "./BrandLogo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { Eye, EyeOff, Lock, User, UserRound } from "lucide-react";

const PERFILES: { role: RoleId; label: string }[] = [
  { role: "contratista", label: "Contratista" },
  { role: "almacenista", label: "Almacenista" },
  { role: "admin", label: "Líder de Pérdidas / Administrador" },
];

export function Login() {
  const { login } = useStore();
  const [role, setRole] = useState<RoleId>("contratista");
  const [show, setShow] = useState(false);
  const [entrando, setEntrando] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* Fondo verde con nubes */}
      <Fondo />

      {/* Marca esquina */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-2.5 text-white">
        <span className="flex size-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <BrandMark className="size-7 text-white" />
        </span>
        <div className="hidden leading-tight sm:block">
          <div className="text-sm font-semibold">CENS · Grupo EPM</div>
          <div className="text-[11px] text-white/70">Gestión de Materiales</div>
        </div>
      </div>

      {/* Tarjeta glass */}
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/40 bg-white/20 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-white/30 text-[#0a3a22] shadow-inner backdrop-blur">
            <UserRound className="size-8" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0a3a22]">Iniciar sesión</h1>
          <p className="text-sm text-[#0a3a22]/70">Plataforma de gestión de materiales</p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setEntrando(true);
            try {
              await login(role);
            } finally {
              setEntrando(false);
            }
          }}
          className="space-y-3.5"
        >
          {/* Selector de rol */}
          <Select value={role} onValueChange={(v) => setRole(v as RoleId)}>
            <SelectTrigger className="h-12 rounded-full border-white/50 bg-white/70 px-5 text-[#0a3a22] shadow-sm backdrop-blur focus:ring-primary/40">
              <div className="flex items-center gap-2.5">
                <UserRound className="size-4 text-[#0a6b3d]" />
                <SelectValue placeholder="Selecciona tu perfil" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {PERFILES.map((p) => (
                <SelectItem key={p.role} value={p.role}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Usuario */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0a6b3d]" />
            <Input
              aria-label="Usuario"
              value={USUARIOS[role].email}
              readOnly
              className="h-12 rounded-full border-white/50 bg-white/80 pl-11 text-[#0a3a22] shadow-sm placeholder:text-[#0a3a22]/50 focus-visible:ring-primary/40"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0a6b3d]" />
            <Input
              aria-label="Contraseña"
              type={show ? "text" : "password"}
              defaultValue="demo1234"
              className="h-12 rounded-full border-white/50 bg-white/80 pl-11 pr-11 text-[#0a3a22] shadow-sm focus-visible:ring-primary/40"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0a6b3d] hover:text-[#0a3a22]"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="pt-1 text-center">
            <button type="button" className="text-sm font-medium text-[#0a3a22]/80 hover:text-[#0a3a22] hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            disabled={entrando}
            className="h-12 w-full rounded-full bg-[#0a6b3d] text-base shadow-lg hover:bg-[#095a33]"
          >
            {entrando ? "Ingresando…" : "Ingresar"}
          </Button>

          <p className="pt-1 text-center text-xs text-[#0a3a22]/60">
            Entorno de demostración · datos simulados
          </p>
        </form>
      </div>
    </div>
  );
}

/* Fondo degradado verde con nubes suaves */
function Fondo() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#3fb37f] via-[#1f9e63] to-[#0a6b3d]" />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 800" fill="none">
        <g fill="#ffffff" opacity="0.14">
          <ellipse cx="140" cy="230" rx="150" ry="70" />
          <ellipse cx="250" cy="250" rx="120" ry="60" />
          <ellipse cx="640" cy="180" rx="170" ry="75" />
          <ellipse cx="520" cy="200" rx="120" ry="55" />
          <ellipse cx="680" cy="600" rx="180" ry="80" />
          <ellipse cx="150" cy="640" rx="160" ry="75" />
          <ellipse cx="400" cy="720" rx="200" ry="80" />
        </g>
      </svg>
    </div>
  );
}
