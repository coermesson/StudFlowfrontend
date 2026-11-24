import { test, expect } from './fixtures';

test.describe('Pomodoro', () => {
  test('alterna ciclos, inicia, pausa e reinicia o cronômetro', async ({ page }) => {
    await page.goto('/pomodoro');
    await expect(page.getByRole('heading', { name: 'Pomodoro' })).toBeVisible();
    await expect(page.getByText('25:00')).toBeVisible();
    await page.getByRole('button', { name: /Pausa curta/ }).click();
    await expect(page.getByText('05:00')).toBeVisible();
    await page.getByRole('button', { name: /Pausa longa/ }).click();
    await expect(page.getByText('15:00')).toBeVisible();
    await page.getByRole('button', { name: /Foco/ }).click();
    await page.getByRole('button', { name: 'Iniciar' }).click();
    await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
    await page.getByRole('button', { name: 'Pausar' }).click();
    await expect(page.getByRole('button', { name: 'Iniciar' })).toBeVisible();
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.getByText('25:00')).toBeVisible();
  });
});
