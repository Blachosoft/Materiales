import { StoreProvider, useStore, Usuario } from "./data/store";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Solicitudes } from "./components/Solicitudes";
import { CrearSolicitud } from "./components/CrearSolicitud";
import { DetalleSolicitud } from "./components/DetalleSolicitud";
import { CierreSolicitud } from "./components/CierreSolicitud";
import { Reportes } from "./components/Reportes";
import { Inventario } from "./components/Inventario";
import { Trazabilidad } from "./components/Trazabilidad";
import { Usuarios } from "./components/Usuarios";
import { Alertas } from "./components/Alertas";

function Router() {
  const { view } = useStore();
  switch (view) {
    case "solicitudes": return <Solicitudes />;
    case "crear-solicitud": return <CrearSolicitud />;
    case "detalle": return <DetalleSolicitud />;
    case "cierre": return <CierreSolicitud />;
    case "reportes": return <Reportes />;
    case "inventario": return <Inventario />;
    case "trazabilidad": return <Trazabilidad />;
    case "usuarios": return <Usuarios />;
    case "alertas": return <Alertas />;
    default: return <Dashboard />;
  }
}

export interface MaterialesAppProps {
  /**
   * Identidad y rol del usuario ya autenticado por la aplicación anfitriona.
   * El módulo de Materiales no incluye pantalla de login: si se omite esta
   * prop, en modo desarrollo (`import.meta.env.DEV`) se habilita un selector
   * de rol para poder probar el ciclo completo de forma aislada.
   */
  usuarioActual?: Usuario;
}

export default function MaterialesApp({ usuarioActual }: MaterialesAppProps = {}) {
  return (
    <StoreProvider usuarioActual={usuarioActual}>
      <Layout>
        <Router />
      </Layout>
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}
