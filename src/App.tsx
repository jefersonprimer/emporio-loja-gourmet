/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { CategoryView } from './components/CategoryView';
import { ProductDetail } from './components/ProductDetail';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppCheckoutModal } from './components/WhatsAppCheckoutModal';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { view, selectedProduct, toasts, dismissToast } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1A1816]">
      {/* Notificações */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="pointer-events-auto bg-[#39050B] text-[#FBF9F5] px-4 py-2.5 text-xs shadow-lg border border-[#5A0912] flex items-center gap-2 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#A3885C]" />
            {toast.message}
          </button>
        ))}
      </div>

      <Header />

      <main className="flex-grow">
        {view === 'home' && <HomeView />}
        {view === 'catalog' && <CatalogView />}
        {view === 'category' && <CategoryView />}
        {view === 'product' && selectedProduct && <ProductDetail product={selectedProduct} />}
        {view === 'product' && !selectedProduct && <HomeView />}
      </main>

      <Footer />

      <CartDrawer />
      <WhatsAppCheckoutModal />
      <FloatingWhatsAppButton />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
