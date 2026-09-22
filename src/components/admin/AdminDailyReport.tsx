import { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  Calendar,
  Phone,
  MessageCircle,
  FileText,
  DollarSign,
  Truck,
  CreditCard,
  Building,
} from 'lucide-react';
import { DailyReportItem, Order } from '../../types';
import { fetchDailyReports } from '../../lib/api';

export function AdminDailyReport() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchDailyReports(selectedDate);
      setReports(data);
    } catch (err) {
      console.error('Error fetching daily reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentReport = reports[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentReport || !currentReport.orders.length) {
      alert('Tidak ada transaksi untuk diekspor pada tanggal ini.');
      return;
    }

    const headers = [
      'No Invoice',
      'Waktu',
      'Nama Pembeli',
      'No WhatsApp Pembeli',
      'Metode Pembayaran',
      'Alamat / Tujuan',
      'Daftar Barang',
      'Status',
      'Total (Rp)',
    ];

    const rows = currentReport.orders.map((o) => [
      `"${o.invoiceNumber}"`,
      `"${new Date(o.createdAt).toLocaleTimeString('id-ID')}"`,
      `"${o.customerName}"`,
      `"${o.customerWhatsapp}"`,
      `"${o.paymentMethod.toUpperCase()}"`,
      `"${o.deliveryAddress.fullAddress}, Kec. ${o.deliveryAddress.district}"`,
      `"${o.items.map((it) => `${it.productName} (${it.quantity}x)`).join('; ')}"`,
      `"${o.status}"`,
      o.total,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Penjualan-Megaphone-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Control header - Hidden during print */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-stone-900">
              Laporan Penjualan Harian Terperinci
            </h3>
            <p className="text-xs text-stone-500">
              Nomor WhatsApp pembeli disertakan otomatis untuk memudahkan tindak lanjut
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-700">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium"
            />
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Hari Ini
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs print:border-none print:shadow-none space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-stone-900">MEGAPHONE MAJENANG</h2>
              <p className="text-xs text-stone-500">
                Pusat Handphone & Aksesoris • Wilayah Kabupaten Cilacap & Sekitarnya
              </p>
              <p className="text-xs text-stone-500">
                Jl. Diponegoro No. 88, Kec. Majenang, Kab. Cilacap, Jawa Tengah
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Tanggal Laporan
              </span>
              <span className="text-base font-extrabold text-stone-900">
                {new Date(selectedDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Summary Stats */}
        {currentReport ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-500 block font-medium">Total Omset Harian</span>
              <span className="text-xl font-black text-red-600 block mt-1">
                Rp {currentReport.totalRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-400">{currentReport.totalOrders} Transaksi</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-500 block font-medium flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-red-600" />
                COD Cilacap
              </span>
              <span className="text-lg font-extrabold text-stone-900 block mt-1">
                Rp {currentReport.codRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-400">{currentReport.codCount} Transaksi COD</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-500 block font-medium flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                Transfer Bank
              </span>
              <span className="text-lg font-extrabold text-stone-900 block mt-1">
                Rp {currentReport.transferRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-400">{currentReport.transferCount} Transaksi Transfer</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs text-stone-500 block font-medium flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                Cash di Toko
              </span>
              <span className="text-lg font-extrabold text-stone-900 block mt-1">
                Rp {currentReport.cashRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-400">{currentReport.cashCount} Transaksi Cash</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            Tidak ada rekap penjualan untuk tanggal ini.
          </div>
        )}

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <th className="py-3 px-3">No. Invoice</th>
                <th className="py-3 px-3">Jam</th>
                <th className="py-3 px-3">Nama Pembeli</th>
                {/* Wajib disertakan otomatis dalam setiap laporan */}
                <th className="py-3 px-3 text-red-700 bg-red-50/50">
                  No. WhatsApp Pembeli
                </th>
                <th className="py-3 px-3">Rincian Barang</th>
                <th className="py-3 px-3">Metode</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Total (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {!currentReport || currentReport.orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Belum ada transaksi pada tanggal ini.
                  </td>
                </tr>
              ) : (
                currentReport.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                      {order.invoiceNumber}
                    </td>
                    <td className="py-3 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    {/* Buyer WhatsApp Column */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700 bg-red-50/30 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${order.customerWhatsapp.replace(/[^0-9]/g, '').startsWith('0') ? '62' + order.customerWhatsapp.replace(/[^0-9]/g, '').slice(1) : order.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1.5"
                        title="Klik untuk langsung chat pelanggan"
                      >
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{order.customerWhatsapp}</span>
                      </a>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-stone-600">
                      {order.items
                        .map((it) => `${it.productName} (${it.quantity}x)`)
                        .join(', ')}
                    </td>
                    <td className="py-3 px-3 uppercase font-mono font-bold text-stone-700 whitespace-nowrap">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-stone-100 text-stone-700">
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-stone-900 whitespace-nowrap">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {currentReport && currentReport.orders.length > 0 && (
              <tfoot>
                <tr className="bg-stone-50 font-black text-xs border-t-2 border-stone-200">
                  <td colSpan={7} className="py-3 px-3 text-right uppercase">
                    Total Keseluruhan Hari Ini:
                  </td>
                  <td className="py-3 px-3 text-right text-red-600 font-extrabold text-sm">
                    Rp {currentReport.totalRevenue.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
