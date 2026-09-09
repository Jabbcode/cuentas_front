import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser } from './helpers';

test.describe('Configuración', () => {
  test('actualizar el nombre del perfil muestra la confirmación de éxito', async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });

    await page.goto('/settings');
    await page.getByLabel('Nombre').fill('Usuario Actualizado');
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    await expect(page.getByText('Profile updated successfully')).toBeVisible();
  });
});
