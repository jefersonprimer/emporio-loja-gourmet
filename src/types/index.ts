export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  /** Página original do produto no site do Cacau Show. */
  url: string | null;
  brand: string;
  /** Categoria principal exibida na vitrine. */
  category: string;
  subcategory: string | null;
  categoryPath: string[];
  /** Slug da coleção/campanha de onde o produto foi coletado. */
  collection: string | null;
  price: number;
  listPrice: number | null;
  discountPercentage: number;
  image: string | null;
  images: string[];
  rating: number | null;
  available: boolean;
  description: string | null;
}

export interface CatalogMeta {
  source: string;
  generatedAt: string;
  total: number;
  categories: Record<string, number>;
}

export interface CatalogFile {
  source: string;
  generatedAt: string;
  total: number;
  categories: Record<string, number>;
  products: Product[];
}

/** Uma vitrine de produtos com título próprio (usada nos carrosséis da home). */
export interface CategorySection {
  id: string;
  title: string;
  subtitle: string;
  products: Product[];
}

export interface CartItem {
  /** id único do item: productId + tamanho da embalagem */
  id: string;
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  storeName: string;
  instagramHandle: string;
  announcementText: string;
  showAnnouncement: boolean;
}

export interface CheckoutCustomerData {
  fullName: string;
  whatsapp: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryMethod: 'shipping' | 'pickup';
  notes?: string;
}
