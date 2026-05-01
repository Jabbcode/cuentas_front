import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { DeleteAccountFormState } from '../types';

export interface DeleteAccountFormProps {
  isLoading: boolean;
  onSubmit: (data: DeleteAccountFormState) => Promise<void>;
}

const EMPTY_STATE: DeleteAccountFormState = {
  password: '',
  confirmation: '',
};

export function DeleteAccountForm({ isLoading, onSubmit }: DeleteAccountFormProps) {
  const [formState, setFormState] = useState<DeleteAccountFormState>(EMPTY_STATE);

  const handleChange =
    (field: keyof DeleteAccountFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <Card className="p-6 border-red-200">
      <h2 className="text-xl font-semibold mb-2 text-red-600">Zona Peligrosa</h2>
      <p className="text-gray-600 mb-6">
        Eliminar tu cuenta es permanente y no se puede deshacer. Todos tus datos serán borrados.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="deletePassword">Contraseña</Label>
          <Input
            id="deletePassword"
            type="password"
            value={formState.password}
            onChange={handleChange('password')}
            placeholder="Tu contraseña"
          />
        </div>

        <div>
          <Label htmlFor="deleteConfirmation">
            Escribe <span className="font-bold">DELETE</span> para confirmar
          </Label>
          <Input
            id="deleteConfirmation"
            value={formState.confirmation}
            onChange={handleChange('confirmation')}
            placeholder="DELETE"
          />
        </div>

        <Button
          type="submit"
          variant="destructive"
          disabled={isLoading || formState.confirmation !== 'DELETE'}
        >
          {isLoading ? 'Eliminando...' : 'Eliminar Cuenta Permanentemente'}
        </Button>
      </form>
    </Card>
  );
}
