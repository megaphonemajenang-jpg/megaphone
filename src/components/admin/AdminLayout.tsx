import { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  FileText,
  Smartphone,
  ImageIcon,
  Settings,
  Eye,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  Building,
  KeyRound,
  Database,
  Cloud,
} from 'lucide-react';
import { StoreSettings, Product, PromoBanner, Order, AnalyticsSummary } from '../../types';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminOrders } from './AdminOrders';
import { AdminDailyReport } from './AdminDailyReport';
import { AdminProducts } from './AdminProducts';
import { AdminBanners } from './AdminBanners';
import { AdminStoreSettings } from './AdminStoreSettings';

interface AdminLayoutProps {
  storeSettings: StoreSettings;
  products: Product[];
  banners: PromoBanner[];
  orders: Order[];
  analytics: AnalyticsSummary | null;
  adminUser: any;
  isConnectedSSE: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  onSwitchToCustomerView: () => void;
  onProductCreated: (prod: Product) => void;
  onProductUpdated: (prod: Product) => void;
  onProductDeleted: (id: string) => void;
  onBannerCreated: (banner: PromoBanner) => void;
  onBannerDeleted: (id: string) => void;
  onBannerUpdated: (banner: PromoBanner) => void;
  onOrderUpdated: (order: Order) => void;
  onSettingsUpdated: (settings: StoreSettings) => void;
}

export function AdminLayout({
  storeSettings,
  products,
  banners,
  orders,
  analytics,
  adminUser,
  isConnectedSSE,
  soundEnabled,
  onToggleSound,
  onLogout,
  onSwitchToCustomerView,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onBannerCreated,
  onBannerDeleted,
  onBannerUpdated,
  onOrderUpdated,
  onSettingsUpdated,
}: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'orders' | 'reports' | 'products' | 'banners' | 'store-details' | 'admin-password' | 'settings'
  >('orders');

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'menunggu_konfirmasi'
  ).length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                MM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base tracking-tight">
                    {storeSettings.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-red-950 text-red-400 px-2 py-0.5 rounded-sm border border-red-800/60">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Majenang • Kabupaten Cilacap
                </p>
              </div>
            </div>

            {/* Status indicators & Utility Actions */}
            <div className="flex items-center gap-3">
              {/* Real-time SSE indicator */}
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isConnectedSSE
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                }`}
                title={
                  isConnectedSSE
                    ? 'Sinkronisasi real-time antar perangkat aktif'
                    : 'Menghubungkan ke server real-time...'
                }
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isConnectedSSE ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isConnectedSSE ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-[11px]">
                  {isConnectedSSE ? 'Real-Time Aktif' : 'Menghubungkan...'}
                </span>
              </div>

              {/* Database Firestore Cloud indicator */}
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                title="Database Cloud Firestore aktif & tersinkronisasi real-time"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Database Cloud: Terhubung</span>
              </div>

              {/* Sound alert toggle */}
              <button
                onClick={onToggleSound}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
                    : 'border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300'
                }`}
                title={soundEnabled ? 'Suara notifikasi aktif' : 'Suara notifikasi dimatikan'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Tombol Pengaturan Detail Toko */}
              <button
                onClick={() => setActiveTab('store-details')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'store-details' || activeTab === 'settings'
                    ? 'bg-red-600 border-red-500 text-white shadow-sm'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                }`}
                title="Buka Pengaturan Detail Toko Megaphone Majenang"
              >
                <Building className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Detail Toko</span>
              </button>

              {/* Tombol Sandi Admin */}
              <button
                onClick={() => setActiveTab('admin-password')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'admin-password'
                    ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                }`}
                title="Buka Pengaturan Sandi & Keamanan Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Sandi Admin</span>
              </button>

              {/* View Customer Store button */}
              <button
                onClick={onSwitchToCustomerView}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors cursor-pointer border border-stone-700"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Lihat Toko Pembeli</span>
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-red-800/40 flex items-center gap-1.5"
                title="Keluar dari Portal Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Sub-Navigation */}
        <div className="bg-stone-950 border-t border-stone-800/80 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1.5">
            {[
              {
                id: 'orders',
                label: 'Pesanan Masuk',
                icon: <ShoppingBag className="w-4 h-4" />,
                badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
              },
              {
                id: 'analytics',
                label: 'Analitik & Ringkasan',
                icon: <TrendingUp className="w-4 h-4" />,
              },
              {
                id: 'reports',
                label: 'Laporan Penjualan Harian',
                icon: <FileText className="w-4 h-4" />,
              },
              {
                id: 'products',
                label: 'Kelola Produk',
                icon: <Smartphone className="w-4 h-4" />,
                badge: products.length,
              },
              {
                id: 'banners',
                label: 'Banner Promo',
                icon: <ImageIcon className="w-4 h-4" />,
              },
              {
                id: 'store-details',
                label: 'Pengaturan Detail Toko',
                icon: <Building className="w-4 h-4" />,
              },
              {
                id: 'admin-password',
                label: 'Sandi Admin',
                icon: <KeyRound className="w-4 h-4" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id || (tab.id === 'store-details' && activeTab === 'settings')
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      tab.id === 'orders' && pendingOrdersCount > 0
                        ? 'bg-amber-400 text-stone-950 animate-bounce'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'analytics' && (
          <AdminAnalytics
            analytics={analytics}
            onNavigateToOrders={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders orders={orders} onOrderUpdated={onOrderUpdated} />
        )}

        {activeTab === 'reports' && <AdminDailyReport />}

        {activeTab === 'products' && (
          <AdminProducts
            products={products}
            onProductCreated={onProductCreated}
            onProductUpdated={onProductUpdated}
            onProductDeleted={onProductDeleted}
          />
        )}

        {activeTab === 'banners' && (
          <AdminBanners
            banners={banners}
            onBannerCreated={onBannerCreated}
            onBannerDeleted={onBannerDeleted}
            onBannerUpdated={onBannerUpdated}
          />
        )}

        {(activeTab === 'store-details' || activeTab === 'settings') && (
          <AdminStoreSettings
            settings={storeSettings}
            adminUser={adminUser}
            initialTab="profile"
            onSettingsUpdated={onSettingsUpdated}
          />
        )}

        {activeTab === 'admin-password' && (
          <AdminStoreSettings
            settings={storeSettings}
            adminUser={adminUser}
            initialTab="password"
            onSettingsUpdated={onSettingsUpdated}
          />
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-6 text-center text-xs text-stone-400 print:hidden">
        MEGAPHONE MAJENANG • Portal Pengelolaan E-Commerce Handphone & Aksesoris Cilacap
      </footer>
    </div>
  );
}
