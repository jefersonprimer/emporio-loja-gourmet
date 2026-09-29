import React from 'react';
import { Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppLink } from '../utils/format';
import { WhatsAppIcon } from './WhatsAppIcon';

const SUPPLIER_MESSAGE =
  'Olá! Quero ser fornecedor da loja. Gostaria de conhecer as condições de atendimento para meus produtos.';

export const TopBar: React.FC = () => {
  const { storeSettings } = useStore();

  return (
    <div className="bg-[#39050B] text-[#E5CFCB] text-[10px] tracking-[0.14em] uppercase border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
        <div className="hidden md:flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={11} className="text-[#A3885C]" />
            Seg a sex 8:30h às 12h · 13:30h às 18:30h
          </span>
          <span className="text-white/20">|</span>
          <span>Sáb 8:30h às 12h · 13:30h às 16:00h</span>
        </div>

        <span className="md:hidden inline-flex items-center gap-1.5">
          <Clock size={11} className="text-[#A3885C]" />
          Seg a sex 8:30h às 18:30h
        </span>

        <a
          href={createWhatsAppLink(storeSettings.whatsappNumber, SUPPLIER_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#25D366] hover:text-white transition-colors"
        >
          <WhatsAppIcon size={11} />
          Quero ser Fornecedor
        </a>
      </div>
    </div>
  );
};

export default TopBar;
