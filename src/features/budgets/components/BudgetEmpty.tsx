import { PiggyBank, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

interface BudgetEmptyProps {
  onAction?: () => void;
}

export function BudgetEmpty({ onAction }: BudgetEmptyProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <PiggyBank className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-900">
          No tienes presupuestos para este mes
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Crea un presupuesto para controlar tu gasto mensual por categoría
        </p>
        {onAction && (
          <Button onClick={onAction} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Crear presupuesto
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
