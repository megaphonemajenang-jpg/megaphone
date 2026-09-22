import { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, ArrowLeft, Chrome } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { adminLogin } from '../../lib/api';

interface AdminLoginProps {
  onSuccess: (admin: any) => void;
  onBackToStore: () => void;
}

export function AdminLogin({ onSuccess, onBackToStore }: AdminLoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await adminLogin({ username, password });
      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Username atau password admin salah');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      onSuccess({
        username: user.displayName || 'Admin Megaphone',
        role: 'admin',
        email: user.email,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Toko Pembeli</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-900 to-red-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-extrabold text-stone-900">Portal Admin Megaphone</h1>
          <p className="text-xs text-stone-500 mt-1">
            Pengelolaan Toko, Produk, Banner, Pesanan & Laporan Harian
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Username / Email / No. HP Admin
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username admin"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Kata Sandi Admin
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan sandi (default: admin123)"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Kredensial Default:</p>
            <p>
              Username: <span className="font-mono font-bold text-stone-900">admin</span>
            </p>
            <p>
              Password: <span className="font-mono font-bold text-stone-900">admin123</span>
            </p>
            <p className="text-stone-400 italic">
              (Dapat diubah kapan saja pada menu Pengaturan Toko di halaman admin).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Portal Admin'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-stone-400 text-[11px]">Atau autentikasi cloud</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Chrome className="w-4 h-4 text-red-500" />
            <span>Masuk Akun Google (megaphonemajenang@gmail.com)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
