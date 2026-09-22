import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Download, Share2, Smartphone, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { StoreSettings } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
}

export function ShareAppModal({ isOpen, onClose, storeSettings }: ShareAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://megaphonemajenang.com';

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(currentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation error', err);
      });
  }, [isOpen, currentUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-MEGAPHONE-MAJENANG.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Share2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">Bagikan Toko</h2>
        <p className="text-xs text-stone-500 mt-1">
          {storeSettings.name} • Wilayah Majenang & Cilacap
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code Toko Megaphone Majenang"
              className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl shadow-xs"
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-stone-400 text-xs">
              Membuat Kode QR...
            </div>
          )}
          <p className="text-[11px] text-stone-500 mt-2 font-medium">
            Scan langsung dengan kamera HP pelanggan
          </p>
        </div>

        {/* Download QR Button */}
        <div className="mb-4">
          <button
            onClick={handleDownloadQr}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Kode QR (Gambar PNG)</span>
          </button>
        </div>

        {/* Direct Link Box */}
        <div className="text-left space-y-1.5">
          <label className="text-[11px] font-bold text-stone-600 block">
            Tautan Langsung Aplikasi:
          </label>
          <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-xl border border-stone-200">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent text-xs text-stone-800 font-mono focus:outline-hidden select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
          Bagikan link ini ke grup WhatsApp, media sosial, atau cetak kode QR untuk dipajang di kasir toko Megaphone Majenang.
        </p>
      </div>
    </div>
  );
}
