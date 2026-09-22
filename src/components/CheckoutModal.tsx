import { useState } from 'react';
import {
  X,
  Truck,
  Building,
  CreditCard,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Customer, StoreSettings, PaymentMethod, Order } from '../types';
import { createOrder } from '../lib/api';
import { firestoreSyncOrder } from '../lib/firebase';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface CheckoutModalProps {
  customer: Customer;
  cartItems: CartItem[];
  storeSettings: StoreSettings;
  onClose: () => void;
  onOrderSuccess: (order: Order, whatsappUrl: string) => void;
}

export function CheckoutModal({
  customer,
  cartItems,
  storeSettings,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [recipientName, setRecipientName] = useState(
    customer.address?.recipientName || customer.name
  );
  const [whatsapp, setWhatsapp] = useState(
    customer.address?.whatsapp || customer.whatsapp
  );
  const [district, setDistrict] = useState(
    customer.address?.district || storeSettings.codAreas[0] || 'Majenang'
  );
  const [fullAddress, setFullAddress] = useState(
    customer.address?.fullAddress || ''
  );
  const [notes, setNotes] = useState(customer.address?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [waLink, setWaLink] = useState('');

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.product.price * it.quantity,
    0
  );
  const deliveryFee = paymentMethod === 'cod' ? (storeSettings.codFee || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentMethod !== 'cash' && !fullAddress.trim()) {
      setErrorMsg('Alamat lengkap pengiriman di Cilacap wajib diisi untuk pengiriman COD atau Transfer!');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      }));

      const payload = {
        customerId: customer.id,
        customerName: recipientName.trim() || customer.name,
        customerWhatsapp: whatsapp.trim() || customer.whatsapp,
        items: itemsPayload,
        paymentMethod,
        deliveryAddress: {
          recipientName: recipientName.trim() || customer.name,
          whatsapp: whatsapp.trim() || customer.whatsapp,
          fullAddress: paymentMethod === 'cash' ? 'Ambil di Toko Megaphone Majenang' : fullAddress.trim(),
          district: paymentMethod === 'cash' ? 'Majenang' : district,
          city: storeSettings.city || 'Kabupaten Cilacap',
          notes: notes.trim(),
        },
        notes: notes.trim(),
      };

      const result = await createOrder(payload);
      // Sync to Firestore in real-time
      try {
        await firestoreSyncOrder(result.order);
      } catch (e) {
        console.warn('Firestore sync order background fallback:', e);
      }
      setCompletedOrder(result.order);
      setWaLink(result.whatsappUrl);
      onOrderSuccess(result.order, result.whatsappUrl);

      // Auto-open WhatsApp in a new tab
      try {
        window.open(result.whatsappUrl, '_blank');
      } catch {
        // Pop-up blockers might prevent window.open, handled gracefully in UI
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-stone-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-extrabold text-stone-900">Pesanan Berhasil Dibuat!</h3>
          <p className="text-xs text-stone-500 font-mono mt-1">
            No. Invoice: <span className="font-bold text-stone-800">{completedOrder.invoiceNumber}</span>
          </p>

          <div className="my-5 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Pembeli:</span>
              <span className="font-bold text-stone-800">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">No. WhatsApp:</span>
              <span className="font-bold text-stone-800 font-mono">{completedOrder.customerWhatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Metode:</span>
              <span className="font-bold text-stone-800 uppercase">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2">
              <span className="text-stone-700 font-bold">Total Pembayaran:</span>
              <span className="font-extrabold text-red-600 text-sm">
                Rp {completedOrder.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Buka Chat WhatsApp Admin</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup & Cek Status Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-stone-900">
              Checkout & Pengantaran Pesanan
            </h2>
            <p className="text-xs text-stone-500">
              MEGAPHONE MAJENANG • Wilayah Cilacap & Sekitarnya
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Confirmation */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-800 mb-1">
              <span>Akun Pembeli Terverifikasi</span>
              <span className="text-emerald-600 font-medium">✓ Siap Order</span>
            </div>
            <p className="text-stone-600">
              Nama: <span className="font-semibold text-stone-900">{customer.name}</span>
            </p>
            <p className="text-stone-600 font-mono">
              WhatsApp: <span className="font-semibold text-stone-900">{customer.whatsapp}</span>
            </p>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-2">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Truck
                    className={`w-5 h-5 ${
                      paymentMethod === 'cod' ? 'text-red-600' : 'text-stone-400'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                    Populer
                  </span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                    COD Cilacap
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Bayar di Tempat</p>
                </div>
              </button>

              {/* Cash di Toko */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Building
                  className={`w-5 h-5 mb-1 ${
                    paymentMethod === 'cash' ? 'text-red-600' : 'text-stone-400'
                  }`}
                />
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                    Cash di Toko
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Ambil di Majenang</p>
                </div>
              </button>

              {/* Transfer Bank */}
              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'transfer'
                    ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 mb-1 ${
                    paymentMethod === 'transfer' ? 'text-red-600' : 'text-stone-400'
                  }`}
                />
                <div>
                  <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                    Transfer Bank
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">BCA / BRI Toko</p>
                </div>
              </button>
            </div>
          </div>

          {/* Transfer Bank Info Display */}
          {paymentMethod === 'transfer' && storeSettings.bankAccounts?.length > 0 && (
            <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 text-xs space-y-1.5">
              <p className="font-bold text-sky-950">Rekening Resmi Toko MEGAPHONE MAJENANG:</p>
              {storeSettings.bankAccounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-sky-100">
                  <span className="font-bold text-sky-900">{acc.bank}:</span>
                  <span className="font-mono font-extrabold text-stone-900">{acc.accountNumber}</span>
                  <span className="text-[11px] text-stone-500">a.n {acc.accountHolder}</span>
                </div>
              ))}
              <p className="text-[11px] text-sky-800">
                Setelah order, kirim bukti transfer ke WhatsApp admin untuk pemrosesan instan.
              </p>
            </div>
          )}

          {/* Cash info */}
          {paymentMethod === 'cash' && (
            <div className="p-3.5 bg-stone-100 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-stone-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                Alamat Toko Megaphone Majenang:
              </p>
              <p className="text-stone-600">{storeSettings.address}</p>
              <p className="text-[11px] text-stone-500">
                Pesanan Anda akan disiapkan dan bisa langsung diambil serta dibayar tunai di kasir toko.
              </p>
            </div>
          )}

          {/* Delivery Address Form (If COD or Transfer) */}
          {paymentMethod !== 'cash' && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                Alamat Pengiriman (Wilayah Kab. Cilacap & Sekitarnya):
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Nama Penerima:
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    No. WhatsApp Penerima:
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Kecamatan (Wilayah Cilacap):
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                >
                  {storeSettings.codAreas.map((area) => (
                    <option key={area} value={area}>
                      Kecamatan {area}
                    </option>
                  ))}
                  <option value="Lainnya (Sekitar Cilacap)">Kecamatan Lainnya (Sekitar Cilacap)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Alamat Lengkap (Desa / RT / RW / Jalan):
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Jl. Diponegoro RT 02 RW 03, Depan Lapangan Jenang..."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Catatan Pengiriman / Patokan Rumah (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Patokan: Pagar hijau / sebelah warung..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Order Summary Breakdown */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
            <h4 className="font-bold text-stone-900 mb-2">Ringkasan Pembayaran</h4>
            <div className="flex justify-between text-stone-600">
              <span>Subtotal Produk ({cartItems.reduce((a, b) => a + b.quantity, 0)} item):</span>
              <span className="font-semibold text-stone-900">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-stone-600">
                <span>Ongkir COD Wilayah Cilacap:</span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0 ? 'GRATIS' : `Rp ${deliveryFee.toLocaleString('id-ID')}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-stone-900 font-extrabold text-sm border-t border-stone-200 pt-2">
              <span>Total Pembayaran:</span>
              <span className="text-red-600 text-base">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              id="confirm-checkout-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>
                {isSubmitting
                  ? 'Menyimpan Pesanan & Menghubungkan WA...'
                  : 'Konfirmasi Pesanan & Kirim ke WhatsApp Admin'}
              </span>
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Pesanan otomatis tercatat di sistem toko dan WhatsApp admin langsung terhubung untuk konfirmasi instan.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
