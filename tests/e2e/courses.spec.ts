import { test, expect, limparDadosDoTeste } from './fixtures';

test.describe('Cursos', () => {
  let marcador = '';
  test.afterEach(async ({ api }) => {
    if (marcador) await limparDadosDoTeste(api, marcador);
  });

  test('cria, pesquisa, edita e exclui somente o curso deste cenário', async ({ page }) => {
    marcador = crypto.randomUUID();
    const nome = `E2E curso ${marcador}`;
    const atualizado = `${nome} atualizado`;

    await page.goto('/cursos');
    await expect(page.getByRole('heading', { name: 'Cursos' })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar curso' }).click();
    await page.getByLabel('Nome do curso').fill('   ');
    await page.getByRole('button', { name: 'Salvar curso' }).click();
    await expect(page.getByText('Informe o nome do curso.')).toBeVisible();
    await page.getByLabel('Nome do curso').fill(nome);
    await page.getByRole('button', { name: 'Salvar curso' }).click();
    await expect(page.getByRole('heading', { name: nome })).toBeVisible();

    await page.getByLabel('Pesquisar cursos').fill(nome);
    await expect(page.getByRole('heading', { name: nome })).toBeVisible();
    await page.getByLabel('Pesquisar cursos').clear();
    await page.getByRole('button', { name: `Editar ${nome}` }).click();
    await page.getByLabel('Nome do curso').fill(atualizado);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByRole('heading', { name: atualizado })).toBeVisible();

    await page.getByRole('button', { name: `Excluir ${atualizado}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir curso' }).click();
    await expect(page.getByRole('heading', { name: atualizado })).toHaveCount(0);
  });
});
