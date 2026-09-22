import { useState } from 'react';
import {
  Smartphone,
  ShoppingBag,
  User,
  Share2,
  ShieldCheck,
  Search,
  Bell,
  LogOut,
  MapPin,
  Truck,
} from 'lucide-react';
import { StoreSettings, Customer } from '../types';

interface NavbarProps {
  storeSettings: StoreSettings;
  cartCount: number;
  customer: Customer | null;
  selectedCategory: string;
  searchQuery: string;
  onSelectCategory: (cat: string) => void;
  onSearchChange: (query: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAccount: (tab?: 'orders' | 'address' | 'password') => void;
  onLogoutCustomer: () => void;
  onOpenShare: () => void;
  onSwitchToAdmin: () => void;
  onRequestPush: () => void;
  pushEnabled: boolean;
}

export function Navbar({
  storeSettings,
  cartCount,
  customer,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onOpenCart,
  onOpenAuth,
  onOpenAccount,
  onLogoutCustomer,
  onOpenShare,
  onSwitchToAdmin,
  onRequestPush,
  pushEnabled,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-stone-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Truck className="w-3.5 h-3.5" />
            Bisa COD Wilayah Kab. Cilacap & Sekitarnya
          </span>
          <span className="hidden sm:inline text-stone-500">•</span>
          <span className="hidden sm:inline flex items-center gap-1 text-stone-300">
            <MapPin className="w-3 h-3 text-red-400" />
            {storeSettings.address || 'Majenang, Cilacap'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="share-app-top-btn"
            onClick={onOpenShare}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="Bagikan Tautan & Kode QR Toko"
          >
            <Share2 className="w-3 h-3" />
            <span>Bagikan Toko / QR</span>
          </button>
          <span className="text-stone-700">|</span>
          <button
            id="switch-admin-btn"
            onClick={onSwitchToAdmin}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            title="Masuk ke Halaman Pengelolaan Toko (Admin)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Admin</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden shrink-0">
              {storeSettings.logo ? (
                <img
                  src={storeSettings.logo}
                  alt={storeSettings.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Smartphone className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 leading-tight">
                {storeSettings.name || 'MEGAPHONE MAJENANG'}
              </h1>
              <p className="text-[11px] text-stone-500 font-medium leading-none">
                Pusat Handphone & Aksesoris Cilacap
              </p>
            </div>
          </div>

          {/* Search bar on Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-input-desktop"
                type="text"
                placeholder="Cari handphone, casing, charger, aksesoris..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Push notification enable button */}
            <button
              id="notif-toggle-btn"
              onClick={onRequestPush}
              title={pushEnabled ? 'Notifikasi push aktif' : 'Aktifkan notifikasi status pesanan'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                pushEnabled
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Cart Button */}
            <button
              id="open-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 text-red-600" />
              <span className="hidden sm:inline text-xs font-bold">Keranjang</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Account Button / Menu */}
            {customer ? (
              <div className="relative">
                <button
                  id="customer-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 truncate max-w-[100px] leading-tight">
                      {customer.name}
                    </p>
                    <p className="text-[10px] text-stone-500 font-mono leading-none">
                      {customer.whatsapp}
                    </p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-800">{customer.name}</p>
                      <p className="text-[11px] text-stone-500 font-mono">{customer.whatsapp}</p>
                    </div>
                    <button
                      id="account-orders-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAccount('orders');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      Cek Pesanan Saya
                    </button>
                    <button
                      id="account-address-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAccount('address');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-stone-400" />
                      Pengaturan Alamat
                    </button>
                    <button
                      id="account-pass-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAccount('password');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Pengaturan Ulang Sandi
                    </button>
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      id="account-logout-btn"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogoutCustomer();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar Akun
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="open-auth-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="search-input-mobile"
              type="text"
              placeholder="Cari handphone, casing, charger..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="cat-all-btn"
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua Produk
          </button>
          <button
            id="cat-hp-btn"
            onClick={() => onSelectCategory('handphone')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'handphone'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Handphone
          </button>
          <button
            id="cat-acc-btn"
            onClick={() => onSelectCategory('aksesoris')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'aksesoris'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Aksesoris
          </button>
        </div>
      </div>
    </header>
  );
}
