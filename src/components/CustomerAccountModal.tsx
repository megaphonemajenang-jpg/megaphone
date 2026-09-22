import { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  MapPin,
  Lock,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  Save,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Customer, Order, StoreSettings } from '../types';
import { fetchCustomerOrders, updateCustomerProfile, resetCustomerPassword } from '../lib/api';

interface CustomerAccountModalProps {
  isOpen: boolean;
  initialTab?: 'orders' | 'address' | 'password';
  customer: Customer;
  storeSettings: StoreSettings;
  onClose: () => void;
  onCustomerUpdated: (customer: Customer) => void;
}

export function CustomerAccountModal({
  isOpen,
  initialTab = 'orders',
  customer,
  storeSettings,
  onClose,
  onCustomerUpdated,
}: CustomerAccountModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'password'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address state
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
  const [addressSaved, setAddressSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab, customer.id, customer.whatsapp]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchCustomerOrders(customer.id, customer.whatsapp);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddressSaved(false);
    try {
      const updatedCust = await updateCustomerProfile({
        customerId: customer.id,
        name: customer.name,
        address: {
          recipientName: recipientName.trim(),
          whatsapp: whatsapp.trim(),
          fullAddress: fullAddress.trim(),
          district,
          city: storeSettings.city || 'Kabupaten Cilacap',
          notes: notes.trim(),
        },
      });
      onCustomerUpdated(updatedCust);
      setAddressSaved(true);
      setTimeout(() => setAddressSaved(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan alamat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await resetCustomerPassword({
        whatsapp: customer.whatsapp,
        currentPassword,
        newPassword,
      });
      setPasswordMsg(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah sandi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'menunggu_konfirmasi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Menunggu Konfirmasi Admin
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
            <Clock className="w-3 h-3" />
            Pesanan Sedang Diproses
          </span>
        );
      case 'dikirim':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" />
            Sedang Dikirim / Siap Diambil
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
            Dibatalkan
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900">Akun Pembeli</h2>
            <p className="text-xs text-stone-500 font-medium">
              {customer.name} • {customer.whatsapp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cek Pesanan ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`pb-3 px-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'address'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Pengaturan Alamat</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-3 text-xs font-bold transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'password'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Pengaturan Ulang Sandi</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: CEK PESANAN */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  Memuat riwayat pesanan Anda...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 text-stone-300 mx-auto mb-2" />
                  <p className="font-bold text-stone-700 text-sm">Belum Ada Pesanan</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Pesanan handphone & aksesoris yang Anda checkout akan muncul di sini secara real-time.
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                      <div>
                        <span className="font-mono text-xs font-black text-stone-900">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[11px] text-stone-400 ml-2">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-700">
                          <span>
                            {it.productName} <span className="text-stone-400 font-bold">x{it.quantity}</span>
                          </span>
                          <span className="font-semibold">
                            Rp {(it.price * it.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Address & Payment Info */}
                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-stone-700">Metode: </span>
                        <span className="uppercase font-mono font-bold text-stone-800">
                          {order.paymentMethod === 'cod'
                            ? 'COD Kab. Cilacap'
                            : order.paymentMethod === 'cash'
                            ? 'Cash di Toko'
                            : 'Transfer Bank'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500">Total: </span>
                        <span className="text-sm font-black text-red-600">
                          Rp {order.total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex justify-end">
                      <a
                        href={`https://wa.me/${storeSettings.whatsapp.replace(/[^0-9]/g, '').startsWith('0') ? '62' + storeSettings.whatsapp.replace(/[^0-9]/g, '').slice(1) : storeSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Megaphone Majenang, saya ingin menanyakan status pesanan saya dengan No. Invoice *${order.invoiceNumber}*`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Admin WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PENGATURAN ALAMAT */}
          {activeTab === 'address' && (
            <form onSubmit={handleSaveAddress} className="space-y-4">
              {addressSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alamat pengiriman berhasil disimpan! Akan otomatis terisi saat checkout.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Nama Penerima
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
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    No. WhatsApp Penerima
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
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Kecamatan (Wilayah Kabupaten Cilacap & Sekitarnya)
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
                  <option value="Lainnya">Kecamatan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Alamat Lengkap (Desa / RT / RW / Nama Jalan / No Rumah)
                </label>
                <textarea
                  required
                  rows={3}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Contoh: Jl. Diponegoro RT 01 RW 04, Dekat Alun-alun Majenang..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Catatan Patokan Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Pagar hitam depan ruko..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan Alamat'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: PENGATURAN ULANG SANDI */}
          {activeTab === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4 max-w-md mx-auto">
              {passwordMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordMsg}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : 'Perbarui Kata Sandi'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
