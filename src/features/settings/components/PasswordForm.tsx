import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import type { PasswordFormState } from '../types';

export interface PasswordFormProps {
  isLoading: boolean;
  onSubmit: (data: PasswordFormState) => Promise<void>;
}

const EMPTY_STATE: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function PasswordForm({ isLoading, onSubmit }: PasswordFormProps) {
  const [formState, setFormState] = useState<PasswordFormState>(EMPTY_STATE);

  const handleChange =
    (field: keyof PasswordFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formState);
    setFormState(EMPTY_STATE);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Contraseña Actual</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formState.currentPassword}
            onChange={handleChange('currentPassword')}
            placeholder="••••••••"
          />
        </div>

        <div>
          <Label htmlFor="newPassword">Nueva Contraseña</Label>
          <Input
            id="newPassword"
            type="password"
            value={formState.newPassword}
            onChange={handleChange('newPassword')}
            placeholder="••••••••"
          />
          <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formState.confirmPassword}
            onChange={handleChange('confirmPassword')}
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </Button>
      </form>
    </Card>
  );
}
