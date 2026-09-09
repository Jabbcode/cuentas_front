import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount } from './helpers';

test.describe('Gastos Fijos', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta Gastos Fijos', '1000');
  });

  test('crear un gasto fijo con auto-generar activado lo agrega a la lista', async ({ page }) => {
    await page.goto('/fixed-expenses');
    await page.getByRole('button', { name: 'Nuevo Gasto Fijo' }).click();

    await page.getByLabel('Nombre').fill('Netflix');
    await page.getByLabel('Monto').fill('15');
    await page.getByRole('switch', { name: 'Auto-generar transacción' }).click();
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    // Solo la tabla desktop usa <tr> real (la vista mobile son cards, no filas) —
    // no hace falta filtrar por visibilidad.
    await expect(page.getByRole('row', { name: /Netflix/ })).toBeVisible();
  });
});
