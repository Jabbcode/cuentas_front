import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount } from './helpers';

test.describe('Dashboard', () => {
  test('refleja el balance tras crear una cuenta y una transacción de ingreso', async ({
    page,
  }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta Dashboard', '500');

    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Nueva Transacción' }).click();
    await page.getByRole('button', { name: 'Ingreso' }).click();
    await page.getByLabel('Monto de la transacción').fill('300');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await page.goto('/');
    await expect(page.getByText('Balance neto del mes')).toBeVisible();
    await expect(page.getByText(/300,00/).first()).toBeVisible();
  });
});
