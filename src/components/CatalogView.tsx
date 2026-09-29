import React, { useMemo, useState } from 'react';
import { products } from '../data/catalog';
import { LoadMoreButton, ProductGrid, SortKey, SortSelect, sortProducts } from './ProductGrid';

export const CatalogView: React.FC = () => {
  const [sort, setSort] = useState<SortKey>('destaques');
  const [brand, setBrand] = useState('Todos');
  const [visible, setVisible] = useState(24);

  const brands = useMemo(
    () => ['Todos', ...Array.from(new Set(products.map((product) => product.brand))).sort()],
    []
  );

  const filtered = useMemo(
    () =>
      sortProducts(
        brand === 'Todos' ? products : products.filter((product) => product.brand === brand),
        sort
      ),
    [brand, sort]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="text-[11px] tracking-[0.3em] uppercase text-[#A3885C] font-semibold">
        Cacau Show
      </span>
      <h1 className="font-editorial text-3xl sm:text-4xl text-[#1A1816] mt-1">
        Catálogo completo
      </h1>
      <p className="mt-1 text-sm text-[#7A6E5E] font-light">
        {filtered.length} produtos coletados do site do Cacau Show.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-[#ECE7DC] py-4">
        <SortSelect value={sort} onChange={setSort} />
        <label className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#7A6E5E]">
          Marca
          <select
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="bg-white border border-[#D9D0C0] px-2 py-1.5 text-xs text-[#1A1816] outline-none"
          >
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8">
        <ProductGrid items={filtered.slice(0, visible)} />
      </div>

      {visible < filtered.length && (
        <LoadMoreButton onClick={() => setVisible((current) => current + 24)} />
      )}
    </div>
  );
};
