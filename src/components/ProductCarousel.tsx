import React, { useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  tone?: 'light' | 'dark';
}

/** Quantos produtos aparecem por vez no desktop. */
const PER_VIEW = 4;

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  subtitle,
  action,
  tone = 'light',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const isDark = tone === 'dark';

  /** Número de páginas considerando 4 itens por página no desktop. */
  const totalPages = Math.max(1, Math.ceil(products.length / PER_VIEW));

  /** Largura de um card + gap, usada para navegar de 4 em 4. */
  const stepOf = (track: HTMLDivElement) => {
    const card = track.querySelector<HTMLElement>('[data-carousel-item]');
    return (card ? card.offsetWidth : track.clientWidth) + 24;
  };

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * stepOf(track) * PER_VIEW, behavior: 'smooth' });
  }, []);

  const goToPage = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * stepOf(track) * PER_VIEW, behavior: 'smooth' });
  }, []);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / (stepOf(track) * PER_VIEW));
    setPage(Math.min(Math.max(current, 0), totalPages - 1));
  };

  return (
    <section className={isDark ? 'py-16 lg:py-20' : 'py-14 lg:py-20'}>
      {/* Cabeçalho da vitrine */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-7 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <span
            className={`text-[11px] tracking-[0.3em] uppercase font-semibold ${
              isDark ? 'text-[#D7C4A5]' : 'text-[#A3885C]'
            }`}
          >
            Cacau Show
          </span>
          <h2
            className={`font-editorial text-2xl sm:text-3xl lg:text-4xl leading-tight mt-1 ${
              isDark ? 'text-white' : 'text-[#1A1816]'
            }`}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={`mt-1.5 text-sm font-light max-w-xl ${
                isDark ? 'text-[#DDD4C5]' : 'text-[#7A6E5E]'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}
          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                aria-label="Produtos anteriores"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/25 text-white hover:bg-white hover:text-[#1A1816]'
                    : 'border-[#D9D0C0] text-[#1A1816] hover:bg-[#39050B] hover:text-white'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                aria-label="Próximos produtos"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'border-white/25 text-white hover:bg-white hover:text-[#1A1816]'
                    : 'border-[#D9D0C0] text-[#1A1816] hover:bg-[#39050B] hover:text-white'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trilho: 1 card no mobile, 2 no tablet, 4 no desktop */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className="snap-start shrink-0 w-[72vw] max-w-[280px] sm:w-[46vw] lg:w-[calc((100%-72px)/4)]"
          >
            <ProductCard product={product} tone={tone} />
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir para o grupo ${index + 1}`}
              onClick={() => goToPage(index)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                index === page ? 'w-8 bg-[#A3885C]' : 'w-3 bg-[#D9D0C0] hover:bg-[#C2B6A3]'
              }`}
            />
          ))}
          <span className="ml-2 text-[11px] tracking-widest uppercase text-[#9E917E]">
            {page + 1}/{totalPages}
          </span>
        </div>
      )}
    </section>
  );
};
