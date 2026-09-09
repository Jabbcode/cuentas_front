import { expect, type Page } from '@playwright/test';

export function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@e2e.local`;
}

export async function registerUser(
  page: Page,
  { email, password, name }: { email: string; password: string; name: string }
): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL('/');
}

export async function createAccount(
  page: Page,
  name: string,
  initialBalance: string
): Promise<void> {
  await page.goto('/accounts');
  await page.getByRole('button', { name: 'Nueva Cuenta' }).click();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Balance inicial').fill(initialBalance);
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

export async function createCreditCard(
  page: Page,
  {
    name,
    paymentAccountName,
    creditLimit,
    cutoffDay,
    paymentDueDay,
  }: {
    name: string;
    paymentAccountName: string;
    creditLimit: string;
    cutoffDay: string;
    paymentDueDay: string;
  }
): Promise<void> {
  await page.goto('/accounts');
  await page.getByRole('button', { name: 'Nueva Cuenta' }).click();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Tipo').selectOption('credit_card');
  await page.getByLabel('Límite de Crédito').fill(creditLimit);
  await page.getByLabel('Día de Corte').fill(cutoffDay);
  await page.getByLabel('Día de Pago').fill(paymentDueDay);
  const paymentAccountSelect = page.getByLabel('Cuenta de Débito para Pago');
  const paymentAccountValue = await paymentAccountSelect
    .locator('option', { hasText: paymentAccountName })
    .getAttribute('value');
  await paymentAccountSelect.selectOption(paymentAccountValue!);
  await page.getByRole('button', { name: 'Crear', exact: true }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}
