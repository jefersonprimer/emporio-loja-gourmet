#!/usr/bin/env node
/**
 * Scraper de catálogo público do Cacau Show.
 *
 * Fonte de dados: páginas de categoria (PLP) e páginas de produto (PDP) públicas,
 * ambas permitidas pelo robots.txt do site (o robots.txt bloqueia apenas
 * carrinho, checkout, login e os endpoints internos /on/demandware.store/).
 *
 * Uso:
 *   node scripts/scrape-cacau-show.mjs
 *   node scripts/scrape-cacau-show.mjs --limit=120 --delay=500 --no-enrich
 *   node scripts/scrape-cacau-show.mjs --categories=chocolate,presentes/...,biscoito
 */

import { writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ORIGIN = 'https://www.cacaushow.com.br';
const USER_AGENT =
  'EmporioModaCatalogScraper/1.0 (+catalogo interno; contato: dev@localhost) Mozilla/5.0 (compatible)';

/** Categorias-semente: de onde a varredura começa em cada família do catálogo. */
const DEFAULT_SEEDS = [
  'chocolate',
  'chocolate/tabletes-e-barras',
  'chocolate/bolinhas-de-chocolate',
  'chocolate/trufas',
  'chocolate/cremes-e-slacks',
  'chocolate/marshmallow',
  'biscoito',
  'biscoito/cookies',
  'biscoito/wafer-e-canudinhos',
  'biscoito/pão-de-mel',
  'biscoito/biscoito-com-chocolate',
  'cafeteria',
  'cafeteria/bebidas-quentes',
  'cafeteria/cafés-e-capuccinos',
  'cafeteria/fondues-e-sobremesas',
  'cafeteria/sorvetes-e-gelatos',
  'campanhas/dia-das-crianças',
  'campanhas/infantis-cacau-show',
  'campanhas/lacreme-kids',
  'campanhas/trufas-cacau-show',
  'presentes',
  'presentes/canecas',
  'presentes/pelúcias-e-ursinhos',
  'presentes/livros',
  'lifestyle',
  'lifestyle/uso-pessoal',
  'lifestyle/bolsas-e-necessaires',
  'mesa-e-cozinha',
  'mesa-e-cozinha/louças',
  'nossas-marcas',
  'nossas-marcas/lacreme',
  'nossas-marcas/bendito-cacao',
  'nossas-marcas/bytes',
  'para-compartilhar/kits-e-presentes',
];

/** Decodifica as sequências unicode que a plataforma usa dentro dos scripts. */
function decodeUnicodeEscapes(input) {
  try {
    return JSON.parse(`"${input}"`);
  } catch {
    return input;
  }
}

function decodeEntities(input) {
  return input
    .replace(/&aacute;/g, 'á')
    .replace(/&atilde;/g, 'ã')
    .replace(/&amp;/g, '&')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&otilde;/g, 'õ')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&ndash;/g, '–')
    .replace(/&reg;/g, '®')
    .replace(/&copy;/g, '©')
    .replace(/&deg;/g, '°')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, '');
}

