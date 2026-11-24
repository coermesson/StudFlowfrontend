import { test, expect, criarCurso, limparDadosDoTeste } from './fixtures';

test.describe('Matérias', () => {
  let marcador = '';
  test.afterEach(async ({ api }) => {
    if (marcador) await limparDadosDoTeste(api, marcador);
  });

  test('cadastra, pesquisa, edita e exclui uma matéria própria', async ({ page }) => {
    marcador = crypto.randomUUID();
    const sufixo = marcador;
    const curso = `Curso ${sufixo}`;
    const materia = `Matéria ${sufixo}`;
    const editada = `${materia} editada`;

    await criarCurso(page, curso);
    await page.getByRole('link', { name: `Abrir matérias do curso ${curso}` }).click();
    await expect(page.getByRole('heading', { name: 'Nenhuma matéria cadastrada' })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar matéria' }).click();
    await page.getByLabel('Nome da matéria').fill(materia);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: materia })).toBeVisible();

    await page.getByLabel('Pesquisar matérias').fill(materia);
    await expect(page.getByRole('heading', { name: materia })).toBeVisible();
    await page.getByRole('button', { name: `Editar matéria ${materia}` }).click();
    await page.getByLabel('Nome da matéria').fill(editada);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: editada })).toBeVisible();

    await page.getByRole('button', { name: `Excluir matéria ${editada}` }).click();
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page.getByRole('heading', { name: editada })).toHaveCount(0);
    await page.goto('/cursos');
    await page.getByRole('button', { name: `Excluir ${curso}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir curso' }).click();
    await expect(page.getByRole('heading', { name: curso })).toHaveCount(0);
  });
});
