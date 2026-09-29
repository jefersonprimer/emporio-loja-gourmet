import React from 'react';
import { Instagram } from 'lucide-react';
import { catalogMeta } from '../data/catalog';
import { categorySections } from '../data/catalog';
import { StoreMap } from './StoreMap';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useStore } from '../context/StoreContext';
import { createWhatsAppLink } from '../utils/format';

export const Footer: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-[#39050B] text-[#DDD4C5] mt-10">
      <StoreMap />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <img
            src="/logo.png"
            alt="Cacau Show Store"
            className="h-20 w-auto object-contain"
          />
          <p className="mt-3 text-sm font-light leading-relaxed text-[#C7BCA9]">
            Vitrine de {catalogMeta.total} produtos coletados do site oficial do Cacau Show.
            Os pedidos são fechados com a loja pelo WhatsApp.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <a
              href={createWhatsAppLink(
                storeSettings.whatsappNumber,
                'Olá! Vim pelo catálogo online, poderia me ajudar?'
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <WhatsAppIcon size={20} />
            </a>
            <a
              href={`https://www.instagram.com/${storeSettings.instagramHandle}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da loja"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all"
            >
              <Instagram size={18} />
            </a>
            <span className="text-sm font-light text-[#C7BCA9]">
              {storeSettings.whatsappDisplay}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-[#D7C4A5] font-semibold">
            Categorias
          </h4>
          <ul className="mt-4 space-y-2">
            {categorySections.slice(0, 6).map((section) => (
              <li key={section.id} className="text-sm font-light">
                {section.title}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase text-[#D7C4A5] font-semibold">
            Dados
          </h4>
          <p className="mt-4 text-sm font-light text-[#C7BCA9]">
            Fonte: {catalogMeta.source.replace('https://', '')}
            <br />
            Atualizado em{' '}
            {new Date(catalogMeta.generatedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-[11px] tracking-widest uppercase text-white/40">
          Catálogo demonstrativo · imagens e preços pertencem ao Cacau Show
        </p>
      </div>
    </footer>
  );
};
