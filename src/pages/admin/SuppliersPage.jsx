import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  toggleSupplierActive,
} from '../../api/demoApi';
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
  HiOutlineTruck,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from 'react-icons/hi';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  address: z.string().optional(),
});

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(supplierSchema),
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchSuppliers({ activeOnly: !showInactive });
      setSuppliers(data);
    } catch (err) {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', phone: '', email: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (sup) => {
    setEditing(sup);
    reset({ name: sup.name, phone: sup.phone || '', email: sup.email || '', address: sup.address || '' });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(editing.id, data);
        toast.success('Proveedor actualizado');
      } else {
        await createSupplier(data);
        toast.success('Proveedor creado');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (sup) => {
    setConfirmDialog({
      title: sup.is_active ? 'Deshabilitar proveedor' : 'Habilitar proveedor',
      message: sup.is_active
        ? `¿Deseas deshabilitar "${sup.name}"?`
        : `¿Deseas habilitar "${sup.name}"?`,
      onConfirm: async () => {
        try {
          await toggleSupplierActive(sup.id, !sup.is_active);
          toast.success(sup.is_active ? 'Proveedor deshabilitado' : 'Proveedor habilitado');
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
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Proveedores"
        description={`${suppliers.length} proveedores registrados`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <HiOutlinePlus className="h-4 w-4" />
            Nuevo Proveedor
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
          Mostrar deshabilitados
        </label>
      </div>

      <div className="mt-6">
        {suppliers.length === 0 ? (
          <EmptyState
            icon={HiOutlineTruck}
            title="Sin proveedores"
            description="Registra tu primer proveedor"
            action={<button onClick={openCreate} className="btn-primary"><HiOutlinePlus className="h-4 w-4" />Nuevo</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((sup) => (
              <div key={sup.id} className={`card p-5 ${!sup.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <HiOutlineTruck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-steel-900">{sup.name}</h3>
                      {sup.is_active ? <span className="badge-success text-[10px]">Activo</span> : <span className="badge-danger text-[10px]">Inactivo</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(sup)} className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors">
                      <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(sup)}
                      className={`rounded-lg p-1.5 transition-colors ${sup.is_active ? 'text-steel-400 hover:bg-red-50 hover:text-red-500' : 'text-steel-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                    >
                      {sup.is_active ? <HiOutlineBan className="h-4 w-4" /> : <HiOutlineCheckCircle className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-steel-500">
                  {sup.phone && <p className="flex items-center gap-1.5"><HiOutlinePhone className="h-3.5 w-3.5" />{sup.phone}</p>}
                  {sup.email && <p className="flex items-center gap-1.5"><HiOutlineMail className="h-3.5 w-3.5" />{sup.email}</p>}
                  {sup.address && <p className="flex items-center gap-1.5"><HiOutlineLocationMarker className="h-3.5 w-3.5" />{sup.address}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-steel-700">Nombre *</label>
            <input {...register('name')} className="input-field" placeholder="Nombre del proveedor" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Teléfono</label>
              <input {...register('phone')} className="input-field" placeholder="+591..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="correo@ejemplo.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-steel-700">Dirección</label>
            <input {...register('address')} className="input-field" placeholder="Dirección del proveedor" />
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
        <ConfirmDialog open={true} title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onClose={() => setConfirmDialog(null)} />
      )}
    </div>
  );
}
