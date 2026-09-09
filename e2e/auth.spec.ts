import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser } from './helpers';

test.describe('Autenticación', () => {
  test('registro exitoso redirige al dashboard', async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await expect(page.getByText('Balance neto del mes')).toBeVisible();
  });

  test('login con credenciales inválidas muestra error y no entra', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Contraseña', { exact: true }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByText(/incorrectos|inválidas/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('login con credenciales correctas lleva al dashboard', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'password123';
    await registerUser(page, { email, password, name: 'Usuario E2E' });

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Balance neto del mes')).toBeVisible();
  });

  test('ruta protegida sin sesión redirige a login', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page).toHaveURL(/\/login$/);
  });
});
