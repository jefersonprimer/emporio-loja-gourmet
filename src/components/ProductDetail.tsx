import React, { useEffect, useState } from 'react';
import { ChevronLeft, Minus, Plus, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, hasDiscount } from '../utils/format';

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { addToCart, isFavorite, toggleFavorite, navigate, openCategory } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
  }, [product.id]);

  const gallery = product.images.length ? product.images : product.image ? [product.image] : [];
  const discounted = hasDiscount(product);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <button
        type="button"
        onClick={() => navigate('home')}
        className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] cursor-pointer mb-8"
      >
        <ChevronLeft size={14} />
        Voltar para a home
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Galeria */}
        <div>
          <div className="aspect-square bg-[#F2EDE4] rounded-[2px] flex items-center justify-center p-6">
            {gallery[activeImage] ? (
              <img
                src={gallery[activeImage]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-[#7A6E5E]">{product.name}</span>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 bg-[#F2EDE4] border rounded-[2px] flex items-center justify-center p-1.5 transition-colors cursor-pointer ${
                    index === activeImage ? 'border-[#A3885C]' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#9E917E]">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => product.collection && openCategory(product.collection)}
              className="hover:text-[#8C3A27] cursor-pointer"
            >
              {product.category}
            </button>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl leading-tight mt-2 text-[#1A1816]">
            {product.name}
          </h1>

          {product.rating && (
            <div className="mt-3 flex items-center gap-1.5">
              <Star size={14} className="fill-[#A3885C] text-[#A3885C]" />
              <span className="text-xs text-[#574E43]">{product.rating.toFixed(1)}</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold font-mono tabular-nums text-[#1A1816]">
              {formatBRL(product.price)}
            </span>
            {discounted && product.listPrice && (
              <span className="text-base line-through font-mono tabular-nums text-[#A69B8D]">
                {formatBRL(product.listPrice)}
              </span>
            )}
            {discounted && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#8C3A27] px-2 py-0.5">
                -{product.discountPercentage}%-off
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#7A6E5E]">
            em até 3x de {formatBRL(product.price / 3)} sem juros
          </p>

          {product.description && (
            <p className="mt-6 text-sm text-[#574E43] font-light leading-relaxed">
              {product.description}
            </p>
          )}

          {product.categoryPath.length > 1 && (
            <p className="mt-4 text-[11px] tracking-widest uppercase text-[#9E917E]">
              {product.categoryPath.join(' › ')}
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center border border-[#D9D0C0] rounded-[1px]">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
                aria-label="Diminuir quantidade"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-mono tabular-nums text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="w-10 h-11 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
                aria-label="Aumentar quantidade"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addToCart(product, quantity)}
              className="flex-1 h-11 bg-[#39050B] text-white hover:bg-[#5A0912] text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
            >
              Adicionar à sacola · {formatBRL(product.price * quantity)}
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label="Favoritar"
              className="w-11 h-11 border border-[#D9D0C0] flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
            >
              <Star
                size={16}
                className={isFavorite(product.id) ? 'fill-[#A3885C] text-[#A3885C]' : ''}
              />
            </button>
          </div>

          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-[11px] tracking-[0.16em] uppercase text-[#574E43] hover:text-[#8C3A27] underline underline-offset-4"
            >
              Ver produto no site do Cacau Show
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
