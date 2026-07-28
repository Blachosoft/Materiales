// Utilidades de exportación sin dependencias externas.

export function exportarCSV(nombre: string, filas: Record<string, string | number>[]) {
  if (filas.length === 0) return;
  const cols = Object.keys(filas[0]);
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    cols.join(";"),
    ...filas.map((f) => cols.map((c) => escape(f[c])).join(";")),
  ].join("\n");
  // BOM para que Excel respete acentos
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  descargar(blob, `${nombre}.csv`);
}

// "PDF": abre una ventana imprimible (Guardar como PDF desde el diálogo del navegador)
export function exportarPDF(titulo: string, htmlContenido: string) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${titulo}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;padding:40px;margin:0}
    h1{color:#0a6b3d;font-size:22px;margin:0 0 4px}
    .sub{color:#64748b;font-size:12px;margin-bottom:24px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
    th{background:#0a6b3d;color:#fff;text-align:left;padding:8px 10px}
    td{padding:8px 10px;border-bottom:1px solid #e2e8f0}
    .brand{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    .dot{width:26px;height:26px;border-radius:7px;background:#0a6b3d}
  </style></head><body>
  <div class="brand"><div class="dot"></div><b>CENS · Gestión de Materiales</b></div>
  <h1>${titulo}</h1>
  <div class="sub">Generado el ${new Date().toLocaleString("es-CO")}</div>
  ${htmlContenido}
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

export function tablaHTML(cols: string[], filas: (string | number)[][]) {
  return `<table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
  <tbody>${filas.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
