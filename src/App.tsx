import { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Building,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Lock,
} from 'lucide-react';
import {
  Product,
  StoreSettings,
  PromoBanner,
  Customer,
  Order,
  ProductCategory,
  AnalyticsSummary,
} from './types';
import {
  fetchStoreSettings,
  fetchProducts,
  fetchBanners,
  fetchOrders,
  fetchAnalyticsSummary,
  createRealtimeConnection,
} from './lib/api';
import {
  subscribeToProducts,
  subscribeToOrders,
  subscribeToBanners,
  subscribeToStoreSettings,
  firestoreSyncProduct,
  firestoreDeleteProduct,
  firestoreSyncBanner,
  firestoreDeleteBanner,
  firestoreSyncSettings,
  firestoreUpdateOrderStatus,
} from './lib/firebase';
import { playChimeSound } from './lib/audio';
import { showPushNotification, requestNotificationPermission } from './lib/notifications';

import { Toast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { BannerSlider } from './components/BannerSlider';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ShareAppModal } from './components/ShareAppModal';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

interface CartItem {
  product: Product;
  quantity: number;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'MEGAPHONE MAJENANG',
  tagline: 'Pusat Handphone & Aksesoris Terlengkap Cilacap',
  whatsapp: '081234567890',
  address: 'Jl. Diponegoro No. 88, Majenang, Kab. Cilacap, Jawa Tengah',
  city: 'Kabupaten Cilacap',
  codAreas: [
    'Majenang',
    'Cimanggu',
    'Wanareja',
    'Karangpucung',
    'Cipari',
    'Sidareja',
    'Gandrungmangu',
    'Kedungreja',
    'Patimuan',
    'Jeruklegi',
    'Kesugihan',
    'Cilacap Kota',
  ],
  codFee: 0,
  bankAccounts: [
    { bank: 'BCA', accountNumber: '123-456-7890', accountHolder: 'MEGAPHONE MAJENANG' },
    { bank: 'BRI', accountNumber: '0099-01-234567-89-0', accountHolder: 'MEGAPHONE MAJENANG' },
  ],
};

