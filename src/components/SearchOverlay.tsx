import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { searchProducts } from '../data/catalog';
import { Product } from '../types';
import { formatBRL, hasDiscount } from '../utils/format';

const SearchResultRow: React.FC<{ product: Product }> = ({ product }) => {
  const { openProduct, setIsSearchOpen } = useStore();
  const [imageError, setImageError] = useState(false);
  const discounted = hasDiscount(product);

  return (
    <button
      type="button"
      onClick={() => {
        setIsSearchOpen(false);
        openProduct(product.id);
      }}
      className="w-full flex items-center gap-4 p-2.5 text-left hover:bg-[#F2EDE4] transition-colors cursor-pointer"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#F2EDE4] rounded-[2px] overflow-hidden flex items-center justify-center">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span className="px-2 text-center text-[11px] text-[#7A6E5E] line-clamp-3">
            {product.name}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <span className="text-[10px] tracking-[0.18em] uppercase font-medium text-[#9E917E]">
          {product.brand}
        </span>
        <h3 className="font-editorial text-base sm:text-lg leading-snug text-[#1A1816] line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-[15px] font-semibold font-mono tabular-nums">
            {formatBRL(product.price)}
          </span>
          {discounted && product.listPrice && (
            <>
              <span className="text-[12px] line-through font-mono tabular-nums text-[#A69B8D]">
                {formatBRL(product.listPrice)}
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white bg-[#8C3A27] px-1.5 py-0.5">
                -{product.discountPercentage}%
              </span>
            </>
          )}
        </div>

        <p className="text-[11px] mt-0.5 text-[#7A6E5E]">
          ou 3x de {formatBRL(product.price / 3)} sem juros
        </p>
      </div>
    </button>
  );
};

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, searchTerm, setSearchTerm } = useStore();

  const results = useMemo(() => searchProducts(searchTerm), [searchTerm]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSearchOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-search-root]')) setIsSearchOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen || !searchTerm.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-10 mt-2 bg-[#FBF9F5] shadow-2xl max-h-[70vh] overflow-y-auto">
      {results.length ? (
        <>
          <p className="px-5 pt-4 text-[11px] tracking-widest uppercase text-[#9E917E]">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          </p>
          <div className="p-2 divide-y divide-[#ECE7DC]">
            {results.map((product) => (
              <SearchResultRow key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-[#7A6E5E] font-light">
            Nada encontrado para “{searchTerm}”. Tente outro termo.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsSearchOpen(false);
            }}
            className="mt-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8C3A27] hover:text-[#5A3210] cursor-pointer"
          >
            Limpar busca
          </button>
        </div>
      )}
    </div>
  );
};
