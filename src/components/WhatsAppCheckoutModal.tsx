import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildOrderMessage, cartSubtotal, createWhatsAppLink, formatBRL } from '../utils/format';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CheckoutCustomerData } from '../types';

const emptyForm: CheckoutCustomerData = {
  fullName: '',
  whatsapp: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  deliveryMethod: 'shipping',
  notes: '',
};

const fieldClass =
  'w-full px-3 py-2.5 bg-white border border-[#D9D0C0] text-sm text-[#1A1816] outline-none focus:border-[#A3885C]';

export const WhatsAppCheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, storeSettings } = useStore();
  const [form, setForm] = useState<CheckoutCustomerData>(emptyForm);

  if (!isCheckoutOpen || cart.length === 0) return null;

  const update = (field: keyof CheckoutCustomerData, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const subtotal = cartSubtotal(cart);
  const message = buildOrderMessage(cart, form, storeSettings.storeName);
  const checkoutLink = createWhatsAppLink(storeSettings.whatsappNumber, message);

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto bg-black/55 px-4 py-8">
      <div className="bg-[#FBF9F5] w-full max-w-lg rounded-[2px] shadow-2xl">
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#ECE7DC]">
          <h2 className="font-editorial text-xl text-[#1A1816]">Finalizar pedido</h2>
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Fechar"
            className="w-9 h-9 flex items-center justify-center hover:bg-[#F2EDE4] cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-[#F2EDE4] px-4 py-3 text-sm flex items-center justify-between">
            <span className="text-[#574E43]">
              {cart.length} {cart.length === 1 ? 'item' : 'itens'}
            </span>
            <span className="font-semibold font-mono tabular-nums">
              {formatBRL(subtotal)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="sm:col-span-2 block">
              <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                Nome completo
              </span>
              <input
                className={`${fieldClass} mt-1`}
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
                placeholder="Como podemos te chamar?"
              />
            </label>

            <label className="block">
              <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">WhatsApp</span>
              <input
                className={`${fieldClass} mt-1`}
                value={form.whatsapp}
                onChange={(event) => update('whatsapp', event.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>

            <label className="block">
              <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">CEP</span>
              <input
                className={`${fieldClass} mt-1`}
                value={form.cep}
                onChange={(event) => update('cep', event.target.value)}
                placeholder="00000-000"
              />
            </label>

            <div className="sm:col-span-2">
              <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                Entrega
              </span>
              <div className="mt-1 flex gap-4">
                {(
                  [
                    ['shipping', 'Receber em casa'],
                    ['pickup', 'Retirar no local'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={form.deliveryMethod === value}
                      onChange={() => update('deliveryMethod', value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {form.deliveryMethod === 'shipping' && (
              <>
                <label className="sm:col-span-2 block">
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                    Endereço
                  </span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={form.street}
                    onChange={(event) => update('street', event.target.value)}
                    placeholder="Rua, avenida..."
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">Nº</span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={form.number}
                    onChange={(event) => update('number', event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                    Complemento
                  </span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={form.complement}
                    onChange={(event) => update('complement', event.target.value)}
                    placeholder="Apto, bloco..."
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                    Bairro
                  </span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={form.neighborhood}
                    onChange={(event) => update('neighborhood', event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                    Cidade
                  </span>
                  <input
                    className={`${fieldClass} mt-1`}
                    value={form.city}
                    onChange={(event) => update('city', event.target.value)}
                  />
                </label>
              </>
            )}

            <label className="sm:col-span-2 block">
              <span className="text-[11px] tracking-widest uppercase text-[#7A6E5E]">
                Observações
              </span>
              <textarea
                rows={2}
                className={`${fieldClass} mt-1 resize-none`}
                value={form.notes}
                onChange={(event) => update('notes', event.target.value)}
                placeholder="Ex.: entregar após as 18h, embrulhar para presente..."
              />
            </label>
          </div>
        </div>

        <footer className="px-6 py-4 border-t border-[#ECE7DC] flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
            className="sm:w-1/3 py-3.5 border border-[#D9D0C0] text-xs font-semibold tracking-[0.16em] uppercase hover:bg-[#F2EDE4] cursor-pointer"
          >
            Continuar comprando
          </button>
          <a
            href={checkoutLink}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:w-2/3 py-3.5 bg-[#39050B] text-white hover:bg-[#5A0912] text-center text-xs font-semibold tracking-[0.16em] uppercase transition-colors inline-flex items-center justify-center gap-2"
          >
            <WhatsAppIcon size={15} />
            Enviar pedido no WhatsApp
          </a>
        </footer>
      </div>
    </div>
  );
};
