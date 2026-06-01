import { Landmark, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

interface DebtEmptyProps {
  onAction: () => void;
}

export function DebtEmpty({ onAction }: DebtEmptyProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Landmark className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-900">No tienes deudas registradas</p>
        <p className="mt-1 text-sm text-gray-500">
          Registra tus deudas para llevar control de pagos e intereses
        </p>
        <Button onClick={onAction} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Agregar deuda
        </Button>
      </CardContent>
    </Card>
  );
}
