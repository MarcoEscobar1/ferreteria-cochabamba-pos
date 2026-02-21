import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineLogout,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

const navItems = [
  { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: HiOutlineCube, label: 'Productos' },
  { to: '/admin/categories', icon: HiOutlineTag, label: 'Categorías' },
  { to: '/admin/suppliers', icon: HiOutlineTruck, label: 'Proveedores' },
  { to: '/admin/employees', icon: HiOutlineUsers, label: 'Empleados' },
  { to: '/admin/reports', icon: HiOutlineDocumentReport, label: 'Reportes' },
];

export default function AdminLayout() {
  const { employee, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-steel-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-steel-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-bold text-steel-900">Ferretería Cochabamba</h2>
            <p className="text-[11px] text-steel-400">Administración</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-steel-600 hover:bg-steel-50 hover:text-steel-900'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-steel-100" />

          <NavLink
            to="/pos"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50 hover:text-steel-900 transition-all"
          >
            <HiOutlineShoppingCart className="h-5 w-5 flex-shrink-0" />
            Ir al POS
          </NavLink>
        </nav>

        {/* User */}
        <div className="border-t border-steel-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {employee?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-steel-900">{employee?.full_name}</p>
              <p className="text-[11px] text-steel-400">Administrador</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 transition-colors"
              title="Cerrar sesión"
            >
              <HiOutlineLogout className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-steel-50">
        <Outlet />
      </main>
    </div>
  );
}
