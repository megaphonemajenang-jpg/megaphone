import { useState } from 'react';
import {
  Search,
  MessageCircle,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ExternalLink,
  MapPin,
  Building,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { updateOrderStatus } from '../../lib/api';

interface AdminOrdersProps {
  orders: Order[];
  onOrderUpdated: (order: Order) => void;
}

export function AdminOrders({ orders, onOrderUpdated }: AdminOrdersProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    if (dateFilter && !order.createdAt.startsWith(dateFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchInvoice = order.invoiceNumber.toLowerCase().includes(q);
      const matchPhone = order.customerWhatsapp.includes(q);
      if (!matchName && !matchInvoice && !matchPhone) return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      onOrderUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status pesanan');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChatCustomerWhatsApp = (order: Order) => {
    const cleanPhone = order.customerWhatsapp.replace(/[^0-9]/g, '');
    const standardPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const text = encodeURIComponent(
      `Halo Kak *${order.customerName}*,\n` +
      `Kami dari *MEGAPHONE MAJENANG* terkait pesanan Anda:\n` +
      `No. Invoice: *${order.invoiceNumber}*\n` +
      `Total: Rp ${order.total.toLocaleString('id-ID')} (${order.paymentMethod.toUpperCase()})\n` +
      `Status Pesanan Saat Ini: *${order.status.toUpperCase().replace('_', ' ')}*\n\n` +
      `Apakah ada yang perlu kami bantu untuk proses pengantaran atau pengambilan barang Anda? Terima kasih.`
    );
    window.open(`https://wa.me/${standardPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Controls & Search */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filters */}
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
            { id: 'diproses', label: 'Diproses' },
            { id: 'dikirim', label: 'Dikirim' },
            { id: 'selesai', label: 'Selesai' },
            { id: 'dibatalkan', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-stone-400 hover:text-stone-700 underline cursor-pointer"
            >
              Reset
            </button>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama, invoice, WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
          <Clock className="w-12 h-12 stroke-1 text-stone-300 mx-auto mb-2" />
          <p className="font-bold text-stone-700 text-sm">Tidak Ada Pesanan Ditemukan</p>
          <p className="text-xs text-stone-400 mt-1">
            Pesanan dari pembeli akan muncul di sini secara real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {order.invoiceNumber}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                      order.status === 'menunggu_konfirmasi'
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : order.status === 'diproses'
                        ? 'bg-sky-100 text-sky-900'
                        : order.status === 'dikirim'
                        ? 'bg-purple-100 text-purple-900'
                        : order.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>

                  {/* WhatsApp Direct Action */}
                  <button
                    onClick={() => handleChatCustomerWhatsApp(order)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Hubungi Pelanggan via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi WA</span>
                  </button>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer info */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                  <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
                  <p className="text-stone-600 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span className="font-bold">{order.customerWhatsapp}</span>
                  </p>
                  <p className="text-[11px] text-stone-400">
                    ID: <span className="font-mono">{order.customerId}</span>
                  </p>
                </div>

                {/* Delivery info */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                  <div className="flex items-center gap-1 text-stone-800 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Tujuan (Kec. {order.deliveryAddress.district || 'Majenang'}):</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {order.deliveryAddress.fullAddress}
                  </p>
                  {order.deliveryAddress.notes && (
                    <p className="text-[11px] text-stone-500 italic">
                      Patokan: {order.deliveryAddress.notes}
                    </p>
                  )}
                </div>

                {/* Payment info */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                  <div className="flex items-center gap-1 text-stone-800 font-bold">
                    {order.paymentMethod === 'cod' ? (
                      <Truck className="w-3.5 h-3.5 text-red-600" />
                    ) : order.paymentMethod === 'cash' ? (
                      <Building className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 text-red-600" />
                    )}
                    <span className="uppercase font-mono">
                      {order.paymentMethod === 'cod'
                        ? 'COD Kab. Cilacap'
                        : order.paymentMethod === 'cash'
                        ? 'Cash di Toko'
                        : 'Transfer Bank'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-stone-500">Total Tagihan:</span>
                    <span className="text-base font-black text-red-600">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  Daftar Barang yang Dipesan:
                </p>
                <div className="divide-y divide-stone-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">
                        {item.productName} <span className="text-stone-400">x{item.quantity}</span>
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-500">Ubah Status Cepat:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'menunggu_konfirmasi')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      order.status === 'menunggu_konfirmasi'
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Menunggu Konfirmasi
                  </button>
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'diproses')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      order.status === 'diproses'
                        ? 'bg-sky-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Proses Pesanan
                  </button>
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'dikirim')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      order.status === 'dikirim'
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Kirim / Siap Diambil
                  </button>
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'selesai')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      order.status === 'selesai'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Selesai
                  </button>
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusChange(order.id, 'dibatalkan')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      order.status === 'dibatalkan'
                        ? 'bg-rose-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
