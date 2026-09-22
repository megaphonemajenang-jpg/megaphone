import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  StoreSettings,
  Product,
  PromoBanner,
  Customer,
  Order,
  OrderStatus,
  DailyReportItem,
  AnalyticsSummary,
} from './src/types';

interface DatabaseSchema {
  admin: {
    username: string;
    password: string;
    email: string;
    phone: string;
  };
  storeSettings: StoreSettings;
  products: Product[];
  banners: PromoBanner[];
  customers: Array<Customer & { password: string }>;
  orders: Order[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'megaphone_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultStoreSettings: StoreSettings = {
  name: 'MEGAPHONE MAJENANG',
  tagline: 'Pusat Handphone & Aksesoris Terlengkap Cilacap',
  whatsapp: '081234567890',
  email: 'megaphonemajenang@gmail.com',
  address: 'Jl. Diponegoro No. 88, Majenang',
  district: 'Majenang',
  city: 'Kabupaten Cilacap',
  province: 'Jawa Tengah',
  postalCode: '53257',
  openingHours: 'Setiap Hari: 08:00 - 21:00 WIB',
  mapsUrl: 'https://maps.google.com/?q=Majenang+Cilacap',
  description: 'Toko Handphone & Aksesoris Terlengkap Majenang Cilacap. Melayani COD Wilayah Cilacap, Cash di Toko, & Transfer Bank.',
  logo: '',
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
    'Kroya',
    'Dayeuhluhur',
  ],
  codFee: 0,
  enableCod: true,
  enableTransfer: true,
  enableCash: true,
  bankAccounts: [
    { bank: 'BCA', accountNumber: '0123456789', accountHolder: 'MEGAPHONE MAJENANG' },
    { bank: 'BRI', accountNumber: '001201098765501', accountHolder: 'MEGAPHONE MAJENANG' },
  ],
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        admin: parsed.admin || {
          username: 'admin',
          password: 'admin123',
          email: 'megaphonemajenang@gmail.com',
          phone: '081234567890',
        },
        storeSettings: parsed.storeSettings || defaultStoreSettings,
        products: parsed.products || [],
        banners: parsed.banners || [],
        customers: parsed.customers || [],
        orders: parsed.orders || [],
      };
    }
  } catch (err) {
    console.error('Failed reading database file, using fallback', err);
  }

  const initialDb: DatabaseSchema = {
    admin: {
      username: 'admin',
      password: 'admin123',
      email: 'megaphonemajenang@gmail.com',
      phone: '081234567890',
    },
    storeSettings: defaultStoreSettings,
    products: [],
    banners: [],
    customers: [],
    orders: [],
  };
  saveDatabase(initialDb);
  return initialDb;
}

let db = loadDatabase();

function saveDatabase(dataToSave = db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving database', err);
  }
}

// Server-Sent Events subscribers
const sseClients = new Set<Response>();

