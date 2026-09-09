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
    // getByLabel('Nombre') colisiona con los aria-label "Editar/Eliminar Nombre..."
    // de las card ya existentes (substring match) — se usa el rol de textbox.
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Mascotas');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await expect(page.getByText('Mascotas')).toBeVisible();
  });

  test('editar una categoría existente actualiza su nombre', async ({ page }) => {
    await page.goto('/categories');
    await page.getByRole('button', { name: 'Nueva Categoría' }).click();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Nombre Original');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();
    await expect(page.getByText('Nombre Original')).toBeVisible();

    // El componente renderiza dos copias del botón (desktop/mobile, alternadas
    // por CSS) con el mismo aria-label — se filtra por la que esté visible en
    // vez de depender de posición o de clases de estilo.
    await page
      .getByRole('button', { name: 'Editar Nombre Original' })
      .and(page.locator(':visible'))
      .click();

    await expect(page.getByRole('heading', { name: 'Editar Categoría' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Nombre Editado');
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

    await page
      .getByRole('button', { name: 'Eliminar Categoría a Borrar' })
      .and(page.locator(':visible'))
      .click();

    await page.getByRole('button', { name: 'Eliminar', exact: true }).click();

    await expect(page.getByText('Categoría a Borrar')).not.toBeVisible();
  });
});
