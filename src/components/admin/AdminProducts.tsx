import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Image as ImageIcon,
  Smartphone,
  ShoppingBag,
  Check,
  X,
  AlertCircle,
  Save,
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { createProduct, updateProduct, deleteProduct } from '../../lib/api';

interface AdminProductsProps {
  products: Product[];
  onProductCreated: (prod: Product) => void;
  onProductUpdated: (prod: Product) => void;
  onProductDeleted: (id: string) => void;
}

export function AdminProducts({
  products,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('handphone');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [specInput, setSpecInput] = useState('');
  const [specs, setSpecs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('handphone');
    setPrice('');
    setOriginalPrice('');
    setStock('10');
    setDescription('');
    setImage('');
    setSpecs([]);
    setSpecInput('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setStock(prod.stock.toString());
    setDescription(prod.description || '');
    setImage(prod.image || '');
    setSpecs(prod.specs || []);
    setSpecInput('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddSpec = () => {
    if (specInput.trim()) {
      setSpecs([...specs, specInput.trim()]);
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Image Upload handler from file
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const parsedPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);
      const parsedOrigPrice = originalPrice
        ? parseInt(originalPrice.replace(/[^0-9]/g, ''), 10)
        : undefined;
      const parsedStock = parseInt(stock.replace(/[^0-9]/g, ''), 10) || 0;

      if (!name.trim()) throw new Error('Nama produk wajib diisi');
      if (isNaN(parsedPrice) || parsedPrice <= 0)
        throw new Error('Harga produk tidak valid');

      const payload = {
        name: name.trim(),
        category,
        price: parsedPrice,
        originalPrice: parsedOrigPrice,
        stock: parsedStock,
        description: description.trim(),
        image: image.trim() || undefined,
        specs,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        onProductUpdated(updated);
      } else {
        const created = await createProduct(payload);
        onProductCreated(created);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      return;
    }
    try {
      await deleteProduct(id);
      onProductDeleted(id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus produk');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-stone-900">
            Katalog Produk Toko ({products.length} Produk)
          </h3>
          <p className="text-xs text-stone-500">
            Kelola handphone & aksesoris untuk etalase pembeli Megaphone Majenang
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
          <Smartphone className="w-14 h-14 stroke-1 text-stone-300 mx-auto mb-3" />
          <p className="font-bold text-stone-800 text-sm">
            Katalog Masih Kosong (Tanpa Data Demo)
          </p>
          <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
            Sesuai instruksi Anda, aplikasi tidak menyertakan data demo bawaan. Silakan klik tombol "Tambah Produk Baru" untuk menambahkan handphone atau aksesoris jualan Anda.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 space-y-3">
                <div className="aspect-video bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center p-2 relative border border-stone-100">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-stone-400">
                      {prod.category === 'handphone' ? (
                        <Smartphone className="w-10 h-10 mx-auto" />
                      ) : (
                        <ShoppingBag className="w-10 h-10 mx-auto" />
                      )}
                      <span className="text-[10px] mt-1 block">Tanpa Foto</span>
                    </div>
                  )}

                  <span
                    className={`absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-sm ${
                      prod.category === 'handphone'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-800 text-white'
                    }`}
                  >
                    {prod.category === 'handphone' ? 'Handphone' : 'Aksesoris'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-stone-900 line-clamp-2">
                    {prod.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-black text-red-600">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </span>
                    {prod.originalPrice && prod.originalPrice > prod.price && (
                      <span className="text-xs text-stone-400 line-through">
                        Rp {prod.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 pt-2 border-t border-stone-100">
                    <span>
                      Stok:{' '}
                      <strong
                        className={prod.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}
                      >
                        {prod.stock} unit
                      </strong>
                    </span>
                    <span>{prod.specs?.length || 0} spesifikasi</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(prod)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(prod.id, prod.name)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Produk"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 my-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-stone-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Samsung Galaxy A55 5G / Casing Silicon..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  >
                    <option value="handphone">Handphone</option>
                    <option value="aksesoris">Aksesoris</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Stok Tersedia
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 3500000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Harga Coret / Promo (Rp, Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3800000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Image upload / URL */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Foto Produk
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {image ? (
                    <div className="w-20 h-20 rounded-xl border border-stone-200 overflow-hidden shrink-0 bg-stone-50 p-1">
                      <img src={image} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-stone-300 flex items-center justify-center text-stone-400 shrink-0 bg-stone-50">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Gambar dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar langsung..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan kondisi produk, garansi resmi, fitur unggulan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* Specifications List builder */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Spesifikasi Produk (RAM, Memori, Chipset, Warna, dll)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Contoh: RAM 8GB / 256GB..."
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                    {specs.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs text-stone-800"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="text-stone-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Menyimpan...'
                      : editingProduct
                      ? 'Simpan Perubahan Produk'
                      : 'Publikasikan Produk'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