export default function App() {
  // Navigation View: 'store' | 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'store';
  });

  // Authentication State
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('mm_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [customer, setCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('mm_customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Core Data
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // UI Filter States
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState<'orders' | 'address' | 'password'>('orders');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Real-time SSE and Audio/Notification settings
  const [isConnectedSSE, setIsConnectedSSE] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mm_sound_enabled') !== 'false';
  });

  // Toast System
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  // Save Cart to localStorage
  useEffect(() => {
    localStorage.setItem('mm_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Request browser push notification permission once
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time Cloud Firestore Subscriptions
  useEffect(() => {
    let active = true;

    const unsubProducts = subscribeToProducts((cloudProds) => {
      if (active && cloudProds && cloudProds.length > 0) {
        setProducts(cloudProds);
      }
    });

    const unsubBanners = subscribeToBanners((cloudBanners) => {
      if (active && cloudBanners && cloudBanners.length > 0) {
        setBanners(cloudBanners);
      }
    });

    const unsubSettings = subscribeToStoreSettings((cloudSettings) => {
      if (active && cloudSettings && cloudSettings.name) {
        setStoreSettings(cloudSettings);
      }
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (active && cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
      }
    });

    return () => {
      active = false;
      unsubProducts();
      unsubBanners();
      unsubSettings();
      unsubOrders();
    };
  }, []);

  const loadAllData = async () => {
    try {
      const [settingsData, prodsData, bannersData] = await Promise.all([
        fetchStoreSettings(),
        fetchProducts(),
        fetchBanners(),
      ]);
      setStoreSettings(settingsData);
      setProducts(prodsData);
      setBanners(bannersData);

      if (adminUser) {
        loadAdminData();
      }
    } catch (err) {
      console.error('Failed loading store data:', err);
    }
  };

  const loadAdminData = async () => {
    try {
      const [ordersData, analyticsData] = await Promise.all([
        fetchOrders(),
        fetchAnalyticsSummary(),
      ]);
      setOrders(ordersData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed loading admin data:', err);
    }
  };

  // Real-time SSE Synchronization
  useEffect(() => {
    const es = createRealtimeConnection((event) => {
      setIsConnectedSSE(true);
      const { type, data } = event;

      switch (type) {
        case 'order_created': {
          const newOrder = data as Order;
          // Trigger audio chime if sound enabled
          if (soundEnabled) {
            playChimeSound();
          }

          // Trigger push notification
          showPushNotification('Pesanan Baru Megaphone!', {
            body: `No. ${newOrder.invoiceNumber} dari ${newOrder.customerName} (Rp ${newOrder.total.toLocaleString('id-ID')})`,
          });

          // Show Toast notification
          setToast({
            id: Date.now().toString(),
            message: `Pesanan Baru #${newOrder.invoiceNumber} (${newOrder.customerName})`,
            type: 'info',
          });

          // Update Admin orders list & analytics
          setOrders((prev) => [newOrder, ...prev]);
          fetchAnalyticsSummary().then(setAnalytics).catch(() => {});
          break;
        }

        case 'order_updated': {
          const updatedOrder = data as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          );

          // If current customer owns this order, notify them!
          if (
            customer &&
            (customer.id === updatedOrder.customerId ||
              customer.whatsapp === updatedOrder.customerWhatsapp)
          ) {
            if (soundEnabled) playChimeSound();
            showPushNotification('Status Pesanan Anda Diperbarui!', {
              body: `Pesanan ${updatedOrder.invoiceNumber}: ${updatedOrder.status.replace('_', ' ').toUpperCase()}`,
            });
            setToast({
              id: Date.now().toString(),
              message: `Status pesanan #${updatedOrder.invoiceNumber} diperbarui: ${updatedOrder.status.replace('_', ' ')}`,
              type: 'info',
            });
          }
          break;
        }

        case 'product_created':
          setProducts((prev) => [...prev, data as Product]);
          break;

        case 'product_updated': {
          const updated = data as Product;
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          break;
        }

        case 'product_deleted': {
          const { id } = data;
          setProducts((prev) => prev.filter((p) => p.id !== id));
          break;
        }

        case 'banner_created':
          setBanners((prev) => [...prev, data as PromoBanner]);
          break;

        case 'banner_updated': {
          const updated = data as PromoBanner;
          setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          break;
        }

        case 'banner_deleted': {
          const { id } = data;
          setBanners((prev) => prev.filter((b) => b.id !== id));
          break;
        }

        case 'settings_updated':
          setStoreSettings(data as StoreSettings);
          break;

        default:
          break;
      }
    });

    return () => {
      es.close();
    };
  }, [customer, soundEnabled]);

  // Cart Management Functions
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      setToast({
        id: Date.now().toString(),
        message: 'Maaf, stok produk ini sedang habis.',
        type: 'warning',
      });
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((it) => it.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((it) =>
          it.product.id === product.id ? { ...it, quantity: nextQty } : it
        );
      }
      return [...prev, { product, quantity }];
    });

    setToast({
      id: Date.now().toString(),
      message: `${quantity}x ${product.name} dimasukkan ke keranjang.`,
      type: 'success',
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity } : it))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    if (!customer) {
      setIsAuthModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  // Auth Functions
  const handleCustomerLoginSuccess = (cust: Customer) => {
    setCustomer(cust);
    localStorage.setItem('mm_customer', JSON.stringify(cust));
    setToast({
      id: Date.now().toString(),
      message: `Selamat datang, ${cust.name}!`,
      type: 'success',
    });
  };

  const handleCustomerLogout = () => {
    setCustomer(null);
    localStorage.removeItem('mm_customer');
    setToast({
      id: Date.now().toString(),
      message: 'Anda telah keluar dari akun pembeli.',
      type: 'info',
    });
  };

  const handleAdminLoginSuccess = (admin: any) => {
    setAdminUser(admin);
    localStorage.setItem('mm_admin_user', JSON.stringify(admin));
    loadAdminData();
    setToast({
      id: Date.now().toString(),
      message: 'Berhasil masuk sebagai Admin Megaphone Majenang.',
      type: 'success',
    });
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('mm_admin_user');
    setCurrentView('store');
    window.location.hash = '';
  };

  // Order Success Handler
  const handleOrderSuccess = (order: Order, waUrl: string) => {
    // Clear shopping cart
    setCartItems([]);
    setIsCheckoutOpen(false);
    setToast({
      id: Date.now().toString(),
      message: `Pesanan #${order.invoiceNumber} berhasil dibuat! Mengalihkan ke WhatsApp...`,
      type: 'success',
    });
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // View Switcher Handlers
  const switchToAdmin = () => {
    setCurrentView('admin');
    window.location.hash = '#admin';
    if (adminUser) {
      loadAdminData();
    }
  };

  const switchToStore = () => {
    setCurrentView('store');
    window.location.hash = '';
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('mm_sound_enabled', nextVal ? 'true' : 'false');
  };

  // -------------------------------------------------------------
  // RENDER: ADMIN VIEW
  // -------------------------------------------------------------
  if (currentView === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onBackToStore={switchToStore}
        />
      );
    }

    return (
      <>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <AdminLayout
          storeSettings={storeSettings}
          products={products}
          banners={banners}
          orders={orders}
          analytics={analytics}
          adminUser={adminUser}
          isConnectedSSE={isConnectedSSE}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onLogout={handleAdminLogout}
          onSwitchToCustomerView={switchToStore}
          onProductCreated={(prod) => {
            setProducts((prev) => [...prev, prod]);
            firestoreSyncProduct(prod);
          }}
          onProductUpdated={(prod) => {
            setProducts((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
            firestoreSyncProduct(prod);
          }}
          onProductDeleted={(id) => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            firestoreDeleteProduct(id);
          }}
          onBannerCreated={(banner) => {
            setBanners((prev) => [...prev, banner]);
            firestoreSyncBanner(banner);
          }}
          onBannerDeleted={(id) => {
            setBanners((prev) => prev.filter((b) => b.id !== id));
            firestoreDeleteBanner(id);
          }}
          onBannerUpdated={(banner) => {
            setBanners((prev) => prev.map((b) => (b.id === banner.id ? banner : b)));
            firestoreSyncBanner(banner);
          }}
          onOrderUpdated={(order) => {
            setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
            firestoreUpdateOrderStatus(order.id, order.status);
          }}
          onSettingsUpdated={(settings) => {
            setStoreSettings(settings);
            firestoreSyncSettings(settings);
          }}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CUSTOMER STORE VIEW
  // -------------------------------------------------------------
  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-red-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Navigation Bar */}
      <Navbar
        storeSettings={storeSettings}
        cartCount={totalCartCount}
        customer={customer}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat: string) => setSelectedCategory(cat as any)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={(tab?: 'orders' | 'address' | 'password') => {
          setAccountInitialTab(tab || 'orders');
          setIsAccountModalOpen(true);
        }}
        onLogoutCustomer={handleCustomerLogout}
        onOpenShare={() => setIsShareModalOpen(true)}
        onSwitchToAdmin={switchToAdmin}
        onRequestPush={() => {
          requestNotificationPermission().then((granted) => {
            setToast({
              id: Date.now().toString(),
              message: granted
                ? 'Notifikasi push berhasil diaktifkan!'
                : 'Izin notifikasi tidak diizinkan di peramban.',
              type: granted ? 'success' : 'warning',
            });
          });
        }}
        pushEnabled={
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        }
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Banner Promo Slider (from Admin) */}
        <BannerSlider
          banners={banners}
          storeSettings={storeSettings}
          onOpenWhatsApp={() => {
            const cleanPhone = storeSettings.whatsapp.replace(/[^0-9]/g, '');
            const standardPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
            window.open(`https://wa.me/${standardPhone}`, '_blank');
          }}
        />

        {/* Feature Badges for Cilacap / Majenang */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                Layanan COD Kabupaten Cilacap
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bayar di tempat untuk Majenang, Sidareja, Cimanggu, dll
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                Garansi Resmi & Terpercaya
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Produk handphone & aksesoris 100% original berkualitas
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-stone-900 leading-tight">
                Toko Fisik di Majenang
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bisa ambil langsung dan bayar tunai (Cash) di kasir toko
              </p>
            </div>
          </div>
        </div>

        {/* Category Tabs & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'Semua Produk Pilihan'
                : selectedCategory === 'handphone'
                ? 'Koleksi Handphone Terbaru'
                : 'Aksesoris & Kelengkapan'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Menampilkan {filteredProducts.length} produk di etalase Megaphone Majenang
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedCategory('handphone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'handphone'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Handphone</span>
            </button>
            <button
              onClick={() => setSelectedCategory('aksesoris')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === 'aksesoris'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Aksesoris</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 shadow-xs">
            <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-base text-stone-800">
              Belum Ada Produk Tersedia
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `Tidak ditemukan produk yang cocok dengan "${searchQuery}". Silakan coba kata kunci lain.`
                : 'Katalog toko saat ini masih kosong (tanpa data demo). Admin dapat menambahkan produk melalui Portal Admin.'}
            </p>
            <button
              onClick={switchToAdmin}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Masuk Portal Admin untuk Tambah Produk</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetail={(prod: Product) => setSelectedProductForDetail(prod)}
                onAddToCart={(prod: Product) => handleAddToCart(prod, 1)}
                isInCart={cartItems.some((it) => it.product.id === product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp storeSettings={storeSettings} />

      {/* Modals & Slide-overs */}
      {/* 1. Product Detail Modal */}
      {selectedProductForDetail && (
        <ProductDetailModal
          product={selectedProductForDetail}
          storeSettings={storeSettings}
          onClose={() => setSelectedProductForDetail(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        customer={customer}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* 3. Checkout Modal */}
      {isCheckoutOpen && customer && (
        <CheckoutModal
          customer={customer}
          cartItems={cartItems}
          storeSettings={storeSettings}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* 4. Customer Login / Register Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleCustomerLoginSuccess}
      />

      {/* 5. Customer Account & Orders Modal */}
      {customer && (
        <CustomerAccountModal
          isOpen={isAccountModalOpen}
          initialTab={accountInitialTab}
          customer={customer}
          storeSettings={storeSettings}
          onClose={() => setIsAccountModalOpen(false)}
          onCustomerUpdated={(updated) => {
            setCustomer(updated);
            localStorage.setItem('mm_customer', JSON.stringify(updated));
          }}
        />
      )}

      {/* 6. Share Store & QR Code Modal */}
      <ShareAppModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        storeSettings={storeSettings}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-16 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800">
            {/* Store Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs">
                  MM
                </div>
                <h3 className="font-extrabold text-white text-base">
                  {storeSettings.name}
                </h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                {storeSettings.tagline}
              </p>
              <div className="flex items-start gap-2 text-xs text-stone-400">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono">{storeSettings.whatsapp}</span>
              </div>
            </div>

            {/* Payment & COD Coverage */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Metode Pembayaran & Wilayah COD
              </h4>
              <p className="text-xs text-stone-400">
                Kami melayani metode <strong>COD (Cash On Delivery)</strong>, <strong>Cash di Toko</strong>, dan <strong>Transfer Bank</strong> (BCA & BRI).
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {storeSettings.codAreas.slice(0, 8).map((area) => (
                  <span
                    key={area}
                    className="text-[11px] bg-stone-800 px-2 py-0.5 rounded-md text-stone-300"
                  >
                    Kec. {area}
                  </span>
                ))}
                {storeSettings.codAreas.length > 8 && (
                  <span className="text-[11px] bg-stone-800 px-2 py-0.5 rounded-md text-stone-400">
                    +{storeSettings.codAreas.length - 8} lainnya
                  </span>
                )}
              </div>
            </div>

            {/* Quick Links & Share */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Tautan Toko & Kelola
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bagikan Toko & Unduh Kode QR</span>
                  </button>
                </li>
                {customer ? (
                  <li>
                    <button
                      onClick={() => {
                        setAccountInitialTab('orders');
                        setIsAccountModalOpen(true);
                      }}
                      className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-red-500" />
                      <span>Cek Pesanan Saya ({customer.name})</span>
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Masuk / Bikin Akun Pembeli</span>
                    </button>
                  </li>
                )}
                <li className="pt-2 border-t border-stone-800">
                  <button
                    onClick={switchToAdmin}
                    className="text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer font-bold text-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Portal Khusus Admin MEGAPHONE</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
            <p>© {new Date().getFullYear()} MEGAPHONE MAJENANG. Hak Cipta Dilindungi.</p>
            <p>Aplikasi E-Commerce Handphone & Aksesoris Cilacap</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
