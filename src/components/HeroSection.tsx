import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const HERO_IMAGE =
  'https://www.cacaushow.com.br/dw/image/v2/BFJD_PRD/on/demandware.static/-/Sites-CacauShow-Library/default/dw9a99cbb6/Home/Banner-Carrossel/enxoval_1264x530.png';

export const HeroSection: React.FC = () => {
  const { navigate, openCategory } = useStore();

  return (
    <section className="relative overflow-hidden bg-[#39050B] text-white">
      <div className="relative mx-auto w-full max-w-[1272px] min-h-[440px] sm:min-h-[480px] lg:min-h-[533px] flex items-end lg:items-center">
        <img
          src={HERO_IMAGE}
          alt="Banner Cacau Show"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-0">
          <div className="max-w-2xl">
            <span className="text-[11px] tracking-[0.35em] uppercase text-[#E5CFCB] font-semibold drop-shadow">
              Desde 2017
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] mt-4 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              Promovendo experiências e bons momentos
            </h1>
            <p className="mt-5 text-sm sm:text-base text-white/90 font-light max-w-xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
              Chocolate, trufas, biscoitos, cafeteria, presentes e a linha infantil. Monte sua sacola
              e feche o pedido direto pelo WhatsApp.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('catalog')}
                className="bg-[#FBF9F5] text-[#1A1816] hover:bg-[#E8DFD0] px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                Ver catálogo completo
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => openCategory('campanhas/infantis-cacau-show')}
                className="border border-white/50 hover:border-white hover:bg-white/10 px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
              >
                Dia das Crianças
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
