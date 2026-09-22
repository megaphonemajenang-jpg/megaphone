import { X, Trash2, ShoppingBag, ArrowRight, UserCheck } from 'lucide-react';
import { Product, Customer } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: Customer | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedCheckout: () => void;
  onOpenAuth: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  onOpenAuth,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-600" />
            <h2 className="font-extrabold text-stone-900 text-base">Keranjang Belanja</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {cartItems.reduce((acc, it) => acc + it.quantity, 0)} barang
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mb-3" />
              <p className="font-bold text-stone-700 text-sm">Keranjang Anda Masih Kosong</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Pilih handphone atau aksesoris pilihan Anda dari Megaphone Majenang sekarang.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-white p-1 border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-stone-400 text-center font-bold">MM</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-stone-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs font-black text-red-600 mt-0.5">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </p>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="inline-flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 font-bold text-xs text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            Math.min(item.product.stock, item.quantity + 1)
                          )
                        }
                        className="px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Hapus barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Subtotal Belanja</span>
              <span className="font-extrabold text-stone-900 text-base">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Requirement Notice: Pembeli wajib bikin akun / login untuk checkout */}
            {!customer ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>Wajib Masuk / Daftar Akun</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Untuk melanjutkan checkout, silakan buat akun dengan nama dan nomor WhatsApp Anda agar data pesanan & konfirmasi COD Cilacap terorganisir aman.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Masuk / Daftar Akun Sekarang
                </button>
              </div>
            ) : (
              <button
                id="proceed-checkout-btn"
                onClick={onProceedCheckout}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut Checkout ({customer.name})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
