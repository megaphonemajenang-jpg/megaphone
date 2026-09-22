import { useState } from 'react';
import { X, ShoppingBag, MessageCircle, ShieldCheck, Truck, Check, Smartphone } from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  storeSettings: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  storeSettings,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleWhatsAppInquiry = () => {
    const cleanPhone = storeSettings.whatsapp.replace(/[^0-9]/g, '');
    const standardPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(
      `Halo MEGAPHONE MAJENANG, saya tertarik dan ingin menanyakan produk:\n` +
      `*${product.name}*\n` +
      `Harga: Rp ${product.price.toLocaleString('id-ID')}\n\n` +
      `Apakah stoknya masih tersedia untuk pengantaran COD wilayah Cilacap / ambil di toko Majenang?`
    );
    window.open(`https://wa.me/${standardPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-sm ${
                product.category === 'handphone'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-800 text-stone-100'
              }`}
            >
              {product.category === 'handphone' ? 'Handphone' : 'Aksesoris'}
            </span>
            <span className="text-xs text-stone-400 font-medium">Megaphone Majenang</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Image */}
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-stone-200">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-stone-400">
                  {product.category === 'handphone' ? (
                    <Smartphone className="w-20 h-20 mx-auto stroke-1" />
                  ) : (
                    <ShoppingBag className="w-20 h-20 mx-auto stroke-1" />
                  )}
                  <p className="text-xs mt-2">Megaphone Majenang</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-snug">
                  {product.name}
                </h2>

                <div className="mt-3">
                  <span className="text-2xl font-black text-red-600">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="ml-2 text-sm text-stone-400 line-through">
                      Rp {product.originalPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Ketersediaan:</span>
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-rose-600">Habis</span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600">
                      Tersedia ({product.stock} unit)
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="mt-6 pt-4 border-t border-stone-100">
                  <label className="text-xs font-bold text-stone-700 block mb-2">
                    Jumlah Pembelian:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-stone-300 rounded-xl overflow-hidden bg-stone-50">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 font-bold text-sm text-stone-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 transition-colors font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-stone-400">
                      Subtotal: Rp {(product.price * quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-2 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 mb-2">Deskripsi Produk</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specs && product.specs.length > 0 && (
            <div className="pt-2 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 mb-2">Spesifikasi Detail</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.specs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700"
                  >
                    <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600 shrink-0" />
              <span>Bisa COD Kab. Cilacap & sekitarnya</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Produk Terjamin Asli & Berkualitas</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleWhatsAppInquiry}
            className="px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Tanya via WhatsApp</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              disabled={isOutOfStock}
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tambah Keranjang</span>
            </button>
            <button
              disabled={isOutOfStock}
              onClick={() => {
                onBuyNow(product, quantity);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Beli Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
