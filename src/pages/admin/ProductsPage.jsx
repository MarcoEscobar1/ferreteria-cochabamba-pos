import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchProducts,
  fetchCategories,
  fetchSuppliers,
  createProduct,
  updateProduct,
  toggleProductActive,
  uploadProductImage,
} from '../../api/supabaseApi';
import { formatCurrency } from '../../utils/formatters';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StockBadge from '../../components/ui/StockBadge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlinePhotograph,
  HiOutlineSearch,
} from 'react-icons/hi';

const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'Precio debe ser mayor o igual a 0'),
  stock: z.coerce.number().min(0).optional(),
  min_stock: z.coerce.number().min(0, 'Stock mínimo inválido'),
  category_id: z.string().optional().transform(v => v || null),
  supplier_id: z.string().optional().transform(v => v || null),
});

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      barcode: '',
      price: 0,
      stock: 0,
      min_stock: 5,
      category_id: '',
      supplier_id: '',
    },
  });

  const loadData = useCallback(async () => {
    try {
      const [prods, cats, sups] = await Promise.all([
        fetchProducts({ activeOnly: !showInactive }),
        fetchCategories(),
        fetchSuppliers(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    reset({
      name: '',
      description: '',
      barcode: '',
      price: 0,
      stock: 0,
      min_stock: 5,
      category_id: '',
      supplier_id: '',
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    reset({
      name: product.name,
      description: product.description || '',
      barcode: product.barcode || '',
      price: product.price,
      stock: product.stock,
      min_stock: product.min_stock,
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
    });
    setImageFile(null);
    setImagePreview(product.image_url || '');
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let image_url = editing?.image_url || null;
      if (imageFile) {
        image_url = await uploadProductImage(imageFile);
      }

      const payload = { ...data, image_url };

      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Producto actualizado');
      } else {
        await createProduct(payload);
        toast.success('Producto creado');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = (product) => {
    setConfirmDialog({
      title: product.is_active ? 'Deshabilitar producto' : 'Habilitar producto',
      message: product.is_active
        ? `¿Deseas deshabilitar "${product.name}"? No aparecerá en el POS.`
        : `¿Deseas habilitar "${product.name}"?`,
      onConfirm: async () => {
        try {
          await toggleProductActive(product.id, !product.is_active);
          toast.success(product.is_active ? 'Producto deshabilitado' : 'Producto habilitado');
          loadData();
        } catch (err) {
          toast.error(err.message);
        }
        setConfirmDialog(null);
      },
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Productos"
        description={`${products.length} productos registrados`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <HiOutlinePlus className="h-4 w-4" />
            Nuevo Producto
          </button>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-steel-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-steel-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-steel-300 text-brand-600 focus:ring-brand-500"
          />
          Mostrar deshabilitados
        </label>
      </div>

      {/* Products Table */}
      <div className="mt-6">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={HiOutlineCube}
            title="Sin productos"
            description="Crea tu primer producto"
            action={
              <button onClick={openCreate} className="btn-primary">
                <HiOutlinePlus className="h-4 w-4" />
                Nuevo Producto
              </button>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50/50">
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Imagen</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Producto</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Categoría</th>
                    <th className="px-5 py-3 text-right font-semibold text-steel-600">Precio</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Stock</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Estado</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b border-steel-100 transition-colors hover:bg-steel-50/30 ${
                        !product.is_active ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded-lg bg-steel-100">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <HiOutlineCube className="h-5 w-5 text-steel-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-steel-900">{product.name}</p>
                        {product.barcode && (
                          <p className="text-xs text-steel-400 font-mono">{product.barcode}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-steel-600">
                        {product.categories?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-steel-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StockBadge stock={product.stock} minStock={product.min_stock} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        {product.is_active ? (
                          <span className="badge-success">Activo</span>
                        ) : (
                          <span className="badge-danger">Inactivo</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors"
                            title="Editar"
                          >
                            <HiOutlinePencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`rounded-lg p-1.5 transition-colors ${
                              product.is_active
                                ? 'text-steel-400 hover:bg-red-50 hover:text-red-500'
                                : 'text-steel-400 hover:bg-emerald-50 hover:text-emerald-500'
                            }`}
                            title={product.is_active ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {product.is_active ? (
                              <HiOutlineBan className="h-4 w-4" />
                            ) : (
                              <HiOutlineCheckCircle className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-steel-700">Nombre *</label>
              <input {...register('name')} className="input-field" placeholder="Nombre del producto" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-steel-700">Descripción</label>
              <textarea {...register('description')} className="input-field" rows={2} placeholder="Descripción opcional" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Código de barras</label>
              <input {...register('barcode')} className="input-field" placeholder="Opcional" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Precio (BOB) *</label>
              <input {...register('price')} type="number" step="0.01" min="0" className="input-field" />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>

            {editing ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-steel-700">
                  Stock actual
                  <span className="ml-1 text-xs text-steel-400">(solo lectura)</span>
                </label>
                <input
                  value={editing.stock}
                  disabled
                  className="input-field bg-steel-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-steel-400">
                  El stock solo se modifica mediante ventas
                </p>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-steel-700">Stock inicial</label>
                <input {...register('stock')} type="number" min="0" className="input-field" />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Stock mínimo</label>
              <input {...register('min_stock')} type="number" min="0" className="input-field" />
              {errors.min_stock && <p className="mt-1 text-xs text-red-500">{errors.min_stock.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Categoría</label>
              <select {...register('category_id')} className="input-field">
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Proveedor</label>
              <select {...register('supplier_id')} className="input-field">
                <option value="">Sin proveedor</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-steel-700">Imagen</label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-steel-200">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer">
                  <HiOutlinePhotograph className="h-4 w-4" />
                  {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-steel-100 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </span>
              ) : editing ? (
                'Actualizar'
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
}
