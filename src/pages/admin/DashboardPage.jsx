import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardMetrics, fetchSales } from '../../api/supabaseApi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineExclamation,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [metricsData, salesData] = await Promise.all([
        fetchDashboardMetrics(),
        fetchSales(),
      ]);
      setMetrics(metricsData);
      setRecentSales(salesData.slice(0, 10));
    } catch (err) {
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Spinner size="lg" />;

  const statCards = [
    {
      label: 'Ventas del Día',
      value: formatCurrency(metrics?.totalSalesToday || 0),
      icon: HiOutlineCurrencyDollar,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Transacciones Hoy',
      value: metrics?.salesCountToday || 0,
      icon: HiOutlineShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Productos Activos',
      value: metrics?.totalProducts || 0,
      icon: HiOutlineCube,
      color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Alertas de Stock',
      value: (metrics?.lowStockProducts?.length || 0) + (metrics?.outOfStockProducts?.length || 0),
      icon: HiOutlineExclamation,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard"
        description={`Resumen del día — ${new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-steel-500">{stat.label}</p>
                <p className="font-display text-2xl font-bold text-steel-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Stock Alerts */}
        <div className="card">
          <div className="border-b border-steel-100 px-5 py-4">
            <h3 className="font-display text-base font-semibold text-steel-900">
              <HiOutlineExclamation className="mr-2 inline h-5 w-5 text-red-500" />
              Alertas de Stock
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto p-5">
            {(metrics?.outOfStockProducts?.length === 0 && metrics?.lowStockProducts?.length === 0) ? (
              <p className="text-center text-sm text-steel-400 py-6">Sin alertas de stock</p>
            ) : (
              <div className="space-y-2">
                {metrics?.outOfStockProducts?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2.5">
                    <span className="text-sm font-medium text-red-800">{p.name}</span>
                    <span className="badge-danger">Agotado</span>
                  </div>
                ))}
                {metrics?.lowStockProducts?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2.5">
                    <span className="text-sm font-medium text-amber-800">{p.name}</span>
                    <span className="badge-warning">Stock: {p.stock} (min: {p.min_stock})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card">
          <div className="border-b border-steel-100 px-5 py-4">
            <h3 className="font-display text-base font-semibold text-steel-900">
              <HiOutlineTrendingUp className="mr-2 inline h-5 w-5 text-brand-500" />
              Ventas Recientes
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recentSales.length === 0 ? (
              <p className="p-5 text-center text-sm text-steel-400">Sin ventas recientes</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-100 bg-steel-50/50">
                    <th className="px-5 py-2 text-left text-xs font-semibold text-steel-500">N°</th>
                    <th className="px-5 py-2 text-left text-xs font-semibold text-steel-500">Empleado</th>
                    <th className="px-5 py-2 text-left text-xs font-semibold text-steel-500">Fecha</th>
                    <th className="px-5 py-2 text-right text-xs font-semibold text-steel-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-steel-50">
                      <td className="px-5 py-2 font-mono font-semibold">#{sale.sale_number}</td>
                      <td className="px-5 py-2 text-steel-600">{sale.employees?.full_name || 'N/A'}</td>
                      <td className="px-5 py-2 text-steel-500">{formatDateTime(sale.created_at)}</td>
                      <td className="px-5 py-2 text-right font-mono font-bold text-brand-700">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
