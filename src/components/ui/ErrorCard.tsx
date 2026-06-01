import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorCardProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorCard({
  message = 'Ocurrió un error al cargar los datos.',
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <p className="text-sm text-red-700">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