function stripHtml(input) {
  return decodeEntities(
    String(input || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(input) {
  return decodeEntities(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * A plataforma usa ponto como separador decimal nos atributos
 * ("19.99"), enquanto a vitrine exibe vírgula ("R$ 19,99").
 */
function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/** Descarta strings de placeholder como "null"/"undefined". */
function cleanText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = decodeEntities(value).trim();
  if (!trimmed || /^(null|undefined|n\/a|false|-|—)$/i.test(trimmed)) return null;
  return trimmed;
}

/** Converte URL de imagem para a variante `large` (mesma pasta de hash). */
function normalizeImageUrl(url) {
  if (!url) return null;
  const abs = url.startsWith('http') ? url : `${ORIGIN}${url}`;
  return abs.replace(/\/(tiny|small|medium|large|zoom|sw=\d+)\//, '/large/');
}

// ---------------------------------------------------------------------------
// Cliente HTTP com rate limit, timeout e retry
// ---------------------------------------------------------------------------
class PoliteClient {
  constructor({ delay = 400, timeout = 20000, retries = 3, concurrency = 3 } = {}) {
    this.delay = delay;
    this.timeout = timeout;
    this.retries = retries;
    this.concurrency = concurrency;
    this.lastRequestAt = 0;
    this.active = 0;
    this.queue = [];
    this.stats = { requests: 0, failures: 0 };
  }

  async #slot() {
    if (this.active >= this.concurrency) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.active += 1;
  }

  #release() {
    this.active -= 1;
    const next = this.queue.shift();
    if (next) next();
  }

  async #throttle() {
    const now = Date.now();
    const waitFor = this.lastRequestAt + this.delay - now;
    if (waitFor > 0) await sleep(waitFor);
    this.lastRequestAt = Date.now();
  }

  async get(url, { allow404 = false } = {}) {
    await this.#slot();
    try {
      let lastError;
      for (let attempt = 0; attempt <= this.retries; attempt += 1) {
        await this.#throttle();
        try {
          this.stats.requests += 1;
          const response = await fetch(url, {
            headers: {
              'User-Agent': USER_AGENT,
              Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(this.timeout),
          });

          if (response.status === 404 && allow404) return null;
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`HTTP ${response.status}`);
          }
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} em ${url}`);
          }
          return await response.text();
        } catch (error) {
          lastError = error;
          if (attempt === this.retries) break;
          const backoff = this.delay * Math.pow(2, attempt);
          await sleep(backoff);
        }
      }
      this.stats.failures += 1;
      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    } finally {
      this.#release();
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
async function buildRobotsGuard() {
  const rules = [];
  try {
    const client = new PoliteClient({ delay: 0, retries: 1 });
    const text = await client.get(`${ORIGIN}/robots.txt`);
    let applies = false;
    for (const rawLine of text.split('\n')) {
      const line = rawLine.split('#')[0].trim();
      if (!line) continue;
      const [rawKey, ...rest] = line.split(':');
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(':').trim();
      if (key === 'user-agent') applies = value === '*';
      if (applies && key === 'disallow' && value) rules.push(value);
    }
  } catch {
    console.warn('  ! robots.txt indisponível, seguindo sem verificação.');
  }

  /** Retorna true quando o robots.txt proíbe a URL. */
  return (url) => {
    const path = new URL(url).pathname;
    return rules.some((rule) => path.startsWith(rule));
  };
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------
function extractJsonLdProduct(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];
  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed, ...(parsed['@graph'] || [])];
    const product = candidates.find(
      (item) => item && (item['@type'] === 'Product' || item['@type']?.includes?.('Product'))
    );
    if (product) return product;
  }
  return null;
}

function extractBreadcrumb(html) {
  const block = html.match(/<ol[^>]+id="breadcrumb"[\s\S]*?<\/ol>/i)?.[0];
  if (!block) return [];

  const items = [...block.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => {
    const attrs = match[1];
    const href = attrs.match(/href="([^"]*)"/i)?.[1] || '';
    const label = attrs.match(/data-breadcrumb="([^"]*)"/i)?.[1] || stripHtml(match[2]);
    return { label, href, path: href.replace(/^\/categoria\/?/, '').replace(/\/+$/, '') };
  });

  return items
    .map((item) => ({ ...item, label: decodeEntities(item.label).trim() }))
    .filter((item) => item.path && item.label && item.label.toLowerCase() !== 'home');
}

/** Lê os produtos da listagem (PLP) usando os data-attributes e o JSON embutido. */
function parseCategoryPage(html, sourceCategory) {
  const tileMarker = '<div class="product js-grid-tile"';
  const tiles = html.split(tileMarker).slice(1);
  const products = [];

  for (const tile of tiles) {
    const nextTile = tile.indexOf(tileMarker, 10);
    const chunk = nextTile > 0 ? tile.slice(0, nextTile) : tile.slice(0, 20000);
    const attr = (name) => {
      const raw = chunk.match(new RegExp(`${name}="([^"]*)"`));
      return raw ? decodeEntities(raw[1]) : null;
    };

    const id = attr('data-pid');
    if (!id) continue;

    const embedded = chunk.match(/productsList\.push\(JSON\.parse\('([^']+)'\)\)/);
    let details = {};
    if (embedded) {
      try {
        details = JSON.parse(decodeUnicodeEscapes(embedded[1]));
      } catch {
        details = {};
      }
    }

    const href = chunk.match(/<a[^>]+href="(\/produto\/[^"]+\.html)"/i)?.[1];
    const salePrice = toNumber(details?.price?.sales?.value) ?? toNumber(attr('data-product-price'));
    const listPrice = toNumber(details?.price?.list?.value) ?? null;
    const gallery = details?.images || {};
    const image =
      gallery.large?.[0]?.absURL ||
      gallery.medium?.[0]?.absURL ||
      gallery[Object.keys(gallery)[0]]?.[0]?.absURL ||
      null;

    const categoryPath = (attr('data-product-category') || sourceCategory)
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);

    const name = cleanText(attr('data-product-name'));
    if (!name || !salePrice) continue;

    products.push({
      id,
      name,
      slug: slugify(name),
      url: href ? `${ORIGIN}${href}` : null,
      brand: cleanText(attr('data-product-brand')),
      categoryPath,
      collection: sourceCategory.join('/'),
      price: salePrice,
      listPrice: listPrice && listPrice > salePrice ? listPrice : null,
      image: normalizeImageUrl(image),
      available: attr('data-product-available') !== 'false',
      rating: toNumber(details?.rating) || null,
    });
  }

  return products;
}

