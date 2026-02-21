import { useState, useEffect, useCallback } from 'react';
import { fetchSales, fetchProducts, fetchEmployees } from '../../api/supabaseApi';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import { generateReportPDF } from '../../utils/pdfExport';
import { exportToExcel } from '../../utils/excelExport';
import PageHeader from '../../components/ui/PageHeader';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlineTable,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineCube,
} from 'react-icons/hi';

const TABS = [
  { id: 'general', label: 'General', icon: HiOutlineDocumentReport },
  { id: 'by-employee', label: 'Por Empleado', icon: HiOutlineUserGroup },
  { id: 'by-date', label: 'Por Fecha', icon: HiOutlineCalendar },
  { id: 'inventory', label: 'Inventario', icon: HiOutlineCube },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, productsData, employeesData] = await Promise.all([
        fetchSales({
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate + 'T23:59:59').toISOString() : null,
          employeeId: selectedEmployee || null,
        }),
        fetchProducts({ activeOnly: false }),
        fetchEmployees(),
      ]);
      setSales(salesData);
      setProducts(productsData);
      setEmployees(employeesData);
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedEmployee]);

  useEffect(() => { loadData(); }, [loadData]);

  // General report data
  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalTransactions = sales.length;
  const avgSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Employee summary
  const employeeSummary = employees.map((emp) => {
    const empSales = sales.filter((s) => s.employee_id === emp.id);
    return {
      name: emp.full_name,
      email: emp.email,
      sales_count: empSales.length,
      total: empSales.reduce((sum, s) => sum + Number(s.total), 0),
    };
  }).filter((e) => e.sales_count > 0).sort((a, b) => b.total - a.total);

  // Daily summary
  const dailySummary = {};
  sales.forEach((sale) => {
    const day = formatDate(sale.created_at);
    if (!dailySummary[day]) {
      dailySummary[day] = { date: day, count: 0, total: 0 };
    }
    dailySummary[day].count += 1;
    dailySummary[day].total += Number(sale.total);
  });
  const dailyData = Object.values(dailySummary).sort((a, b) => b.date.localeCompare(a.date));

  // Inventory data
  const inventoryData = products.map((p) => ({
    name: p.name,
    category: p.categories?.name || 'Sin categoría',
    stock: p.stock,
    min_stock: p.min_stock,
    price: p.price,
    value: p.stock * p.price,
    status: p.stock === 0 ? 'Agotado' : p.stock <= p.min_stock ? 'Stock bajo' : 'Normal',
    is_active: p.is_active ? 'Activo' : 'Inactivo',
  })).sort((a, b) => a.stock - b.stock);

  const totalInventoryValue = inventoryData.reduce((sum, p) => sum + p.value, 0);

  const handleExport = (type, format) => {
    let columns, data, title, summary, fileName;

    switch (type) {
      case 'general':
        title = 'Reporte General de Ventas';
        fileName = 'reporte-general';
        columns = [
          { header: 'N° Venta', accessor: (r) => `#${r.sale_number}` },
          { header: 'Fecha', accessor: (r) => formatDateTime(r.created_at) },
          { header: 'Empleado', accessor: (r) => r.employees?.full_name || 'N/A' },
          { header: 'Cliente', accessor: (r) => r.customer_name || 'Cliente general' },
          { header: 'Items', accessor: (r) => r.sale_items?.length || 0 },
          { header: 'Total (BOB)', accessor: (r) => formatCurrency(r.total) },
        ];
        data = sales;
        summary = [
          `Total Ventas: ${formatCurrency(totalSales)}`,
          `Transacciones: ${totalTransactions}`,
          `Promedio por venta: ${formatCurrency(avgSale)}`,
        ];
        break;

      case 'by-employee':
        title = 'Reporte por Empleado';
        fileName = 'reporte-empleados';
        columns = [
          { header: 'Empleado', accessor: (r) => r.name },
          { header: 'Email', accessor: (r) => r.email },
          { header: 'N° Ventas', accessor: (r) => r.sales_count },
          { header: 'Total (BOB)', accessor: (r) => formatCurrency(r.total) },
        ];
        data = employeeSummary;
        summary = [`Total General: ${formatCurrency(totalSales)}`];
        break;

      case 'by-date':
        title = 'Reporte por Fecha';
        fileName = 'reporte-fechas';
        columns = [
          { header: 'Fecha', accessor: (r) => r.date },
          { header: 'N° Ventas', accessor: (r) => r.count },
          { header: 'Total (BOB)', accessor: (r) => formatCurrency(r.total) },
        ];
        data = dailyData;
        summary = [`Total General: ${formatCurrency(totalSales)}`];
        break;

      case 'inventory':
        title = 'Reporte de Inventario';
        fileName = 'reporte-inventario';
        columns = [
          { header: 'Producto', accessor: (r) => r.name },
          { header: 'Categoría', accessor: (r) => r.category },
          { header: 'Stock', accessor: (r) => r.stock },
          { header: 'Mín.', accessor: (r) => r.min_stock },
          { header: 'Precio Unit.', accessor: (r) => formatCurrency(r.price) },
          { header: 'Valor Total', accessor: (r) => formatCurrency(r.value) },
          { header: 'Estado', accessor: (r) => r.status },
          { header: 'Activo', accessor: (r) => r.is_active },
        ];
        data = inventoryData;
        summary = [`Valor total del inventario: ${formatCurrency(totalInventoryValue)}`];
        break;
    }

    if (format === 'pdf') {
      const doc = generateReportPDF({ title, columns, data, summary });
      doc.save(`${fileName}.pdf`);
      toast.success('PDF descargado');
    } else {
      exportToExcel({ title, columns, data, fileName });
      toast.success('Excel descargado');
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Reportes" description="Genera y exporta reportes del negocio" />

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-steel-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-steel-900 shadow-sm'
                : 'text-steel-500 hover:text-steel-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-500">Desde</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-44" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-500">Hasta</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field w-44" />
        </div>
        {activeTab === 'by-employee' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-500">Empleado</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="input-field w-52">
              <option value="">Todos</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
        )}
        {(startDate || endDate || selectedEmployee) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); setSelectedEmployee(''); }} className="btn-ghost text-sm">
            Limpiar filtros
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button onClick={() => handleExport(activeTab, 'pdf')} className="btn-secondary text-sm">
            <HiOutlineDownload className="h-4 w-4" /> PDF
          </button>
          <button onClick={() => handleExport(activeTab, 'excel')} className="btn-secondary text-sm">
            <HiOutlineTable className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Total Ventas</p>
                    <p className="font-display text-2xl font-bold text-brand-700">{formatCurrency(totalSales)}</p>
                  </div>
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Transacciones</p>
                    <p className="font-display text-2xl font-bold text-steel-900">{totalTransactions}</p>
                  </div>
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Promedio/Venta</p>
                    <p className="font-display text-2xl font-bold text-steel-900">{formatCurrency(avgSale)}</p>
                  </div>
                </div>

                {sales.length === 0 ? (
                  <EmptyState icon={HiOutlineDocumentReport} title="Sin datos" description="No hay ventas en el período seleccionado" />
                ) : (
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-steel-200 bg-steel-50/50">
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">N°</th>
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Fecha</th>
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Empleado</th>
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Cliente</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">Items</th>
                            <th className="px-5 py-3 text-right font-semibold text-steel-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((sale) => (
                            <tr key={sale.id} className="border-b border-steel-100 hover:bg-steel-50/30">
                              <td className="px-5 py-2.5 font-mono font-semibold">#{sale.sale_number}</td>
                              <td className="px-5 py-2.5 text-steel-600">{formatDateTime(sale.created_at)}</td>
                              <td className="px-5 py-2.5 text-steel-600">{sale.employees?.full_name || 'N/A'}</td>
                              <td className="px-5 py-2.5 text-steel-600">{sale.customer_name}</td>
                              <td className="px-5 py-2.5 text-center text-steel-600">{sale.sale_items?.length || 0}</td>
                              <td className="px-5 py-2.5 text-right font-mono font-bold text-brand-700">{formatCurrency(sale.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* BY EMPLOYEE TAB */}
            {activeTab === 'by-employee' && (
              <>
                {employeeSummary.length === 0 ? (
                  <EmptyState icon={HiOutlineUserGroup} title="Sin datos" description="No hay ventas por empleados" />
                ) : (
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-steel-200 bg-steel-50/50">
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Empleado</th>
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Email</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">N° Ventas</th>
                            <th className="px-5 py-3 text-right font-semibold text-steel-600">Total (BOB)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeSummary.map((emp, i) => (
                            <tr key={i} className="border-b border-steel-100 hover:bg-steel-50/30">
                              <td className="px-5 py-2.5 font-medium text-steel-900">{emp.name}</td>
                              <td className="px-5 py-2.5 text-steel-600">{emp.email}</td>
                              <td className="px-5 py-2.5 text-center text-steel-600">{emp.sales_count}</td>
                              <td className="px-5 py-2.5 text-right font-mono font-bold text-brand-700">{formatCurrency(emp.total)}</td>
                            </tr>
                          ))}
                          <tr className="bg-steel-50/50 font-semibold">
                            <td className="px-5 py-3" colSpan={2}>TOTAL</td>
                            <td className="px-5 py-3 text-center">{employeeSummary.reduce((s, e) => s + e.sales_count, 0)}</td>
                            <td className="px-5 py-3 text-right font-mono text-brand-700">{formatCurrency(totalSales)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* BY DATE TAB */}
            {activeTab === 'by-date' && (
              <>
                {dailyData.length === 0 ? (
                  <EmptyState icon={HiOutlineCalendar} title="Sin datos" description="No hay ventas en el período" />
                ) : (
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-steel-200 bg-steel-50/50">
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Fecha</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">N° Ventas</th>
                            <th className="px-5 py-3 text-right font-semibold text-steel-600">Total (BOB)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.map((day, i) => (
                            <tr key={i} className="border-b border-steel-100 hover:bg-steel-50/30">
                              <td className="px-5 py-2.5 font-medium text-steel-900">{day.date}</td>
                              <td className="px-5 py-2.5 text-center text-steel-600">{day.count}</td>
                              <td className="px-5 py-2.5 text-right font-mono font-bold text-brand-700">{formatCurrency(day.total)}</td>
                            </tr>
                          ))}
                          <tr className="bg-steel-50/50 font-semibold">
                            <td className="px-5 py-3">TOTAL</td>
                            <td className="px-5 py-3 text-center">{dailyData.reduce((s, d) => s + d.count, 0)}</td>
                            <td className="px-5 py-3 text-right font-mono text-brand-700">{formatCurrency(totalSales)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Productos Totales</p>
                    <p className="font-display text-2xl font-bold text-steel-900">{inventoryData.length}</p>
                  </div>
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Alertas</p>
                    <p className="font-display text-2xl font-bold text-red-600">
                      {inventoryData.filter((p) => p.status !== 'Normal').length}
                    </p>
                  </div>
                  <div className="card p-5 text-center">
                    <p className="text-sm text-steel-500">Valor del Inventario</p>
                    <p className="font-display text-2xl font-bold text-brand-700">{formatCurrency(totalInventoryValue)}</p>
                  </div>
                </div>

                {inventoryData.length === 0 ? (
                  <EmptyState icon={HiOutlineCube} title="Sin productos" description="No hay productos registrados" />
                ) : (
                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-steel-200 bg-steel-50/50">
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Producto</th>
                            <th className="px-5 py-3 text-left font-semibold text-steel-600">Categoría</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">Stock</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">Mín.</th>
                            <th className="px-5 py-3 text-right font-semibold text-steel-600">Precio</th>
                            <th className="px-5 py-3 text-right font-semibold text-steel-600">Valor</th>
                            <th className="px-5 py-3 text-center font-semibold text-steel-600">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData.map((p, i) => (
                            <tr key={i} className={`border-b border-steel-100 ${p.status === 'Agotado' ? 'bg-red-50/30' : p.status === 'Stock bajo' ? 'bg-amber-50/30' : ''}`}>
                              <td className="px-5 py-2.5 font-medium text-steel-900">{p.name}</td>
                              <td className="px-5 py-2.5 text-steel-600">{p.category}</td>
                              <td className="px-5 py-2.5 text-center font-mono font-semibold">{p.stock}</td>
                              <td className="px-5 py-2.5 text-center text-steel-400">{p.min_stock}</td>
                              <td className="px-5 py-2.5 text-right font-mono">{formatCurrency(p.price)}</td>
                              <td className="px-5 py-2.5 text-right font-mono font-semibold">{formatCurrency(p.value)}</td>
                              <td className="px-5 py-2.5 text-center">
                                <span className={
                                  p.status === 'Agotado' ? 'badge-danger' :
                                  p.status === 'Stock bajo' ? 'badge-warning' :
                                  'badge-success'
                                }>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
