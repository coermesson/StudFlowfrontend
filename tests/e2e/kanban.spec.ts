import { test, expect, criarCurso, criarMateria, limparDadosDoTeste } from './fixtures';

test.describe('Kanban', () => {
  let marcador = '';
  test.afterEach(async ({ api }) => {
    if (marcador) await limparDadosDoTeste(api, marcador);
  });

  test('cria quadro e tarefa, altera o status e exclui os dados criados', async ({ page }) => {
    marcador = crypto.randomUUID();
    const sufixo = marcador;
    const curso = `Curso ${sufixo}`;
    const materia = `Matéria ${sufixo}`;
    const quadro = `Quadro ${sufixo}`;
    const tarefa = `Tarefa ${sufixo}`;

    await criarCurso(page, curso);
    await criarMateria(page, curso, materia);
    await page.goto('/kanban');
    await page.getByRole('button', { name: 'Novo quadro' }).click();
    await page.getByLabel('Nome do quadro').fill(quadro);
    await page.getByLabel('Matéria').selectOption({ label: materia });
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: quadro })).toBeVisible();
    await page.getByRole('button', { name: new RegExp(quadro) }).click();

    await expect(page.getByRole('heading', { name: 'A Fazer' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova tarefa' }).click();
    await page.getByLabel('Título').fill(tarefa);
    await page.getByLabel('Descrição').fill('Descrição exclusiva do teste');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: tarefa })).toBeVisible();

    await page.getByRole('button', { name: `Editar tarefa ${tarefa}` }).click();
    const tarefaEditada = `${tarefa} revisada`;
    await page.getByLabel('Título').fill(tarefaEditada);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('heading', { name: tarefaEditada })).toBeVisible();

    const colunaFeito = page.getByRole('heading', { name: 'Feito' }).locator('xpath=../../..');
    await page.getByRole('heading', { name: tarefaEditada }).dragTo(colunaFeito);
    await expect(colunaFeito.getByRole('heading', { name: tarefaEditada })).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: `Excluir tarefa ${tarefaEditada}` }).click();
    await expect(page.getByRole('heading', { name: tarefaEditada })).toHaveCount(0);
    page.once('dialog', dialog => dialog.accept());
    await page.goto('/kanban');
    await page.getByRole('button', { name: `Excluir quadro ${quadro}` }).click();
    await expect(page.getByRole('heading', { name: quadro })).toHaveCount(0);
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
