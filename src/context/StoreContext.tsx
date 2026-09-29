import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Product, StoreSettings } from '../types';
import { initialStoreSettings, products } from '../data/catalog';

export type View = 'home' | 'product' | 'category' | 'catalog';

interface Toast {
  id: string;
  message: string;
}

interface StoreContextValue {
  products: Product[];
  storeSettings: StoreSettings;
  cart: CartItem[];
  favorites: string[];
  toasts: Toast[];

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  addToast: (message: string) => void;
  dismissToast: (id: string) => void;

  view: View;
  navigate: (view: View) => void;
  openProduct: (productId: string) => void;
  openCategory: (sectionId: string) => void;
  selectedProduct: Product | null;
  selectedSectionId: string | null;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_KEY = 'cacau_show_cart_v1';
const FAVORITES_KEY = 'cacau_show_favorites_v1';
const SETTINGS_KEY = 'cacau_show_settings_v2';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => ({
    ...initialStoreSettings,
    ...readStorage<Partial<StoreSettings>>(SETTINGS_KEY, {}),
  }));
  const [cart, setCart] = useState<CartItem[]>(() => readStorage<CartItem[]>(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() =>
    readStorage<string[]>(FAVORITES_KEY, [])
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [view, setView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(storeSettings));
  }, [storeSettings]);

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((current) => [...current, { id, message }]);
      window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast]
  );

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      const itemId = `${product.id}-un`;
      setCart((current) => {
        const existing = current.find((item) => item.id === itemId);
        if (existing) {
          return current.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [...current, { id: itemId, product, quantity }];
      });
      addToast(`${product.name} adicionado à sacola.`);
      setIsCartOpen(true);
    },
    [addToast]
  );

  const removeFromCart = useCallback((itemId: string) => {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }, []);

  const updateCartQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart((current) =>
        current.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (productId: string) => {
      setFavorites((current) => {
        const exists = current.includes(productId);
        addToast(exists ? 'Removido dos favoritos.' : 'Salvo nos favoritos.');
        return exists ? current.filter((id) => id !== productId) : [...current, productId];
      });
    },
    [addToast]
  );

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  const navigate = useCallback(
    (next: View) => {
      setView(next);
      setIsSearchOpen(false);
      scrollTop();
    },
    [scrollTop]
  );

  const openProduct = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);
      setView('product');
      setIsCartOpen(false);
      setIsSearchOpen(false);
      scrollTop();
    },
    [scrollTop]
  );

  const openCategory = useCallback(
    (sectionId: string) => {
      setSelectedSectionId(sectionId);
      setView('category');
      scrollTop();
    },
    [scrollTop]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [selectedProductId]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      storeSettings,
      cart,
      favorites,
      toasts,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      addToast,
      dismissToast,
      view,
      navigate,
      openProduct,
      openCategory,
      selectedProduct,
      selectedSectionId,
      isCartOpen,
      setIsCartOpen,
      isSearchOpen,
      setIsSearchOpen,
      searchTerm,
      setSearchTerm,
      isCheckoutOpen,
      setIsCheckoutOpen,
    }),
    [
      storeSettings,
      cart,
      favorites,
      toasts,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleFavorite,
      isFavorite,
      addToast,
      dismissToast,
      view,
      navigate,
      openProduct,
      openCategory,
      selectedProduct,
      selectedSectionId,
      isCartOpen,
      isSearchOpen,
      searchTerm,
      isCheckoutOpen,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore precisa estar dentro de StoreProvider');
  return context;
}
