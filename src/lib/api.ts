import {
  StoreSettings,
  Product,
  PromoBanner,
  Customer,
  Order,
  OrderStatus,
  DailyReportItem,
  AnalyticsSummary,
} from '../types';

export const API_BASE = '/api';

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/store`);
  if (!res.ok) throw new Error('Gagal memuat pengaturan toko');
  return res.json();
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/store`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Gagal memperbarui pengaturan toko');
  const data = await res.json();
  return data.storeSettings;
}

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat produk');
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menambahkan produk');
  return data.product;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memperbarui produk');
  return data.product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus produk');
  return true;
}

export async function fetchBanners(): Promise<PromoBanner[]> {
  const res = await fetch(`${API_BASE}/banners`);
  if (!res.ok) throw new Error('Gagal memuat banner promo');
  return res.json();
}

export async function createBanner(bannerData: Partial<PromoBanner>): Promise<PromoBanner> {
  const res = await fetch(`${API_BASE}/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bannerData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal menambahkan banner');
  return data.banner;
}

export async function updateBanner(id: string, bannerData: Partial<PromoBanner>): Promise<PromoBanner> {
  const res = await fetch(`${API_BASE}/banners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bannerData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memperbarui banner');
  return data.banner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus banner');
  return true;
}

// Auth Customer
export async function registerCustomer(payload: {
  name: string;
  whatsapp: string;
  password: string;
  address?: any;
}): Promise<Customer> {
  const res = await fetch(`${API_BASE}/auth/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mendaftar');
  return data.customer;
}

export async function loginCustomer(payload: { whatsapp: string; password: string }): Promise<Customer> {
  const res = await fetch(`${API_BASE}/auth/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Nomor WhatsApp atau password salah');
  return data.customer;
}

export async function updateCustomerProfile(payload: {
  customerId: string;
  name?: string;
  address?: any;
}): Promise<Customer> {
  const res = await fetch(`${API_BASE}/customer/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memperbarui profil');
  return data.customer;
}

export async function resetCustomerPassword(payload: {
  whatsapp: string;
  currentPassword?: string;
  newPassword: string;
}): Promise<string> {
  const res = await fetch(`${API_BASE}/customer/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mereset sandi');
  return data.message;
}

export async function fetchCustomerOrders(customerId?: string, whatsapp?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (customerId) params.append('customerId', customerId);
  if (whatsapp) params.append('whatsapp', whatsapp);
  const res = await fetch(`${API_BASE}/customer/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat pesanan');
  return res.json();
}

// Orders
export async function createOrder(payload: any): Promise<{ order: Order; whatsappUrl: string }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal membuat pesanan');
  return { order: data.order, whatsappUrl: data.whatsappUrl };
}

export async function fetchAllOrders(status?: string, date?: string, search?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (date) params.append('date', date);
  if (search) params.append('search', search);
  const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat pesanan admin');
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengubah status');
  return data.order;
}

// Reports & Analytics
export async function fetchDailyReports(date?: string): Promise<DailyReportItem[]> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  const res = await fetch(`${API_BASE}/reports/daily?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat laporan harian');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Gagal memuat analitik');
  return res.json();
}

// Admin Auth
export async function adminLogin(payload: { username: string; password: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Kredensial admin salah');
  return data.admin;
}

export async function updateAdminCredentials(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/admin/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengubah kredensial admin');
  return data;
}

export const fetchOrders = fetchAllOrders;
export const fetchAnalyticsSummary = fetchAnalytics;

export async function changeAdminPassword(payload: {
  currentPassword?: string;
  newPassword: string;
}): Promise<string> {
  const res = await updateAdminCredentials(payload);
  return res.message || 'Kata sandi admin berhasil diubah';
}

export function createRealtimeConnection(
  onMessage: (event: { type: string; data: any }) => void
): EventSource {
  const es = new EventSource(`${API_BASE}/realtime`);
  es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    } catch (e) {
      console.error('SSE JSON error:', e);
    }
  };
  return es;
}

// Helper to convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
