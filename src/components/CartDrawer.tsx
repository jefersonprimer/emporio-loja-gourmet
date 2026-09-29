import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cartSubtotal, formatBRL } from '../utils/format';
import { WhatsAppIcon } from './WhatsAppIcon';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, updateCartQuantity, removeFromCart, setIsCheckoutOpen, openProduct } =
    useStore();

  const subtotal = cartSubtotal(cart);

  return (
    <>
      <div
        onClick={() => setIsCartOpen(false)}
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#FBF9F5] shadow-2xl flex flex-col transition-transform duration-300 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-[#ECE7DC]">
          <h2 className="font-editorial text-xl text-[#1A1816]">Sua sacola</h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Fechar sacola"
            className="w-9 h-9 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <ShoppingBag size={32} className="text-[#C2B6A3]" />
            <p className="text-sm text-[#7A6E5E] font-light">
              Sua sacola está vazia. Escolha um produto para começar o pedido.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => openProduct(item.product.id)}
                    className="w-20 h-20 bg-[#F2EDE4] rounded-[2px] flex items-center justify-center p-2 shrink-0 cursor-pointer"
                    aria-label={`Ver ${item.product.name}`}
                  >
                    <img
                      src={item.product.image ?? ''}
                      alt={item.product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] tracking-widest uppercase text-[#9E917E]">
                      {item.product.brand}
                    </p>
                    <p className="text-sm text-[#1A1816] leading-snug line-clamp-2 mt-0.5">
                      {item.product.name}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-[#D9D0C0]">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
                          aria-label="Diminuir"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-mono tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
                          aria-label="Aumentar"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-semibold font-mono tabular-nums">
                        {formatBRL(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remover item"
                    className="self-start w-8 h-8 flex items-center justify-center text-[#9E917E] hover:text-[#8C3A27] cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <footer className="border-t border-[#ECE7DC] px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.16em] uppercase text-[#7A6E5E]">Subtotal</span>
                <span className="text-lg font-semibold font-mono tabular-nums">
                  {formatBRL(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#9E917E]">
                Frete, disponibilidade e pagamento são confirmados com a loja no WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3.5 bg-[#39050B] text-white hover:bg-[#5A0912] text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon size={15} />
                Finalizar pedido pelo WhatsApp
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
};
