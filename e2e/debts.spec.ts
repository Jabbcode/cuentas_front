import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount } from './helpers';

test.describe('Deudas', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta Deudas', '1000');
  });

  test('crear una deuda la agrega a la lista de deudas activas', async ({ page }) => {
    await page.goto('/debts');
    await page.getByRole('button', { name: 'Nueva Deuda' }).click();

    await page.getByLabel('Acreedor', { exact: false }).fill('Banco E2E');
    await page.getByLabel('Descripción', { exact: false }).fill('Préstamo personal');
    await page.getByLabel('Monto Total', { exact: false }).fill('500');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Banco E2E' })).toBeVisible();
  });

  test('registrar un pago total reduce el saldo restante a cero', async ({ page }) => {
    await page.goto('/debts');
    await page.getByRole('button', { name: 'Nueva Deuda' }).click();
    await page.getByLabel('Acreedor', { exact: false }).fill('Acreedor Pago');
    await page.getByLabel('Descripción', { exact: false }).fill('Deuda a pagar');
    await page.getByLabel('Monto Total', { exact: false }).fill('200');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Acreedor Pago' })).toBeVisible();

    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await expect(page.getByRole('heading', { name: 'Pagar Deuda' })).toBeVisible();
    const paymentAccountSelect = page.getByLabel('Cuenta de Pago', { exact: false });
    const paymentAccountValue = await paymentAccountSelect
      .locator('option', { hasText: 'Cuenta Deudas' })
      .getAttribute('value');
    await paymentAccountSelect.selectOption(paymentAccountValue!);
    await page.getByRole('button', { name: 'Confirmar Pago' }).click();

    // "Deudas Pagadas" también aparece como label fijo en la tarjeta resumen;
    // el heading de sección solo se renderiza una vez que hay al menos una deuda pagada.
    await expect(page.getByRole('heading', { name: 'Deudas Pagadas' })).toBeVisible();
  });
});
