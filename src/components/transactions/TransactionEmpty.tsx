import { ArrowLeftRight, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface TransactionEmptyProps {
  onCreateClick: () => void;
}

export function TransactionEmpty({ onCreateClick }: TransactionEmptyProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <ArrowLeftRight className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">
          No se encontraron transacciones con los filtros seleccionados.
        </p>
        <Button onClick={onCreateClick} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Crear transacción
        </Button>
      </CardContent>
    </Card>
  );
}
