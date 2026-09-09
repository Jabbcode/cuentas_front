import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser } from './helpers';

test.describe('Categorías', () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
  });

  test('crear una categoría de gasto la agrega a la lista', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nueva Categoría' }).click();
    await page.getByLabel('Nombre').fill('Mascotas');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await expect(page.getByText('Mascotas')).toBeVisible();
  });

  test('editar una categoría existente actualiza su nombre', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nueva Categoría' }).click();
    await page.getByLabel('Nombre').fill('Nombre Original');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('Nombre Original')).toBeVisible();

    const row = page.locator('.rounded-lg.border.border-gray-200.p-3', {
      hasText: 'Nombre Original',
    });
    await row.locator('button:visible').first().click();

    await expect(page.getByRole('heading', { name: 'Editar Categoría' })).toBeVisible();
    await page.getByLabel('Nombre').fill('Nombre Editado');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();

    await expect(page.getByText('Nombre Editado')).toBeVisible();
    await expect(page.getByText('Nombre Original')).not.toBeVisible();
  });

  test('eliminar una categoría la quita de la lista', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nueva Categoría' }).click();
    await page.getByLabel('Nombre').fill('Categoría a Borrar');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('Categoría a Borrar')).toBeVisible();

    const row = page.locator('.rounded-lg.border.border-gray-200.p-3', {
      hasText: 'Categoría a Borrar',
    });
    await row.locator('button:visible').nth(1).click();

    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

    await expect(page.getByText('Categoría a Borrar')).not.toBeVisible();
  });
});
