import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingCart,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineChartBar,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

const navItems = [
  { to: '/pos', icon: HiOutlineShoppingCart, label: 'Punto de Venta', end: true },
  { to: '/pos/history', icon: HiOutlineClock, label: 'Mis Ventas' },
];

export default function EmployeeLayout() {
  const { employee, signOut, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = ({ onNavClick }) => (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-steel-200 px-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-sm font-bold text-steel-900">Ferretería Cochabamba</h2>
          <p className="text-[11px] text-steel-400">Punto de Venta</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavClick}
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

        {isAdmin() && (
          <>
            <div className="my-3 border-t border-steel-100" />
            <NavLink
              to="/admin"
              onClick={onNavClick}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-steel-600 hover:bg-steel-50 hover:text-steel-900 transition-all"
            >
              <HiOutlineChartBar className="h-5 w-5 flex-shrink-0" />
              Administración
            </NavLink>
          </>
        )}
      </nav>

      <div className="border-t border-steel-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {employee?.full_name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-steel-900">{employee?.full_name}</p>
            <p className="text-[11px] text-steel-400 capitalize">{employee?.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── MOBILE: Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-steel-950/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar (drawer on mobile, fixed on desktop) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-steel-200 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={closeSidebar}
          className="absolute right-3 top-3.5 rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 lg:hidden"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
        <SidebarContent onNavClick={closeSidebar} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── MOBILE/TABLET: Top Header Bar ── */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-steel-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-steel-600 hover:bg-steel-100 transition-colors"
            aria-label="Abrir menú"
          >
            <HiOutlineMenu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-steel-900">POS</span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-2 text-steel-500 hover:bg-steel-100 transition-colors"
            title="Cerrar sesión"
          >
            <HiOutlineLogout className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-hidden bg-steel-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
