import React from 'react';
import { useStore } from '../context/StoreContext';
import { Instagram } from 'lucide-react';

const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3543.5584793342173!2d-53.398813125149026!3d-27.358268711966353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94fb9f8f12451b41%3A0xd3cb1fa5424f2472!2sEmp%C3%B3rio%20Loja%20Gourmet!5e0!3m2!1sen!2sbr!4v1790639003799!5m2!1sen!2sbr';

const MAP_LINK_URL = 'https://www.google.com/maps/search/?api=1&query=Emp%C3%B3rio+Loja+Gourmet';

export const StoreMap: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
        <div>
          <h3 className="font-editorial text-2xl text-white">Onde estamos</h3>
          <p className="mt-3 text-sm font-light leading-relaxed text-[#C7BCA9]">
            Retire seu pedido na loja ou combine a entrega com a gente pelo WhatsApp.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <a
              href={MAP_LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#D7C4A5] hover:text-white transition-colors"
            >
              Abrir rota no Google Maps
            </a>
            <a
              href={`https://www.instagram.com/${storeSettings.instagramHandle}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da loja"
              className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#D7C4A5] hover:text-white transition-colors"
            >
              <Instagram size={14} />
              @{storeSettings.instagramHandle}
            </a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="w-full aspect-video lg:aspect-[16/7] border border-white/10 overflow-hidden">
            <iframe
              title="Mapa da Empório Loja Gourmet"
              src={MAP_EMBED_URL}
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreMap;
