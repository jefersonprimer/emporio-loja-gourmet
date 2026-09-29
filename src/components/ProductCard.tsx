import React, { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, hasDiscount } from '../utils/format';

interface ProductCardProps {
  product: Product;
  tone?: 'light' | 'dark';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, tone = 'light' }) => {
  const { addToCart, isFavorite, toggleFavorite, openProduct } = useStore();
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const isDark = tone === 'dark';
  const favorited = isFavorite(product.id);
  const discounted = hasDiscount(product);
  const installment = product.price / 3;

  const handleAdd = (event: React.MouseEvent) => {
    event.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article
      onClick={() => openProduct(product.id)}
      className={`group relative flex flex-col h-full cursor-pointer ${
        isDark ? 'text-white' : 'text-[#1A1816]'
      }`}
    >
      <div
        className={`relative aspect-square w-full overflow-hidden rounded-[2px] ${
          isDark ? 'bg-white/5' : 'bg-[#F2EDE4]'
        }`}
      >
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center p-4 text-center text-xs ${
              isDark ? 'text-white/60' : 'text-[#7A6E5E]'
            }`}
          >
            {product.name}
          </div>
        )}

        {discounted && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-white bg-[#8C3A27] px-2 py-0.5">
            -{product.discountPercentage}%
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleFavorite(product.id);
          }}
          aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? 'bg-white/15 hover:bg-white/25' : 'bg-white/85 hover:bg-white'
          }`}
        >
          <Heart size={15} className={favorited ? 'fill-[#A3885C] text-[#A3885C]' : ''} />
        </button>
      </div>

      <div className="pt-3 flex flex-col flex-grow">
        <span
          className={`text-[10px] tracking-[0.18em] uppercase font-medium ${
            isDark ? 'text-[#C7BCA9]' : 'text-[#9E917E]'
          }`}
        >
          {product.brand}
        </span>

        <h3
          className={`font-editorial text-lg leading-snug mt-0.5 line-clamp-2 ${
            isDark ? 'text-white' : 'text-[#1A1816]'
          }`}
        >
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-[15px] font-semibold font-mono tabular-nums">
            {formatBRL(product.price)}
          </span>
          {discounted && product.listPrice && (
            <span
              className={`text-[12px] line-through font-mono tabular-nums ${
                isDark ? 'text-white/50' : 'text-[#A69B8D]'
              }`}
            >
              {formatBRL(product.listPrice)}
            </span>
          )}
        </div>

        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/50' : 'text-[#7A6E5E]'}`}>
          ou 3x de {formatBRL(installment)} sem juros
        </p>

        <button
          type="button"
          onClick={handleAdd}
          className={`mt-3 w-full py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center justify-center gap-2 rounded-[1px] transition-colors cursor-pointer ${
            added
              ? 'bg-[#2F7D4F] text-white'
              : isDark
                ? 'bg-white text-[#1A1816] hover:bg-[#E8DFD0]'
                : 'bg-[#39050B] text-white hover:bg-[#5A0912]'
          }`}
        >
          <ShoppingBag size={14} />
          {added ? 'Adicionado' : 'Comprar'}
        </button>
      </div>
    </article>
  );
};
