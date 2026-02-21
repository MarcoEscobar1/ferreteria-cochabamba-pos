import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeActive,
} from '../../api/supabaseApi';
import { useAuthStore } from '../../stores/authStore';
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
  HiOutlineUsers,
  HiOutlineMail,
  HiOutlinePhone,
} from 'react-icons/hi';

const employeeSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'employee']),
});

const editEmployeeSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'employee']),
});

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [saving, setSaving] = useState(false);

  const currentUser = useAuthStore((s) => s.employee);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editing ? editEmployeeSchema : employeeSchema),
  });

  const loadData = useCallback(async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    reset({ full_name: '', email: '', phone: '', role: 'employee' });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    reset({ full_name: emp.full_name, phone: emp.phone || '', role: emp.role });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateEmployee(editing.id, {
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        });
        toast.success('Empleado actualizado');
      } else {
        await createEmployee(data);
        toast.success('Invitación enviada al empleado');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (emp) => {
    if (emp.id === currentUser?.id) {
      toast.error('No puedes deshabilitarte a ti mismo');
      return;
    }

    setConfirmDialog({
      title: emp.is_active ? 'Deshabilitar empleado' : 'Habilitar empleado',
      message: emp.is_active
        ? `¿Deseas deshabilitar a "${emp.full_name}"? No podrá iniciar sesión.`
        : `¿Deseas habilitar a "${emp.full_name}"?`,
      onConfirm: async () => {
        try {
          await toggleEmployeeActive(emp.id, !emp.is_active);
          toast.success(emp.is_active ? 'Empleado deshabilitado' : 'Empleado habilitado');
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
        title="Empleados"
        description={`${employees.length} empleados registrados`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <HiOutlinePlus className="h-4 w-4" />
            Invitar Empleado
          </button>
        }
      />

      <div className="mt-6">
        {employees.length === 0 ? (
          <EmptyState
            icon={HiOutlineUsers}
            title="Sin empleados"
            description="Invita a tu primer empleado"
            action={<button onClick={openCreate} className="btn-primary"><HiOutlinePlus className="h-4 w-4" />Invitar</button>}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-50/50">
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Empleado</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Email</th>
                    <th className="px-5 py-3 text-left font-semibold text-steel-600">Teléfono</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Rol</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Estado</th>
                    <th className="px-5 py-3 text-center font-semibold text-steel-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className={`border-b border-steel-100 hover:bg-steel-50/30 transition-colors ${!emp.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                            {emp.full_name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-steel-900">{emp.full_name}</span>
                          {emp.id === currentUser?.id && <span className="badge-info text-[10px]">Tú</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-steel-600">{emp.email}</td>
                      <td className="px-5 py-3 text-steel-600">{emp.phone || '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`badge ${emp.role === 'admin' ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20' : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'}`}>
                          {emp.role === 'admin' ? 'Admin' : 'Empleado'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {emp.is_active ? <span className="badge-success">Activo</span> : <span className="badge-danger">Inactivo</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(emp)} className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors" title="Editar">
                            <HiOutlinePencil className="h-4 w-4" />
                          </button>
                          {emp.id !== currentUser?.id && (
                            <button
                              onClick={() => handleToggle(emp)}
                              className={`rounded-lg p-1.5 transition-colors ${emp.is_active ? 'text-steel-400 hover:bg-red-50 hover:text-red-500' : 'text-steel-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                              title={emp.is_active ? 'Deshabilitar' : 'Habilitar'}
                            >
                              {emp.is_active ? <HiOutlineBan className="h-4 w-4" /> : <HiOutlineCheckCircle className="h-4 w-4" />}
                            </button>
                          )}
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Empleado' : 'Invitar Empleado'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-steel-700">Nombre completo *</label>
            <input {...register('full_name')} className="input-field" placeholder="Nombre y apellido" />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>
          {!editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Email *</label>
              <input {...register('email')} type="email" className="input-field" placeholder="correo@ejemplo.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              <p className="mt-1 text-xs text-steel-400">Se enviará una invitación a este correo</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Teléfono</label>
              <input {...register('phone')} className="input-field" placeholder="+591..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-steel-700">Rol *</label>
              <select {...register('role')} className="input-field">
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-steel-100 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Enviar Invitación'}
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
