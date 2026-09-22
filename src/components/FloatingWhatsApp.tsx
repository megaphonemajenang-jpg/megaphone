import { useState } from 'react';
import { MessageCircle, X, Send, Truck, Smartphone, HelpCircle } from 'lucide-react';
import { StoreSettings } from '../types';

interface FloatingWhatsAppProps {
  storeSettings: StoreSettings;
}

export function FloatingWhatsApp({ storeSettings }: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const cleanPhone = storeSettings.whatsapp.replace(/[^0-9]/g, '');
  const standardPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  const quickMessages = [
    {
      title: 'Tanya Stok Handphone',
      icon: <Smartphone className="w-4 h-4 text-red-600" />,
      text: 'Halo Admin MEGAPHONE MAJENANG, saya ingin tanya ketersediaan stok handphone hari ini.',
    },
    {
      title: 'Info COD Cilacap & Sekitarnya',
      icon: <Truck className="w-4 h-4 text-emerald-600" />,
      text: 'Halo Admin MEGAPHONE MAJENANG, apakah bisa pengantaran COD untuk wilayah kecamatan saya?',
    },
    {
      title: 'Konsultasi Aksesoris & Charger',
      icon: <HelpCircle className="w-4 h-4 text-sky-600" />,
      text: 'Halo Admin MEGAPHONE MAJENANG, saya butuh rekomendasi aksesoris / casing / charger yang cocok.',
    },
  ];

  const handleSend = (textToSend: string) => {
    const encoded = encodeURIComponent(textToSend || 'Halo Admin MEGAPHONE MAJENANG, saya ingin bertanya.');
    window.open(`https://wa.me/${standardPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Chat Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-emerald-600 font-black flex items-center justify-center text-sm shadow-xs">
                  MM
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-300 ring-2 ring-emerald-600" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">Admin Megaphone Majenang</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                  <span>Online</span> • Respon Cepat
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-stone-50 space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-2xs border border-stone-200/80 text-xs text-stone-700 space-y-1">
              <p className="font-bold text-stone-900">
                Halo! Selamat datang di Megaphone Majenang 👋
              </p>
              <p className="text-stone-600 leading-relaxed">
                Ada yang bisa kami bantu seputar handphone, aksesoris, atau layanan COD di wilayah Cilacap?
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Pilih Topik Chat Cepat:
              </p>
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(msg.text)}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-xs text-stone-800 flex items-center gap-2 transition-all cursor-pointer shadow-2xs group"
                >
                  {msg.icon}
                  <span className="font-semibold flex-1 group-hover:text-emerald-800">
                    {msg.title}
                  </span>
                  <Send className="w-3 h-3 text-stone-300 group-hover:text-emerald-600" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <input
                  type="text"
                  placeholder="Ketik pesan Anda..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSend(customMsg);
                      setCustomMsg('');
                    }
                  }}
                  className="flex-1 px-2 text-xs bg-transparent focus:outline-hidden text-stone-800 placeholder:text-stone-400"
                />
                <button
                  onClick={() => {
                    handleSend(customMsg);
                    setCustomMsg('');
                  }}
                  className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-emerald-600/40 transition-all cursor-pointer transform hover:scale-105"
        title="Chat WhatsApp Admin Megaphone Majenang"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline">Chat WhatsApp Admin</span>
      </button>
    </div>
  );
}
