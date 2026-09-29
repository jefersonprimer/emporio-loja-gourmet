import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { categorySections, getSectionById } from '../data/catalog';
import { LoadMoreButton, ProductGrid, SortKey, SortSelect, sortProducts } from './ProductGrid';

export const CategoryView: React.FC = () => {
  const { selectedSectionId, navigate, openCategory } = useStore();
  const [sort, setSort] = useState<SortKey>('destaques');
  const [visible, setVisible] = useState(24);

  const section = selectedSectionId ? getSectionById(selectedSectionId) : undefined;

  if (!section) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-sm text-[#7A6E5E]">Categoria não encontrada.</p>
        <button
          type="button"
          onClick={() => navigate('home')}
          className="mt-4 inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] cursor-pointer"
        >
          <ChevronLeft size={14} />
          Voltar para a home
        </button>
      </div>
    );
  }

  const sorted = sortProducts(section.products, sort);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        type="button"
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] cursor-pointer mb-6"
      >
        <ChevronLeft size={14} />
        Home
      </button>

      <span className="text-[11px] tracking-[0.3em] uppercase text-[#A3885C] font-semibold">
        Cacau Show
      </span>
      <h1 className="font-editorial text-3xl sm:text-4xl text-[#1A1816] mt-1">{section.title}</h1>
      <p className="mt-1 text-sm text-[#7A6E5E] font-light max-w-xl">{section.subtitle}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-[#ECE7DC] py-4">
        <SortSelect value={sort} onChange={setSort} />

        {categorySections
          .filter((other) => other.id !== section.id)
          .slice(0, 4)
          .map((other) => (
            <button
              key={other.id}
              type="button"
              onClick={() => openCategory(other.id)}
              className="px-3 py-1.5 border border-[#D9D0C0] text-[11px] tracking-widest uppercase text-[#574E43] hover:border-[#39050B] cursor-pointer"
            >
              {other.title}
            </button>
          ))}
      </div>

      <div className="mt-8">
        <ProductGrid items={sorted.slice(0, visible)} />
      </div>

      {visible < sorted.length && (
        <LoadMoreButton onClick={() => setVisible((current) => current + 24)} />
      )}
    </div>
  );
};
