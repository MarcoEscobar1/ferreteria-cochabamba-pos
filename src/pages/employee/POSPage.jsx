import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts, fetchCategories, processSale, fetchSaleById } from '../../api/supabaseApi';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/formatters';
import { generateReceiptPDF } from '../../utils/pdfExport';
import StockBadge from '../../components/ui/StockBadge';
import Spinner from '../../components/ui/Spinner';
import ReceiptModal from '../../components/pos/ReceiptModal';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineTrash,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [processing, setProcessing] = useState(false);
  const [receiptSale, setReceiptSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const employee = useAuthStore((s) => s.employee);
  const {
    items: cartItems,
    customerName,
    addItem,
    updateQuantity,
    removeItem,
    setCustomerName,
    getTotal,
    getItemCount,
    clear,
  } = useCartStore();

  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    const added = addItem(product);
    if (!added) {
      toast.error(product.stock <= 0 ? 'Producto agotado' : 'Stock máximo alcanzado');
    }
  };

  const handleProcessSale = async () => {
    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        employee_id: employee.id,
        customer_name: customerName || 'Cliente general',
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const result = await processSale(saleData);

      // Fetch complete sale for receipt
      const sale = await fetchSaleById(result.sale_id);
      setReceiptSale(sale);
      setShowReceipt(true);

      clear();
      toast.success(`Venta N° ${result.sale_number} procesada exitosamente`);

      // Reload products to get updated stock
      const prods = await fetchProducts();
      setProducts(prods);
    } catch (err) {
      toast.error(err.message || 'Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!receiptSale) return;
    const doc = generateReceiptPDF(receiptSale);
    doc.save(`recibo-${receiptSale.sale_number}.pdf`);
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="flex h-full">
      {/* Products section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search & Filters */}
        <div className="border-b border-steel-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel-400" />
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field sm:w-48"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HiOutlineShoppingCart className="h-12 w-12 text-steel-300" />
              <p className="mt-3 text-sm text-steel-500">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`card group relative overflow-hidden p-0 text-left transition-all hover:shadow-md ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-300 cursor-pointer'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square w-full overflow-hidden bg-steel-100">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <HiOutlineShoppingCart className="h-10 w-10 text-steel-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="truncate text-xs text-steel-400">{product.categories?.name || 'Sin categoría'}</p>
                    <h3 className="mt-0.5 truncate text-sm font-semibold text-steel-900">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-brand-700">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <StockBadge stock={product.stock} minStock={product.min_stock} />
                    </div>
                  </div>

                  {/* Add overlay */}
                  {product.stock > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-600/0 opacity-0 transition-all group-hover:bg-brand-600/10 group-hover:opacity-100">
                      <div className="rounded-full bg-brand-600 p-2 shadow-lg">
                        <HiOutlinePlus className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart sidebar */}
      <div className="flex w-96 flex-col border-l border-steel-200 bg-white">
        {/* Cart header */}
        <div className="border-b border-steel-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-steel-900">Carrito</h2>
            {cartItems.length > 0 && (
              <span className="badge-info">{getItemCount()} items</span>
            )}
          </div>
        </div>

        {/* Customer name */}
        <div className="border-b border-steel-100 px-5 py-3">
          <input
            type="text"
            placeholder="Nombre del cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HiOutlineShoppingCart className="h-10 w-10 text-steel-300" />
              <p className="mt-2 text-sm text-steel-500">Carrito vacío</p>
              <p className="text-xs text-steel-400">Selecciona productos para agregar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="rounded-xl border border-steel-100 bg-steel-50/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium text-steel-900">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-steel-400">
                        {formatCurrency(item.unit_price)} c/u
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="rounded-lg p-1 text-steel-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="rounded-lg border border-steel-200 bg-white p-1 text-steel-600 hover:bg-steel-50 transition-colors"
                      >
                        <HiOutlineMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-steel-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.stock) {
                            updateQuantity(item.product_id, item.quantity + 1);
                          } else {
                            toast.error('Stock máximo alcanzado');
                          }
                        }}
                        className="rounded-lg border border-steel-200 bg-white p-1 text-steel-600 hover:bg-steel-50 transition-colors"
                      >
                        <HiOutlinePlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-bold text-steel-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t border-steel-200 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-steel-500">Método de pago:</span>
            <span className="text-sm font-medium text-steel-700">Efectivo / BOB</span>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-base font-semibold text-steel-900">Total</span>
            <span className="font-mono text-xl font-bold text-brand-700">
              {formatCurrency(getTotal())}
            </span>
          </div>

          <div className="flex gap-2">
            {cartItems.length > 0 && (
              <button onClick={clear} className="btn-ghost flex-shrink-0">
                Limpiar
              </button>
            )}
            <button
              onClick={handleProcessSale}
              disabled={cartItems.length === 0 || processing}
              className="btn-primary flex-1 py-3"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Procesando...
                </span>
              ) : (
                'Procesar Venta'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          onClose={() => {
            setShowReceipt(false);
            setReceiptSale(null);
          }}
          onDownload={handleDownloadPDF}
        />
      )}
    </div>
  );
}
