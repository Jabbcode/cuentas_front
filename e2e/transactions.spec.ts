import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount } from './helpers';

test.describe('Transacciones', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta E2E', '1000');
  });

  test('crear un gasto decrementa el saldo de la cuenta', async ({ page }) => {
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Nueva Transacción' }).click();
    await page.getByLabel('Monto de la transacción').fill('150');
    await expect(page.getByRole('button', { name: 'Alimentación' })).toBeVisible();
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await page.goto('/accounts');
    await expect(page.getByText(/850,00/).first()).toBeVisible();
  });

  test('crear un ingreso incrementa el saldo de la cuenta', async ({ page }) => {
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Nueva Transacción' }).click();
    await page.getByRole('button', { name: 'Ingreso' }).click();
    await page.getByLabel('Monto de la transacción').fill('300');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await page.goto('/accounts');
    await expect(page.getByText(/1\.?300,00/).first()).toBeVisible();
  });
});
