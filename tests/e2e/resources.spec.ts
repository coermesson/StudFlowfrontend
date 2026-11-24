import { test, expect, criarCurso, criarMateria, limparDadosDoTeste } from './fixtures';

test.describe('Arquivos da matéria', () => {
  let marcador = '';
  test.afterEach(async ({ api }) => {
    if (marcador) await limparDadosDoTeste(api, marcador);
  });

  test('valida o tipo, envia um PDF, pesquisa e exclui o arquivo criado', async ({ page }) => {
    marcador = crypto.randomUUID();
    const sufixo = marcador;
    const curso = `Curso ${sufixo}`;
    const materia = `Matéria ${sufixo}`;
    const pdf = `material-${sufixo}.pdf`;

    await criarCurso(page, curso);
    await criarMateria(page, curso, materia);
    await page.getByRole('link', { name: `Abrir matéria ${materia}` }).click();
    await expect(page.getByRole('heading', { name: 'Nenhum recurso cadastrado' })).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({ name: 'inválido.txt', mimeType: 'text/plain', buffer: Buffer.from('arquivo') });
    await expect(page.getByText('Selecione um arquivo no formato PDF.')).toBeVisible();
    await fileInput.setInputFiles({
      name: pdf,
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF'),
    });
    await expect(page.getByText(pdf)).toBeVisible();
    await page.getByRole('button', { name: 'Enviar arquivo' }).click();
    await expect(page.getByText('Arquivo cadastrado com sucesso!')).toBeVisible();
    await expect(page.getByRole('heading', { name: pdf })).toBeVisible();

    await page.getByLabel('Buscar arquivo pelo nome').fill('sem-correspondência');
    await expect(page.getByRole('heading', { name: 'Nenhum arquivo encontrado' })).toBeVisible();
    await page.getByLabel('Buscar arquivo pelo nome').clear();
    await page.getByRole('button', { name: `Excluir ${pdf}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Arquivo excluído com sucesso!')).toBeVisible();
    await expect(page.getByRole('heading', { name: pdf })).toHaveCount(0);

    await page.getByRole('button', { name: 'Voltar para matérias' }).click();
    await page.getByRole('button', { name: `Excluir matéria ${materia}` }).click();
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.goto('/cursos');
    await page.getByRole('button', { name: `Excluir ${curso}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir curso' }).click();
  });
});
