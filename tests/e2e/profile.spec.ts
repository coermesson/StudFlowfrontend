import { test, expect } from './fixtures';

test.describe('Perfil', () => {
  test('mostra os dados da conta e salva uma alteração de nome', async ({ page }) => {
    await page.goto('/perfil');
    await expect(page.getByRole('heading', { name: 'Editar perfil' })).toBeVisible();

    const nomeOriginal = await page.getByLabel('Nome', { exact: true }).inputValue();
    const nomeAtualizado = `${nomeOriginal} E2E`;
    try {
      await page.getByLabel('Nome', { exact: true }).fill(nomeAtualizado);
      await page.getByRole('button', { name: 'Salvar alterações' }).click();
      await expect(page.getByText('Perfil atualizado com sucesso!')).toBeVisible();

      await page.reload();
      await expect(page.getByLabel('Nome', { exact: true })).toHaveValue(nomeAtualizado);
    } finally {
      await page.goto('/perfil');
      await page.getByLabel('Nome', { exact: true }).fill(nomeOriginal);
      await page.getByRole('button', { name: 'Salvar alterações' }).click();
      await expect(page.getByText('Perfil atualizado com sucesso!')).toBeVisible();
    }
  });
});
