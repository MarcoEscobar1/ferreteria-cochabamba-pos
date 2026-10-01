import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff, HiOutlineInformationCircle } from 'react-icons/hi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      const { employee } = useAuthStore.getState();
      if (employee?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/pos');
      }
      toast.success('Bienvenido');
    } catch (err) {
      toast.error(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@ferreteria.com');
      setPassword('admin123');
    } else {
      setEmail('empleado@ferreteria.com');
      setPassword('emp123');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-steel-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative w-full max-w-md px-6">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.194-.14 1.743" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Ferretería Cochabamba
          </h1>
          <p className="mt-2 text-sm text-steel-400">Sistema de Punto de Venta</p>
        </div>

        {/* Demo credentials hint */}
        <div className="mb-4 rounded-xl border border-brand-500/30 bg-brand-600/10 p-4">
          <div className="flex items-start gap-2 mb-3">
            <HiOutlineInformationCircle className="h-5 w-5 shrink-0 text-brand-400 mt-0.5" />
            <p className="text-xs text-brand-300 font-medium">Modo Demo — Acceso rápido:</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="flex-1 rounded-lg bg-brand-600/20 px-3 py-2 text-xs font-medium text-brand-300 hover:bg-brand-600/30 transition-colors border border-brand-500/20"
            >
              👨‍💼 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('employee')}
              className="flex-1 rounded-lg bg-steel-700/50 px-3 py-2 text-xs font-medium text-steel-300 hover:bg-steel-700/70 transition-colors border border-steel-600/20"
            >
              👷 Empleado
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-steel-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-steel-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-600"
                >
                  {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Ingresando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-steel-500">
          © {new Date().getFullYear()} Ferretería Cochabamba. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
