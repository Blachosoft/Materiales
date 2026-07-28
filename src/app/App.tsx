import { StoreProvider, useStore } from "./data/store";
import { Toaster } from "./components/ui/sonner";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Solicitudes } from "./components/Solicitudes";
import { CrearSolicitud } from "./components/CrearSolicitud";
import { DetalleSolicitud } from "./components/DetalleSolicitud";
import { Instalacion } from "./components/Instalacion";
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
    case "instalacion": return <Instalacion />;
    case "reportes": return <Reportes />;
    case "inventario": return <Inventario />;
    case "trazabilidad": return <Trazabilidad />;
    case "usuarios": return <Usuarios />;
    case "alertas": return <Alertas />;
    default: return <Dashboard />;
  }
}

function Shell() {
  const { usuario } = useStore();
  if (!usuario) return <Login />;
  return (
    <Layout>
      <Router />
    </Layout>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}
