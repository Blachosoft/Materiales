// Marca del sistema — torre de energía estilizada (inspirada en CENS) + wordmark.
export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <rect width="48" height="48" rx="11" fill="currentColor" />
      <g stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d="M24 9 L33 39 L15 39 Z" />
        <path d="M16.5 24 H31.5" />
        <path d="M18.5 31.5 H29.5" />
        <path d="M24 9 L18.5 16 H29.5 Z" opacity="0.9" />
        <path d="M15 39 L33 24 M33 39 L15 24" opacity="0.7" />
      </g>
    </svg>
  );
}

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="size-9 text-primary shrink-0" />
      {!compact && (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">Gestión de Materiales</div>
          <div className="text-[11px] text-muted-foreground">CENS · Área de Pérdidas</div>
        </div>
      )}
    </div>
  );
}
