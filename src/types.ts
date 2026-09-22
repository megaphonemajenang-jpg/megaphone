export interface StoreSettings {
  name: string;
  tagline?: string;
  whatsapp: string;
  email?: string;
  address: string;
  district?: string;
  city: string;
  province?: string;
  postalCode?: string;
  mapsUrl?: string;
  openingHours?: string;
  description?: string;
  logo?: string; // Base64 data URL or image link
  codAreas: string[];
  codFee: number;
  enableCod?: boolean;
  enableTransfer?: boolean;
  enableCash?: boolean;
  bankAccounts: Array<{
    bank: string;
    accountNumber: string;
    accountHolder: string;
  }>;
}

export type ProductCategory = 'handphone' | 'aksesoris';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string; // Base64 or URL
  description: string;
  specs: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string; // Base64 or URL
  link?: string;
  linkText?: string;
  active: boolean;
  createdAt: string;
}

export interface CustomerAddress {
  recipientName: string;
  whatsapp: string;
  fullAddress: string;
  district: string; // Kecamatan (e.g. Majenang, Cimanggu, Wanareja, dll)
  city: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string; // Phone number
  address?: CustomerAddress;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export type OrderStatus = 'menunggu_konfirmasi' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan';
export type PaymentMethod = 'cod' | 'transfer' | 'cash';

export interface Order {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryAddress: CustomerAddress;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReportItem {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  totalOrders: number;
  codCount: number;
  codRevenue: number;
  transferCount: number;
  transferRevenue: number;
  cashCount: number;
  cashRevenue: number;
  orders: Order[];
}

export interface AnalyticsSummary {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  totalCustomers: number;
  hpCategoryCount: number;
  accCategoryCount: number;
  recentOrders: Order[];
}
