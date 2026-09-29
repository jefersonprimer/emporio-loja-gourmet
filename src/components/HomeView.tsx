import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { categorySections, products } from '../data/catalog';
import { ProductCarousel } from './ProductCarousel';
import { ProductGrid } from './ProductGrid';

export const HomeView: React.FC = () => {
  const { navigate, openCategory } = useStore();
  const [visible, setVisible] = useState(16);

  const discounted = useMemo(
    () =>
      products
        .filter((product) => product.discountPercentage > 0)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8),
    []
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <span className="text-[11px] tracking-[0.3em] uppercase text-[#A3885C] font-semibold">
          Ofertas do catálogo
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#1A1816]">
            Descontos em destaque
          </h2>
          <button
            type="button"
            onClick={() => navigate('catalog')}
            className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] cursor-pointer"
          >
            Ver todos os {products.length} produtos
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid items={discounted} />
      </div>

      {/* Um carrossel por categoria, 4 produtos por vez */}
      {categorySections.map((section, index) => (
        <div
          key={section.id}
          className={index % 3 === 1 ? 'bg-[#F5F2EB] border-y border-[#ECE7DC]' : ''}
        >
          <ProductCarousel
            products={section.products}
            title={section.title}
            subtitle={section.subtitle}
            action={
              <button
                type="button"
                onClick={() => openCategory(section.id)}
                className="hidden sm:inline-flex text-[11px] font-semibold tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] cursor-pointer"
              >
                Ver todos
              </button>
            }
          />
        </div>
      ))}

      {/* Vitrine completa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-editorial text-2xl sm:text-3xl text-[#1A1816] mb-6">
          Vitrine completa
        </h2>
        <ProductGrid items={products.slice(0, visible)} />
        {visible < products.length && (
          <button
            type="button"
            onClick={() => setVisible((current) => current + 16)}
            className="mt-10 w-full py-4 border border-[#1A1816] text-[#1A1816] hover:bg-[#39050B] hover:text-white text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
          >
            Carregar mais produtos
          </button>
        )}
        <p className="mt-3 text-center text-[11px] tracking-widest uppercase text-[#9E917E]">
          {Math.min(visible, products.length)} de {products.length} produtos
        </p>
      </div>
    </>
  );
};
