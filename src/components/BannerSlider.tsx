import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, MapPin, Truck, ShieldCheck } from 'lucide-react';
import { PromoBanner, StoreSettings } from '../types';

interface BannerSliderProps {
  banners: PromoBanner[];
  storeSettings: StoreSettings;
  onOpenWhatsApp: () => void;
}

export function BannerSlider({ banners, storeSettings, onOpenWhatsApp }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter((b) => b.active);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) {
    // Elegant welcome header when store has no promotional banners uploaded yet
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-red-950 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Toko Resmi Majenang Cilacap
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {storeSettings.name}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-300 leading-relaxed">
              {storeSettings.description ||
                'Pusat Handphone & Aksesoris Terlengkap di Majenang. Melayani COD Bayar di Tempat wilayah Kabupaten Cilacap & sekitarnya, Cash di Toko, serta Transfer Bank.'}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                id="header-wa-consult-btn"
                onClick={onOpenWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Konsultasi Produk via WhatsApp</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-stone-300 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>COD Majenang, Cimanggu, Wanareja, dll</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Garansi Resmi & Terpercaya</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>COD Antar Sampai Rumah</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span>Bisa Ambil Langsung di Toko</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = activeBanners[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white aspect-[21/9] min-h-[220px] max-h-[380px] shadow-xl group">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover object-center transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
          <div className="max-w-xl">
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {current.title}
            </h3>
            {current.subtitle && (
              <p className="mt-1 text-xs sm:text-base text-stone-200 drop-shadow-sm line-clamp-2">
                {current.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Banner sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Banner selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 right-6 flex items-center gap-1.5">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-6 bg-red-500' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Pindah ke banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
