import { test as base, expect, request, type APIRequestContext, type Page } from '@playwright/test';

type Fixtures = { api: APIRequestContext };

const apiUrl = (process.env.E2E_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const test = base.extend<Fixtures>({
  api: async ({ page }, use) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      throw new Error('Defina E2E_EMAIL e E2E_PASSWORD para usar uma conta dedicada de testes.');
    }

    const api = await request.newContext({ baseURL: apiUrl });
    const login = await api.post('/auth/login', { data: { email, senha: password } });

    if (!login.ok()) {
      await api.dispose();
      throw new Error(`Não foi possível preparar a sessão E2E (HTTP ${login.status()}).`);
    }

    const { cookies } = await api.storageState();
    await page.context().addCookies(cookies);
    const pageErrors: string[] = [];
    const apiFailures: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(apiUrl) && response.status() >= 500) {
        apiFailures.push(`${response.status()} ${response.url()}`);
      }
    });
    page.on('requestfailed', failed => {
      if (failed.url().startsWith(apiUrl)) {
        apiFailures.push(`${failed.failure()?.errorText || 'requisição falhou'} ${failed.url()}`);
      }
    });

    try {
      await use(api);
      expect(pageErrors, 'erros de execução no navegador').toEqual([]);
      expect(apiFailures, 'falhas HTTP 5xx na API').toEqual([]);
    } finally {
      await api.post('/auth/logout').catch(() => {});
      await api.dispose();
    }
  },
});

export { expect };

export async function criarCurso(page: Page, nome: string) {
  await page.goto('/cursos');
  await page.getByRole('button', { name: 'Adicionar curso' }).click();
  await page.getByLabel('Nome do curso').fill(nome);
  await page.getByRole('button', { name: 'Salvar curso' }).click();
  await expect(page.getByRole('heading', { name: nome })).toBeVisible();
}

export async function criarMateria(page: Page, curso: string, materia: string) {
  await page.getByRole('link', { name: `Abrir matérias do curso ${curso}` }).click();
  await page.getByRole('button', { name: 'Adicionar matéria' }).click();
  await page.getByLabel('Nome da matéria').fill(materia);
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByRole('heading', { name: materia })).toBeVisible();
}

export async function limparDadosDoTeste(api: APIRequestContext, marcador: string) {
  const recursos = [
    ['/arquivos', (item: Record<string, unknown>) => item.nome],
    ['/itens', (item: Record<string, unknown>) => item.descricao],
    ['/tarefa', (item: Record<string, unknown>) => item.titulo],
    ['/listas', (item: Record<string, unknown>) => item.nome],
    ['/quadros-kanban', (item: Record<string, unknown>) => item.nome],
    ['/materias', (item: Record<string, unknown>) => item.nome],
    ['/cursos', (item: Record<string, unknown>) => item.nome],
  ] as const;

  for (const [path, obterTexto] of recursos) {
    const resposta = await api.get(path);
    if (!resposta.ok()) continue;
    const dados: unknown = await resposta.json();
    if (!Array.isArray(dados)) continue;

    for (const item of dados as Record<string, unknown>[]) {
      const texto = obterTexto(item);
      if (typeof texto === 'string' && texto.includes(marcador) && item.id != null) {
        await api.delete(`${path}/${item.id}`);
      }
    }
  }
}