/** Enriquece o produto com a página de detalhe: descrição e galeria. */
function parseProductPage(html, base) {
  const product = {};
  const jsonLd = extractJsonLdProduct(html);

  if (jsonLd) {
    product.name = cleanText(jsonLd.name) || base.name;
    product.description = stripHtml(jsonLd.description) || null;
    product.sku = cleanText(jsonLd.sku) || cleanText(jsonLd.mpn) || base.id;
    product.brand =
      cleanText(typeof jsonLd.brand === 'object' ? jsonLd.brand?.name : jsonLd.brand) || base.brand;
    const images = (Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image])
      .filter(Boolean)
      .map(normalizeImageUrl)
      .filter(Boolean);
    if (images.length) product.images = images;
    const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers[0] : jsonLd.offers;
    if (offers) {
      const price = toNumber(offers.price);
      if (price) product.price = price;
      if (offers.priceCurrency) product.currency = offers.priceCurrency;
      product.available = /InStock/i.test(offers.availability || '');
    }
  }

  const breadcrumb = extractBreadcrumb(html);
  if (breadcrumb.length) {
    product.categoryPath = breadcrumb.map((item) => item.label);
    product.categorySlugPath = breadcrumb.map((item) => item.path);
  }

  if (product.price != null) {
    const strike = html.match(
      /<span class="strike-through list">[\s\S]{0,200}?content="([\d.,]+)"/
    );
    const listPrice = strike ? toNumber(strike[1]) : null;
    if (listPrice && listPrice > product.price) product.listPrice = listPrice;
  }

  return product;
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    limit: 100,
    delay: 400,
    concurrency: 3,
    out: resolve(ROOT, 'src/data/cacau-show-products.json'),
    enrich: true,
    seeds: DEFAULT_SEEDS,
  };

  for (const raw of argv) {
    const [key, value] = raw.replace(/^--/, '').split('=');
    if (key === 'no-enrich') args.enrich = false;
    else if (key === 'limit') args.limit = Number(value);
    else if (key === 'delay') args.delay = Number(value);
    else if (key === 'concurrency') args.concurrency = Number(value);
    else if (key === 'out') args.out = resolve(ROOT, value);
    else if (key === 'categories') {
      args.seeds = value
        .split(',')
        .map((item) => item.trim().replace(/^\/+|\/+$/g, ''))
        .filter(Boolean);
    }
  }

  return args;
}

