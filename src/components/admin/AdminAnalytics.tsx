import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Smartphone,
  Users,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { AnalyticsSummary } from '../../types';

interface AdminAnalyticsProps {
  analytics: AnalyticsSummary | null;
  onNavigateToOrders: () => void;
}

export function AdminAnalytics({ analytics, onNavigateToOrders }: AdminAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="p-8 text-center text-xs text-stone-400">
        Memuat data analitik penjualan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert banner if there are pending orders */}
      {analytics.pendingOrders > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">
                Ada {analytics.pendingOrders} Pesanan Baru Menunggu Konfirmasi!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Segera periksa dan hubungi pembeli melalui WhatsApp untuk konfirmasi pengantaran COD Cilacap.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer transition-colors"
          >
            Lihat Pesanan
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hari Ini</span>
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-stone-900">
            Rp {analytics.todayRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {analytics.todayOrders} transaksi hari ini
          </p>
        </div>

        {/* 7 Days */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">7 Hari Terakhir</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-stone-900">
            Rp {analytics.weekRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {analytics.weekOrders} total transaksi
          </p>
        </div>

        {/* 30 Days */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">30 Hari Terakhir</span>
            <span className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-stone-900">
            Rp {analytics.monthRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {analytics.monthOrders} total transaksi
          </p>
        </div>

        {/* Total Customers & Products */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pelanggan & Produk</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {analytics.totalCustomers}
            </span>
            <span className="text-xs text-stone-400 font-bold">Pelanggan Terdaftar</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {analytics.totalProducts} produk aktif di katalog
          </p>
        </div>
      </div>

      {/* Category Breakdown & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="font-extrabold text-sm text-stone-900 mb-4">
            Distribusi Katalog Megaphone Majenang
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-stone-800">
                  <Smartphone className="w-4 h-4 text-red-600" />
                  Kategori Handphone
                </span>
                <span className="font-extrabold text-stone-900">
                  {analytics.hpCategoryCount} produk
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      analytics.totalProducts > 0
                        ? (analytics.hpCategoryCount / analytics.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-bold text-stone-800">
                  <ShoppingBag className="w-4 h-4 text-stone-700" />
                  Kategori Aksesoris & Kelengkapan
                </span>
                <span className="font-extrabold text-stone-900">
                  {analytics.accCategoryCount} produk
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-stone-800 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      analytics.totalProducts > 0
                        ? (analytics.accCategoryCount / analytics.totalProducts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
            Data produk terisi langsung dari galeri yang Anda unggah tanpa data dummy.
          </p>
        </div>

        {/* Performance Highlights */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-stone-900 mb-4">
              Status Operasional Toko
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-stone-500 text-[11px]">Menunggu Konfirmasi</p>
                <p className="text-xl font-black text-amber-800 mt-1">
                  {analytics.pendingOrders}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-stone-500 text-[11px]">Pesanan Selesai</p>
                <p className="text-xl font-black text-emerald-800 mt-1">
                  {analytics.completedOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              Layanan COD Wilayah Kab. Cilacap Aktif
            </span>
            <span className="font-bold text-emerald-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
