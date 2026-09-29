# Cacau Show Store

Catálogo de produtos coletados do site público do Cacau Show, com vitrine por categoria,
carrosséis de 4 produtos por vez, página de detalhes e fechamento de pedido pelo WhatsApp.

## Deploy na Vercel

O projeto é uma SPA Vite estática, sem variáveis de ambiente obrigatórias.

```bash
vercel link
vercel --prod
```

O `vercel.json` já define `buildCommand`, `outputDirectory` e o rewrite de SPA
para o `index.html`. A pasta `public/` é publicada na raiz: `logo.png` (header e
rodapé) e `favicon.png`.

## Rodando localmente

**Pré-requisito:** Node.js

1. Instale as dependências: `npm install`
2. Suba o app: `npm run dev`

## Scraper

O catálogo vive em `src/data/cacau-show-products.json` e é gerado por:

```bash
npm run scrape                 # 100 produtos, enriquecidos (padrão)
npm run scrape -- --limit=120  # outro total
npm run scrape -- --no-enrich  # só páginas de categoria (bem mais rápido)
npm run scrape -- --categories=chocolate,biscoito,cafeteria
```

Opções: `--limit`, `--delay` (ms entre requisições), `--concurrency`,
`--categories`, `--out`, `--no-enrich`.

O script usa o sitemap oficial, respeita o `robots.txt`, aplica rate limit com retry
e monta um JSON equilibrado entre as coleções para que toda categoria vire um
carrossel completo na home.

## Estrutura

- `scripts/scrape-cacau-show.mjs` — coleta os produtos
- `src/data/cacau-show-products.json` — catálogo gerado
- `src/data/catalog.ts` — títulos das vitrines, seções e busca
- `src/components/ProductCarousel.tsx` — carrossel (4 por vez)
- `src/components/ProductDetail.tsx` — página de detalhes
- `src/components/WhatsAppCheckoutModal.tsx` — fechamento via WhatsApp

Os preços e imagens pertencem ao Cacau Show; o pedido é confirmado com a loja.
