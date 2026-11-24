import { test, expect, criarCurso, criarMateria, limparDadosDoTeste } from './fixtures';

test.describe('ToDo', () => {
  let marcador = '';
  test.afterEach(async ({ api }) => {
    if (marcador) await limparDadosDoTeste(api, marcador);
  });

  test('cria lista e item, conclui, edita e remove os registros do cenário', async ({ page }) => {
    marcador = crypto.randomUUID();
    const sufixo = marcador;
    const curso = `Curso ${sufixo}`;
    const materia = `Matéria ${sufixo}`;
    const lista = `Lista ${sufixo}`;
    const item = `Item ${sufixo}`;
    const itemEditado = `${item} atualizado`;

    await criarCurso(page, curso);
    await criarMateria(page, curso, materia);
    await page.goto('/todo');
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByLabel('Nome da lista').fill(lista);
    await page.getByLabel('Matéria').selectOption({ label: materia });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: lista })).toBeVisible();
    await page.getByRole('button', { name: new RegExp(lista) }).click();

    await expect(page.getByRole('heading', { name: 'Nenhum item cadastrado' })).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar item' }).click();
    await page.getByLabel('Descrição').fill(item);
    await page.getByRole('button', { name: 'Adicionar item' }).last().click();
    await expect(page.getByText(item, { exact: true })).toBeVisible();
    await expect(page.getByText('1 pendentes')).toBeVisible();
    await page.getByRole('checkbox', { name: item }).check();
    await expect(page.getByText('1 concluídos')).toBeVisible();
    await page.getByRole('button', { name: `Editar item ${item}` }).click();
    await page.getByLabel('Descrição').fill(itemEditado);
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByText(itemEditado, { exact: true })).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: `Excluir item ${itemEditado}` }).click();
    await expect(page.getByText(itemEditado, { exact: true })).toHaveCount(0);
    page.once('dialog', dialog => dialog.accept());
    await page.goto('/todo');
    await page.getByRole('button', { name: `Excluir lista ${lista}` }).click();
    await expect(page.getByRole('heading', { name: lista })).toHaveCount(0);

    await page.goto('/cursos');
    await page.getByRole('link', { name: `Abrir matérias do curso ${curso}` }).click();
    await page.getByRole('button', { name: `Excluir matéria ${materia}` }).click();
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();
    await page.goto('/cursos');
    await page.getByRole('button', { name: `Excluir ${curso}` }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Excluir curso' }).click();
    await expect(page.getByRole('heading', { name: curso })).toHaveCount(0);
  });
});
