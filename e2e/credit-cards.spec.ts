import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createAccount, createCreditCard } from './helpers';

test.describe('Tarjetas de Crédito', () => {
  test('crear una tarjeta configurada muestra el crédito disponible', async ({ page }) => {
    await registerUser(page, {
      email: uniqueEmail(),
      password: 'password123',
      name: 'Usuario E2E',
    });
    await createAccount(page, 'Cuenta Débito', '500');
    await createCreditCard(page, {
      name: 'Visa E2E',
      paymentAccountName: 'Cuenta Débito',
      creditLimit: '2000',
      cutoffDay: '5',
      paymentDueDay: '20',
    });

    await page.goto('/credit-cards');

    await expect(page.getByRole('heading', { name: 'Visa E2E' })).toBeVisible();
    await expect(page.getByText('Crédito disponible')).toBeVisible();
  });
});
