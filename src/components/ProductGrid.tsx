import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

export const SORTS = [
  ['destaques', 'Destaques'],
  ['menor-preco', 'Menor preço'],
  ['maior-preco', 'Maior preço'],
  ['desconto', 'Maior desconto'],
  ['nome', 'Nome (A-Z)'],
] as const;

export type SortKey = (typeof SORTS)[number][0];

export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const copy = [...items];
  switch (sort) {
    case 'menor-preco':
      return copy.sort((a, b) => a.price - b.price);
    case 'maior-preco':
      return copy.sort((a, b) => b.price - a.price);
    case 'desconto':
      return copy.sort((a, b) => b.discountPercentage - a.discountPercentage);
    case 'nome':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    default:
      return copy.sort((a, b) => b.discountPercentage - a.discountPercentage || b.price - a.price);
  }
}

export const ProductGrid: React.FC<{ items: Product[] }> = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
    {items.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
);

export const SortSelect: React.FC<{
  value: SortKey;
  onChange: (value: SortKey) => void;
}> = ({ value, onChange }) => (
  <label className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#7A6E5E]">
    Ordenar
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as SortKey)}
      className="bg-white border border-[#D9D0C0] px-2 py-1.5 text-xs text-[#1A1816] outline-none"
    >
      {SORTS.map(([sortValue, label]) => (
        <option key={sortValue} value={sortValue}>
          {label}
        </option>
      ))}
    </select>
  </label>
);

export const LoadMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-10 w-full py-4 border border-[#1A1816] text-[#1A1816] hover:bg-[#39050B] hover:text-white text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
  >
    Carregar mais produtos
  </button>
);
