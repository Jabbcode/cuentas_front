import { Wallet, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface AccountEmptyProps {
  onCreateClick: () => void;
}

export function AccountEmpty({ onCreateClick }: AccountEmptyProps) {
  return (
    <Card className="sm:col-span-2 lg:col-span-3">
      <CardContent className="py-12 text-center">
        <Wallet className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">No tienes cuentas. Crea una para empezar.</p>
        <Button onClick={onCreateClick} className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Crear primera cuenta
        </Button>
      </CardContent>
    </Card>
  );
}
