import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dca001ee`;

// Cliente Supabase (singleton) para autenticación
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`;
    console.error(`Error API ${path}: ${msg}`, data);
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  bootstrap: () => req<any>("/bootstrap"),
  crearSolicitud: (body: any) => req<any>("/solicitudes", { method: "POST", body: JSON.stringify(body) }),
  aprobar: (id: string, usuario: string) => req<any>(`/solicitudes/${id}/aprobar`, { method: "POST", body: JSON.stringify({ usuario }) }),
  rechazar: (id: string, usuario: string, motivo: string) => req<any>(`/solicitudes/${id}/rechazar`, { method: "POST", body: JSON.stringify({ usuario, motivo }) }),
  despachar: (id: string, usuario: string, despachos: Record<string, number>) => req<any>(`/solicitudes/${id}/despachar`, { method: "POST", body: JSON.stringify({ usuario, despachos }) }),
  instalar: (id: string, usuario: string, datos: any) => req<any>(`/solicitudes/${id}/instalar`, { method: "POST", body: JSON.stringify({ usuario, datos }) }),
  guardarUsuario: (u: any) => req<any>("/usuarios", { method: "POST", body: JSON.stringify(u) }),
  toggleUsuario: (id: string) => req<any>(`/usuarios/${id}/toggle`, { method: "POST" }),
};
