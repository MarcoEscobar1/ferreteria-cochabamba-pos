import { useState, useEffect, useCallback } from 'react';
import { fetchSales, fetchSaleById } from '../../api/demoApi';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, formatDateISO } from '../../utils/formatters';
import { generateReceiptPDF } from '../../utils/pdfExport';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ReceiptModal from '../../components/pos/ReceiptModal';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineEye, HiOutlineDownload } from 'react-icons/hi';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const employee = useAuthStore((s) => s.employee);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSales({
        employeeId: employee.id,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate + 'T23:59:59').toISOString() : null,
      });
      setSales(data);
    } catch (err) {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [employee.id, startDate, endDate]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleViewReceipt = async (sale) => {
    try {
      const fullSale = await fetchSaleById(sale.id);
      setSelectedSale(fullSale);
      setShowReceipt(true);
    } catch {
      toast.error('Error al cargar recibo');
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedSale) return;
    const doc = generateReceiptPDF(selectedSale);
    doc.save(`recibo-${selectedSale.sale_number}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Historial de Ventas"
        description="Registro de tus ventas realizadas"
      />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-500">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field w-44"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-500">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field w-44"
          />
        </div>
        {(startDate || endDate) && (
          <div className="flex items-end">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="btn-ghost text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={HiOutlineClock}
            title="Sin ventas"
            description="No se encontraron ventas en el período seleccionado"
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50/50">
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">N° Venta</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Fecha</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Cliente</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Productos</th>
                    <th className="px-5 py-3 text-right font-semibold text-steel-600">Total</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-steel-100 hover:bg-steel-50/30 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-steel-900">
                        #{sale.sale_number}
                      </td>
                      <td className="px-5 py-3 text-steel-600">
                        {formatDateTime(sale.created_at)}
                      </td>
                      <td className="px-5 py-3 text-steel-600">
                        {sale.customer_name || 'Cliente general'}
                      </td>
                      <td className="px-5 py-3 text-steel-600">
                        {sale.sale_items?.length || 0} items
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-brand-700">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleViewReceipt(sale)}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <HiOutlineEye className="h-4 w-4" />
                          Ver recibo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {showReceipt && selectedSale && (
        <ReceiptModal
          sale={selectedSale}
          onClose={() => {
            setShowReceipt(false);
            setSelectedSale(null);
          }}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
}
