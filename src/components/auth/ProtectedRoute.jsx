import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { employee, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!employee) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(employee.role)) {
    const redirect = employee.role === 'admin' ? '/admin' : '/pos';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
