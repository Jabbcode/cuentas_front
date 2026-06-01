import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { ReactNode } from 'react';

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-semibold text-gray-800">Algo salió mal</p>
      <p className="text-sm text-gray-500">
        Ocurrió un error inesperado. Puedes intentar recargar la página.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Recargar página
      </button>
    </div>
  );
}

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>;
}
