import { CartItem, CheckoutCustomerData, Product } from '../types';

export function formatBRL(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Preço efetivo do produto (o site já entrega o valor de venda em `price`). */
export function currentPrice(product: Product): number {
  return product.price;
}

export function hasDiscount(product: Product): boolean {
  return Boolean(product.listPrice && product.listPrice > product.price);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + currentPrice(item.product) * item.quantity, 0);
}

export function cartTotalItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function createWhatsAppLink(phoneNumber: string, message: string): string {
  return `https://wa.me/${cleanPhoneNumber(phoneNumber)}?text=${encodeURIComponent(message.trim())}`;
}

/** Monta a mensagem de pedido enviada para o WhatsApp da loja. */
export function buildOrderMessage(
  items: CartItem[],
  customer: Partial<CheckoutCustomerData>,
  storeName: string
): string {
  const itemsText = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name}\n  ${formatBRL(
          currentPrice(item.product) * item.quantity
        )} | ${item.product.url ?? 'sem link'}`
    )
    .join('\n');

  const city = [customer.city, customer.state].filter(Boolean).join('/');

  const deliveryLines = [
    customer.street && `Endereço: ${customer.street}, ${customer.number || 'S/N'}`,
    customer.complement && `Complemento: ${customer.complement}`,
    customer.neighborhood && `Bairro: ${customer.neighborhood}`,
    customer.cep && `CEP: ${customer.cep}`,
    city && `Cidade: ${city}`,
  ].filter(Boolean) as string[];

  const delivery =
    customer.deliveryMethod === 'pickup'
      ? 'Retirada no local'
      : deliveryLines.join('\n') || 'Entrega a combinar';

  const notes = customer.notes ? `\nObservações: ${customer.notes}` : '';

  return `Olá, ${storeName}! Vim pelo catálogo e quero fazer este pedido:

*PEDIDO*
${itemsText}

*Total do site: ${formatBRL(cartSubtotal(items))}*

*Cliente*
Nome: ${customer.fullName || '—'}
WhatsApp: ${customer.whatsapp || '—'}

*Entrega*
${delivery}${notes}

Pode me confirmar disponibilidade, valores e prazo de entrega?`;
}

/** Mensagem curta para tirar dúvida sobre um produto. */
export function buildProductInquiryMessage(product: Product): string {
  return `Olá! Tenho interesse no produto "${product.name}" (cód. ${product.sku}). Ainda está disponível?`;
}
