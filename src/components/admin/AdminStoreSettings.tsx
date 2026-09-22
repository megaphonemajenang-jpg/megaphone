import { useState, useRef, useEffect } from 'react';
import {
  Save,
  Phone,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Compass,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { updateStoreSettings, changeAdminPassword, fileToBase64 } from '../../lib/api';

interface AdminStoreSettingsProps {
  settings: StoreSettings;
  adminUser?: any;
  initialTab?: 'profile' | 'address' | 'password';
  onSettingsUpdated: (settings: StoreSettings) => void;
}

const ALL_CILACAP_DISTRICTS = [
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
  'Cilacap Selatan',
  'Cilacap Tengah',
  'Cilacap Utara',
  'Kroya',
  'Dayeuhluhur',
  'Adipala',
  'Sampang',
  'Maos',
  'Nusawungu',
  'Bantarsari',
  'Binangun',
  'Kampung Laut',
];

export function AdminStoreSettings({
  settings,
  adminUser,
  initialTab,
  onSettingsUpdated,
}: AdminStoreSettingsProps) {
  // Sub-tabs: 'profile' | 'address' | 'password'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'address' | 'password'>(
    initialTab || 'profile'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // --- Profile state ---
  const [name, setName] = useState(settings.name || 'MEGAPHONE MAJENANG');
  const [tagline, setTagline] = useState(
    settings.tagline || 'Pusat Handphone & Aksesoris Terlengkap Cilacap'
  );
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '081234567890');
  const [email, setEmail] = useState(settings.email || 'megaphonemajenang@gmail.com');
  const [description, setDescription] = useState(
    settings.description ||
      'Pusat Handphone & Aksesoris Terlengkap di Majenang. Melayani COD Bayar di Tempat wilayah Kabupaten Cilacap & sekitarnya, Cash di Toko, serta Transfer Bank.'
  );
  const [openingHours, setOpeningHours] = useState(
    settings.openingHours || 'Setiap Hari: 08:00 - 21:00 WIB'
  );
  const [logo, setLogo] = useState(settings.logo || '');

  // Payment methods
  const [enableCod, setEnableCod] = useState(settings.enableCod !== false);
  const [enableTransfer, setEnableTransfer] = useState(settings.enableTransfer !== false);
  const [enableCash, setEnableCash] = useState(settings.enableCash !== false);
  const [bankAccounts, setBankAccounts] = useState(settings.bankAccounts || []);

  // --- Address state ---
  const [address, setAddress] = useState(settings.address || 'Jl. Diponegoro No. 88, Majenang');
  const [district, setDistrict] = useState(settings.district || 'Majenang');
  const [city, setCity] = useState(settings.city || 'Kabupaten Cilacap');
  const [province, setProvince] = useState(settings.province || 'Jawa Tengah');
  const [postalCode, setPostalCode] = useState(settings.postalCode || '53257');
  const [mapsUrl, setMapsUrl] = useState(
    settings.mapsUrl || 'https://maps.google.com/?q=Majenang+Cilacap'
  );

  // COD shipping zones
  const [codFee, setCodFee] = useState((settings.codFee ?? 0).toString());
  const [codAreas, setCodAreas] = useState<string[]>(
    settings.codAreas && settings.codAreas.length > 0 ? settings.codAreas : ['Majenang', 'Cimanggu', 'Wanareja']
  );
  const [newAreaInput, setNewAreaInput] = useState('');

  // --- Password & Security state ---
  const [adminUsername, setAdminUsername] = useState(adminUser?.username || 'admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setLogo(base64);
    } catch (err) {
      setErrorMsg('Gagal membaca berkas logo gambar.');
    }
  };

  // Add Bank Account
  const handleAddBank = () => {
    setBankAccounts([
      ...bankAccounts,
      { bank: 'BCA', accountNumber: '', accountHolder: 'MEGAPHONE MAJENANG' },
    ]);
  };

  const handleUpdateBank = (index: number, field: string, val: string) => {
    const next = [...bankAccounts];
    next[index] = { ...next[index], [field]: val };
    setBankAccounts(next);
  };

  const handleRemoveBank = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  // Add Single COD Area
  const handleAddArea = () => {
    const clean = newAreaInput.trim();
    if (clean && !codAreas.includes(clean)) {
      setCodAreas([...codAreas, clean]);
      setNewAreaInput('');
    }
  };

  // Bulk Add All Cilacap Areas
  const handleLoadAllCilacapAreas = () => {
    const combined = Array.from(new Set([...codAreas, ...ALL_CILACAP_DISTRICTS]));
    setCodAreas(combined);
  };

  const handleRemoveArea = (area: string) => {
    setCodAreas(codAreas.filter((a) => a !== area));
  };

  // Save Store Settings (Profile & Address)
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSaving(true);

    try {
      const updated = await updateStoreSettings({
        name: name.trim(),
        tagline: tagline.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        description: description.trim(),
        openingHours: openingHours.trim(),
        logo: logo.trim(),
        address: address.trim(),
        district: district.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        mapsUrl: mapsUrl.trim(),
        codFee: parseInt(codFee.replace(/[^0-9]/g, ''), 10) || 0,
        enableCod,
        enableTransfer,
        enableCash,
        bankAccounts,
        codAreas,
      });

      onSettingsUpdated(updated);
      setSuccessMsg('Pengaturan toko MEGAPHONE MAJENANG berhasil disimpan & diperbarui!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan pengaturan toko');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Kata sandi saat ini wajib diisi untuk verifikasi keamanan!');
      return;
    }

    if (newAdminPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter demi keamanan akun!');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru!');
      return;
    }

    setIsSavingPassword(true);
    try {
      const msg = await changeAdminPassword({
        currentPassword,
        newPassword: newAdminPassword,
      });
      setSuccessMsg(msg || 'Kata sandi admin berhasil diperbarui!');
      setCurrentPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui kata sandi admin');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Password Strength evaluation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Cukup', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Kuat', color: 'bg-emerald-500' };
    return { score: 4, label: 'Sangat Kuat', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newAdminPassword);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-100 text-red-600">
              <Building className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Pengaturan Toko & Keamanan Admin
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Kelola profil toko MEGAPHONE MAJENANG, alamat fisik & jangkauan COD Cilacap, serta kata sandi akun admin.
          </p>
        </div>

        {/* Action button in header */}
        {activeSubTab !== 'password' && (
          <button
            onClick={handleSaveStore}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-stone-200/80 p-1.5 rounded-2xl border border-stone-300/60 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building className="w-4 h-4 text-red-600" />
          <span>1. Profil Toko</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('address')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'address'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>2. Alamat & COD</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('password')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'password'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-600" />
          <span>3. Kata Sandi</span>
        </button>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-900 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: PROFIL TOKO */}
      {/* ============================================================ */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveStore} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-600" />
                  Identitas & Profil Utama Toko
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Informasi merek yang akan tampil di halaman utama pembeli, faktur pesanan, dan pesan WhatsApp
                </p>
              </div>
            </div>

            {/* Nama Toko & Slogan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Nama Toko <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MEGAPHONE MAJENANG"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-extrabold text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Nama resmi yang muncul di navbar toko dan invoice.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Slogan / Tagline Toko
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Pusat Handphone & Aksesoris Terlengkap Cilacap"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Motto toko yang ditampilkan di bawah nama brand.
                </p>
              </div>
            </div>

            {/* Deskripsi Toko */}
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">
                Deskripsi Profil Toko
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan mengenai keunggulan, produk handphone dan aksesoris, serta layanan toko..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
              />
            </div>

            {/* Kontak Resmi: WhatsApp & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-stone-100">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Nomor WhatsApp Resmi Admin <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Terkoneksi langsung dengan tombol Floating WhatsApp dan tujuan penerimaan rincian checkout pelanggan.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Email Resmi Toko
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="megaphonemajenang@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Email kontak untuk korespondensi resmi toko Megaphone Majenang.
                </p>
              </div>
            </div>

            {/* Jam Operasional & Logo Toko */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-stone-100">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Jam Buka / Operasional Toko
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="Setiap Hari: 08:00 - 21:00 WIB"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Logo Toko / Foto Etalase Toko
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                    {logo ? (
                      <img src={logo} alt="Logo Toko" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 cursor-pointer"
                      >
                        Pilih Gambar Logo
                      </button>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo('')}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 cursor-pointer font-semibold"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pengaturan Metode Pembayaran */}
            <div className="pt-4 border-t border-stone-100 space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-stone-900">
                  Pilihan Metode Pembayaran Pembeli
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tentukan opsi pembayaran yang dibuka untuk pembeli saat proses checkout
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white cursor-pointer flex items-center gap-3 transition-colors">
                  <input
                    type="checkbox"
                    checked={enableCod}
                    onChange={(e) => setEnableCod(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">COD (Bayar di Tempat)</span>
                    <span className="text-[11px] text-stone-500">Khusus wilayah Cilacap</span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white cursor-pointer flex items-center gap-3 transition-colors">
                  <input
                    type="checkbox"
                    checked={enableCash}
                    onChange={(e) => setEnableCash(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Cash (Tunai di Toko)</span>
                    <span className="text-[11px] text-stone-500">Ambil di kasir Majenang</span>
                  </div>
                </label>

                <label className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white cursor-pointer flex items-center gap-3 transition-colors">
                  <input
                    type="checkbox"
                    checked={enableTransfer}
                    onChange={(e) => setEnableTransfer(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Transfer Bank</span>
                    <span className="text-[11px] text-stone-500">BCA, BRI, dll</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Nomor Rekening Bank Toko */}
            {enableTransfer && (
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-600" />
                      Rekening Bank Pembayaran Toko
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Ditampilkan kepada pembeli yang memilih pembayaran transfer
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBank}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {bankAccounts.map((acc, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200"
                    >
                      <input
                        type="text"
                        placeholder="Bank (BCA/BRI)"
                        value={acc.bank}
                        onChange={(e) => handleUpdateBank(index, 'bank', e.target.value)}
                        className="w-24 sm:w-28 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Nomor Rekening"
                        value={acc.accountNumber}
                        onChange={(e) =>
                          handleUpdateBank(index, 'accountNumber', e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Atas Nama Pemilik Rekening"
                        value={acc.accountHolder}
                        onChange={(e) =>
                          handleUpdateBank(index, 'accountHolder', e.target.value)
                        }
                        className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBank(index)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {bankAccounts.length === 0 && (
                    <p className="text-xs text-stone-400 italic">
                      Belum ada rekening bank yang ditambahkan. Klik tombol "Tambah Rekening".
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tombol Simpan Profil Toko */}
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan Profil...' : 'Simpan Profil Toko'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* TAB 2: ALAMAT TOKO & WILAYAH COD */}
      {/* ============================================================ */}
      {activeSubTab === 'address' && (
        <form onSubmit={handleSaveStore} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Alamat Fisik Toko di Majenang
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Lokasi toko fisik tempat pengambilan pesanan tunai (Cash) dan titik awal pengiriman COD
              </p>
            </div>

            {/* Alamat Lengkap & Patokan */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Alamat Lengkap Toko (Jalan & Nomor Bangunan) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-red-600" />
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Diponegoro No. 88, Majenang..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Majenang"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kabupaten Cilacap"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="Jawa Tengah"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="53257"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Tautan Google Maps */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Tautan Google Maps Lokasi Toko
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="url"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-900 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                    />
                  </div>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Uji Buka Peta</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Jangkauan Wilayah COD & Biaya Pengantaran */}
            <div className="pt-6 border-t border-stone-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-red-600" />
                    Wilayah Jangkauan COD Kabupaten Cilacap & Sekitarnya
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Daftar kecamatan yang dapat memilih metode Cash On Delivery (COD) saat checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadAllCilacapAreas}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Muat Semua Kecamatan Cilacap
                </button>
              </div>

              {/* Biaya Pengantaran COD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Tarif Biaya Pengantaran COD (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={codFee}
                    onChange={(e) => setCodFee(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCodFee('0')}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold cursor-pointer ${
                        codFee === '0'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-stone-600 border-stone-300'
                      }`}
                    >
                      Gratis Ongkir (Rp 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodFee('5000')}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 font-medium cursor-pointer"
                    >
                      Rp 5.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodFee('10000')}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 font-medium cursor-pointer"
                    >
                      Rp 10.000
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Tambah Kecamatan Baru
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Contoh: Majenang, Sidareja..."
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddArea();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddArea}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Daftar Kecamatan Aktif */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Daftar Kecamatan Aktif ({codAreas.length} Wilayah):
                </label>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  {codAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-stone-800 border border-stone-200 shadow-2xs"
                    >
                      <span>Kec. {area}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(area)}
                        className="text-stone-400 hover:text-rose-600 cursor-pointer font-black text-sm"
                        title="Hapus Kecamatan"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {codAreas.length === 0 && (
                    <p className="text-xs text-stone-400 italic">
                      Belum ada kecamatan COD yang aktif. Silakan tambahkan kecamatan.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Simpan Alamat */}
            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan Alamat...' : 'Simpan Alamat & Wilayah COD'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PENGATURAN KATA SANDI ADMIN */}
      {/* ============================================================ */}
      {activeSubTab === 'password' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Pengaturan Kata Sandi & Akses Admin
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Kelola keamanan akun login untuk portal pengelolaan MEGAPHONE MAJENANG
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Ganti Password */}
            <div className="md:col-span-2 space-y-5">
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Username Display */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Username Akun Admin
                  </label>
                  <input
                    type="text"
                    disabled
                    value={adminUsername}
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-700 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Gunakan username ini bersama kata sandi baru untuk masuk ke portal admin.
                  </p>
                </div>

                {/* Kata Sandi Saat Ini */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Kata Sandi Saat Ini <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Kata Sandi Baru */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Kata Sandi Baru <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newAdminPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Kekuatan Sandi:</span>
                        <span className="font-bold text-stone-800">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 1 ? strength.color : 'bg-transparent'
                          } w-1/4`}
                        />
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 2 ? strength.color : 'bg-transparent'
                          } w-1/4`}
                        />
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 3 ? strength.color : 'bg-transparent'
                          } w-1/4`}
                        />
                        <div
                          className={`h-full transition-all ${
                            strength.score >= 4 ? strength.color : 'bg-transparent'
                          } w-1/4`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Kata Sandi Baru */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1.5">
                    Konfirmasi Kata Sandi Baru <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>
                      {isSavingPassword ? 'Memperbarui Sandi...' : 'Perbarui Kata Sandi Admin'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* Security Tips Card */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-extrabold text-xs">Tips Keamanan Akun</h4>
                </div>
                <ul className="space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Gunakan kombinasi minimal 8 karakter dengan huruf dan angka.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Hindari menggunakan tanggal lahir atau nomor telepon yang mudah ditebak.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Jangan bagikan kata sandi admin kepada pihak luar demi privasi data pelanggan.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900">
                <p className="font-bold">Penting:</p>
                <p className="mt-0.5">
                  Setelah mengganti sandi, pastikan Anda mengingat atau mencatat kata sandi baru untuk sesi login berikutnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
