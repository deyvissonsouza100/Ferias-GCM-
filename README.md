# Quantitativo Férias GCM

Dashboard React + Vite + Tailwind para ler dados do Google Sheets via **CSV público** e exibir:
- Cards por período (Integral x Divididas)
- Filtros (Período, Modo do Período, Tipo de Férias, Subordinação, Responsável p/ Lotação, pesquisa)
- Tabela com ordenação, paginação opcional e destaque azul para registros incompletos no período

## Rodar local
```bash
npm install
npm run dev
```

## Publicar no GitHub Pages
1. Confirme que o `base` em `vite.config.ts` está com o nome do seu repositório:
   - Ex: `base: "/gcm-ferias-dashboard/"`
2. Suba tudo para o GitHub.
3. Em **Settings → Pages → Source** selecione **GitHub Actions**.
4. O deploy roda automaticamente a cada push.

## Workflow (GitHub Actions)
Este repo já inclui `.github/workflows/deploy.yml` (sem cache npm para não exigir lockfile).

## Fonte de dados (CSV)
O link do CSV está em `src/utils/sheets.ts` (const `CSV_URL`).

## Senha
Senha: **Artigo02** (frontend-only, serve apenas como bloqueio simples no navegador).
