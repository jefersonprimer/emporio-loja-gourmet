import rawCatalog from './cacau-show-products.json';
import { CatalogFile, CategorySection, Product, StoreSettings } from '../types';

const catalog = rawCatalog as CatalogFile;

export const catalogMeta = {
  source: catalog.source,
  generatedAt: catalog.generatedAt,
  total: catalog.total,
  categories: catalog.categories,
};

export const products: Product[] = catalog.products;

export const initialStoreSettings: StoreSettings = {
  whatsappNumber: '5555984017985',
  whatsappDisplay: '(55) 98401-7985',
  storeName: 'Cacau Show Store',
  instagramHandle: 'emporio_fw',
  announcementText: 'CATÁLOGO CACAU SHOW · PEÇAS COM ATACADO PELA LOJA ORIGINAL · PEDIDO VIA WHATSAPP',
  showAnnouncement: true,
};

/** mínimo de produtos para uma seção virar carrossel na home */
const MIN_PRODUCTS_PER_SECTION = 4;

/** Títulos de vitrine por coleção (o slug vem do scraper). */
const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  'campanhas/infantis-cacau-show': {
    title: 'Dia das Crianças',
    subtitle: 'Brinquedos, pelúcias e doces que fazem a festa infantil ainda mais gostosa.',
  },
  chocolate: {
    title: 'Chocolate & Bombons',
    subtitle: 'Tabletes, barras e bombons para presentear quem você ama.',
  },
  'chocolate/tabletes-e-barras': {
    title: 'Tabletes e Barras',
    subtitle: 'O clássico Cacau Show em todos os tamanhos e perfis de sabor.',
  },
  'chocolate/trufas': {
    title: 'Trufas',
    subtitle: 'Cremosas e recheadas: o bombom que derrete na boca.',
  },
  'chocolate/bolinhas-de-chocolate': {
    title: 'Bolinhas de Chocolate',
    subtitle: 'As spheros que somem rápido demais na confraternização.',
  },
  'chocolate/marshmallow': {
    title: 'Marshmallows & Cremes',
    subtitle: 'Cremes aerados, marshmallows e sobremesas de chocolate.',
  },
  'chocolate/cremes-e-slacks': {
    title: 'Cremes & Snacks',
    subtitle: 'Cremes para passar no pão e snacks de chocolate em qualquer hora.',
  },
  biscoito: {
    title: 'Biscoiteria',
    subtitle: 'Wafer, cookie e pão de mel: a trilha doce perfeita para o café.',
  },
  cafeteria: {
    title: 'Cafeteria',
    subtitle: 'Cafés, bebidas e sobremesas para deixar a pausa mais gostosa.',
  },
  presentes: {
    title: 'Presentes & Cestas',
    subtitle: 'Kits prontos para presentear em qualquer ocasião.',
  },
  'presentes/canecas': {
    title: 'Canecas & Copos',
    subtitle: 'Presente criativo com a cara do Cacau Show.',
  },
  lifestyle: {
    title: 'Lifestyle Cacau Show',
    subtitle: 'Pelúcias, bolsas e objetos para viver o universo Cacau Show.',
  },
  'lifestyle/uso-pessoal': {
    title: 'Uso Pessoal',
    subtitle: 'Hidratantes e cuidado diário com cheiro de chocolate.',
  },
  'para-compartilhar/kits-e-presentes': {
    title: 'Kits e Cestas',
    subtitle: 'Combinações montadas para dividir (ou não).',
  },
  'nossas-marcas/bendito-cacao': {
    title: 'Bendito Cação',
    subtitle: 'A linha gourmet da casa, com cacau intenso e recheios especiais.',
  },
  'nossas-marcas/lacreme': {
    title: 'laCreme',
    subtitle: 'A marca que combina o sabor do cacau com a cremosidade do leite.',
  },
};

/** Ordem de exibição dos carrosséis na home. */
const SECTION_ORDER = [
  'campanhas/infantis-cacau-show',
  'chocolate',
  'chocolate/tabletes-e-barras',
  'chocolate/trufas',
  'chocolate/bolinhas-de-chocolate',
  'biscoito',
  'cafeteria',
  'presentes',
  'lifestyle',
  'lifestyle/uso-pessoal',
  'para-compartilhar/kits-e-presentes',
  'nossas-marcas/bendito-cacao',
  'nossas-marcas/lacreme',
];

function prettify(slug: string): string {
  const last = slug.split('/').filter(Boolean).pop() || slug;
  const spaced = last.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function groupByCollection(items: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  for (const product of items) {
    const key = product.collection || product.category;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
  }
  return groups;
}

const groups = groupByCollection(products);

/** Uma vitrine por categoria, já pronta para virar carrossel. */
export const categorySections: CategorySection[] = [...groups.entries()]
  .filter(([, items]) => items.length >= MIN_PRODUCTS_PER_SECTION)
  .map(([collection, items]) => {
    const custom = SECTION_TITLES[collection];
    return {
      id: collection,
      title: custom?.title || prettify(collection),
      subtitle: custom?.subtitle || `Seleção especial de ${items.length} itens da categoria.`,
      products: items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    };
  })
  .sort((a, b) => {
    const indexA = SECTION_ORDER.indexOf(a.id);
    const indexB = SECTION_ORDER.indexOf(b.id);
    if (indexA !== -1 || indexB !== -1) {
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    }
    return b.products.length - a.products.length;
  });

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getSectionById(id: string): CategorySection | undefined {
  return categorySections.find((section) => section.id === id);
}

/** Destaques da home: promoções com maior desconto. */
export const featuredProducts: Product[] = [...products]
  .filter((product) => product.discountPercentage > 0)
  .sort((a, b) => b.discountPercentage - a.discountPercentage)
  .slice(0, 8);

/** Mais vendidos: mistura de categorias para dar variedade ao topo da página. */
export const trendingProducts: Product[] = [
  ...new Map(
    products
      .filter((product) => product.available)
      .slice()
      .sort((a, b) => b.rating! - a.rating!)
      .map((product) => [product.id, product])
  ).values(),
].slice(0, 8);

export function searchProducts(term: string): Product[] {
  const query = term.trim().toLowerCase();
  if (!query) return [];
  return products
    .filter((product) =>
      [product.name, product.brand, product.category, product.subcategory ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
    .slice(0, 12);
}