function dedupe(products) {
  const seen = new Set();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

/**
 * Intercala os grupos (coleções) para o catálogo final ter variedade, com teto
 * por grupo para que nenhuma família domine o catálogo e todas virem um
 * carrossel completo na home.
 */
function balanceByGroup(products, limit) {
  const cap = Math.max(4, Math.round(limit / 12));
  const buckets = new Map();

  for (const product of products) {
    const key = product.collection || product.categoryPath?.[0] || 'Outros';
    if (!buckets.has(key)) buckets.set(key, []);
    const items = buckets.get(key);
    if (items.length >= cap) continue;
    items.push(product);
  }

  const queues = [...buckets.values()].sort(
    (a, b) => b.length - a.length || a[0].name.localeCompare(b[0].name)
  );
  const result = [];

  while (result.length < limit) {
    let added = false;
    for (const items of queues) {
      const next = items.shift();
      if (!next) continue;
      result.push(next);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }

  return result;
}

async function fetchSitemap(client, url) {
  const xml = await client.get(url);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    decodeEntities(match[1].trim())
  );
}

/**
 * Casa as categorias-semente com as URLs reais do sitemap, evitando 404 por
 * acento ou slug desatualizado (ex.: "pascoa" -> "/categoria/p%C3%A1scoa").
 */
function resolveSeeds(sitemapUrls, seeds) {
  const index = new Map(
    sitemapUrls
      .filter((url) => url.includes('/categoria/'))
      .map((url) => [slugify(url.split('/categoria/')[1].replace(/\/+$/, '')), url])
  );

  const resolved = [];
  const missing = [];

  for (const seed of seeds) {
    const url = index.get(slugify(seed));
    if (url) resolved.push({ seed, url });
    else missing.push(seed);
  }

  return { resolved, missing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = new PoliteClient({
    delay: args.delay,
    concurrency: args.concurrency,
  });
  const isDisallowed = await buildRobotsGuard();

  console.log(`Cacau Show scraper -> ${args.out}`);
  console.log(`  limite: ${args.limit} | intervalo: ${args.delay}ms | paralelismo: ${args.concurrency}`);
  console.log(`  categorias-semente: ${args.seeds.length}`);

  const collected = [];
  const sitemapUrls = await fetchSitemap(client, `${ORIGIN}/sitemap_2-category.xml`).catch(
    () => []
  );
  const { resolved, missing } = resolveSeeds(sitemapUrls, args.seeds);
  if (missing.length) console.log(`  ignoradas (fora do sitemap): ${missing.join(', ')}`);

  for (const { seed, url: categoryUrl } of resolved) {
    const url = `${categoryUrl}?sz=48`;
    if (isDisallowed(url)) {
      console.log(`  - bloqueado pelo robots.txt: ${seed}`);
      continue;
    }
    try {
      const html = await client.get(url);
      const products = parseCategoryPage(html, seed.split('/'));
      collected.push(...products);
      console.log(`  + ${seed}: ${products.length} produtos`);
    } catch (error) {
      console.log(`  ! ${seed}: ${error.message}`);
    }
  }

  const unique = dedupe(collected).filter((product) => product.categoryPath[0] !== 'Todos');
  const selected = balanceByGroup(unique, args.limit);
  console.log(`\n  ${unique.length} produtos únicos -> ${selected.length} selecionados`);

  if (args.enrich) {
    console.log(`  enriquecendo ${selected.length} páginas de produto...`);
    for (const product of selected) {
      if (!product.url) continue;
      if (isDisallowed(product.url)) continue;
      try {
        const html = await client.get(product.url);
        Object.assign(product, parseProductPage(html, product));
      } catch (error) {
        console.log(`  ! ${product.id}: ${error.message}`);
      }
      const done = selected.indexOf(product) + 1;
      if (done % 10 === 0 || done === selected.length) {
        console.log(`    ${done}/${selected.length}`);
      }
    }
  }

  const products = selected
    .map((product) => {
      const images = product.images?.length ? product.images : product.image ? [product.image] : [];
      const listPrice = product.listPrice ?? null;
      const price = product.price ?? 0;
      return {
        id: String(product.id),
        sku: product.sku || String(product.id),
        name: product.name,
        slug: product.slug || slugify(product.name),
        url: product.url || null,
        brand: product.brand || 'Cacau Show',
        category: product.categoryPath?.[0] || 'Outros',
        subcategory: product.categoryPath?.[1] || null,
        categoryPath: product.categoryPath || [],
        collection: product.collection || null,
        price,
        listPrice,
        discountPercentage:
          listPrice && listPrice > price ? Math.round((1 - price / listPrice) * 100) : 0,
        image: images[0] || null,
        images,
        rating: product.rating || null,
        available: product.available !== false,
        description: product.description || null,
      };
    })
    .filter((product) => product.price > 0 && product.image);

  const categories = {};
  for (const product of products) {
    categories[product.category] = (categories[product.category] || 0) + 1;
  }

  const payload = {
    source: 'https://www.cacaushow.com.br',
    generatedAt: new Date().toISOString(),
    total: products.length,
    categories: Object.fromEntries(
      Object.entries(categories).sort((a, b) => b[1] - a[1])
    ),
    products,
  };

  await mkdir(dirname(args.out), { recursive: true });
  const tmp = `${args.out}.tmp`;
  await writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  await rename(tmp, args.out);

  console.log(`\n  ${products.length} produtos salvos (${client.stats.requests} requisições)`);
  console.log('  categorias:');
  for (const [category, count] of Object.entries(payload.categories)) {
    console.log(`    ${String(count).padStart(3)}  ${category}`);
  }
}

main().catch((error) => {
  console.error('Falha no scrape:', error);
  process.exit(1);
});
