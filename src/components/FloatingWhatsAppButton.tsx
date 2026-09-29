import React from 'react';
import { useStore } from '../context/StoreContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { createWhatsAppLink } from '../utils/format';

export const FloatingWhatsAppButton: React.FC = () => {
  const { storeSettings } = useStore();
  const message = 'Olá! Vim pelo catálogo online, poderia me ajudar?';

  return (
    <a
      href={createWhatsAppLink(storeSettings.whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
};
