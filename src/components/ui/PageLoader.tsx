export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status">
      <span className="text-xs font-medium text-gray-600 motion-safe:animate-pulse">Cargando…</span>
    </div>
  );
}
