import { useState } from 'react';
import { Plus, Trash2, Upload, Image as ImageIcon, Save, X, AlertCircle } from 'lucide-react';
import { PromoBanner } from '../../types';
import { createBanner, deleteBanner, updateBanner } from '../../lib/api';

interface AdminBannersProps {
  banners: PromoBanner[];
  onBannerCreated: (banner: PromoBanner) => void;
  onBannerDeleted: (id: string) => void;
  onBannerUpdated: (banner: PromoBanner) => void;
}

export function AdminBanners({
  banners,
  onBannerCreated,
  onBannerDeleted,
  onBannerUpdated,
}: AdminBannersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran banner maksimal 2MB!');
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

  const handleToggleActive = async (banner: PromoBanner) => {
    try {
      const updated = await updateBanner(banner.id, { active: !banner.active });
      onBannerUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus banner promo ini?')) return;
    try {
      await deleteBanner(id);
      onBannerDeleted(id);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus banner');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (!title.trim()) throw new Error('Judul banner wajib diisi');

      const created = await createBanner({
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim(),
        link: link.trim(),
        active: true,
      });

      onBannerCreated(created);
      setIsModalOpen(false);
      setTitle('');
      setSubtitle('');
      setImage('');
      setLink('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-stone-900">
            Banner Promo Beranda ({banners.length} Banner)
          </h3>
          <p className="text-xs text-stone-500">
            Atur slider promo diskon, pengantaran COD Cilacap, dan penawaran spesial
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Banner Promo</span>
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
          <ImageIcon className="w-14 h-14 stroke-1 text-stone-300 mx-auto mb-3" />
          <p className="font-bold text-stone-800 text-sm">
            Belum Ada Banner Promo
          </p>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Tambahkan banner promosi untuk menarik pelanggan di beranda aplikasi Megaphone Majenang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-21/9 bg-stone-900 relative overflow-hidden flex items-center justify-center">
                {b.image ? (
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white p-4">
                    <h4 className="font-black text-lg">{b.title}</h4>
                    <p className="text-xs text-stone-300 mt-1">{b.subtitle}</p>
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    b.active ? 'bg-emerald-500 text-white' : 'bg-stone-500 text-white'
                  }`}
                >
                  {b.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-stone-900">{b.title}</h4>
                  <p className="text-xs text-stone-500">{b.subtitle}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(b)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 cursor-pointer"
                  >
                    {b.active ? 'Matikan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-stone-900">
                Tambah Banner Promo Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Judul Promo Banner
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PROMO MERIAH GADGET MAJENANG"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Sub-Judul / Keterangan Singkat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bebas Ongkir COD Wilayah Kab. Cilacap"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {/* Upload image */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Gambar Banner (Rasio Landscape)
                </label>
                {image && (
                  <div className="aspect-21/9 rounded-xl overflow-hidden mb-2 border border-stone-200">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Atau masukkan tautan URL gambar..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Banner Promo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
