import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser } from './helpers';

test.describe('Notificaciones', () => {
  test('la campana muestra "sin notificaciones" para un usuario nuevo y se puede abrir/cerrar', async ({
    page,
  }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });

    // El bell se renderiza dos veces (header desktop y móvil); a este viewport
    // solo una copia es visible — la otra queda oculta con `lg:hidden`/`hidden lg:block`.
    const bell = page.locator('button[aria-label="Notificaciones"]:visible');
    await expect(page.getByText('No tienes notificaciones')).not.toBeVisible();

    await bell.click();
    await expect(page.getByText('No tienes notificaciones')).toBeVisible();

    await bell.click();
    await expect(page.getByText('No tienes notificaciones')).not.toBeVisible();
  });
});
