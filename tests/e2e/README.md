# Testes E2E

Os testes usam uma conta dedicada, já cadastrada no backend. Configure `E2E_EMAIL` e `E2E_PASSWORD` no ambiente do processo que inicia o Playwright. A fixture autentica pela API para cada teste, injeta o cookie de sessão no navegador e encerra a sessão ao terminar. Os cenários não testam login nem cadastro.

Inicie o backend conforme as instruções do repositório do backend, acessível em `http://localhost:3000` (ou configure `E2E_API_URL`). Configure também `VITE_API_URL` no `.env` do frontend para apontar para essa API. Em outro terminal, na raiz deste frontend, inicie o Vite:

```powershell
npm run dev
```

O frontend deve estar em `http://localhost:5173`, ou em outra URL configurada por `E2E_BASE_URL`. Na raiz do frontend, execute toda a suíte com:

```powershell
npx playwright test
```

Se os navegadores do Playwright ainda não estiverem instalados neste ambiente, instale o Chromium com `npx playwright install chromium` antes de executar a suíte.

Os cenários de CRUD criam registros com UUID e limpam somente itens que contêm o marcador do próprio cenário. O teste de perfil restaura o nome original mesmo quando uma asserção falha. Use apenas uma conta dedicada aos testes.
