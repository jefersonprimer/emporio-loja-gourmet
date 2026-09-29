import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cartTotalItems } from '../utils/format';
import { categorySections } from '../data/catalog';
import { TopBar } from './TopBar';
import { SearchOverlay } from './SearchOverlay';

export const Header: React.FC = () => {
  const { view, navigate, openCategory, setIsCartOpen, setIsSearchOpen, searchTerm, setSearchTerm, cart } =
    useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cartTotalItems(cart);

  const go = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <>
      <TopBar />
      <header className="sticky top-0 z-30 bg-[#39050B]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:h-20 sm:py-0 flex flex-wrap items-center justify-between gap-2.5 sm:gap-6">
          <button
            type="button"
            onClick={() => go(() => navigate('home'))}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <img
              src="/logo.png"
              alt="Cacau Show Store"
              className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
            />
          </button>

          <div data-search-root className="relative z-40 order-last lg:order-none basis-full lg:basis-auto lg:flex-1 lg:max-w-3xl">
            <div className="w-full h-11 sm:h-12 px-4 sm:px-5 flex items-center gap-3 rounded-full bg-white/5 border border-white/15 focus-within:border-white/40 transition-colors">
              <Search size={17} className="text-[#A3885C] shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchTerm.trim()) setIsSearchOpen(true);
                }}
                placeholder="Buscar por chocolate, trufa, biscoito, marca..."
                aria-label="Buscar produtos"
                className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-[#8C8175]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setIsSearchOpen(false);
                  }}
                  aria-label="Limpar busca"
                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <SearchOverlay />
          </div>

          <div className="flex items-center gap-1 text-[#DDD4C5] shrink-0">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir sacola"
              className="relative w-10 h-10 flex items-center justify-center hover:bg-white/10 cursor-pointer"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#8C3A27] text-white text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center hover:bg-white/10 cursor-pointer"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <nav className="hidden lg:flex items-center justify-center gap-7 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('catalog')}
            className={`py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer ${
              view === 'catalog'
                ? 'text-[#D7C4A5] border-b border-[#D7C4A5]'
                : 'text-[#C7BCA9] hover:text-[#D7C4A5]'
            }`}
          >
            Catálogo
          </button>
          {categorySections.slice(0, 5).map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => go(() => openCategory(section.id))}
              className={`py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer ${
                view === 'category'
                  ? 'text-[#D7C4A5] border-b border-[#D7C4A5]'
                  : 'text-[#C7BCA9] hover:text-[#D7C4A5]'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#39050B] px-4 py-3 max-h-[70vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => go(() => navigate('catalog'))}
            className="block w-full text-left py-2.5 text-xs font-semibold tracking-[0.16em] uppercase text-white"
          >
            Catálogo completo
          </button>
          {categorySections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => go(() => openCategory(section.id))}
              className="block w-full text-left py-2.5 text-xs font-semibold tracking-[0.16em] uppercase text-[#C7BCA9]"
            >
              {section.title}
            </button>
          ))}
        </div>
      )}
    </header>
    </>
  );
};
