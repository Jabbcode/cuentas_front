import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function CreditCardEmpty() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">
          No tienes tarjetas de crédito configuradas.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Crea una cuenta de tipo "Tarjeta de Crédito" en Cuentas para empezar.
        </p>
      </CardContent>
    </Card>
  );
}
