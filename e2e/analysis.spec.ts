import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount } from './helpers';

test.describe('Análisis', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta E2E', '1000');
  });

  test('navega desde el menú, muestra el rango y el toggle por defecto', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Análisis' }).click();

    await expect(page).toHaveURL('/analysis');
    await expect(page.getByRole('heading', { name: 'Análisis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Gasto' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    await expect(page.getByLabel('Desde')).toHaveValue(monthStart);
  });

  test('con una transacción en el rango, ve una línea con datos y hace click en un punto para ir a Transacciones filtradas', async ({
    page,
  }) => {
    await page.goto('/transactions');
    await page.getByRole('button', { name: 'Nueva Transacción' }).click();
    await page.getByLabel('Monto de la transacción').fill('50');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await page.goto('/analysis');
    await expect(page.getByText('Alimentación')).toBeVisible();

    const dot = page.locator('[data-testid^="chart-dot-"]').first();
    await dot.click();

    await expect(page).toHaveURL(/\/transactions\?.*categoryIds=/);
    await expect(page.getByText('50,00')).toBeVisible();
  });

  test('al volver a entrar en Análisis, todos los filtros vuelven a sus valores por defecto', async ({
    page,
  }) => {
    await page.goto('/analysis');
    await page.getByRole('button', { name: 'Ingreso' }).click();
    await expect(page.getByRole('button', { name: 'Ingreso' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await page.goto('/');
    await page.getByRole('link', { name: 'Análisis' }).click();

    await expect(page.getByRole('button', { name: 'Gasto' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
