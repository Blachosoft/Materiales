
  # Módulo de Gestión de Materiales

  Módulo web para el ciclo de vida de solicitudes de material del área de
  Pérdidas de CENS: contratista solicita → interventor aprueba → almacenista
  agenda cita y despacha → contratista recoge, usa y cierra con evidencia.

  ## Uso como módulo embebido

  El componente **no incluye pantalla de login**: la aplicación anfitriona ya
  autentica al usuario y le pasa su identidad y rol.

  ```tsx
  import MaterialesApp from "./app/App";

  <MaterialesApp
    usuarioActual={{
      role: "contratista", // "contratista" | "interventor" | "almacenista" | "admin"
      nombre: "Carlos Pérez",
      cargo: "Contratista",
      email: "carlos.perez@electrocontratos.co",
      empresa: "Electrocontratos SAS",
      iniciales: "CP",
    }}
  />
  ```

  Si se omite `usuarioActual` y el build corre en modo desarrollo
  (`import.meta.env.DEV`), aparece un selector de rol en la barra lateral para
  poder probar el ciclo completo (crear → aprobar → agendar cita → despachar
  → recoger → cerrar) cambiando de usuario sin salir de la app. En producción,
  embebido en el host, ese selector no se renderiza.

  ## Persistencia

  Por defecto el módulo guarda su estado en memoria durante la sesión del
  navegador (no requiere backend propio ni credenciales de terceros). Cuando
  el host necesite persistencia real entre sesiones, las funciones de
  transición en `src/app/data/store.tsx` son el punto de integración a
  reemplazar por llamadas a su API. `supabase/functions/server/` incluye una
  implementación de referencia (Hono + Supabase Edge Functions + KV store) por
  si se prefiere desplegar un backend equivalente en lugar de escribir uno
  desde cero.
