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
    const autoGenerateToggle = page.locator('div.flex.items-start.justify-between.rounded-lg', {
      hasText: 'Auto-generar transaccion',
    });
    await autoGenerateToggle.locator('button').click();
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    // La tabla se renderiza dos veces (vista móvil oculta + desktop visible a este viewport).
    await expect(page.locator('span:visible', { hasText: 'Netflix' }).first()).toBeVisible();
  });
});