function broadcastSSE(type: string, payload: any) {
  const message = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Real-time Server-Sent Events
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to MEGAPHONE MAJENANG Realtime Sync' })}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // Store settings
  app.get('/api/store', (_req: Request, res: Response) => {
    res.json(db.storeSettings);
  });

  app.put('/api/store', (req: Request, res: Response) => {
    const updated = { ...db.storeSettings, ...req.body };
    db.storeSettings = updated;
    saveDatabase();
    broadcastSSE('settings_updated', db.storeSettings);
    broadcastSSE('store_updated', db.storeSettings);
    res.json({ success: true, storeSettings: db.storeSettings });
  });

  // Admin Auth
  app.post('/api/auth/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (
      (username === db.admin.username || username === db.admin.email || username === db.admin.phone) &&
      password === db.admin.password
    ) {
      res.json({
        success: true,
        admin: {
          username: db.admin.username,
          email: db.admin.email,
          phone: db.admin.phone,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Username atau password admin salah!' });
    }
  });

  app.put('/api/auth/admin/update', (req: Request, res: Response) => {
    const { username, password, newPassword, email, phone, currentPassword } = req.body;
    if (currentPassword && currentPassword !== db.admin.password) {
      return res.status(401).json({ success: false, message: 'Password saat ini salah!' });
    }

    if (username) db.admin.username = username.trim();
    const nextPassword = newPassword || password;
    if (nextPassword) db.admin.password = nextPassword.trim();
    if (email) db.admin.email = email.trim();
    if (phone) db.admin.phone = phone.trim();

    saveDatabase();
    res.json({
      success: true,
      admin: {
        username: db.admin.username,
        email: db.admin.email,
        phone: db.admin.phone,
      },
      message: 'Kredensial dan kata sandi admin berhasil diperbarui!',
    });
  });

  // Customer Auth
  app.post('/api/auth/customer/register', (req: Request, res: Response) => {
    const { name, whatsapp, password, address } = req.body;
    if (!name || !whatsapp || !password) {
      return res.status(400).json({ success: false, message: 'Nama, No WhatsApp, dan Password wajib diisi!' });
    }

    const cleanedPhone = whatsapp.replace(/[^0-9]/g, '');
    const existing = db.customers.find((c) => c.whatsapp.replace(/[^0-9]/g, '') === cleanedPhone);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp ini sudah terdaftar. Silakan login!' });
    }

    const newCustomer: Customer & { password: string } = {
      id: 'CUST-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: name.trim(),
      whatsapp: cleanedPhone,
      password: password.trim(),
      address: address || undefined,
      createdAt: new Date().toISOString(),
    };

    db.customers.push(newCustomer);
    saveDatabase();

    const { password: _, ...safeCustomer } = newCustomer;
    res.json({ success: true, customer: safeCustomer });
  });

  app.post('/api/auth/customer/login', (req: Request, res: Response) => {
    const { whatsapp, password } = req.body;
    if (!whatsapp || !password) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp dan password wajib diisi!' });
    }

    const cleanedPhone = whatsapp.replace(/[^0-9]/g, '');
    const customer = db.customers.find(
      (c) => c.whatsapp.replace(/[^0-9]/g, '') === cleanedPhone && c.password === password.trim()
    );

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Nomor WhatsApp atau password tidak sesuai!' });
    }

    const { password: _, ...safeCustomer } = customer;
    res.json({ success: true, customer: safeCustomer });
  });

  app.put('/api/customer/profile', (req: Request, res: Response) => {
    const { customerId, name, address } = req.body;
    const custIndex = db.customers.findIndex((c) => c.id === customerId);
    if (custIndex === -1) {
      return res.status(404).json({ success: false, message: 'Akun pelanggan tidak ditemukan!' });
    }

    if (name) db.customers[custIndex].name = name.trim();
    if (address) db.customers[custIndex].address = address;

    saveDatabase();
    const { password: _, ...safeCustomer } = db.customers[custIndex];
    res.json({ success: true, customer: safeCustomer, message: 'Alamat dan profil berhasil diperbarui!' });
  });

  app.put('/api/customer/reset-password', (req: Request, res: Response) => {
    const { whatsapp, currentPassword, newPassword } = req.body;
    if (!whatsapp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp dan password baru wajib diisi!' });
    }

    const cleanedPhone = whatsapp.replace(/[^0-9]/g, '');
    const custIndex = db.customers.findIndex((c) => c.whatsapp.replace(/[^0-9]/g, '') === cleanedPhone);

    if (custIndex === -1) {
      return res.status(404).json({ success: false, message: 'Nomor WhatsApp belum terdaftar!' });
    }

    if (currentPassword && db.customers[custIndex].password !== currentPassword.trim()) {
      return res.status(401).json({ success: false, message: 'Password saat ini salah!' });
    }

    db.customers[custIndex].password = newPassword.trim();
    saveDatabase();

    res.json({ success: true, message: 'Password berhasil diubah. Silakan gunakan password baru untuk login.' });
  });

  // Products
  app.get('/api/products', (req: Request, res: Response) => {
    const { category, search } = req.query;
    let list = [...db.products];

    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.specs.some((s) => s.toLowerCase().includes(q))
      );
    }

    res.json(list);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const { name, category, price, originalPrice, stock, image, description, specs } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Nama, kategori, dan harga wajib diisi!' });
    }

    const newProduct: Product = {
      id: 'PROD-' + Date.now(),
      name: name.trim(),
      category: category === 'aksesoris' ? 'aksesoris' : 'handphone',
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock) >= 0 ? Number(stock) : 1,
      image: image || '',
      description: description || '',
      specs: Array.isArray(specs) ? specs : [],
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    saveDatabase();
    broadcastSSE('product_updated', { action: 'create', product: newProduct });

    res.json({ success: true, product: newProduct });
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan!' });
    }

    const existing = db.products[index];
    const updated: Product = {
      ...existing,
      ...req.body,
      id: existing.id,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : existing.originalPrice,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updated;
    saveDatabase();
    broadcastSSE('product_updated', { action: 'update', product: updated });

    res.json({ success: true, product: updated });
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const beforeCount = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    if (db.products.length !== beforeCount) {
      saveDatabase();
      broadcastSSE('product_updated', { action: 'delete', productId: id });
    }
    res.json({ success: true });
  });

  // Promo Banners
  app.get('/api/banners', (_req: Request, res: Response) => {
    res.json(db.banners);
  });

  app.post('/api/banners', (req: Request, res: Response) => {
    const { title, subtitle, image, linkText, active } = req.body;
    if (!title || !image) {
      return res.status(400).json({ success: false, message: 'Judul dan gambar banner promo wajib diisi!' });
    }

    const newBanner: PromoBanner = {
      id: 'BANNER-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      image,
      linkText: linkText || 'Lihat Promo',
      active: active !== undefined ? Boolean(active) : true,
      createdAt: new Date().toISOString(),
    };

    db.banners.unshift(newBanner);
    saveDatabase();
    broadcastSSE('banner_updated', { action: 'create', banner: newBanner });

    res.json({ success: true, banner: newBanner });
  });

  app.put('/api/banners/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.banners.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Banner tidak ditemukan!' });
    }

    db.banners[index] = {
      ...db.banners[index],
      ...req.body,
      id,
    };
    saveDatabase();
    broadcastSSE('banner_updated', { action: 'update', banner: db.banners[index] });

    res.json({ success: true, banner: db.banners[index] });
  });

  app.delete('/api/banners/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.banners = db.banners.filter((b) => b.id !== id);
    saveDatabase();
    broadcastSSE('banner_updated', { action: 'delete', bannerId: id });
    res.json({ success: true });
  });

  // Orders
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      customerId,
      customerName,
      customerWhatsapp,
      items,
      paymentMethod,
      deliveryAddress,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Keranjang belanja tidak boleh kosong!' });
    }

    if (!customerName || !customerWhatsapp) {
      return res.status(400).json({ success: false, message: 'Nama dan Nomor WhatsApp pembeli wajib diisi!' });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity) || 0), 0);
    const deliveryFee = paymentMethod === 'cod' ? (db.storeSettings.codFee || 0) : 0;
    const total = subtotal + deliveryFee;

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(db.orders.length + 1).padStart(4, '0');
    const invoiceNumber = `MM-${todayStr}-${seq}`;

    const newOrder: Order = {
      id: 'ORD-' + Date.now(),
      invoiceNumber,
      customerId: customerId || 'GUEST',
      customerName: customerName.trim(),
      customerWhatsapp: customerWhatsapp.trim(),
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'cod',
      deliveryAddress: deliveryAddress || {
        recipientName: customerName,
        whatsapp: customerWhatsapp,
        fullAddress: 'Ambil di Toko',
        district: 'Majenang',
        city: 'Kabupaten Cilacap',
      },
      status: 'menunggu_konfirmasi',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update stock of items
    for (const item of items) {
      const prodIndex = db.products.findIndex((p) => p.id === item.productId);
      if (prodIndex !== -1) {
        db.products[prodIndex].stock = Math.max(0, db.products[prodIndex].stock - (item.quantity || 1));
      }
    }

    db.orders.unshift(newOrder);
    saveDatabase();

    // Broadcast SSE to all clients (admin & buyer)
    broadcastSSE('order_created', newOrder);

    // Format WhatsApp prefilled message for admin
    const paymentMethodText =
      newOrder.paymentMethod === 'cod'
        ? 'COD (Bayar di Tempat - Kab. Cilacap)'
        : newOrder.paymentMethod === 'transfer'
        ? 'Transfer Bank'
        : 'Cash (Ambil di Toko)';

    const itemListText = newOrder.items
      .map((it, idx) => `${idx + 1}. ${it.productName} (${it.quantity}x) = Rp ${Number(it.price * it.quantity).toLocaleString('id-ID')}`)
      .join('\n');

    const addressText =
      newOrder.paymentMethod === 'cash'
        ? 'Ambil langsung di Toko MEGAPHONE MAJENANG'
        : `${newOrder.deliveryAddress.fullAddress}, Kec. ${newOrder.deliveryAddress.district}, ${newOrder.deliveryAddress.city}`;

    const waText = encodeURIComponent(
      `*PESANAN BARU - MEGAPHONE MAJENANG*\n` +
      `No Invoice: *${newOrder.invoiceNumber}*\n` +
      `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n` +
      `*DATA PEMBELI:*\n` +
      `Nama: ${newOrder.customerName}\n` +
      `No WhatsApp: ${newOrder.customerWhatsapp}\n` +
      `Metode: ${paymentMethodText}\n` +
      `Alamat: ${addressText}\n\n` +
      `*RINCIAN PESANAN:*\n` +
      `${itemListText}\n\n` +
      `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}\n` +
      `Ongkir COD: Rp ${deliveryFee.toLocaleString('id-ID')}\n` +
      `*TOTAL: Rp ${total.toLocaleString('id-ID')}*\n\n` +
      `Catatan: ${newOrder.notes || '-'}\n\n` +
      `Mohon segera dikonfirmasi pesanan saya ya Admin Megaphone Majenang. Terima kasih!`
    );

    const adminPhoneClean = db.storeSettings.whatsapp.replace(/[^0-9]/g, '');
    const standardAdminPhone = adminPhoneClean.startsWith('0') ? '62' + adminPhoneClean.slice(1) : adminPhoneClean;
    const whatsappUrl = `https://wa.me/${standardAdminPhone}?text=${waText}`;

    res.json({
      success: true,
      order: newOrder,
      whatsappUrl,
    });
  });

  app.get('/api/orders', (req: Request, res: Response) => {
    const { status, date, search } = req.query;
    let list = [...db.orders];

    if (status && status !== 'all') {
      list = list.filter((o) => o.status === status);
    }

    if (date && typeof date === 'string') {
      list = list.filter((o) => o.createdAt.startsWith(date));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerWhatsapp.includes(q)
      );
    }

    res.json(list);
  });

  app.get('/api/customer/orders', (req: Request, res: Response) => {
    const { customerId, whatsapp } = req.query;
    let list = [...db.orders];

    if (customerId && typeof customerId === 'string') {
      list = list.filter((o) => o.customerId === customerId);
    } else if (whatsapp && typeof whatsapp === 'string') {
      const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
      list = list.filter((o) => o.customerWhatsapp.replace(/[^0-9]/g, '') === cleanPhone);
    } else {
      list = [];
    }

    res.json(list);
  });

  app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses: OrderStatus[] = ['menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid!' });
    }

    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan!' });
    }

    db.orders[index].status = status;
    db.orders[index].updatedAt = new Date().toISOString();
    saveDatabase();

    broadcastSSE('order_status_updated', db.orders[index]);

    res.json({ success: true, order: db.orders[index] });
  });

  // Daily Sales Detailed Report
  app.get('/api/reports/daily', (req: Request, res: Response) => {
    const { date } = req.query; // YYYY-MM-DD or undefined for all days
    const orders = [...db.orders].filter((o) => o.status !== 'dibatalkan');

    const grouped: { [dateStr: string]: Order[] } = {};
    for (const order of orders) {
      const dateKey = order.createdAt.slice(0, 10);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(order);
    }

    const reportItems: DailyReportItem[] = Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .map((dateKey) => {
        const dayOrders = grouped[dateKey];
        let totalRevenue = 0;
        let codCount = 0;
        let codRevenue = 0;
        let transferCount = 0;
        let transferRevenue = 0;
        let cashCount = 0;
        let cashRevenue = 0;

        for (const ord of dayOrders) {
          totalRevenue += ord.total;
          if (ord.paymentMethod === 'cod') {
            codCount++;
            codRevenue += ord.total;
          } else if (ord.paymentMethod === 'transfer') {
            transferCount++;
            transferRevenue += ord.total;
          } else if (ord.paymentMethod === 'cash') {
            cashCount++;
            cashRevenue += ord.total;
          }
        }

        return {
          date: dateKey,
          totalRevenue,
          totalOrders: dayOrders.length,
          codCount,
          codRevenue,
          transferCount,
          transferRevenue,
          cashCount,
          cashRevenue,
          orders: dayOrders,
        };
      });

    if (date && typeof date === 'string') {
      const matched = reportItems.find((r) => r.date === date);
      return res.json(matched ? [matched] : []);
    }

    res.json(reportItems);
  });

  // Simple Analytics Dashboard
  app.get('/api/analytics', (_req: Request, res: Response) => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const activeOrders = db.orders.filter((o) => o.status !== 'dibatalkan');

    const todayOrders = activeOrders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

    const weekOrders = activeOrders.filter((o) => o.createdAt.slice(0, 10) >= sevenDaysAgo);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);

    const monthOrders = activeOrders.filter((o) => o.createdAt.slice(0, 10) >= thirtyDaysAgo);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);

    const pendingOrders = db.orders.filter((o) => o.status === 'menunggu_konfirmasi').length;
    const completedOrders = db.orders.filter((o) => o.status === 'selesai').length;

    const hpCategoryCount = db.products.filter((p) => p.category === 'handphone').length;
    const accCategoryCount = db.products.filter((p) => p.category === 'aksesoris').length;

    const summary: AnalyticsSummary = {
      todayRevenue,
      todayOrders: todayOrders.length,
      weekRevenue,
      weekOrders: weekOrders.length,
      monthRevenue,
      monthOrders: monthOrders.length,
      pendingOrders,
      completedOrders,
      totalProducts: db.products.length,
      totalCustomers: db.customers.length,
      hpCategoryCount,
      accCategoryCount,
      recentOrders: db.orders.slice(0, 10),
    };

    res.json(summary);
  });

  // Vite middleware for dev or static dist for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server MEGAPHONE MAJENANG running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
