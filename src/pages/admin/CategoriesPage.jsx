import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  toggleCategoryActive,
} from '../../api/supabaseApi';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineTag,
} from 'react-icons/hi';

const categorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchCategories({ activeOnly: !showInactive });
      setCategories(data);
    } catch (err) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    reset({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, data);
        toast.success('Categoría actualizada');
      } else {
        await createCategory(data);
        toast.success('Categoría creada');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (cat) => {
    setConfirmDialog({
      title: cat.is_active ? 'Deshabilitar categoría' : 'Habilitar categoría',
      message: cat.is_active
        ? `¿Deseas deshabilitar "${cat.name}"?`
        : `¿Deseas habilitar "${cat.name}"?`,
      onConfirm: async () => {
        try {
          await toggleCategoryActive(cat.id, !cat.is_active);
          toast.success(cat.is_active ? 'Categoría deshabilitada' : 'Categoría habilitada');
          loadData();
        } catch (err) {
          toast.error(err.message);
        }
        setConfirmDialog(null);
      },
    });
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="p-6">
      <PageHeader
        title="Categorías"
        description={`${categories.length} categorías registradas`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <HiOutlinePlus className="h-4 w-4" />
            Nueva Categoría
          </button>
        }
      />

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-steel-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-steel-300 text-brand-600 focus:ring-brand-500"
          />
          Mostrar deshabilitadas
        </label>
      </div>

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState
            icon={HiOutlineTag}
            title="Sin categorías"
            description="Crea tu primera categoría"
            action={<button onClick={openCreate} className="btn-primary"><HiOutlinePlus className="h-4 w-4" />Nueva</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`card p-5 ${!cat.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <HiOutlineTag className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-steel-900">{cat.name}</h3>
                      {cat.description && (
                        <p className="mt-0.5 text-xs text-steel-400">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors">
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(cat)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        cat.is_active
                          ? 'text-steel-400 hover:bg-red-50 hover:text-red-500'
                          : 'text-steel-400 hover:bg-emerald-50 hover:text-emerald-500'
                      }`}
                    >
                      {cat.is_active ? <HiOutlineBan className="h-4 w-4" /> : <HiOutlineCheckCircle className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  {cat.is_active ? <span className="badge-success">Activa</span> : <span className="badge-danger">Inactiva</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-steel-700">Nombre *</label>
            <input {...register('name')} className="input-field" placeholder="Nombre de la categoría" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-steel-700">Descripción</label>
            <textarea {...register('description')} className="input-field" rows={2} placeholder="Descripción opcional" />
          </div>
          <div className="flex justify-end gap-3 border-t border-steel-100 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

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
